/**
 * Oggy - AI-Powered Commit Analysis CLI
 * 
 * An intelligent agent that analyzes your commits before PRs,
 * similar to CodeRabbit but running locally with open-source tools.
 * 
 * @see https://github.com/krishvsoni/oggy
 * @author Krish Soni
 */

export { CommitAnalyzer } from './src/analyzers/commit';
export { CodeAnalyzer } from './src/analyzers/code';
export { loadConfig, validateConfig } from './src/analyzers/config';
export { ReportGenerator } from './src/analyzers/report';
export { GroqAgent } from './src/agent/groq';
export { AgentOrchestrator } from './src/agent/orchestrator';

export type {
  Config,
  CommitInfo,
  FileChange,
  AnalysisResult,
  Issue,
  Suggestion,
  AgentThought,
  AgentPlan
} from './src/types';
