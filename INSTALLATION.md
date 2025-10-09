# Oggy Installation & Setup Guide

Complete guide for installing and setting up Oggy CLI across all platforms.

## Installation Options

### Option 1: One-Line Install (Recommended)

**Windows (PowerShell as Administrator):**
```powershell
iwr "https://raw.githubusercontent.com/krishvsoni/oggy/main/Install-Oggy.ps1" -OutFile "Install-Oggy.ps1"; .\Install-Oggy.ps1
```

**Linux/macOS:**
```bash
curl -sSL https://raw.githubusercontent.com/krishvsoni/oggy/main/install.sh | bash
```

### Option 2: Manual Download

1. **Download from GitHub Releases:**
    - Go to [Releases](https://github.com/krishvsoni/oggy/releases/latest)
    - Download the appropriate binary:

| Platform | Binary File | Architecture |
|----------|-------------|--------------|
| Windows | `oggy.exe` | x64 |
| macOS Intel | `oggy-macos` | x64 |
| macOS Apple Silicon | `oggy-macos-arm64` | ARM64 |
| Linux | `oggy-linux` | x64 |
| Linux ARM | `oggy-linux-arm64` | ARM64 |

2. **Make Executable & Install:**

**Windows:**
```cmd
# Move to a permanent location
mkdir C:\Tools\Oggy
move oggy.exe C:\Tools\Oggy\
# Add to PATH via System Properties > Environment Variables
```

**Linux/macOS:**
```bash
# Make executable
chmod +x oggy-*

# Install system-wide (requires sudo)
sudo mv oggy-* /usr/local/bin/oggy

# Or install for current user
mkdir -p ~/.local/bin
mv oggy-* ~/.local/bin/oggy
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Option 3: Build from Source

```bash
# Prerequisites: Bun runtime
curl -fsSL https://bun.sh/install | bash

# Clone and build
git clone https://github.com/krishvsoni/oggy.git
cd oggy
bun install
bun run build:all
```

## Configuration

### 1. Get Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key

### 2. Setup Methods

#### Method A: Interactive Setup (Recommended)
```bash
oggy setup
# Follow the prompts to enter your API key
```

#### Method B: Manual Environment Variable
```bash
# Windows (Command Prompt)
setx GROQ_API_KEY "your_api_key_here"

# Windows (PowerShell)
[Environment]::SetEnvironmentVariable("GROQ_API_KEY", "your_api_key_here", "User")

# Linux/macOS
echo 'export GROQ_API_KEY="your_api_key_here"' >> ~/.bashrc
source ~/.bashrc
```

#### Method C: Project-Specific .env File
```bash
# In your project directory
echo "GROQ_API_KEY=your_api_key_here" > .env
```

### 3. Initialize Project

```bash
# Basic initialization
oggy init

# Production-ready setup
oggy init --production

# Language-specific setup
oggy init --language typescript --framework react

# Full setup with all options
oggy init --production --language python --framework django
```

## Verification

Test your installation:

```bash
# Check version
oggy --version

# Test configuration
oggy config

# Test analysis (in a git repository)
oggy analyze --help
```

## Configuration Files

After initialization, you'll have:

- `oggy.config.yaml` - Main configuration
- `.env` - Environment variables (API keys)
- `.oggyignore` - Files to ignore during analysis

### Sample `oggy.config.yaml`:

```yaml
analysis:
  codeQuality: true
  security: true
  performance: true
  productionReadiness: true
  minScore: 80

checks:
  commitMessage: true
  testsIncluded: true
  typeChecking: true

agent:
  verbosity: normal
  generatePRDescription: true
  focusAreas:
     - security
     - performance
     - production-readiness

project:
  type: web-app
  languages: typescript
  frameworks: react
```

## Platform-Specific Notes

### Windows
- Requires PowerShell 5.0+ for automatic installation
- May need to run as Administrator for system-wide installation
- Windows Defender might flag the executable (add exclusion if needed)

### macOS
- Apple Silicon and Intel versions available
- May need to allow the app in Security & Privacy settings
- Use Homebrew for additional dependencies if needed

### Linux
- Works on all major distributions (Ubuntu, CentOS, Arch, etc.)
- Both x64 and ARM64 versions available
- May need to install git if not already present

## Troubleshooting

### Common Issues

#### "Command not found"
- Cause: Binary not in PATH
- Solution: Add installation directory to PATH environment variable

#### "Permission denied"
- Cause: Binary not executable
- Solution: `chmod +x oggy-*` (Linux/macOS)

#### "API key not found"
- Cause: GROQ_API_KEY not set
- Solution: Run `oggy setup` or manually set environment variable

#### "Not a git repository"
- Cause: Running outside git repository
- Solution: Initialize git: `git init` or run in existing repository

### Getting Help

- Documentation: [README.md](README.md)
- Issues: [GitHub Issues](https://github.com/krishvsoni/oggy/issues)
- Discussions: [GitHub Discussions](https://github.com/krishvsoni/oggy/discussions)

## Quick Start Examples

### Basic Workflow
```bash
# 1. Initialize in your project
cd your-project
oggy init

# 2. Set up API key
oggy setup

# 3. Analyze latest commit
oggy analyze

# 4. Analyze before committing
git add .
oggy analyze --unstaged
git commit -m "your commit message"
```

### Advanced Usage
```bash
# Production readiness check
oggy analyze --production --whole-codebase

# Remote repository analysis
oggy analyze --git-url https://github.com/user/repo.git

# Generate detailed report
oggy analyze --output detailed-report.md --e2e-tests

# CI/CD integration
oggy analyze --quiet --production
```

## Updates

To update Oggy to the latest version:

1. Binary installations: Download new version from releases
2. Source installations: `git pull && bun run build:all`
3. Check for updates: Follow the GitHub repository for release notifications

---

Happy coding with Oggy!