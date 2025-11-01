#!/usr/bin/env bun

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { CommitAnalyzer } from './analyzers/commit';
import { loadConfig, validateConfig } from './analyzers/config';
import { AgentOrchestrator } from './agent/orchestrator';
import { ReportGenerator } from './analyzers/report';
import { GitHubHelper } from './utils/github';
import { displayBanner } from './utils/banner';
import ora from 'ora';
import path from 'path';
import fs from 'fs';

const findOggyInstallDir = (): string | null => {
  try {
    const { execSync } = require('child_process');
    try {
      const npmRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
      const oggyPath = path.join(npmRoot, 'oggy');
      if (fs.existsSync(oggyPath)) {
        return oggyPath;
      }
    } catch (e) {}
    let currentDir = __dirname;
    while (currentDir !== path.dirname(currentDir)) {
      const packageJsonPath = path.join(currentDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          if (packageJson.name === 'oggy') {
            return currentDir;
          }
        } catch (e) {}
      }
      currentDir = path.dirname(currentDir);
    }
    return null;
  } catch (error) {
    return null;
  }
};

const loadEnvFiles = () => {
  const locations = [
    path.join(process.cwd(), '.env'),
  ];
  const oggyInstallDir = findOggyInstallDir();
  if (oggyInstallDir) {
    locations.push(path.join(oggyInstallDir, '.env'));
  }
  locations.push(
    path.join(process.env.HOME || process.env.USERPROFILE || '', '.oggy.env'),
    path.join(process.env.HOME || process.env.USERPROFILE || '', '.env'),
    'D:\\JavaScript\\Projects\\oggy\\.env'
  );
  let envLoaded = false;
  for (const location of locations) {
    if (fs.existsSync(location)) {
      dotenv.config({ path: location });
      envLoaded = true;
      break;
    }
  }
  return { envLoaded, searchedLocations: locations, oggyInstallDir };
};

const envInfo = loadEnvFiles();

const program = new Command();

