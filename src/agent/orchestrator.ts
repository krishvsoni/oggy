import { GroqAgent } from './groq';
import { CodeAnalyzer } from '../analyzers/code';
import type { CommitInfo, Config, AnalysisResult, AgentThought, AgentPlan } from '../types';
import chalk from 'chalk';
import ora from 'ora';

export class AgentOrchestrator {
  private groqAgent: GroqAgent;
  private codeAnalyzer: CodeAnalyzer;
  private config: Config;

  constructor(apiKey: string, config: Config, model?: string) {
    this.groqAgent = new GroqAgent(apiKey, model);
    this.codeAnalyzer = new CodeAnalyzer(config);
    this.config = config;
  }

  async analyzeCommit(commit: CommitInfo): Promise<AnalysisResult> {
    const verbosity = this.config.agent.verbosity;
    
    // Step 1: Analyze code metrics
    const spinner = ora('Analyzing commit metrics...').start();
    const metrics = this.codeAnalyzer.analyzeCommit(commit);
    const codeContext = this.codeAnalyzer.extractCodeContext(commit.files);
    const { languages, frameworks } = this.codeAnalyzer.detectLanguagesAndFrameworks(commit.files);
    spinner.succeed('Commit metrics analyzed');

    // Step 2: Create analysis plan
    spinner.start('Agent creating analysis plan...');
    const contextSummary = `
Commit: ${commit.message}
Files Changed: ${metrics.filesChanged}
Languages: ${languages.join(', ')}
Frameworks: ${frameworks.join(', ')}
Complexity: ${metrics.complexity}
Has Tests: ${metrics.testFiles.length > 0}
Breaking Changes: ${metrics.hasBreakingChanges}
    `.trim();

    let plan: AgentPlan;
    try {
      plan = await this.groqAgent.createPlan(
        'Analyze this commit for PR readiness and code quality',
        contextSummary
      );
      spinner.succeed('Analysis plan created');

      if (verbosity !== 'quiet') {
        console.log(chalk.cyan('\n🎯 Agent Plan:'));
        console.log(chalk.gray(`   Goal: ${plan.goal}`));
        console.log(chalk.gray(`   Complexity: ${plan.estimatedComplexity}`));
        if (verbosity === 'verbose') {
          console.log(chalk.gray('   Steps:'));
          plan.steps.forEach((step, i) => {
            console.log(chalk.gray(`     ${i + 1}. ${step}`));
          });
        }
      }
    } catch (error) {
      spinner.fail('Failed to create plan');
      throw error;
    }

    // Step 3: Execute plan with thinking
    const thoughts: AgentThought[] = [];
    
    if (verbosity !== 'quiet') {
      console.log(chalk.cyan('\n🤔 Agent Thinking Process:'));
    }

    for (let i = 0; i < Math.min(plan.steps.length, 5); i++) {
      const stepSpinner = ora(`Step ${i + 1}/${plan.steps.length}: ${plan.steps[i]}`).start();
      
      try {
        const thought = await this.groqAgent.think(
          i + 1,
          plan,
          codeContext.substring(0, 8000), // Limit context size
          thoughts
        );
        thoughts.push(thought);
        stepSpinner.succeed();

        if (verbosity === 'verbose') {
          console.log(chalk.gray(`   💭 ${thought.thought}`));
          console.log(chalk.gray(`   🎬 Action: ${thought.action}`));
          console.log(chalk.gray(`   📝 Reasoning: ${thought.reasoning}\n`));
        }
      } catch (error) {
        stepSpinner.fail();
        console.warn(chalk.yellow(`   ⚠️  Step ${i + 1} failed, continuing...`));
      }
    }

    // Step 4: Perform deep analysis
    spinner.start('Performing deep code analysis...');
    let analysisResult: AnalysisResult;
    
    try {
      const analysisJson = await this.groqAgent.analyzeCode(
        commit.message,
        codeContext,
        metrics,
        plan,
        thoughts
      );
      
      analysisResult = JSON.parse(analysisJson);
      spinner.succeed('Deep analysis completed');
    } catch (error) {
      spinner.fail('Analysis failed');
      throw error;
    }

    // Step 5: Generate PR title if needed
    if (this.config.agent.generatePRDescription && analysisResult.prDescription) {
      spinner.start('Generating PR title...');
      try {
        const prTitle = await this.groqAgent.generatePRTitle(
          commit.message,
          analysisResult.summary
        );
        analysisResult.prDescription = `# ${prTitle}\n\n${analysisResult.prDescription}`;
        spinner.succeed('PR title generated');
      } catch (error) {
        spinner.warn('PR title generation failed');
      }
    }

    // Filter suggestions by max count
    if (analysisResult.suggestions && analysisResult.suggestions.length > this.config.agent.maxSuggestions) {
      analysisResult.suggestions = analysisResult.suggestions
        .sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        })
        .slice(0, this.config.agent.maxSuggestions);
    }

    return analysisResult;
  }
}
