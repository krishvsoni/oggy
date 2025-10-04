# Oggy Setup Guide

Complete step-by-step guide to set up and use Oggy in your projects.

## Prerequisites

- [Bun](https://bun.sh) v1.0.0 or higher
- Git repository
- [Groq API key](https://console.groq.com) (free tier available)

## Installation

### Step 1: Install Bun (if not already installed)

**macOS/Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows:**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

### Step 2: Clone or Download Oggy

```bash
git clone https://github.com/krishvsoni/oggy.git
cd oggy
```

Or add to existing project:
```bash
# In your project directory
git clone https://github.com/krishvsoni/oggy.git .oggy
cd .oggy
```

### Step 3: Install Dependencies

```bash
bun install
```

### Step 4: Get Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys
4. Create a new API key
5. Copy the key

### Step 5: Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your API key
echo "GROQ_API_KEY=your_actual_api_key_here" > .env
```

### Step 6: Initialize Configuration

```bash
bun run src/cli.ts init
```

This creates `oggy.config.yaml` in your project root.

### Step 7: Test Installation

```bash
# Make a test commit first
git add .
git commit -m "test: oggy setup"

# Run analysis
bun run src/cli.ts analyze
```

## Configuration

### Basic Configuration

Edit `oggy.config.yaml`:

```yaml
analysis:
  minScore: 70  # Adjust based on your standards
  
agent:
  verbosity: normal  # quiet | normal | verbose
  generatePRDescription: true
```

### Environment Variables

Edit `.env`:

```bash
# Required
GROQ_API_KEY=your_api_key_here

# Optional
GROQ_MODEL=llama-3.1-70b-versatile
```

## Usage Patterns

### 1. Manual Analysis

```bash
# Analyze latest commit
bun run src/cli.ts analyze

# Analyze before committing
bun run src/cli.ts analyze --unstaged
```

### 2. Automatic Analysis (Recommended)

Set up pre-commit hook:

```bash
bun run setup-hooks
```

Now every commit is automatically analyzed!

### 3. CI/CD Integration

Add to your GitHub Actions:

```yaml
# .github/workflows/commit-check.yml
name: Commit Check
on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: cd .oggy && bun install
      - name: Analyze
        env:
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
        run: cd .oggy && bun run src/cli.ts analyze
```

## Troubleshooting

### Error: GROQ_API_KEY not found

**Solution:**
```bash
# Check if .env exists
ls -la .env

# Create it if missing
echo "GROQ_API_KEY=your_key" > .env

# Verify it's loaded
cat .env
```

### Error: Not a git repository

**Solution:**
```bash
# Initialize git if needed
git init
git add .
git commit -m "initial commit"
```

### Error: Module not found

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
bun install
```

### Analysis is too slow

**Solution:**
```bash
# Use faster model
bun run src/cli.ts analyze --model llama-3.1-8b-instant

# Or update .env
echo "GROQ_MODEL=llama-3.1-8b-instant" >> .env
```

### Too many suggestions

**Solution:**
Edit `oggy.config.yaml`:
```yaml
agent:
  maxSuggestions: 3  # Reduce from default 5
```

### Score is too strict/lenient

**Solution:**
Edit `oggy.config.yaml`:
```yaml
analysis:
  minScore: 60  # Lower for lenient, higher for strict
```

## Project-Specific Setup

### For Web Applications

```yaml
# oggy.config.yaml
project:
  type: web-app
  frameworks: [react, next.js]

analysis:
  performance: true  # Important for web apps
  security: true
```

### For Libraries/Packages

```yaml
# oggy.config.yaml
project:
  type: library

checks:
  documentation: true  # Important for libraries
  testsIncluded: true
  breakingChanges: true
```

### For APIs/Backend

```yaml
# oggy.config.yaml
project:
  type: api

analysis:
  security: true  # Critical for APIs
  performance: true

checks:
  securityIssues: true
```

## Advanced Configuration

### Custom Ignore Patterns

```yaml
# oggy.config.yaml
analysis:
  ignore:
    - node_modules/**
    - dist/**
    - "*.generated.*"
    - vendor/**
    - __mocks__/**
```

### Verbosity Levels

```yaml
# oggy.config.yaml
agent:
  verbosity: verbose  # See agent's thinking process
```

**Quiet:** Minimal output (CI/CD)
**Normal:** Balanced output (default)
**Verbose:** Detailed agent reasoning

### Multiple Configurations

```bash
# Development (lenient)
bun run src/cli.ts analyze --config config.dev.yaml

# Production (strict)
bun run src/cli.ts analyze --config config.prod.yaml
```

## Best Practices

1. **Analyze Before Pushing**
   ```bash
   bun run src/cli.ts analyze
   git push
   ```

2. **Use Pre-commit Hook**
   - Catches issues early
   - Consistent code quality

3. **Set Appropriate minScore**
   - Start with 60-70
   - Increase gradually
   - Balance quality vs speed

4. **Review Suggestions**
   - Don't ignore them
   - Learn from patterns
   - Update config as needed

5. **Use in CI/CD**
   - Enforce quality gates
   - Fail builds on critical issues

## Getting Help

- **Issues:** [GitHub Issues](https://github.com/krishvsoni/oggy/issues)
- **Discussions:** [GitHub Discussions](https://github.com/krishvsoni/oggy/discussions)
- **Contributing:** See [CONTRIBUTING.md](CONTRIBUTING.md)

## Next Steps

- ✅ Set up pre-commit hook
- ✅ Customize configuration for your project
- ✅ Integrate with CI/CD
- ✅ Share with your team
- ✅ Contribute improvements

Happy coding! 🚀