program
  .name('oggy')
  .description('AI-powered CLI agent for commit analysis and PR readiness')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze the latest commit, unstaged changes, or entire codebase')
  .option('-c, --commit <hash>', 'Analyze specific commit by hash')
  .option('-u, --unstaged', 'Analyze unstaged changes instead of last commit')
  .option('-w, --whole-codebase', 'Analyze entire codebase for production readiness')
  .option('--git-url <url>', 'Clone and analyze remote repository')
  .option('--branch <name>', 'Branch to analyze from remote repository (used with --git-url)')
  .option('--keep-clone', 'Keep cloned repository for inspection (used with --git-url)')
  .option('--config <path>', 'Path to config file')
  .option('-o, --output <file>', 'Save report to file')
  .option('-m, --model <model>', 'Groq model to use (default: llama-3.3-70b-versatile)')
  .option('--production', 'Enable production-level compatibility checks')
  .option('--e2e-tests', 'Include end-to-end testing analysis')
  .action(async (options) => {
    try {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        console.log();
        console.error(chalk.red('[ERROR] GROQ_API_KEY not found'));
        console.log(chalk.yellow('\nSetup options:'));
        console.log(chalk.dim('  1. Run: oggy setup (recommended)'));
        console.log(chalk.dim('  2. Get API key from https://console.groq.com'));
        if (envInfo.oggyInstallDir) {
          console.log(chalk.dim(`  3. Create ${path.join(envInfo.oggyInstallDir, '.env')}`));
          console.log(chalk.dim('     Content: GROQ_API_KEY=your_key_here'));
        } else {
          console.log(chalk.dim('  3. Create ~/.oggy.env'));
          console.log(chalk.dim('     Content: GROQ_API_KEY=your_key_here'));
        }
        console.log(chalk.dim('  4. Set environment: export GROQ_API_KEY=your_key_here'));
        console.log(chalk.dim(`\nSearched locations: ${envInfo.searchedLocations.slice(0, 3).join(', ')}`));
        console.log();
        process.exit(1);
      }
      const config = loadConfig(options.config);
      const validation = validateConfig(config);
      if (!validation.valid) {
        console.log();
        console.error(chalk.red('[ERROR] Invalid configuration'));
        validation.errors.forEach(err => console.error(chalk.dim(`  - ${err}`)));
        console.log();
        process.exit(1);
      }
      const commitAnalyzer = new CommitAnalyzer();
      const repoInfo = await commitAnalyzer.getRepositoryInfo();
      if (!repoInfo.isRepo) {
        console.error(chalk.red('\n[ERROR] Not a git repository'));
        console.log(chalk.yellow('Please run this command from within a git repository\n'));
        process.exit(1);
      }
      
      // Display banner
      displayBanner();
      console.log(chalk.gray(`Repository: ${repoInfo.name || 'Unknown'}`));
      console.log(chalk.gray(`Branch: ${repoInfo.branch || 'Unknown'}`));
      console.log();
      
      let commit;
      const spinner = ora({ text: 'Initializing analysis...', spinner: 'dots' }).start();
      let tempDir: string | null = null;
      
      try {
        if (options.gitUrl) {
          spinner.text = 'Step 1/3: Cloning remote repository...';
          const { execSync } = require('child_process');
          const os = require('os');
          
          // Create a unique temporary directory
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(7);
          tempDir = path.join(os.tmpdir(), `oggy-temp-${timestamp}-${randomId}`);
          
          try {
            // Ensure temp directory doesn't exist
            if (fs.existsSync(tempDir)) {
              fs.rmSync(tempDir, { recursive: true, force: true });
            }

            // Build git clone command
            const branchOption = options.branch ? `--branch ${options.branch} ` : '';
            const cloneCmd = `git clone --depth 1 ${branchOption}"${options.gitUrl}" "${tempDir}"`;
            
            try {
              execSync(cloneCmd, { 
                stdio: 'pipe',
                encoding: 'utf8'
              });
            } catch (cloneError: any) {
              // If clone fails, try to get stderr for better error message
              throw new Error(cloneError.stderr || cloneError.message || 'Git clone failed');
            }
            
            spinner.text = 'Step 2/3: Analyzing repository structure...';
            const tempCommitAnalyzer = new CommitAnalyzer(tempDir);
            commit = await tempCommitAnalyzer.getLatestCommit();
            
            if (options.keepClone) {
              spinner.stop();
              console.log(chalk.cyan(`[INFO] Cloned repository saved at: ${tempDir}`));
              tempDir = null; // Prevent cleanup
            } else {
              spinner.stop();
              console.log(chalk.green('[COMPLETE] Remote repository cloned and analyzed'));
            }
          } catch (error: any) {
            spinner.stop();
            console.log(chalk.red('[ERROR] Repository clone failed'));
            
            // Clean error message
            let errorMessage = error.message || 'Unknown error';
            if (error.stderr) {
              errorMessage = error.stderr.toString();
            }
            
            // Provide helpful error messages
            console.log();
            if (errorMessage.includes('not found') || errorMessage.includes('repository') && errorMessage.includes('not exist')) {
              console.error(chalk.red('[ERROR] Repository not found or URL is incorrect'));
              console.log(chalk.dim('Please verify the repository URL and try again'));
            } else if (errorMessage.includes('authentication') || errorMessage.includes('permission')) {
              console.error(chalk.red('[ERROR] Authentication failed'));
              console.log(chalk.dim('For private repositories, use SSH URL with proper credentials'));
            } else if (errorMessage.includes('Could not resolve host')) {
              console.error(chalk.red('[ERROR] Network error - cannot reach the repository'));
              console.log(chalk.dim('Please check your internet connection'));
            } else {
              console.error(chalk.red(`[ERROR] ${errorMessage}`));
            }
            console.log();
            
            // Clean up temp directory
            if (tempDir && fs.existsSync(tempDir)) {
              try {
                fs.rmSync(tempDir, { recursive: true, force: true });
              } catch (e) {}
            }
            process.exit(1);
          }
        } else if (options.wholeCodebase) {
          spinner.text = 'Step 1/3: Scanning entire codebase...';
          commit = await commitAnalyzer.getCodebaseAnalysis();
          spinner.stop();
          console.log(chalk.green('[COMPLETE] Codebase analysis complete'));
        } else if (options.unstaged) {
          spinner.text = 'Step 1/3: Retrieving unstaged changes...';
          commit = await commitAnalyzer.getUnstagedChanges();
          spinner.stop();
          console.log(chalk.green('[COMPLETE] Unstaged changes retrieved'));
        } else if (options.commit) {
          spinner.text = `Step 1/3: Fetching commit ${options.commit.substring(0, 7)}...`;
          commit = await commitAnalyzer.getCommitByHash(options.commit);
          spinner.stop();
          console.log(chalk.green('[COMPLETE] Commit data retrieved'));
        } else {
          spinner.text = 'Step 1/3: Fetching latest commit...';
          commit = await commitAnalyzer.getLatestCommit();
          spinner.stop();
          console.log(chalk.green('[COMPLETE] Latest commit retrieved'));
        }
      } catch (error: any) {
        spinner.stop();
        console.log(chalk.red('[ERROR] Analysis initialization failed'));
        console.log();
        console.error(chalk.red(`[ERROR] ${error.message}`));
        console.log();
        
        // Clean up temp directory on error
        if (tempDir && fs.existsSync(tempDir)) {
          try {
            fs.rmSync(tempDir, { recursive: true, force: true });
          } catch (e) {
            // Ignore cleanup errors
          }
        }
        
        process.exit(1);
      }
      
      // Check for fork and prompt for issue number
      const githubHelper = new GitHubHelper();
      try {
        const forkInfo = await githubHelper.getForkInfo();
        
        if (forkInfo.isFork && forkInfo.parentOwner && forkInfo.parentRepo && !options.gitUrl) {
          console.log(chalk.cyan(`\n[FORK DETECTED] Parent: ${forkInfo.parentOwner}/${forkInfo.parentRepo}`));
          
          // Prompt for issue number
          const readline = require('readline').promises;
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });
          
          try {
            const issueInput = await rl.question(chalk.yellow('Link to parent repository issue? Enter issue number (or press Enter to skip): '));
            rl.close();
            
            if (issueInput && issueInput.trim()) {
              const issueNumber = parseInt(issueInput.trim(), 10);
              
              if (!isNaN(issueNumber) && issueNumber > 0) {
                const issueSpinner = ora({ 
                  text: `Step 2/3: Fetching issue #${issueNumber}...`,
                  spinner: 'dots'
                }).start();
                
                try {
                  const issue = await githubHelper.getIssue(forkInfo.parentOwner, forkInfo.parentRepo, issueNumber);
                  
                  if (issue) {
                    issueSpinner.stop();
                    console.log(chalk.green(`[COMPLETE] Issue #${issueNumber}: ${issue.title}`));
                    console.log(chalk.dim(`         Status: ${issue.state}`));
                    console.log(chalk.dim(`         Link: ${issue.html_url}`));
                    
                    // Attach issue info to commit
                    commit.issueNumber = issue.number;
                    commit.issueTitle = issue.title;
                    commit.issueBody = issue.body;
                    
                    console.log(chalk.green('\n[INFO] Analysis will validate against linked issue\n'));
                  } else {
                    issueSpinner.stop();
                    console.log(chalk.red(`[ERROR] Issue #${issueNumber} not found`));
                    console.log(chalk.dim('Continuing without issue validation...\n'));
                  }
                } catch (error: any) {
                  issueSpinner.stop();
                  console.log(chalk.red(`[ERROR] Failed to fetch issue: ${error.message}`));
                  console.log(chalk.dim('Continuing without issue validation...\n'));
                }
              } else {
                console.log(chalk.dim('Invalid issue number, skipping...\n'));
              }
            } else {
              console.log(chalk.dim('Skipping issue validation...\n'));
            }
          } catch (error) {
            rl.close();
            console.log(chalk.dim('Skipping issue validation...\n'));
          }
        }
      } catch (error) {
        // Silently continue if fork detection fails
      }
      
      const model = options.model || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      const orchestrator = new AgentOrchestrator(apiKey, config, model);
      
      console.log(chalk.dim(`Model: ${model}`));
      console.log();
      
      const analysisSpinner = ora({ 
        text: 'Step 3/3: Running AI analysis...',
        spinner: 'dots'
      }).start();
      
      let result;
      try {
        result = await orchestrator.analyzeCommit(commit);
        analysisSpinner.stop();
        console.log(chalk.green('[COMPLETE] AI analysis complete'));
        console.log();
      } catch (error: any) {
        analysisSpinner.stop();
        console.log(chalk.red('[ERROR] AI analysis failed'));
        console.log();
        console.error(chalk.red('[ERROR] Analysis failed'));
        console.error(chalk.dim(error.message));
        if (error.message.includes('API key')) {
          console.log(chalk.yellow('\nPlease verify your Groq API key is valid'));
        }
        console.log();
        process.exit(1);
      }
      const reporter = new ReportGenerator(config);
      reporter.printReport(commit, result);
      
      if (options.output) {
        reporter.saveReportToFile(commit, result, options.output);
        console.log(chalk.green(`\n[SAVED] Report written to ${options.output}\n`));
      }
      
      // Clean up temp directory if it was created
      if (tempDir && fs.existsSync(tempDir)) {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      if (result.status === 'not-ready' || result.score < config.analysis.minScore) {
        process.exit(1);
      }
    } catch (error: any) {
      console.log();
      console.error(chalk.red('[ERROR] Unexpected error occurred'));
      console.error(chalk.dim(error.message));
      if (error.stack && process.env.DEBUG) {
        console.log();
        console.error(chalk.gray('Stack trace:'));
        console.error(chalk.gray(error.stack));
      }
      console.log();
      
      // Clean up temp directory on error
      if (tempDir && fs.existsSync(tempDir)) {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      process.exit(1);
    }
  });

