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
        
        const spinner = ora('Analyzing commit metrics...').start();
        const metrics = this.codeAnalyzer.analyzeCommit(commit);
        const codeContext = this.codeAnalyzer.extractCodeContext(commit.files);
        const { languages, frameworks, testingFrameworks, buildTools } = this.codeAnalyzer.detectLanguagesAndFrameworks(commit.files);
        
        let productionAnalysis = null;
        if (this.config.analysis.productionReadiness) {
            productionAnalysis = this.codeAnalyzer.analyzeProductionReadiness(commit);
        }
        
        spinner.stop();
        console.log(chalk.green('[COMPLETE] Commit metrics analyzed'));

        spinner.start('Agent creating analysis plan...');
        const contextSummary = `
Commit: ${commit.message}
Files Changed: ${metrics.filesChanged}
Languages: ${languages.length} detected
Frameworks: ${frameworks.length} detected
Testing Frameworks: ${testingFrameworks.length > 0 ? 'Yes' : 'No'}
Build Tools: ${buildTools.length > 0 ? 'Yes' : 'No'}
Complexity: ${metrics.complexity}
Has Tests: ${metrics.testFiles.length > 0}
Breaking Changes: ${metrics.hasBreakingChanges}
Production Ready: ${productionAnalysis ? `${productionAnalysis.score}/100` : 'Not analyzed'}
Focus Areas: ${this.config.agent.focusAreas?.join(', ') || 'General'}
${commit.issueNumber ? `\nLinked Issue #${commit.issueNumber}: ${commit.issueTitle}` : ''}
        `.trim();

        let plan: AgentPlan;
        try {
            plan = await this.groqAgent.createPlan(
                'Analyze this commit for PR readiness and code quality',
                contextSummary
            );
            spinner.stop();
            console.log(chalk.green('[COMPLETE] Analysis plan created'));

            if (verbosity !== 'quiet') {
                console.log(chalk.cyan('\nAgent Plan:'));
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
            spinner.stop();
            console.log(chalk.red('[ERROR] Failed to create plan'));
            throw error;
        }

        const thoughts: AgentThought[] = [];
        
        if (verbosity !== 'quiet') {
            console.log(chalk.cyan('\nAgent Thinking Process:'));
        }

        for (let i = 0; i < Math.min(plan.steps.length, 5); i++) {
            const stepSpinner = ora(`Step ${i + 1}/${plan.steps.length}: ${plan.steps[i]}`).start();
            
            try {
                const thought = await this.groqAgent.think(
                    i + 1,
                    plan,
                    codeContext.substring(0, 8000),
                    thoughts
                );
                thoughts.push(thought);
                stepSpinner.stop();
                console.log(chalk.green(`[COMPLETE] Step ${i + 1}/${plan.steps.length}`));

                if (verbosity !== 'quiet') {
                    console.log(chalk.gray(`   ${thought.thought}`));
                }
            } catch (error) {
                stepSpinner.stop();
                console.log(chalk.yellow(`[WARNING] Step ${i + 1} failed, continuing...`));
            }
        }

        spinner.start('Performing deep code analysis...');
        let analysisResult: AnalysisResult;
        
        try {
            const analysisJson = await this.groqAgent.analyzeCode(
                commit.message,
                codeContext,
                { ...metrics, languages, frameworks, testingFrameworks, buildTools },
                plan,
                thoughts,
                productionAnalysis
            );
            
            analysisResult = JSON.parse(analysisJson);
            spinner.stop();
            console.log(chalk.green('[COMPLETE] Deep analysis completed'));
        } catch (error) {
            spinner.stop();
            console.log(chalk.red('[ERROR] Analysis failed'));
            throw error;
        }

        if (this.config.agent.generatePRDescription && analysisResult.prDescription) {
            spinner.start('Generating PR title...');
            try {
                const prTitle = await this.groqAgent.generatePRTitle(
                    commit.message,
                    analysisResult.summary
                );
                analysisResult.prDescription = `# ${prTitle}\n\n${analysisResult.prDescription}`;
                spinner.stop();
                console.log(chalk.green('[COMPLETE] PR title generated'));
            } catch (error) {
                spinner.stop();
                console.log(chalk.yellow('[WARNING] PR title generation failed'));
            }
        }

        if (analysisResult.suggestions && analysisResult.suggestions.length > this.config.agent.maxSuggestions) {
            analysisResult.suggestions = analysisResult.suggestions
                .sort((a, b) => {
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                })
                .slice(0, this.config.agent.maxSuggestions);
        }

        // Check issue relevance if issue information is provided
        if (commit.issueNumber && commit.issueTitle && commit.issueBody) {
            spinner.start('Analyzing issue relevance...');
            try {
                const issueRelevance = await this.analyzeIssueRelevance(commit, codeContext);
                analysisResult.issueRelevance = issueRelevance;
                spinner.stop();
                console.log(chalk.green('[COMPLETE] Issue relevance analyzed'));
            } catch (error) {
                spinner.stop();
                console.log(chalk.yellow('[WARNING] Issue relevance check failed'));
            }
        }

        return analysisResult;
    }

    async analyzeIssueRelevance(commit: CommitInfo, codeContext: string): Promise<{
        isRelevant: boolean;
        score: number;
        explanation: string;
        mismatches: string[];
    }> {
        if (!commit.issueNumber || !commit.issueTitle) {
            return {
                isRelevant: true,
                score: 100,
                explanation: 'No issue linked for validation',
                mismatches: []
            };
        }

        const issueContext = `
Issue #${commit.issueNumber}: ${commit.issueTitle}

Issue Description:
${commit.issueBody || 'No description provided'}
        `.trim();

        const commitContext = `
Commit Message: ${commit.message}

Files Changed:
${commit.files.map(f => `- ${f.path} (${f.status})`).join('\n')}

Code Changes Summary:
${codeContext.substring(0, 4000)}
        `.trim();

        const result = await this.groqAgent.checkIssueRelevance(issueContext, commitContext);
        
        return result;
    }
}
