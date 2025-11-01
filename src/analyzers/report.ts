import chalk from 'chalk';
import type { AnalysisResult, CommitInfo, Config } from '../types';

export class ReportGenerator {
    private config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    printReport(commit: CommitInfo, result: AnalysisResult): void {
        console.log('\n' + '='.repeat(80));
        console.log(chalk.bold.cyan('COMMIT ANALYSIS REPORT'));
        console.log('='.repeat(80));

        console.log(chalk.bold('\nCommit Information:'));
        console.log(`   Hash:    ${chalk.gray(commit.hash.substring(0, 8))}`);
        console.log(`   Message: ${chalk.white(commit.message)}`);
        console.log(`   Author:  ${chalk.gray(commit.author)}`);
        console.log(`   Files:   ${chalk.gray(commit.files.length)} changed`);
        
        if (commit.issueNumber && commit.issueTitle) {
            console.log(chalk.bold('\nLinked Issue:'));
            console.log(`   #${commit.issueNumber}: ${chalk.cyan(commit.issueTitle)}`);
        }

        console.log(chalk.bold('\nOverall Score:'));
        const scoreColor = result.score >= 80 ? chalk.green : 
                                             result.score >= 60 ? chalk.yellow : chalk.red;
        console.log(`   ${scoreColor(result.score + '/100')}`);

        console.log(chalk.bold('\nStatus:'));
        const statusColor = result.status === 'ready' ? chalk.green :
                                             result.status === 'needs-work' ? chalk.yellow : chalk.red;
        console.log(`   ${statusColor(result.status.toUpperCase())}`);

        console.log(chalk.bold('\nSummary:'));
        console.log(chalk.gray('   ' + result.summary));

        // Display issue relevance if available
        if (result.issueRelevance) {
            console.log(chalk.bold('\nIssue Relevance Analysis:'));
            const relevanceColor = result.issueRelevance.isRelevant ? chalk.green : chalk.red;
            const scoreColor = result.issueRelevance.score >= 70 ? chalk.green :
                             result.issueRelevance.score >= 50 ? chalk.yellow : chalk.red;
            
            console.log(`   Status: ${relevanceColor(result.issueRelevance.isRelevant ? '[RELEVANT]' : '[NOT RELEVANT]')}`);
            console.log(`   Score:  ${scoreColor(result.issueRelevance.score + '/100')}`);
            console.log(`   ${chalk.gray(result.issueRelevance.explanation)}`);
            
            if (result.issueRelevance.mismatches && result.issueRelevance.mismatches.length > 0) {
                console.log(chalk.yellow('\n   Potential Mismatches:'));
                result.issueRelevance.mismatches.forEach(mismatch => {
                    console.log(`      • ${chalk.yellow(mismatch)}`);
                });
            }
        }

        if (result.issues && result.issues.length > 0) {
            console.log(chalk.bold('\nIssues Found:'));
            
            const criticalIssues = result.issues.filter(i => i.severity === 'critical');
            const highIssues = result.issues.filter(i => i.severity === 'high');
            const mediumIssues = result.issues.filter(i => i.severity === 'medium');
            const lowIssues = result.issues.filter(i => i.severity === 'low');

            if (criticalIssues.length > 0) {
                console.log(chalk.red.bold(`\n   CRITICAL (${criticalIssues.length}):`));
                criticalIssues.forEach(issue => this.printIssue(issue));
            }

            if (highIssues.length > 0) {
                console.log(chalk.red(`\n   HIGH (${highIssues.length}):`));
                highIssues.forEach(issue => this.printIssue(issue));
            }

            if (mediumIssues.length > 0) {
                console.log(chalk.yellow(`\n   MEDIUM (${mediumIssues.length}):`));
                mediumIssues.forEach(issue => this.printIssue(issue));
            }

            if (lowIssues.length > 0 && this.config.agent.verbosity === 'verbose') {
                console.log(chalk.gray(`\n   LOW (${lowIssues.length}):`));
                lowIssues.forEach(issue => this.printIssue(issue));
            }
        } else {
            console.log(chalk.bold('\nIssues Found:'));
            console.log(chalk.green('   No issues found!'));
        }

        if (this.config.agent.suggestImprovements && result.suggestions && result.suggestions.length > 0) {
            console.log(chalk.bold('\nSuggestions:'));
            result.suggestions.forEach((suggestion, i) => {
                const priorityColor = suggestion.priority === 'high' ? chalk.red :
                                                         suggestion.priority === 'medium' ? chalk.yellow : chalk.gray;
                console.log(`   ${i + 1}. [${priorityColor(suggestion.priority.toUpperCase())}] ${chalk.cyan(suggestion.category)}`);
                console.log(`      ${chalk.gray(suggestion.message)}`);
            });
        }

        console.log(chalk.bold('\nPR Readiness:'));
        const minScore = this.config.analysis.minScore;
        const isPRReady = result.score >= minScore && result.status !== 'not-ready';
        
        if (isPRReady) {
            console.log(chalk.green(`   Ready for Pull Request!`));
            console.log(chalk.gray(`   Score (${result.score}) meets minimum requirement (${minScore})`));
        } else {
            console.log(chalk.yellow(`   Needs improvement before PR`));
            console.log(chalk.gray(`   Score (${result.score}) below minimum requirement (${minScore})`));
        }

        if (this.config.agent.generatePRDescription && result.prDescription) {
            console.log(chalk.bold('\nGenerated PR Description:'));
            console.log(chalk.gray('   ' + '─'.repeat(76)));
            console.log(chalk.white(result.prDescription.split('\n').map(line => '   ' + line).join('\n')));
            console.log(chalk.gray('   ' + '─'.repeat(76)));
        }

        console.log('\n' + '='.repeat(80) + '\n');
    }

