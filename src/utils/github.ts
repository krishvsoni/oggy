import simpleGit, { type SimpleGit } from 'simple-git';

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: string[];
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface ForkInfo {
  isFork: boolean;
  parentRepo?: string;
  parentOwner?: string;
  currentRepo?: string;
  currentOwner?: string;
}

export class GitHubHelper {
  private git: SimpleGit;
  private repoPath: string;

  constructor(repoPath: string = process.cwd()) {
    this.git = simpleGit(repoPath);
    this.repoPath = repoPath;
  }

  /**
   * Checks if the current repository is a fork and gets parent repo info
   */
  async getForkInfo(): Promise<ForkInfo> {
    try {
      const remotes = await this.git.getRemotes(true);
      
      const origin = remotes.find(r => r.name === 'origin');
      if (!origin || !origin.refs || !origin.refs.fetch) {
        return { isFork: false };
      }

      const currentRepoInfo = this.parseGitHubUrl(origin.refs.fetch);
      if (!currentRepoInfo) {
        return { isFork: false };
      }

      const upstream = remotes.find(r => r.name === 'upstream');
      if (upstream && upstream.refs && upstream.refs.fetch) {
        const parentRepoInfo = this.parseGitHubUrl(upstream.refs.fetch);
        if (parentRepoInfo) {
          return {
            isFork: true,
            parentRepo: parentRepoInfo.repo,
            parentOwner: parentRepoInfo.owner,
            currentRepo: currentRepoInfo.repo,
            currentOwner: currentRepoInfo.owner
          };
        }
      }

      // Alternative: Try to detect from GitHub API if no upstream is set
      // For now, we'll rely on upstream remote being configured
      return {
        isFork: false,
        currentRepo: currentRepoInfo.repo,
        currentOwner: currentRepoInfo.owner
      };
    } catch (error) {
      return { isFork: false };
    }
  }

  /**
   * Parse GitHub URL to extract owner and repo name
   */
  private parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    // Handle both HTTPS and SSH URLs
    // HTTPS: https://github.com/owner/repo.git
    // SSH: git@github.com:owner/repo.git
    
    const httpsMatch = url.match(/https:\/\/github\.com\/([^\/]+)\/([^\/\.]+)/);
    if (httpsMatch) {
      return {
        owner: httpsMatch[1],
        repo: httpsMatch[2]
      };
    }

    const sshMatch = url.match(/git@github\.com:([^\/]+)\/([^\/\.]+)/);
    if (sshMatch) {
      return {
        owner: sshMatch[1],
        repo: sshMatch[2]
      };
    }

    return null;
  }

  /**
   * Fetch issues from a GitHub repository
   * Uses GitHub's public API (no authentication required for public repos)
   */
  async fetchIssues(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubIssue[]> {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=${state}&per_page=100`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Oggy-CLI'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository ${owner}/${repo} not found or is private`);
        }
        throw new Error(`Failed to fetch issues: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Filter out pull requests (they appear in issues API)
      const issues = data.filter((item: any) => !item.pull_request);

      return issues.map((issue: any) => ({
        number: issue.number,
        title: issue.title,
        body: issue.body || '',
        state: issue.state,
        labels: issue.labels.map((l: any) => l.name),
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        html_url: issue.html_url
      }));
    } catch (error: any) {
      throw new Error(`Failed to fetch issues: ${error.message}`);
    }
  }

  /**
   * Get a specific issue by number
   */
  async getIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue | null> {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Oggy-CLI'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch issue: ${response.statusText}`);
      }

      const issue = await response.json();
      
      // Check if it's a pull request
      if (issue.pull_request) {
        return null;
      }

      return {
        number: issue.number,
        title: issue.title,
        body: issue.body || '',
        state: issue.state,
        labels: issue.labels.map((l: any) => l.name),
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        html_url: issue.html_url
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch issue #${issueNumber}: ${error.message}`);
    }
  }

  /**
   * Check if an issue number exists in the parent repository
   */
  async validateIssueExists(owner: string, repo: string, issueNumber: number): Promise<boolean> {
    try {
      const issue = await this.getIssue(owner, repo, issueNumber);
      return issue !== null;
    } catch (error) {
      return false;
    }
  }
}
