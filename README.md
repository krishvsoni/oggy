# Oggy - AI Commit Analyzer

An intelligent CLI agent that analyzes your commits before PR creation, similar to CodeRabbit but running locally with open-source integrations.

## Features

- **AI-Powered Analysis** - Uses Groq's fast LLM API for intelligent code review
- **Agent-Based Architecture** - Proper planning and reasoning process, not just simple prompts
- **Comprehensive Checks** - Code quality, security, performance, best practices, documentation
- **Detailed Reports** - Clear scoring and actionable suggestions
- **PR Readiness** - Validates commits before you create pull requests
- **Beautiful CLI** - Colorful, informative terminal output
- **Highly Configurable** - Customize analysis rules via YAML config
- **100% Open Source** - Uses only open-source integrations

## Quick Start

### Installation

```bash
# Clone or navigate to your project
cd your-project

# Install dependencies
bun install

# Initialize Oggy
bun run src/cli.ts init
```

### Setup

1. Get your Groq API key from [console.groq.com](https://console.groq.com)
2. Add it to `.env`:
    ```
    GROQ_API_KEY=your_api_key_here
    ```
3. Customize `oggy.config.yaml` to your needs

### Usage

```bash
# Analyze latest commit
bun run src/cli.ts analyze

# Analyze specific commit
bun run src/cli.ts analyze --commit abc123

# Analyze unstaged changes
bun run src/cli.ts analyze --unstaged

# Save report to file
bun run src/cli.ts analyze --output report.md

# Use different model
bun run src/cli.ts analyze --model llama-3.1-8b-instant
```

## How It Works

### Agent Architecture

Unlike simple prompt-based tools, Oggy uses a proper agent architecture:

1. **Planning Phase** - Creates an analysis plan based on commit context
2. **Thinking Phase** - Reasons through each step with explicit thoughts
3. **Execution Phase** - Performs deep analysis with accumulated knowledge
4. **Synthesis Phase** - Generates comprehensive report with PR description

### Analysis Process

```
Commit Detection
     ↓
Metrics Extraction (files, lines, complexity)
     ↓
Agent Plans Analysis Strategy
     ↓
Agent Thinks Through Each Step
     ↓
Deep Code Analysis
     ├─ Code Quality
     ├─ Security Issues
     ├─ Performance
     ├─ Best Practices
     ├─ Documentation
     └─ Testing
     ↓
Generate PR Description
     ↓
PR Readiness Decision
```

## Configuration

Edit `oggy.config.yaml` to customize:

```yaml
analysis:
  codeQuality: true
  security: true
  minScore: 70  # Minimum score for PR approval

checks:
  commitMessage: true
  testsIncluded: true
  breakingChanges: true

agent:
  verbosity: normal  # quiet | normal | verbose
  generatePRDescription: true
  maxSuggestions: 5
```

## Example Output

```
COMMIT ANALYSIS REPORT
================================================================================

Commit Information:
    Hash:    a1b2c3d4
    Message: Add user authentication
    Author:  John Doe
    Files:   5 changed

Overall Score:
    85/100

Status:
    READY

Issues Found:
    HIGH (1):
        • Security: Potential SQL injection vulnerability
          Location: src/db.ts:45
          Suggestion: Use parameterized queries

Suggestions:
    1. [HIGH] Testing
        Add integration tests for authentication flow

PR Readiness:
    Ready for Pull Request!

Generated PR Description:
    # Add user authentication with JWT
    
    ## Changes
    - Implemented JWT-based authentication
    - Added login/logout endpoints
    - Created user session management
    
    ## Testing
    - Added unit tests for auth service
    - Manual testing completed
```

## Development

```bash
# Install dependencies
bun install

# Run in development
bun run dev analyze

# Build for production
bun run build

# Run built version
bun run start analyze
```

## Available Models

- `llama-3.1-70b-versatile` (Default, most capable)
- `llama-3.1-8b-instant` (Faster, lighter)
- `mixtral-8x7b-32768` (Good balance)

## Contributing

This is an open-source project! Contributions are welcome.

## License

MIT

## Credits

- Powered by [Groq](https://groq.com) - Fast LLM inference
- Built with [Bun](https://bun.sh) - Fast JavaScript runtime
- Inspired by CodeRabbit's commit analysis approach

---

Made with love for better code reviews

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.19. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