program
  .command('setup')
  .description('Set up Oggy with your Groq API key')
  .action(async () => {
    const readline = require('readline').promises;
    
    console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║           OGGY SETUP                  ║'));
    console.log(chalk.bold.cyan('╚═══════════════════════════════════════╝\n'));
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    try {
      console.log(chalk.white('Steps to get your API key:'));
      console.log(chalk.dim('  1. Visit https://console.groq.com'));
      console.log(chalk.dim('  2. Sign up or log in'));
      console.log(chalk.dim('  3. Navigate to API Keys section'));
      console.log(chalk.dim('  4. Create a new API key\n'));
      
      const apiKey = await rl.question(chalk.cyan('Enter your Groq API key: '));
      
      if (!apiKey || !apiKey.trim()) {
        console.log(chalk.red('\n[ERROR] No API key provided. Setup cancelled.\n'));
        process.exit(1);
      }
      
      let envPath: string;
      if (envInfo.oggyInstallDir) {
        envPath = path.join(envInfo.oggyInstallDir, '.env');
      } else {
        envPath = path.join(process.env.HOME || process.env.USERPROFILE || '', '.oggy.env');
      }
      
      const envContent = `GROQ_API_KEY=${apiKey.trim()}\nGROQ_MODEL=llama-3.3-70b-versatile\n`;
      
      try {
        fs.writeFileSync(envPath, envContent);
        console.log(chalk.green(`\n[SUCCESS] API key saved to: ${envPath}`));
        console.log(chalk.green('[SUCCESS] Setup complete!\n'));
        console.log(chalk.dim('Try running: oggy analyze\n'));
      } catch (error: any) {
        console.error(chalk.red(`\n[ERROR] Failed to save config: ${error.message}\n`));
        console.log(chalk.yellow('Manual setup option:'));
        console.log(chalk.dim(`  File: ${envPath}`));
        console.log(chalk.dim(`  Content: GROQ_API_KEY=${apiKey.trim()}\n`));
      }
    } catch (error: any) {
      console.error(chalk.red(`\n[ERROR] Setup failed: ${error.message}\n`));
    } finally {
      rl.close();
    }
  });

