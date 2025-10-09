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
    testingFrameworks: string[];
    buildTools: string[];
  } {
    const languages = new Set<string>();
    const frameworks = new Set<string>();
    const testingFrameworks = new Set<string>();
    const buildTools = new Set<string>();

    for (const file of files) {
      // Detect languages by file extension
      this.detectLanguageByExtension(file.path, languages);
      
      // Detect frameworks and tools by file content and names
      this.detectFrameworksAndTools(file, frameworks, testingFrameworks, buildTools);
    }

    return {
      languages: Array.from(languages),
      frameworks: Array.from(frameworks),
      testingFrameworks: Array.from(testingFrameworks),
      buildTools: Array.from(buildTools)
    };
  }

  private detectLanguageByExtension(path: string, languages: Set<string>): void {
    const ext = path.substring(path.lastIndexOf('.'));
    
    switch (ext) {
      case '.ts':
      case '.tsx':
        languages.add('TypeScript');
        break;
      case '.js':
      case '.jsx':
      case '.mjs':
      case '.cjs':
        languages.add('JavaScript');
        break;
      case '.py':
      case '.pyw':
        languages.add('Python');
        break;
      case '.java':
        languages.add('Java');
        break;
      case '.go':
        languages.add('Go');
        break;
      case '.rs':
        languages.add('Rust');
        break;
      case '.cpp':
      case '.cxx':
      case '.cc':
        languages.add('C++');
        break;
      case '.c':
        languages.add('C');
        break;
      case '.h':
      case '.hpp':
        languages.add('C/C++');
        break;
      case '.cs':
        languages.add('C#');
        break;
      case '.php':
        languages.add('PHP');
        break;
      case '.rb':
        languages.add('Ruby');
        break;
      case '.swift':
        languages.add('Swift');
        break;
      case '.kt':
      case '.kts':
        languages.add('Kotlin');
        break;
      case '.scala':
        languages.add('Scala');
        break;
      case '.dart':
        languages.add('Dart');
        break;
      case '.sol':
        languages.add('Solidity');
        break;
    }
  }

  private detectFrameworksAndTools(
    file: FileChange, 
    frameworks: Set<string>, 
    testingFrameworks: Set<string>,
    buildTools: Set<string>
  ): void {
    const content = file.diff.toLowerCase();
    const path = file.path.toLowerCase();

    // JavaScript/TypeScript Frameworks
    if (content.includes('react') || path.includes('react')) frameworks.add('React');
    if (content.includes('vue') || path.includes('vue')) frameworks.add('Vue.js');
    if (content.includes('angular') || content.includes('@angular')) frameworks.add('Angular');
    if (content.includes('next') || path.includes('next')) frameworks.add('Next.js');
    if (content.includes('nuxt')) frameworks.add('Nuxt.js');
    if (content.includes('svelte')) frameworks.add('Svelte');
    if (content.includes('express')) frameworks.add('Express.js');
    if (content.includes('fastify')) frameworks.add('Fastify');
    if (content.includes('koa')) frameworks.add('Koa.js');
    if (content.includes('nestjs') || content.includes('@nestjs')) frameworks.add('NestJS');
    if (content.includes('gatsby')) frameworks.add('Gatsby');

    // Python Frameworks
    if (content.includes('django') || path.includes('django')) frameworks.add('Django');
    if (content.includes('flask') || path.includes('flask')) frameworks.add('Flask');
    if (content.includes('fastapi') || path.includes('fastapi')) frameworks.add('FastAPI');
    if (content.includes('pyramid')) frameworks.add('Pyramid');
    if (content.includes('tornado')) frameworks.add('Tornado');

    // Java Frameworks
    if (content.includes('spring') || path.includes('spring')) frameworks.add('Spring');
    if (content.includes('hibernate')) frameworks.add('Hibernate');
    if (content.includes('struts')) frameworks.add('Struts');

    // Go Frameworks
    if (content.includes('gin') && file.path.endsWith('.go')) frameworks.add('Gin');
    if (content.includes('echo') && file.path.endsWith('.go')) frameworks.add('Echo');
    if (content.includes('fiber') && file.path.endsWith('.go')) frameworks.add('Fiber');

    // Rust Frameworks
    if (content.includes('actix') && file.path.endsWith('.rs')) frameworks.add('Actix');
    if (content.includes('rocket') && file.path.endsWith('.rs')) frameworks.add('Rocket');
    if (content.includes('warp') && file.path.endsWith('.rs')) frameworks.add('Warp');

    // Testing Frameworks
    if (content.includes('jest')) testingFrameworks.add('Jest');
    if (content.includes('mocha')) testingFrameworks.add('Mocha');
    if (content.includes('jasmine')) testingFrameworks.add('Jasmine');
    if (content.includes('cypress')) testingFrameworks.add('Cypress');
    if (content.includes('playwright')) testingFrameworks.add('Playwright');
    if (content.includes('selenium')) testingFrameworks.add('Selenium');
    if (content.includes('pytest')) testingFrameworks.add('PyTest');
    if (content.includes('unittest')) testingFrameworks.add('unittest');
    if (content.includes('junit')) testingFrameworks.add('JUnit');
    if (content.includes('testng')) testingFrameworks.add('TestNG');
    if (content.includes('rspec')) testingFrameworks.add('RSpec');

    // Build Tools
    if (path === 'package.json') buildTools.add('npm/yarn');
    if (path === 'webpack.config.js' || content.includes('webpack')) buildTools.add('Webpack');
    if (path === 'vite.config' || content.includes('vite')) buildTools.add('Vite');
    if (path === 'rollup.config' || content.includes('rollup')) buildTools.add('Rollup');
    if (path === 'gulpfile' || content.includes('gulp')) buildTools.add('Gulp');
    if (path === 'gruntfile' || content.includes('grunt')) buildTools.add('Grunt');
    if (path === 'pom.xml') buildTools.add('Maven');
    if (path === 'build.gradle') buildTools.add('Gradle');
    if (path === 'cargo.toml') buildTools.add('Cargo');
    if (path === 'go.mod') buildTools.add('Go Modules');
    if (path === 'makefile') buildTools.add('Make');
    if (path === 'dockerfile') buildTools.add('Docker');
  }

  analyzeProductionReadiness(commit: CommitInfo): {
    score: number;
    issues: Array<{
      severity: 'critical' | 'high' | 'medium' | 'low';
      category: string;
      message: string;
      file?: string;
      suggestion?: string;
    }>;
    recommendations: string[];
  } {
    const issues: Array<{
      severity: 'critical' | 'high' | 'medium' | 'low';
      category: string;
      message: string;
      file?: string;
      suggestion?: string;
    }> = [];
    const recommendations: string[] = [];
    let score = 100;

    for (const file of commit.files) {
      // Check for production anti-patterns
      this.checkProductionAntiPatterns(file, issues);
      
      // Check for security vulnerabilities
      this.checkSecurityVulnerabilities(file, issues);
      
      // Check for performance issues
      this.checkPerformanceIssues(file, issues);
      
      // Check for error handling
      this.checkErrorHandling(file, issues);
      
      // Check for logging and monitoring
      this.checkLoggingAndMonitoring(file, issues);
    }

    // Calculate score based on issues
    score -= issues.filter(i => i.severity === 'critical').length * 20;
    score -= issues.filter(i => i.severity === 'high').length * 10;
    score -= issues.filter(i => i.severity === 'medium').length * 5;
    score -= issues.filter(i => i.severity === 'low').length * 2;

    // Generate recommendations
    this.generateProductionRecommendations(commit, issues, recommendations);

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  private checkProductionAntiPatterns(file: FileChange, issues: any[]): void {
    const content = file.diff;
    
    // Check for console.log in production code
    if (content.includes('console.log') && !this.isTestFile(file.path)) {
      issues.push({
        severity: 'medium',
        category: 'Production Readiness',
        message: 'Console.log statements found in production code',
        file: file.path,
        suggestion: 'Replace with proper logging framework'
      });
    }

    // Check for TODO/FIXME comments
    if (content.match(/\/\/\s*(TODO|FIXME|HACK)/i)) {
      issues.push({
        severity: 'low',
        category: 'Code Quality',
        message: 'TODO/FIXME comments found',
        file: file.path,
        suggestion: 'Resolve pending issues before production'
      });
    }

    // Check for hardcoded credentials
    if (content.match(/(password|secret|key|token)\s*=\s*['"][^'"]+['"]/i)) {
      issues.push({
        severity: 'critical',
        category: 'Security',
        message: 'Potential hardcoded credentials found',
        file: file.path,
        suggestion: 'Use environment variables or secure secret management'
      });
    }

    // Check for debug code
    if (content.includes('debugger;') || content.includes('console.trace')) {
      issues.push({
        severity: 'high',
        category: 'Production Readiness',
        message: 'Debug code found',
        file: file.path,
        suggestion: 'Remove debug statements before production'
      });
    }
  }

  private checkSecurityVulnerabilities(file: FileChange, issues: any[]): void {
    const content = file.diff;
    
    // SQL Injection patterns
    if (content.match(/query\s*\(\s*['"]\s*SELECT.*\+/i)) {
      issues.push({
        severity: 'critical',
        category: 'Security',
        message: 'Potential SQL injection vulnerability',
        file: file.path,
        suggestion: 'Use parameterized queries or ORM'
      });
    }

    // XSS vulnerabilities
    if (content.includes('innerHTML') && !content.includes('sanitize')) {
      issues.push({
        severity: 'high',
        category: 'Security',
        message: 'Potential XSS vulnerability with innerHTML',
        file: file.path,
        suggestion: 'Sanitize input or use textContent/innerText'
      });
    }

    // Insecure HTTP in production
    if (content.includes('http://') && !this.isTestFile(file.path)) {
      issues.push({
        severity: 'medium',
        category: 'Security',
        message: 'Insecure HTTP protocol used',
        file: file.path,
        suggestion: 'Use HTTPS for production endpoints'
      });
    }
  }

  private checkPerformanceIssues(file: FileChange, issues: any[]): void {
    const content = file.diff;
    
    // Synchronous file operations
    if (content.match(/fs\.(readFileSync|writeFileSync)/)) {
      issues.push({
        severity: 'medium',
        category: 'Performance',
        message: 'Synchronous file operations found',
        file: file.path,
        suggestion: 'Use asynchronous file operations'
      });
    }

    // Missing async/await patterns
    if (content.includes('.then(') && content.includes('.catch(')) {
      issues.push({
        severity: 'low',
        category: 'Code Quality',
        message: 'Promise chains found, consider async/await',
        file: file.path,
        suggestion: 'Refactor to use async/await for better readability'
      });
    }

    // Large bundle imports
    if (content.match(/import\s+\*\s+as\s+\w+\s+from\s+['"]lodash['"]/)) {
      issues.push({
        severity: 'medium',
        category: 'Performance',
        message: 'Importing entire library instead of specific functions',
        file: file.path,
        suggestion: 'Import only needed functions to reduce bundle size'
      });
    }
  }

  private checkErrorHandling(file: FileChange, issues: any[]): void {
    const content = file.diff;
    
    // Missing try-catch blocks
    if (content.includes('await ') && !content.includes('try {')) {
      issues.push({
        severity: 'medium',
        category: 'Error Handling',
        message: 'Async operations without error handling',
        file: file.path,
        suggestion: 'Wrap async operations in try-catch blocks'
      });
    }

    // Empty catch blocks
    if (content.match(/catch\s*\([^)]*\)\s*{\s*}/)) {
      issues.push({
        severity: 'high',
        category: 'Error Handling',
        message: 'Empty catch block found',
        file: file.path,
        suggestion: 'Add proper error handling and logging'
      });
    }
  }

  private checkLoggingAndMonitoring(file: FileChange, issues: any[]): void {
    const content = file.diff;
    
    // Missing error logging
    if (content.includes('catch (') && !content.includes('log')) {
      issues.push({
        severity: 'medium',
        category: 'Monitoring',
        message: 'Error caught but not logged',
        file: file.path,
        suggestion: 'Add error logging for debugging and monitoring'
      });
    }
  }

  private generateProductionRecommendations(
    commit: CommitInfo, 
    issues: any[], 
    recommendations: string[]
  ): void {
    const { languages, frameworks } = this.detectLanguagesAndFrameworks(commit.files);
    
    if (issues.some(i => i.category === 'Security')) {
      recommendations.push('Run security audit tools like npm audit, bandit, or security linters');
    }
    
    if (issues.some(i => i.category === 'Performance')) {
      recommendations.push('Profile application performance and optimize critical paths');
    }
    
    if (languages.includes('JavaScript') || languages.includes('TypeScript')) {
      recommendations.push('Run bundle analyzer to check for optimization opportunities');
      recommendations.push('Ensure proper tree-shaking and code splitting');
    }
    
    if (frameworks.includes('React')) {
      recommendations.push('Implement React DevTools profiling for performance');
      recommendations.push('Consider React.memo and useMemo for optimization');
    }
    
    if (languages.includes('Python')) {
      recommendations.push('Use production WSGI server like Gunicorn or uWSGI');
      recommendations.push('Implement proper Python logging configuration');
    }
    
    recommendations.push('Set up proper CI/CD pipeline with automated testing');
    recommendations.push('Configure production monitoring and alerting');
    recommendations.push('Implement health checks and readiness probes');
  }
}
