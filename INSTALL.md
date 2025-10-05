# Oggy CLI - Download & Installation Guide

## Quick Install

### Windows
1. Download `oggy.exe` 
2. Run `install.bat` as Administrator
3. Restart your terminal
4. Run `oggy --help` from anywhere!

### Linux/macOS  
1. Download `oggy` (Linux) or `oggy-mac` (macOS)
2. Run `sudo ./install.sh`
3. Run `oggy --help` from anywhere!

## Manual Installation

### Windows
1. Download `oggy.exe`
2. Move it to a folder like `C:\Program Files\Oggy\`
3. Add that folder to your PATH environment variable
4. Restart terminal and run `oggy`

### Linux/macOS
1. Download the appropriate executable
2. Move to `/usr/local/bin/` and make executable:
   ```bash
   sudo mv oggy /usr/local/bin/oggy
   sudo chmod +x /usr/local/bin/oggy
   ```
3. Run `oggy` from anywhere!

## Usage
```bash
oggy analyze          # Analyze current commit
oggy setup           # Configure API key  
oggy init            # Initialize config
oggy --help          # Show all commands
```