program
  .command('init')
  .description('Initialize Oggy configuration in current repository with enhanced setup')
  .option('--production', 'Initialize with production-ready configuration')
  .option('--language <lang>', 'Specify primary language for better defaults')
  .option('--framework <framework>', 'Specify framework for optimized configuration')
  .action((options) => {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(process.cwd(), 'oggy.config.yaml');
    const envPath = path.join(process.cwd(), '.env');
    
    console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║      OGGY INITIALIZATION              ║'));
    console.log(chalk.bold.cyan('╚═══════════════════════════════════════╝\n'));
    
    // Detect project type and language
    const projectInfo = detectProjectInfo();
    const language = options.language || projectInfo.language;
    const framework = options.framework || projectInfo.framework;
    
    console.log(chalk.dim(`Detected language: ${language || 'auto'}`));
    console.log(chalk.dim(`Detected framework: ${framework || 'auto'}\n`));
    
    if (fs.existsSync(configPath)) {
      console.log(chalk.yellow('[SKIP] oggy.config.yaml already exists'));
    } else {
      // Create enhanced config based on detected project type
      const config = generateEnhancedConfig(language, framework, options.production);
      fs.writeFileSync(configPath, config);
      console.log(chalk.green('[CREATED] oggy.config.yaml'));
    }
    
    if (!fs.existsSync(envPath)) {
      const envContent = `# Groq API Configuration
GROQ_API_KEY=your_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Analysis Configuration
OGGY_PRODUCTION_MODE=${options.production ? 'true' : 'false'}
OGGY_E2E_TESTS=${language === 'javascript' || language === 'typescript' ? 'true' : 'false'}
`;
      fs.writeFileSync(envPath, envContent);
      console.log(chalk.green('[CREATED] .env file'));
    }
    
    // Create project-specific ignore file
    const gitignorePath = path.join(process.cwd(), '.oggyignore');
    if (!fs.existsSync(gitignorePath)) {
      const ignoreContent = generateIgnoreFile(language, framework);
      fs.writeFileSync(gitignorePath, ignoreContent);
      console.log(chalk.green('[CREATED] .oggyignore file'));
    }
    
    console.log(chalk.green('\n[SUCCESS] Initialization complete!\n'));
    console.log(chalk.white('Next steps:'));
    console.log(chalk.dim('  1. Get your API key from https://console.groq.com'));
    console.log(chalk.dim('  2. Update .env: GROQ_API_KEY=your_key'));
    console.log(chalk.dim('  3. Customize oggy.config.yaml'));
    console.log(chalk.dim('  4. Run: oggy analyze\n'));
    
    if (options.production) {
      console.log(chalk.cyan('[PRODUCTION MODE]'));
      console.log(chalk.dim('  - Enhanced security checks'));
      console.log(chalk.dim('  - Performance optimization'));
      console.log(chalk.dim('  - Deployment readiness\n'));
    }
  });

