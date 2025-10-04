# Oggy Quick Reference

## Installation & Setup

```bash
# 1. Install dependencies
bun install

# 2. Set up API key
cp .env.example .env
# Edit .env and add: GROQ_API_KEY=your_key

# 3. Initialize config
bun run src/cli.ts init

# 4. (Optional) Set up auto-analysis
bun run setup-hooks
```

## Commands

```bash
# Analyze latest commit
bun run src/cli.ts analyze

# Analyze specific commit
bun run src/cli.ts analyze --commit <hash>

# Analyze unstaged changes
bun run src/cli.ts analyze --unstaged

# Save report to file
bun run src/cli.ts analyze --output report.md

# Use different model
bun run src/cli.ts analyze --model llama-3.1-8b-instant

# Custom config
bun run src/cli.ts analyze --config custom.yaml

# Show current config
bun run src/cli.ts config

# Initialize in new project
bun run src/cli.ts init
```

## Available Models

| Model | Speed | Quality | Use Case |
|-------|-------|---------|----------|
| `llama-3.1-70b-versatile` | Medium | High | Default, best quality |
| `llama-3.1-8b-instant` | Fast | Good | Quick checks, CI/CD |
| `mixtral-8x7b-32768` | Medium | High | Long context |

## Configuration Quick Reference

### Minimum Example
```yaml
analysis:
  minScore: 70
```

### Common Settings
```yaml
analysis:
  minScore: 70           # Threshold for PR approval
  codeQuality: true
  security: true
  
agent:
  verbosity: normal      # quiet|normal|verbose
  maxSuggestions: 5
```

### Strict Mode
```yaml
analysis:
  minScore: 85
  security: true
  performance: true
  bestPractices: true
  documentation: true
  
checks:
  commitMessage: true
  testsIncluded: true
  breakingChanges: true
  complexity: true
  securityIssues: true
```

### Lenient Mode
```yaml
analysis:
  minScore: 60
  security: true
  performance: false
  
agent:
  verbosity: quiet
  suggestImprovements: false
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success - commit is PR ready |
| 1 | Failure - issues found or score too low |

## Ignore Patterns

```yaml
analysis:
  ignore:
    - node_modules/**
    - dist/**
    - build/**
    - "*.generated.*"
    - "*.min.js"
    - vendor/**
```

## Environment Variables

```bash
# Required
GROQ_API_KEY=gsk_xxxxx

# Optional
GROQ_MODEL=llama-3.1-70b-versatile
DEBUG=true                # Show debug info
```

## Git Hook

```bash
# Install
bun run setup-hooks

# Skip hook on commit
git commit --no-verify -m "message"

# Uninstall
rm .git/hooks/pre-commit
```

## Common Workflows

### Before Committing
```bash
# 1. Make changes
# 2. Check analysis
bun run src/cli.ts analyze --unstaged
# 3. Fix issues
# 4. Commit
git commit -m "your message"
```

### Before PR
```bash
# 1. Commit changes
git commit -m "feat: add feature"
# 2. Analyze
bun run src/cli.ts analyze
# 3. If good, push
git push origin feature-branch
```

### In CI/CD
```yaml
- run: bun install
- run: bun run src/cli.ts analyze
  env:
    GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
```

## Troubleshooting

### Error: GROQ_API_KEY not found
```bash
# Create .env file
echo "GROQ_API_KEY=your_key" > .env
```

### Error: Not a git repository
```bash
git init
```

### Too slow
```bash
# Use faster model
bun run src/cli.ts analyze --model llama-3.1-8b-instant
```

### Too many suggestions
```yaml
# In oggy.config.yaml
agent:
  maxSuggestions: 3
```

### Score too strict/lenient
```yaml
# In oggy.config.yaml
analysis:
  minScore: 60  # Lower = more lenient
```

## File Locations

| File | Purpose |
|------|---------|
| `.env` | API keys (gitignored) |
| `oggy.config.yaml` | Main configuration |
| `.oggy.yaml` | Alt config location |
| `.git/hooks/pre-commit` | Auto-analysis hook |

## Support

- 📖 Docs: README.md, SETUP.md, EXAMPLES.md
- 🏗️ Architecture: ARCHITECTURE.md
- 🤝 Contributing: CONTRIBUTING.md
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

## Tips

✅ **DO:**
- Analyze before pushing
- Use pre-commit hook
- Review suggestions
- Customize config for your project
- Start with lenient settings

❌ **DON'T:**
- Commit API keys
- Ignore critical issues
- Set minScore too low
- Skip analysis in CI/CD
- Use --no-verify regularly

## Links

- Get Groq API Key: https://console.groq.com
- Bun Runtime: https://bun.sh
- GitHub Repo: https://github.com/krishvsoni/oggy
