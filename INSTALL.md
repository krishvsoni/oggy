# Oggy CLI - Download & Installation Guide

## User Installation Options

You have **two main options** for using Oggy:

### Option 1: Pre-built Binary (Recommended for End Users)
- Download and install the binary directly 
- No development tools required
- Users need to configure their own GROQ API key
- ✅ **Best for users who just want to use Oggy**

### Option 2: Repository Setup (For Developers)
- Clone the repository and run from source
- Requires Bun runtime
- Full development environment
- ✅ **Best for contributors and developers**

---

## Option 1: Pre-built Binary Installation

### Windows

**Method 1 - PowerShell (Recommended):**
```powershell
# Download and run installer (as Administrator)
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/krishvsoni/oggy/main/Install-Oggy.ps1" -OutFile "Install-Oggy.ps1"
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\Install-Oggy.ps1
```

**Method 2 - Manual:**
1. Download the correct binary from [Releases](https://github.com/krishvsoni/oggy/releases/latest):
   - **Windows (x64):** `oggy.exe`
2. Create folder: `C:\Program Files\Oggy\`
3. Move `oggy.exe` to that folder
4. Add `C:\Program Files\Oggy\` to your PATH environment variable
5. Restart terminal

### Linux/macOS

**Method 1 - Install Script:**
```bash
# Download and run installer
curl -sSL https://raw.githubusercontent.com/krishvsoni/oggy/main/install.sh | bash
```

**Method 2 - Manual:**
```bash
# Download the correct binary for your platform from releases:
# Linux x64:
curl -L -o oggy https://github.com/krishvsoni/oggy/releases/latest/download/oggy-linux
# Linux ARM64:
curl -L -o oggy https://github.com/krishvsoni/oggy/releases/latest/download/oggy-linux-arm64
# macOS Intel:
curl -L -o oggy https://github.com/krishvsoni/oggy/releases/latest/download/oggy-macos
# macOS Apple Silicon (M1/M2):
curl -L -o oggy https://github.com/krishvsoni/oggy/releases/latest/download/oggy-macos-arm64

# Make executable and install
chmod +x oggy
sudo mv oggy /usr/local/bin/oggy

# Or install to user directory
mkdir -p ~/.local/bin
mv oggy ~/.local/bin/oggy
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
```

### Setup After Installation

**All platforms need API key configuration:**

1. **Get Groq API key:**
   - Visit [console.groq.com](https://console.groq.com)
   - Sign up/login → API Keys → Create new key

2. **Configure Oggy:**
   ```bash
   # Run setup wizard
   oggy setup
   
   # Or manually set environment variable
   # Windows (cmd):
   setx GROQ_API_KEY "your_api_key_here"
   
   # Windows (PowerShell):
   [Environment]::SetEnvironmentVariable("GROQ_API_KEY", "your_api_key_here", "User")
   
   # Linux/macOS:
   echo 'export GROQ_API_KEY="your_api_key_here"' >> ~/.bashrc
   source ~/.bashrc
   ```

3. **Test installation:**
   ```bash
   oggy --help
   # In a git repository:
   oggy analyze
   ```

---

## Option 2: Repository Setup

### Prerequisites
- [Bun](https://bun.sh) runtime
- Git
- [Groq API key](https://console.groq.com)

### Installation Steps

1. **Clone repository:**
   ```bash
   git clone https://github.com/krishvsoni/oggy.git
   cd oggy
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Configure environment:**
   ```bash
   # Copy example env file
   cp .env.example .env
   
   # Edit .env and add your API key
   # GROQ_API_KEY=your_api_key_here
   # GROQ_MODEL=llama-3.3-70b-versatile
   ```

4. **Initialize configuration:**
   ```bash
   bun run src/cli.ts init
   ```

5. **Test setup:**
   ```bash
   bun run src/cli.ts analyze
   ```

6. **Optional - Build executable:**
   ```bash
   bun run build
   # Creates oggy.exe (Windows) or oggy (Unix)
   ```

---

## Usage Examples

Once installed with either method:

```bash
# Basic usage
oggy analyze                    # Analyze latest commit
oggy analyze --unstaged         # Analyze unstaged changes
oggy setup                      # Configure API key
oggy init                       # Initialize config in repo

# Advanced usage  
oggy analyze --commit abc123    # Analyze specific commit
oggy analyze --output report.md # Save report to file
oggy config                     # Show current config
```

---

## Key Differences Between Installation Methods

| Feature | Pre-built Binary | Repository Setup |
|---------|------------------|------------------|
| **Setup Complexity** | Simple download | Requires Bun |
| **Updates** | Manual download | `git pull` |
| **Customization** | Config files only | Full source access |
| **API Key Storage** | User's environment | `.env` file |
| **Best For** | End users | Developers |

---

## Important Notes

### ✅ **Correct Setup:**
- **Binary users:** Set `GROQ_API_KEY` environment variable OR use `oggy setup`
- **Repository users:** Add `GROQ_API_KEY` to `.env` file OR use `oggy init`
- **Both methods:** Users provide their own API keys (security best practice)

### ❌ **API Keys Are NOT:**
- Packed with the executable
- Included in the repository
- Shared between users
- Hard-coded anywhere

### 🔧 **Configuration:**
- Binary: Uses global config (`~/.oggy.env` or environment variables)
- Repository: Uses local config (`.env` file in project)
- Both: Support `oggy.config.yaml` for analysis settings

---

## Troubleshooting

### "Command not found"
- **Binary:** Check PATH environment variable includes install directory
- **Repository:** Use `bun run src/cli.ts` instead of `oggy`

### "GROQ_API_KEY not found"
- **Binary:** Run `oggy setup` or set environment variable
- **Repository:** Check `.env` file exists with correct key

### "Not a git repository"
- Run commands from inside a git repository
- Initialize git: `git init`

### Permission errors (Linux/macOS)
- Use `sudo` for system-wide installation
- Or install to user directory (`~/.local/bin`)

---

## 📋 **Complete Installation Summary**

### **Required Binaries (5 total):**
✅ Your release workflow builds all these:
- `oggy.exe` (Windows x64)
- `oggy-linux` (Linux x64)
- `oggy-linux-arm64` (Linux ARM64)
- `oggy-macos` (macOS Intel)
- `oggy-macos-arm64` (macOS Apple Silicon)

### **Installation Scripts by Platform:**

| Platform | Script | Auto-detects Architecture | Downloads |
|----------|--------|---------------------------|-----------|
| **Windows** | `Install-Oggy.ps1` | ❌ (x64 only) | `oggy.exe` |
| **Linux x64** | `install.sh` | ✅ | `oggy-linux` |
| **Linux ARM64** | `install.sh` | ✅ | `oggy-linux-arm64` |
| **macOS Intel** | `install.sh` | ✅ | `oggy-macos` |
| **macOS Apple Silicon** | `install.sh` | ✅ | `oggy-macos-arm64` |

### **One-Line Install Commands:**

```bash
# Windows (PowerShell as Admin)
iwr "https://raw.githubusercontent.com/krishvsoni/oggy/main/Install-Oggy.ps1" -OutFile "Install-Oggy.ps1"; .\Install-Oggy.ps1

# Linux/macOS (auto-detects architecture)
curl -sSL https://raw.githubusercontent.com/krishvsoni/oggy/main/install.sh | bash
```

### **What You Need to Do:**
1. ✅ **Release workflow is correct** - builds all 5 binaries
2. ✅ **Install scripts are correct** - auto-detect and download right binary
3. ❌ **Delete old files:** ~~`install.bat`~~ (removed)
4. ✅ **Documentation updated** - reflects current setup

---

## Getting Help

- 📖 **Documentation:** [README.md](README.md), [SETUP.md](SETUP.md)
- 🐛 **Issues:** [GitHub Issues](https://github.com/krishvsoni/oggy/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/krishvsoni/oggy/discussions)

---

Happy coding! 🚀