function detectProjectInfo(): { language: string | null; framework: string | null } {
  const fs = require('fs');
  const path = require('path');
  
  let language = null;
  let framework = null;
  
  // Check package.json for Node.js projects
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps.typescript || deps['@types/node']) {
        language = 'typescript';
      } else {
        language = 'javascript';
      }
      
      if (deps.react || deps['@types/react']) framework = 'react';
      else if (deps.vue) framework = 'vue';
      else if (deps.angular || deps['@angular/core']) framework = 'angular';
      else if (deps.next || deps['next']) framework = 'nextjs';
      else if (deps.express) framework = 'express';
      else if (deps.nestjs || deps['@nestjs/core']) framework = 'nestjs';
    } catch (e) {
      // Ignore parsing errors
    }
  }
  
  // Check for Python
  if (fs.existsSync('requirements.txt') || fs.existsSync('pyproject.toml') || fs.existsSync('setup.py')) {
    language = 'python';
    if (fs.existsSync('manage.py')) framework = 'django';
    else if (fs.readFileSync('requirements.txt', 'utf8').includes('flask')) framework = 'flask';
  }
  
  // Check for Java
  if (fs.existsSync('pom.xml') || fs.existsSync('build.gradle')) {
    language = 'java';
    if (fs.readFileSync('pom.xml', 'utf8').includes('spring')) framework = 'spring';
  }
  
  // Check for Go
  if (fs.existsSync('go.mod')) {
    language = 'go';
  }
  
  // Check for Rust
  if (fs.existsSync('Cargo.toml')) {
    language = 'rust';
  }
  
  return { language, framework };
}

