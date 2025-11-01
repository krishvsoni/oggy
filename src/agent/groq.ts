import Groq from 'groq-sdk';
import type { AgentPlan, AgentThought } from '../types';

export class GroqAgent {
    private client: Groq;
    private model: string;

    constructor(apiKey: string, model: string = 'llama-3.3-70b-versatile') {
        this.client = new Groq({ apiKey });
        this.model = model;
    }

    async createPlan(task: string, context: string): Promise<AgentPlan> {
        const prompt = `You are an expert code review agent. Your task is to create a detailed plan for analyzing a code commit.

Task: ${task}

Context:
${context}

Create a detailed plan with:
1. The main goal of the analysis
2. Step-by-step approach to analyze the commit
3. Estimated complexity of the analysis

Respond in JSON format:
{
    "goal": "main goal",
    "steps": ["step 1", "step 2", ...],
    "estimatedComplexity": "low|medium|high"
}`;

        const response = await this.client.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: this.model,
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from Groq API');
        }

        return JSON.parse(content) as AgentPlan;
    }

    async think(step: number, plan: AgentPlan, context: string, previousThoughts: AgentThought[]): Promise<AgentThought> {
        const currentStep = plan.steps[step - 1];
        const previousContext = previousThoughts.map(t => 
            `Step ${t.step}: ${t.thought}\nAction: ${t.action}\nReasoning: ${t.reasoning}`
        ).join('\n\n');

        const prompt = `You are an expert code review agent executing step ${step} of ${plan.steps.length}.

Goal: ${plan.goal}
Current Step: ${currentStep}

Context:
${context}

Previous Thoughts:
${previousContext}

Think through this step carefully. What should you do? What are you looking for?

Respond in JSON format:
{
    "step": ${step},
    "thought": "your analytical thought process",
    "action": "what you will analyze in this step",
    "reasoning": "why this is important"
}`;

        const response = await this.client.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: this.model,
            temperature: 0.5,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from Groq API');
        }

        return JSON.parse(content) as AgentThought;
    }

    async analyzeCode(
        commitMessage: string,
        codeContext: string,
        analysisMetrics: any,
        plan: AgentPlan,
        thoughts: AgentThought[],
        productionAnalysis?: any
    ): Promise<string> {
        const thoughtsContext = thoughts.map(t => 
            `Step ${t.step} - ${t.action}: ${t.reasoning}`
        ).join('\n');

        const productionContext = productionAnalysis ? `
Production Readiness Analysis:
- Score: ${productionAnalysis.score}/100
- Critical Issues: ${productionAnalysis.issues.filter((i: any) => i.severity === 'critical').length}
- High Priority Issues: ${productionAnalysis.issues.filter((i: any) => i.severity === 'high').length}
- Recommendations: ${productionAnalysis.recommendations.slice(0, 3).join(', ')}
        ` : '';

        const prompt = `You are an expert code review agent with deep knowledge of production systems, security, and software engineering best practices. Analyze this commit thoroughly for enterprise-grade quality.

Commit Message: ${commitMessage}

Analysis Metrics:
- Files Changed: ${analysisMetrics.filesChanged}
- Lines Added: ${analysisMetrics.linesAdded}
- Lines Deleted: ${analysisMetrics.linesDeleted}
- Complexity: ${analysisMetrics.complexity}
- Test Files: ${analysisMetrics.testFiles.length}
- Code Files: ${analysisMetrics.codeFiles.length}
- Has Breaking Changes: ${analysisMetrics.hasBreakingChanges}
- Languages: ${analysisMetrics.languages?.join(', ') || 'Unknown'}
- Frameworks: ${analysisMetrics.frameworks?.join(', ') || 'Unknown'}
- Testing Frameworks: ${analysisMetrics.testingFrameworks?.join(', ') || 'None'}

${productionContext}

Agent's Analysis Plan:
${plan.goal}

Agent's Thoughts:
${thoughtsContext}

Code Changes:
${codeContext.substring(0, 20000)} ${codeContext.length > 20000 ? '...(truncated for length)' : ''}

Provide a comprehensive analysis focusing on:
1. **Code Quality** - Architecture, maintainability, readability, design patterns
2. **Security** - Vulnerabilities, data protection, authentication, authorization
3. **Performance** - Scalability, efficiency, memory usage, async patterns
4. **Production Readiness** - Error handling, logging, monitoring, configuration
5. **Testing** - Coverage, quality, E2E scenarios, edge cases
6. **Best Practices** - Language-specific conventions, framework patterns
7. **Documentation** - Code comments, API docs, deployment guides
8. **Breaking Changes** - Impact assessment, migration strategies
9. **File-Specific Issues** - Identify problematic files with line numbers when possible
10. **End-to-End Considerations** - Integration points, external dependencies

For each file analyzed, provide specific feedback including:
- File path and primary concerns
- Line-specific issues when identifiable
- Severity assessment (critical/high/medium/low)
- Actionable suggestions for improvement

Consider the detected languages and frameworks for context-specific analysis.

Respond in JSON format:
{
    "score": 0-100,
    "status": "ready|needs-work|not-ready",
    "summary": "comprehensive summary focusing on production readiness",
    "issues": [
        {
            "severity": "critical|high|medium|low",
            "category": "category name (Security, Performance, Code Quality, etc.)",
            "message": "detailed issue description",
            "file": "specific file path when applicable",
            "line": optional line number when identifiable,
            "suggestion": "specific actionable fix",
            "impact": "description of potential impact if not addressed"
        }
    ],
    "suggestions": [
        {
            "category": "category name",
            "message": "detailed improvement suggestion",
            "priority": "high|medium|low",
            "effort": "low|medium|high",
            "files": ["list of affected files if applicable"]
        }
    ],
    "fileAnalysis": [
        {
            "file": "file path",
            "issues": number of issues,
            "quality": "excellent|good|fair|poor",
            "mainConcerns": ["list of primary concerns for this file"]
        }
    ],
    "productionReadiness": {
        "deploymentReady": boolean,
        "criticalBlockers": ["list of issues that must be fixed before deployment"],
        "performanceImpact": "assessment of performance implications",
        "securityRisks": ["list of security concerns"],
        "monitoringNeeds": ["recommended monitoring/logging improvements"]
    },
    "prDescription": "auto-generated PR description in markdown format with focus on production impact"
}`;

        const response = await this.client.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: this.model,
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from Groq API');
        }

        return content;
    }

    async generatePRTitle(commitMessage: string, summary: string): Promise<string> {
        const prompt = `Generate a concise, descriptive PR title based on:
Commit Message: ${commitMessage}
Summary: ${summary}

Guidelines:
- Keep it under 72 characters
- Use imperative mood
- Be specific and descriptive
- Don't include PR/commit prefixes

Return only the title, nothing else.`;

        const response = await this.client.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: this.model,
            temperature: 0.7,
            max_tokens: 100
        });

        return response.choices[0]?.message?.content?.trim() || commitMessage;
    }

    async checkIssueRelevance(issueContext: string, commitContext: string): Promise<{
        isRelevant: boolean;
        score: number;
        explanation: string;
        mismatches: string[];
    }> {
        const prompt = `You are an expert code reviewer. Analyze whether the commit changes are relevant to solving the GitHub issue.

${issueContext}

${commitContext}

Analyze:
1. Does the commit address the issue described?
2. Are the file changes relevant to fixing the issue?
3. Does the commit message reference the issue appropriately?
4. Are there any mismatches between what the issue requests and what was changed?

Provide a relevance score from 0-100:
- 90-100: Highly relevant, directly addresses the issue
- 70-89: Mostly relevant, addresses core aspects
- 50-69: Partially relevant, some connection to issue
- 30-49: Barely relevant, tangential connection
- 0-29: Not relevant, unrelated changes

Respond in JSON format:
{
    "isRelevant": true/false,
    "score": 0-100,
    "explanation": "detailed explanation of relevance",
    "mismatches": ["list of any mismatches or missing aspects"]
}`;

        const response = await this.client.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: this.model,
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from Groq API');
        }

        const result = JSON.parse(content);
        result.isRelevant = result.score >= 50;
        
        return result;
    }
}
