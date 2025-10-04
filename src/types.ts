export interface Config {
  analysis: {
    codeQuality: boolean;
    security: boolean;
    performance: boolean;
    bestPractices: boolean;
    documentation: boolean;
    minScore: number;
    ignore: string[];
  };
  checks: {
    commitMessage: boolean;
    testsIncluded: boolean;
    breakingChanges: boolean;
    complexity: boolean;
    securityIssues: boolean;
  };
  agent: {
    verbosity: 'quiet' | 'normal' | 'verbose';
    generatePRDescription: boolean;
    suggestImprovements: boolean;
    maxSuggestions: number;
  };
  project: {
    type: string;
    languages: string | string[];
    frameworks: string | string[];
  };
}

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: string;
  files: FileChange[];
}

export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  diff: string;
}

export interface AnalysisResult {
  score: number;
  status: 'ready' | 'needs-work' | 'not-ready';
  summary: string;
  issues: Issue[];
  suggestions: Suggestion[];
  prDescription?: string;
}

export interface Issue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  message: string;
  file?: string;
  line?: number;
  suggestion?: string;
}

export interface Suggestion {
  category: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AgentThought {
  step: number;
  thought: string;
  action: string;
  reasoning: string;
}

export interface AgentPlan {
  goal: string;
  steps: string[];
  estimatedComplexity: 'low' | 'medium' | 'high';
}
