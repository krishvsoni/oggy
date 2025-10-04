import type { CommitInfo, FileChange, Config } from '../types';

export class CodeAnalyzer {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  analyzeCommit(commit: CommitInfo): {
    complexity: string;
    filesChanged: number;
    linesAdded: number;
    linesDeleted: number;
    testFiles: string[];
    configFiles: string[];
    codeFiles: string[];
    hasBreakingChanges: boolean;
  } {
    const filesChanged = commit.files.length;
    const linesAdded = commit.files.reduce((sum, f) => sum + f.additions, 0);
    const linesDeleted = commit.files.reduce((sum, f) => sum + f.deletions, 0);

    const testFiles = commit.files
      .filter(f => this.isTestFile(f.path))
      .map(f => f.path);

    const configFiles = commit.files
      .filter(f => this.isConfigFile(f.path))
      .map(f => f.path);

    const codeFiles = commit.files
      .filter(f => this.isCodeFile(f.path) && !this.isTestFile(f.path))
      .map(f => f.path);

    const hasBreakingChanges = this.detectBreakingChanges(commit);

    let complexity = 'low';
    const totalChanges = linesAdded + linesDeleted;
    if (totalChanges > 500 || filesChanged > 10) {
      complexity = 'high';
    } else if (totalChanges > 200 || filesChanged > 5) {
      complexity = 'medium';
    }

    return {
      complexity,
      filesChanged,
      linesAdded,
      linesDeleted,
      testFiles,
      configFiles,
      codeFiles,
      hasBreakingChanges
    };
  }

  private isTestFile(path: string): boolean {
    const testPatterns = [
      /\.test\./,
      /\.spec\./,
      /__tests__\//,
      /\/tests?\//,
      /\/test\//
    ];
    return testPatterns.some(pattern => pattern.test(path));
  }

  private isConfigFile(path: string): boolean {
    const configPatterns = [
      /package\.json$/,
      /tsconfig\.json$/,
      /\.config\.(js|ts|json)$/,
      /\.rc$/,
      /\.yaml$/,
      /\.yml$/,
      /Dockerfile$/,
      /docker-compose/,
      /\.env/
    ];
    return configPatterns.some(pattern => pattern.test(path));
  }

  private isCodeFile(path: string): boolean {
    const codeExtensions = [
      '.ts', '.tsx', '.js', '.jsx',
      '.py', '.java', '.cpp', '.c', '.h',
      '.go', '.rs', '.rb', '.php',
      '.cs', '.swift', '.kt', '.scala'
    ];
    return codeExtensions.some(ext => path.endsWith(ext));
  }

  private detectBreakingChanges(commit: CommitInfo): boolean {
    const breakingKeywords = [
      'BREAKING CHANGE',
      'breaking change',
      'breaking:',
      'BREAKING:',
      '!:' // Conventional Commits breaking change
    ];

    return breakingKeywords.some(keyword => 
      commit.message.includes(keyword)
    );
  }

  extractCodeContext(files: FileChange[]): string {
    let context = '';

    for (const file of files) {
      if (this.shouldIgnoreFile(file.path)) {
        continue;
      }

      context += `\n## File: ${file.path}\n`;
      context += `Status: ${file.status}\n`;
      context += `Changes: +${file.additions} -${file.deletions}\n`;
      
      if (file.diff && file.diff.length < 5000) { // Limit diff size
        context += `\nDiff:\n${file.diff}\n`;
      } else if (file.diff) {
        context += `\n(Diff too large, showing summary only)\n`;
      }
      context += '\n---\n';
    }

    return context;
  }

  private shouldIgnoreFile(path: string): boolean {
    const ignorePatterns = this.config.analysis.ignore || [];
    return ignorePatterns.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
      return regex.test(path);
    });
  }

  detectLanguagesAndFrameworks(files: FileChange[]): {
    languages: string[];
    frameworks: string[];
  } {
    const languages = new Set<string>();
    const frameworks = new Set<string>();

    for (const file of files) {
      // Detect languages
      if (file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
        languages.add('TypeScript');
      } else if (file.path.endsWith('.js') || file.path.endsWith('.jsx')) {
        languages.add('JavaScript');
      } else if (file.path.endsWith('.py')) {
        languages.add('Python');
      } else if (file.path.endsWith('.java')) {
        languages.add('Java');
      } else if (file.path.endsWith('.go')) {
        languages.add('Go');
      } else if (file.path.endsWith('.rs')) {
        languages.add('Rust');
      }

      // Detect frameworks (basic detection)
      if (file.diff.includes('react') || file.path.includes('react')) {
        frameworks.add('React');
      }
      if (file.diff.includes('vue') || file.path.includes('vue')) {
        frameworks.add('Vue');
      }
      if (file.diff.includes('express') || file.path.includes('express')) {
        frameworks.add('Express');
      }
      if (file.diff.includes('next') || file.path.includes('next')) {
        frameworks.add('Next.js');
      }
    }

    return {
      languages: Array.from(languages),
      frameworks: Array.from(frameworks)
    };
  }
}
