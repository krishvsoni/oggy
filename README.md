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

#### Option 1: Download Pre-built Binary (Recommended)
1. Go to [Releases](https://github.com/krishvsoni/oggy/releases/latest)
2. Download the appropriate binary for your OS:
   - **Windows**: `oggy.exe`
   - **macOS**: `oggy-macos`
   - **Linux**: `oggy-linux`
3. Make it executable and move to PATH

#### Option 2: Quick Install Script

**Windows (PowerShell as Administrator):**
```powershell
# Download and run installer
curl -o install.bat https://raw.githubusercontent.com/krishvsoni/oggy/main/install.bat
.\install.bat
```

**Linux/macOS:**
```bash
# Download and run installer
curl -sSL https://raw.githubusercontent.com/krishvsoni/oggy/main/install.sh | bash
```

#### Option 3: Manual Installation
```bash
# Clone the repository
git clone https://github.com/krishvsoni/oggy.git
cd oggy

# Install dependencies
bun install

# Build the executable
bun run build

# The executable will be created as oggy.exe (Windows) or oggy (Unix)
```

### Setup

The executable comes with built-in configuration, but you can customize it:

1. Get your Groq API key from [console.groq.com](https://console.groq.com)
2. Create a `.env` file in your project:
    ```
    GROQ_API_KEY=your_api_key_here
    ```
3. Initialize Oggy in your project:
    ```bash
    oggy init
    ```

### Usage

```bash
# Analyze latest commit
oggy analyze

# Analyze specific commit
oggy analyze --commit abc123

# Analyze unstaged changes
oggy analyze --unstaged

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
