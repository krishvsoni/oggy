# Contributing to Oggy

Thank you for your interest in contributing to Oggy! This document provides guidelines for contributing.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `bun install`
3. Copy `.env.example` to `.env` and add your Groq API key
4. Run in development: `bun run dev analyze`

## Project Structure

```
oggy/
├── src/
│   ├── cli.ts              # Main CLI entry point
│   ├── types.ts            # TypeScript type definitions
│   ├── agent/
│   │   ├── groq.ts         # Groq AI agent
│   │   └── orchestrator.ts # Agent orchestration logic
│   └── analyzers/
│       ├── code.ts         # Code analysis
│       ├── commit.ts       # Git commit handling
│       ├── config.ts       # Configuration management
│       └── report.ts       # Report generation
├── oggy.config.yaml        # Default configuration
└── package.json
```

## Adding New Features

### Adding a New Analyzer

1. Create a new file in `src/analyzers/`
2. Implement the analyzer class
3. Export the analyzer
4. Integrate it in `orchestrator.ts`

### Adding New Agent Capabilities

1. Add new methods to `src/agent/groq.ts`
2. Update the agent prompts
3. Test with various commit scenarios

### Adding New Configuration Options

1. Update `src/types.ts` with new config types
2. Update `oggy.config.yaml` with defaults
3. Update `src/analyzers/config.ts` validation
4. Document in README.md

## Code Style

- Use TypeScript
- Follow existing code style
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Use meaningful variable names

## Testing

Before submitting:

1. Test with various commit types
2. Test with different configuration options
3. Ensure no TypeScript errors
4. Test the CLI commands

## Commit Messages

Use conventional commits:

- `feat: add new feature`
- `fix: bug fix`
- `docs: documentation changes`
- `refactor: code refactoring`
- `test: add tests`
- `chore: maintenance tasks`

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Submit PR with clear description
6. Wait for review

## Ideas for Contributions

- Add support for more languages
- Improve security detection
- Add performance profiling
- Create CI/CD integrations
- Add more output formats (JSON, HTML)
- Improve agent reasoning
- Add custom rules system
- Create VS Code extension

## Questions?

Open an issue for discussion!
