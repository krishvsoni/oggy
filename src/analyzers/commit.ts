import simpleGit, { type SimpleGit, type DiffResult } from 'simple-git';
import type { CommitInfo, FileChange } from '../types';

export class CommitAnalyzer {
  private git: SimpleGit;

  constructor(repoPath: string = process.cwd()) {
    this.git = simpleGit(repoPath);
  }

  async getLatestCommit(): Promise<CommitInfo> {
    const log = await this.git.log({ maxCount: 1 });
    const latest = log.latest;

    if (!latest) {
      throw new Error('No commits found in repository');
    }

    const files = await this.getCommitFiles(latest.hash);

    return {
      hash: latest.hash,
      message: latest.message,
      author: latest.author_name,
      date: latest.date,
      files
    };
  }

  async getCommitByHash(hash: string): Promise<CommitInfo> {
    const log = await this.git.log({ from: hash, to: hash, maxCount: 1 });
    const commit = log.latest;

    if (!commit) {
      throw new Error(`Commit ${hash} not found`);
    }

    const files = await this.getCommitFiles(hash);

    return {
      hash: commit.hash,
      message: commit.message,
      author: commit.author_name,
      date: commit.date,
      files
    };
  }

  async getUnstagedChanges(): Promise<CommitInfo> {
    const status = await this.git.status();
    const diff = await this.git.diff();
    
    const files: FileChange[] = [];
    
    for (const file of status.modified) {
      const fileDiff = await this.git.diff(['--', file]);
      files.push({
        path: file,
        status: 'modified',
        additions: this.countLines(fileDiff, '+'),
        deletions: this.countLines(fileDiff, '-'),
        diff: fileDiff
      });
    }

    for (const file of status.created) {
      const fileDiff = await this.git.diff(['--cached', '--', file]);
      files.push({
        path: file,
        status: 'added',
        additions: this.countLines(fileDiff, '+'),
        deletions: 0,
        diff: fileDiff
      });
    }

    for (const file of status.deleted) {
      files.push({
        path: file,
        status: 'deleted',
        additions: 0,
        deletions: 0,
        diff: ''
      });
    }

    return {
      hash: 'unstaged',
      message: 'Unstaged changes',
      author: 'current user',
      date: new Date().toISOString(),
      files
    };
  }

  private async getCommitFiles(commitHash: string): Promise<FileChange[]> {
    const diffSummary = await this.git.diffSummary([`${commitHash}^`, commitHash]);
    const files: FileChange[] = [];

    for (const file of diffSummary.files) {
      const fileDiff = await this.git.diff([`${commitHash}^`, commitHash, '--', file.file]);
      
      let status: FileChange['status'] = 'modified';
      if (file.binary) {
        status = 'modified';
      } else if (file.insertions > 0 && file.deletions === 0) {
        status = 'added';
      } else if (file.insertions === 0 && file.deletions > 0) {
        status = 'deleted';
      }

      files.push({
        path: file.file,
        status,
        additions: file.insertions,
        deletions: file.deletions,
        diff: fileDiff
      });
    }

    return files;
  }

  private countLines(diff: string, prefix: string): number {
    return diff.split('\n').filter(line => line.startsWith(prefix)).length;
  }

  async getCurrentBranch(): Promise<string> {
    const branch = await this.git.branchLocal();
    return branch.current;
  }

  async hasUncommittedChanges(): Promise<boolean> {
    const status = await this.git.status();
    return !status.isClean();
  }

  async getRepositoryInfo(): Promise<{
    isRepo: boolean;
    hasRemote: boolean;
    defaultBranch: string;
  }> {
    try {
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) {
        return { isRepo: false, hasRemote: false, defaultBranch: '' };
      }

      const remotes = await this.git.getRemotes(true);
      const hasRemote = remotes.length > 0;

      let defaultBranch = 'main';
      try {
        const branches = await this.git.branch();
        if (branches.all.includes('main')) {
          defaultBranch = 'main';
        } else if (branches.all.includes('master')) {
          defaultBranch = 'master';
        }
      } catch (e) {
        // Use default
      }

      return { isRepo, hasRemote, defaultBranch };
    } catch (error) {
      return { isRepo: false, hasRemote: false, defaultBranch: '' };
    }
  }
}
