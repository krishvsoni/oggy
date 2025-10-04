# Oggy Usage Examples

## Basic Usage

### Analyze Latest Commit
```bash
bun run src/cli.ts analyze
```

### Analyze Specific Commit
```bash
bun run src/cli.ts analyze --commit a1b2c3d
```

### Analyze Unstaged Changes (Before Committing)
```bash
bun run src/cli.ts analyze --unstaged
```

## Advanced Usage

### Save Report to File
```bash
bun run src/cli.ts analyze --output report.md
```

### Use Custom Config File
```bash
bun run src/cli.ts analyze --config ./custom-config.yaml
```

### Use Different Model
```bash
# Faster, lighter model
bun run src/cli.ts analyze --model llama-3.1-8b-instant

# Most powerful model (default)
bun run src/cli.ts analyze --model llama-3.1-70b-versatile

# Good balance
bun run src/cli.ts analyze --model mixtral-8x7b-32768
```

## Configuration Examples

### Strict Mode (High Standards)
```yaml
# oggy.config.yaml
analysis:
  minScore: 85
  
agent:
  verbosity: verbose
  maxSuggestions: 10
```

### Quick Mode (Less Strict)
```yaml
# oggy.config.yaml
analysis:
  minScore: 60
  security: true
  performance: false
  documentation: false
  
agent:
  verbosity: quiet
  suggestImprovements: false
```

### Security-Focused
```yaml
# oggy.config.yaml
analysis:
  security: true
  codeQuality: false
  performance: false
  minScore: 50
  
checks:
  securityIssues: true
  commitMessage: false
  testsIncluded: false
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Commit Analysis
on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - name: Analyze commits
        env:
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
        run: bun run src/cli.ts analyze
```

### GitLab CI
```yaml
analyze-commit:
  script:
    - bun install
    - bun run src/cli.ts analyze
  variables:
    GROQ_API_KEY: $GROQ_API_KEY
```

## Pre-commit Hook

### Automatic Analysis Before Each Commit
```bash
# Setup once
bun run setup-hooks

# Now every commit will be analyzed automatically
git commit -m "your changes"

# Skip analysis if needed
git commit --no-verify -m "urgent fix"
```

## Common Workflows

### Before Creating a PR
```bash
# 1. Make your changes
# 2. Commit them
git commit -m "feat: add new feature"

# 3. Analyze the commit
bun run src/cli.ts analyze

# 4. If score is good, push and create PR
git push origin feature-branch
```

### Analyzing Multiple Commits
```bash
# Get list of commits
git log --oneline -5

# Analyze each one
bun run src/cli.ts analyze --commit abc123
bun run src/cli.ts analyze --commit def456
```

### Testing Changes Before Commit
```bash
# Make changes but don't commit yet
# Analyze unstaged changes
bun run src/cli.ts analyze --unstaged

# Fix issues
# Analyze again
bun run src/cli.ts analyze --unstaged

# When ready, commit
git add .
git commit -m "your message"
```

## Output Formats

### Terminal Output (Default)
Beautiful colored output in terminal

### Markdown Report
```bash
bun run src/cli.ts analyze --output report.md
```

### Quiet Mode (CI/CD)
```bash
# Only essential output
bun run src/cli.ts analyze --config quiet-config.yaml
```

## Troubleshooting

### No API Key Error
```bash
# Set your API key
echo "GROQ_API_KEY=your_key_here" > .env
```

### Not a Git Repository
```bash
# Initialize git first
git init
```

### Configuration Errors
```bash
# Check your config
bun run src/cli.ts config

# Use default config
bun run src/cli.ts analyze --config oggy.config.yaml
```
