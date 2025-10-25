# Oggy - AI-Powered Code Analysis CLI

An intelligent CLI agent that provides comprehensive code analysis for commits, entire codebases, and production readiness. Built with AI-powered insights for modern development workflows.

## Features

- AI-Powered Analysis - Advanced LLM-based code review using Groq's fast inference
- Agent Architecture - Intelligent planning and reasoning, not just simple prompts
- Comprehensive Checks - Code quality, security, performance, production readiness
- Multi-Language Support - TypeScript, JavaScript, Python, Java, Go, Rust, C++, and more
- Framework-Aware - React, Vue, Angular, Django, Spring, Express, and many others
- Production-Ready Analysis - Enterprise-grade quality checks and deployment readiness
- Detailed Reports - File-specific issues with line numbers and actionable suggestions
- End-to-End Testing - E2E test analysis and recommendations
- Git Integration - Analyze commits, unstaged changes, or remote repositories
- Beautiful CLI - Colorful, informative terminal output with progress indicators
- Highly Configurable - Customize analysis rules via YAML configuration
- Cross-Platform - Native binaries for Windows, macOS (Intel & Apple Silicon), and Linux

## Quick Start

### Installation

#### Option 1: One-Line Install (Recommended)

Windows (PowerShell as Administrator):
```powershell
iwr "https://raw.githubusercontent.com/krishvsoni/oggy/main/Install-Oggy.ps1" -OutFile "Install-Oggy.ps1"; .\Install-Oggy.ps1
```

Linux/macOS:
```bash
curl -sSL https://raw.githubusercontent.com/krishvsoni/oggy/main/install.sh | bash
```

