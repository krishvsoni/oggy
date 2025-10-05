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
        thoughts: AgentThought[]
    ): Promise<string> {
        const thoughtsContext = thoughts.map(t => 
            `Step ${t.step} - ${t.action}: ${t.reasoning}`
        ).join('\n');

        const prompt = `You are an expert code review agent. Analyze this commit thoroughly.

Commit Message: ${commitMessage}

Analysis Metrics:
- Files Changed: ${analysisMetrics.filesChanged}
- Lines Added: ${analysisMetrics.linesAdded}
- Lines Deleted: ${analysisMetrics.linesDeleted}
- Complexity: ${analysisMetrics.complexity}
- Test Files: ${analysisMetrics.testFiles.length}
- Code Files: ${analysisMetrics.codeFiles.length}
- Has Breaking Changes: ${analysisMetrics.hasBreakingChanges}

Agent's Analysis Plan:
${plan.goal}

Agent's Thoughts:
${thoughtsContext}

Code Changes:
${codeContext.substring(0, 15000)} ${codeContext.length > 15000 ? '...(truncated)' : ''}

Based on your plan and thoughts, provide a comprehensive analysis covering:
1. Code Quality (structure, readability, maintainability)
2. Security Issues (vulnerabilities, unsafe patterns)
3. Performance Concerns (inefficiencies, bottlenecks)
4. Best Practices (adherence to standards, patterns)
5. Documentation (comments, clarity)
6. Testing (test coverage, quality)
7. Breaking Changes (impact, migration)
8. Overall PR Readiness

Respond in JSON format:
{
    "score": 0-100,
    "status": "ready|needs-work|not-ready",
    "summary": "brief overall summary",
    "issues": [
        {
            "severity": "critical|high|medium|low",
            "category": "category name",
            "message": "issue description",
            "file": "optional file path",
            "line": optional line number,
            "suggestion": "optional fix suggestion"
        }
    ],
    "suggestions": [
        {
            "category": "category name",
            "message": "suggestion text",
            "priority": "high|medium|low"
        }
    ],
    "prDescription": "auto-generated PR description in markdown format"
}`;

        const response = await this.client.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: this.model,
            temperature: 0.4,
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
}