function generateEnhancedConfig(language: string | null, framework: string | null, production: boolean): string {
  const baseConfig = {
    analysis: {
      codeQuality: true,
      security: true,
      performance: true,
      bestPractices: true,
      documentation: true,
      productionReadiness: production,
      e2eTests: ['javascript', 'typescript'].includes(language || ''),
      minScore: production ? 85 : 70,
      ignore: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '*.log',
        '*.lock',
        '.git/**',
        'coverage/**',
        '.next/**',
        '.nuxt/**',
        'target/**',  // Rust/Java
        '__pycache__/**',  // Python
        '*.pyc',  // Python
        'vendor/**',  // Go/PHP
      ]
    },
    checks: {
      commitMessage: true,
      testsIncluded: true,
      breakingChanges: true,
      complexity: true,
      securityIssues: true,
      typeChecking: ['typescript', 'python'].includes(language || ''),
      linting: true,
      formatting: true
    },
    agent: {
      verbosity: 'normal',
      generatePRDescription: true,
      suggestImprovements: true,
      maxSuggestions: production ? 10 : 5,
      focusAreas: generateFocusAreas(language, framework, production)
    },
    project: {
      type: framework || language || 'auto',
      languages: language || 'auto',
      frameworks: framework || 'auto',
      productionEnvironment: production
    }
  };
  
  return require('js-yaml').dump(baseConfig, { indent: 2 });
}

function generateFocusAreas(language: string | null, framework: string | null, production: boolean): string[] {
  const areas = ['code-quality', 'security'];
  
  if (production) {
    areas.push('performance', 'scalability', 'error-handling', 'monitoring');
  }
  
  if (language === 'javascript' || language === 'typescript') {
    areas.push('async-patterns', 'memory-leaks');
    if (framework === 'react') areas.push('react-best-practices', 'component-design');
    if (framework === 'nextjs') areas.push('ssr-optimization', 'seo');
  }
  
  if (language === 'python') {
    areas.push('pythonic-code', 'packaging');
    if (framework === 'django') areas.push('django-security', 'orm-optimization');
  }
  
  if (language === 'java') {
    areas.push('memory-management', 'concurrency');
    if (framework === 'spring') areas.push('spring-security', 'bean-management');
  }
  
  return areas;
}

function generateIgnoreFile(language: string | null, framework: string | null): string {
  let content = `# Oggy Analysis Ignore Patterns
# Add patterns for files/directories to exclude from analysis

# Common build artifacts
node_modules/
dist/
build/
target/
*.log
*.lock

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Coverage reports
coverage/
*.coverage
.nyc_output/

`;

  if (language === 'javascript' || language === 'typescript') {
    content += `# Node.js specific
.next/
.nuxt/
.output/
.vercel/
.netlify/

`;
  }

  if (language === 'python') {
    content += `# Python specific
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
pip-log.txt
pip-delete-this-directory.txt
.env
.venv/
env/
venv/

`;
  }

  if (language === 'java') {
    content += `# Java specific
*.class
*.jar
*.war
*.ear
.mvn/
target/

`;
  }

  if (language === 'go') {
    content += `# Go specific
vendor/
*.exe
*.exe~
*.dll
*.so
*.dylib

`;
  }

  if (language === 'rust') {
    content += `# Rust specific
target/
Cargo.lock

`;
  }

  return content;
}

program
  .command('config')
  .description('Show current configuration')
  .option('--config <path>', 'Path to config file')
  .action((options) => {
    const config = loadConfig(options.config);
    console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║      CURRENT CONFIGURATION            ║'));
    console.log(chalk.bold.cyan('╚═══════════════════════════════════════╝\n'));
    console.log(JSON.stringify(config, null, 2));
    console.log();
  });

program.parse();