#### Option 2: Manual Download
1. Go to [Releases](https://github.com/krishvsoni/oggy/releases/latest)
2. Download the binary for your platform:
    - Windows: `oggy.exe`
    - macOS Intel: `oggy-macos` 
    - macOS Apple Silicon: `oggy-macos-arm64`
    - Linux x64: `oggy-linux`
    - Linux ARM64: `oggy-linux-arm64`
3. Make executable and add to PATH

### Setup

1. Get your Groq API key:
    - Visit [console.groq.com](https://console.groq.com)
    - Sign up/login → API Keys → Create new key

2. Initialize Oggy in your project:
    ```bash
    oggy init                    # Basic setup
    oggy init --production       # Production-ready setup
    oggy init --language python # Language-specific setup
    ```

3. Configure your API key:
    ```bash
    oggy setup                   # Interactive setup
    # Or manually add to .env:
    # GROQ_API_KEY=your_api_key_here
    ```

## Usage

### Basic Analysis
```bash
# Analyze latest commit
oggy analyze

# Analyze unstaged changes
oggy analyze --unstaged

# Analyze specific commit
oggy analyze --commit abc123

# Analyze entire codebase
oggy analyze --whole-codebase
```

### Advanced Analysis
```bash
# Production readiness check
oggy analyze --production

# With end-to-end testing analysis
oggy analyze --e2e-tests

# Analyze remote repository
oggy analyze --git-url https://github.com/user/repo.git

# Save detailed report
oggy analyze --output report.md

# Use different AI model
oggy analyze --model llama-3.1-8b-instant
```

### Configuration
```bash
# View current configuration
oggy config

# Initialize with custom options
oggy init --production --language typescript --framework react
```

## How It Works

### Intelligent Agent Architecture

Unlike simple prompt-based tools, Oggy uses a sophisticated agent system:

```
Planning Phase
    ↓
Analysis Strategy Creation
    ↓  
Multi-Step Reasoning Process
    ↓
Comprehensive Code Analysis
    ↓
Production Readiness Assessment
    ↓
Detailed Report Generation
```

### Analysis Capabilities

- Code Quality: Architecture, maintainability, design patterns
- Security: Vulnerability detection, secure coding practices
- Performance: Optimization opportunities, scalability issues
- Production Readiness: Error handling, logging, monitoring
- Testing: Coverage analysis, E2E testing recommendations
- Best Practices: Language and framework-specific conventions
- Breaking Changes: Impact assessment and migration strategies

## Example Output

```
================================================================================
COMMIT ANALYSIS REPORT
================================================================================

Commit Information:
    Hash:    a1b2c3d4
    Message: Add user authentication with JWT
    Author:  John Doe
    Files:   8 changed

Overall Score:
    87/100

Status:
    READY

Summary:
    Well-structured authentication implementation with good security practices.
    Minor performance optimizations recommended for production deployment.

Issues Found:

    CRITICAL (0):
    None found

    HIGH (1):
        • Security: JWT secret should be configurable via environment
          Location: src/auth/jwt.ts:15
          Suggestion: Move JWT_SECRET to environment variables

    MEDIUM (2):
        • Performance: Synchronous bcrypt usage in authentication
          Location: src/auth/password.ts:23
          Suggestion: Use bcrypt.hash() async version

File Analysis:
    src/auth/jwt.ts        - 1 issue  - Good quality
    src/auth/password.ts   - 1 issue  - Good quality
    src/middleware/auth.ts - 0 issues - Excellent quality

Production Readiness:
    Deployment Ready: Yes
    Performance Impact: Minor optimizations needed
    Security Risks: 1 configuration issue
    Monitoring: Add authentication metrics

Suggestions:
    1. [HIGH] Security: Implement rate limiting for auth endpoints
    2. [MEDIUM] Performance: Add caching for user sessions
    3. [LOW] Documentation: Add API documentation for auth routes

Generated PR Description:
    # Add JWT-based user authentication
    
    ## Changes
    - Implemented secure JWT authentication
    - Added password hashing with bcrypt
    - Created authentication middleware
    - Added login/logout endpoints
    
    ## Security Features
    - JWT token validation
    - Secure password hashing
    - Session management
    
    ## Testing
    - Unit tests for auth service
    - Integration tests for endpoints
    - Manual testing completed
```

## Configuration

Create `oggy.config.yaml` in your project:

```yaml
analysis:
  codeQuality: true
  security: true
  performance: true
  productionReadiness: true
  e2eTests: true
  minScore: 80

checks:
  commitMessage: true
  testsIncluded: true
  breakingChanges: true
  typeChecking: true
  linting: true

agent:
  verbosity: normal  # quiet | normal | verbose
  generatePRDescription: true
  maxSuggestions: 10
  focusAreas:
     - security
     - performance
     - production-readiness

project:
  type: web-app
  languages: [typescript, python]
  frameworks: [react, fastapi]
  productionEnvironment: true
```

## Language & Framework Support

### Languages
- JavaScript/TypeScript - React, Vue, Angular, Node.js
- Python - Django, Flask, FastAPI
- Java - Spring, Hibernate
- Go - Gin, Echo, Fiber
- Rust - Actix, Rocket, Warp
- C/C++ - Performance-critical applications
- C# - .NET applications
- PHP - Laravel, Symfony
- Ruby - Rails applications

### Testing Frameworks
- Frontend: Jest, Cypress, Playwright, Selenium
- Backend: PyTest, JUnit, Go testing, Rust tests
- E2E: Comprehensive end-to-end testing analysis

### Build Tools
- JavaScript: npm, Webpack, Vite, Rollup
- Python: pip, Poetry, setuptools
- Java: Maven, Gradle
- Go: Go modules
- Rust: Cargo

## Development

```bash
# Clone repository
git clone https://github.com/krishvsoni/oggy.git
cd oggy

# Install dependencies
bun install

# Run in development
bun run dev analyze

# Build for all platforms
bun run build:all

# Build for specific platform
bun run build:windows  # or build:linux, build:macos
```

## Available Models

| Model | Speed | Quality | Use Case |
|-------|-------|---------|----------|
| `llama-3.3-70b-versatile` | Medium | Excellent | Default, best analysis |
| `llama-3.1-8b-instant` | Fast | Good | Quick checks, CI/CD |
| `mixtral-8x7b-32768` | Medium | Very Good | Long context analysis |



## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

- AI Powered by [Groq](https://groq.com) - Ultra-fast LLM inference
- Built with [Bun](https://bun.sh) - Fast JavaScript runtime
- Inspired by modern code review practices

---

Made for better code quality and production readiness

[![GitHub Stars](https://img.shields.io/github/stars/krishvsoni/oggy?style=social)](https://github.com/krishvsoni/oggy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform Support](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)](https://github.com/krishvsoni/oggy/releases)
