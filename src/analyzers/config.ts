import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import type { Config } from '../types';

const DEFAULT_CONFIG: Config = {
  analysis: {
    codeQuality: true,
    security: true,
    performance: true,
    bestPractices: true,
    documentation: true,
    minScore: 70,
    ignore: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.log',
      '*.lock',
      '.git/**'
    ]
  },
  checks: {
    commitMessage: true,
    testsIncluded: true,
    breakingChanges: true,
    complexity: true,
    securityIssues: true
  },
  agent: {
    verbosity: 'normal',
    generatePRDescription: true,
    suggestImprovements: true,
    maxSuggestions: 5
  },
  project: {
    type: 'auto',
    languages: 'auto',
    frameworks: 'auto'
  }
};

export function loadConfig(configPath?: string): Config {
  const searchPaths = [
    configPath,
    join(process.cwd(), 'oggy.config.yaml'),
    join(process.cwd(), 'oggy.config.yml'),
    join(process.cwd(), '.oggy.yaml'),
    join(process.cwd(), '.oggy.yml')
  ].filter(Boolean) as string[];

  for (const path of searchPaths) {
    if (existsSync(path)) {
      try {
        const fileContent = readFileSync(path, 'utf-8');
        const userConfig = yaml.load(fileContent) as Partial<Config>;
        return mergeConfig(DEFAULT_CONFIG, userConfig);
      } catch (error) {
        console.warn(`Failed to load config from ${path}:`, error);
      }
    }
  }

  return DEFAULT_CONFIG;
}

function mergeConfig(defaultConfig: Config, userConfig: Partial<Config>): Config {
  return {
    analysis: { ...defaultConfig.analysis, ...userConfig.analysis },
    checks: { ...defaultConfig.checks, ...userConfig.checks },
    agent: { ...defaultConfig.agent, ...userConfig.agent },
    project: { ...defaultConfig.project, ...userConfig.project }
  };
}

export function validateConfig(config: Config): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.analysis.minScore < 0 || config.analysis.minScore > 100) {
    errors.push('analysis.minScore must be between 0 and 100');
  }

  if (!['quiet', 'normal', 'verbose'].includes(config.agent.verbosity)) {
    errors.push('agent.verbosity must be one of: quiet, normal, verbose');
  }

  if (config.agent.maxSuggestions < 1) {
    errors.push('agent.maxSuggestions must be at least 1');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