    private printIssue(issue: any): void {
        const location = issue.file ? 
            `${issue.file}${issue.line ? `:${issue.line}` : ''}` : 
            'General';
        
        console.log(`      • ${chalk.bold(issue.category)}: ${issue.message}`);
        console.log(`        ${chalk.gray('Location:')} ${chalk.gray(location)}`);
        
        if (issue.suggestion) {
            console.log(`        ${chalk.gray('Suggestion:')} ${chalk.cyan(issue.suggestion)}`);
        }
    }

    saveReportToFile(commit: CommitInfo, result: AnalysisResult, filename: string): void {
        const fs = require('fs');
        const report = this.generateMarkdownReport(commit, result);
        fs.writeFileSync(filename, report, 'utf-8');
    }

    private generateMarkdownReport(commit: CommitInfo, result: AnalysisResult): string {
        let md = `# Commit Analysis Report\n\n`;
        md += `**Generated:** ${new Date().toISOString()}\n\n`;
        
        md += `## Commit Information\n\n`;
        md += `- **Hash:** \`${commit.hash}\`\n`;
        md += `- **Message:** ${commit.message}\n`;
        md += `- **Author:** ${commit.author}\n`;
        md += `- **Files Changed:** ${commit.files.length}\n`;
        
        if (commit.issueNumber && commit.issueTitle) {
            md += `- **Linked Issue:** #${commit.issueNumber} - ${commit.issueTitle}\n`;
        }
        
        md += `\n`;
        
        md += `## Analysis Results\n\n`;
        md += `- **Score:** ${result.score}/100\n`;
        md += `- **Status:** ${result.status}\n\n`;
        
        if (result.issueRelevance) {
            md += `### Issue Relevance\n\n`;
            md += `- **Relevant:** ${result.issueRelevance.isRelevant ? '[Yes]' : '[No]'}\n`;
            md += `- **Relevance Score:** ${result.issueRelevance.score}/100\n`;
            md += `- **Explanation:** ${result.issueRelevance.explanation}\n\n`;
            
            if (result.issueRelevance.mismatches && result.issueRelevance.mismatches.length > 0) {
                md += `**Potential Mismatches:**\n\n`;
                result.issueRelevance.mismatches.forEach(m => {
                    md += `- ${m}\n`;
                });
                md += '\n';
            }
        }
        
        md += `### Summary\n\n${result.summary}\n\n`;
        
        if (result.issues && result.issues.length > 0) {
            md += `### Issues\n\n`;
            result.issues.forEach(issue => {
                md += `- **[${issue.severity.toUpperCase()}]** ${issue.category}: ${issue.message}\n`;
                if (issue.file) md += `  - File: \`${issue.file}\`\n`;
                if (issue.suggestion) md += `  - Suggestion: ${issue.suggestion}\n`;
            });
            md += '\n';
        }
        
        if (result.suggestions && result.suggestions.length > 0) {
            md += `### Suggestions\n\n`;
            result.suggestions.forEach(s => {
                md += `- **[${s.priority.toUpperCase()}]** ${s.category}: ${s.message}\n`;
            });
            md += '\n';
        }
        
        if (result.prDescription) {
            md += `## PR Description\n\n${result.prDescription}\n`;
        }
        
        return md;
    }
}
