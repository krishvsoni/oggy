#!/usr/bin/env bun

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { CommitAnalyzer } from './analyzers/commit';
import { loadConfig, validateConfig } from './analyzers/config';
import { AgentOrchestrator } from './agent/orchestrator';
import { ReportGenerator } from './analyzers/report';
import ora from 'ora';

dotenv.config();

const program = new Command();

program
  .name('oggy')
  .description('AI-powered CLI agent for commit analysis and PR readiness')
  .version('0.1.0');

program
  .command('analyze')
  .description('Analyze the latest commit or unstaged changes')
  .option('-c, --commit <hash>', 'Analyze specific commit by hash')
  .option('-u, --unstaged', 'Analyze unstaged changes instead of last commit')
  .option('--config <path>', 'Path to config file')
  .option('-o, --output <file>', 'Save report to file')
  .option('-m, --model <model>', 'Groq model to use (default: llama-3.1-70b-versatile)')
  .action(async (options) => {
    try {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        console.error(chalk.red('Error: GROQ_API_KEY not found in environment variables'));
        console.log(chalk.yellow('\nPlease set your Groq API key:'));
        console.log(chalk.gray('1. Get your API key from https://console.groq.com'));
        console.log(chalk.gray('2. Create a .env file with: GROQ_API_KEY=your_key_here'));
        process.exit(1);
      }

      const config = loadConfig(options.config);
      const validation = validateConfig(config);
      if (!validation.valid) {
        console.error(chalk.red('Invalid configuration:'));
        validation.errors.forEach(err => console.error(chalk.red(`   - ${err}`)));
        process.exit(1);
      }

      const commitAnalyzer = new CommitAnalyzer();
      const repoInfo = await commitAnalyzer.getRepositoryInfo();
      
      if (!repoInfo.isRepo) {
        console.error(chalk.red('Error: Not a git repository'));
        console.log(chalk.yellow('Please run this command from within a git repository'));
        process.exit(1);
      }

      console.log(chalk.bold.cyan('\nOggy - AI Commit Analyzer\n'));

      let commit;
      const spinner = ora('Fetching commit information...').start();
      
      try {
        if (options.unstaged) {
          spinner.text = 'Analyzing unstaged changes...';
          commit = await commitAnalyzer.getUnstagedChanges();
        } else if (options.commit) {
          spinner.text = `Analyzing commit ${options.commit}...`;
          commit = await commitAnalyzer.getCommitByHash(options.commit);
        } else {
          spinner.text = 'Analyzing latest commit...';
          commit = await commitAnalyzer.getLatestCommit();
        }
        spinner.succeed('Commit information retrieved');
      } catch (error: any) {
        spinner.fail('Failed to fetch commit');
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }

     
      const model = options.model || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      const orchestrator = new AgentOrchestrator(apiKey, config, model);

      console.log(chalk.gray(`Using model: ${model}\n`));

     
      let result;
      try {
        result = await orchestrator.analyzeCommit(commit);
      } catch (error: any) {
        console.error(chalk.red('\nAnalysis failed:'));
        console.error(chalk.red(error.message));
        if (error.message.includes('API key')) {
          console.log(chalk.yellow('\nPlease check your Groq API key is valid'));
        }
        process.exit(1);
      }

      const reporter = new ReportGenerator(config);
      reporter.printReport(commit, result);

      if (options.output) {
        reporter.saveReportToFile(commit, result, options.output);
        console.log(chalk.green(`Report saved to ${options.output}\n`));
      }

      if (result.status === 'not-ready' || result.score < config.analysis.minScore) {
        process.exit(1);
      }

    } catch (error: any) {
      console.error(chalk.red('\nUnexpected error:'));
      console.error(chalk.red(error.message));
      if (error.stack && process.env.DEBUG) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize Oggy configuration in current repository')
  .action(() => {
    const fs = require('fs');
    const path = require('path');
    
    const configPath = path.join(process.cwd(), 'oggy.config.yaml');
    const envPath = path.join(process.cwd(), '.env');
    
    if (fs.existsSync(configPath)) {
      console.log(chalk.yellow('oggy.config.yaml already exists'));
    } else {
      const defaultConfig = fs.readFileSync(
        path.join(__dirname, '../oggy.config.yaml'),
        'utf-8'
      );
      fs.writeFileSync(configPath, defaultConfig);
      console.log(chalk.green('Created oggy.config.yaml'));
    }
    
    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, 'GROQ_API_KEY=your_api_key_here\n');
      console.log(chalk.green('Created .env file'));
      console.log(chalk.yellow('\nPlease add your Groq API key to .env'));
    }
    
    console.log(chalk.cyan('\nOggy initialized successfully!'));
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray('1. Get your API key from https://console.groq.com'));
    console.log(chalk.gray('2. Add it to .env: GROQ_API_KEY=your_key'));
    console.log(chalk.gray('3. Customize oggy.config.yaml to your needs'));
    console.log(chalk.gray('4. Run: oggy analyze\n'));
  });

program
  .command('config')
  .description('Show current configuration')
  .option('--config <path>', 'Path to config file')
  .action((options) => {
    const config = loadConfig(options.config);
    console.log(chalk.cyan('\nCurrent Configuration:\n'));
    console.log(JSON.stringify(config, null, 2));
    console.log();
  });

program.parse();
