#!/bin/bash
set -e

echo "Installing Oggy CLI globally..."

# Detect OS and Architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case $OS in
  linux*)
    case $ARCH in
      x86_64) BINARY_NAME="oggy-linux" ;;
      arm64|aarch64) BINARY_NAME="oggy-linux-arm64" ;;
      *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
    esac
    ;;
  darwin*)
    case $ARCH in
      x86_64) BINARY_NAME="oggy-macos" ;;
      arm64) BINARY_NAME="oggy-macos-arm64" ;;
      *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
    esac
    ;;
  *)
    echo "Unsupported OS: $OS"
    echo "For Windows, please use: Install-Oggy.ps1"
    exit 1
    ;;
esac

# Get latest release info
echo "Fetching latest release..."
LATEST_RELEASE=$(curl -s https://api.github.com/repos/krishvsoni/oggy/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')

if [ -z "$LATEST_RELEASE" ]; then
    echo "Failed to fetch latest release"
    exit 1
fi

# Download binary
DOWNLOAD_URL="https://github.com/krishvsoni/oggy/releases/download/${LATEST_RELEASE}/${BINARY_NAME}"
echo "Downloading Oggy ${LATEST_RELEASE} for ${OS} (${ARCH})..."

curl -L -o oggy "$DOWNLOAD_URL"
if [ $? -ne 0 ]; then
    echo "Failed to download binary"
    echo "Please check if the release exists: $DOWNLOAD_URL"
    exit 1
fi

chmod +x oggy

# Install globally
if [ "$EUID" -eq 0 ] || [ "$(id -u)" -eq 0 ]; then
    # Running as root/admin
    mv oggy /usr/local/bin/oggy
    echo "Oggy installed successfully to /usr/local/bin/"
else
    # Install to user directory
    mkdir -p ~/.local/bin
    mv oggy ~/.local/bin/oggy
    echo "Oggy installed successfully to ~/.local/bin/"
    
    # Add to PATH if not already there
    if ! echo "$PATH" | grep -q "$HOME/.local/bin"; then
        # Update shell configs
        for shell_config in ~/.bashrc ~/.zshrc ~/.profile; do
            if [ -f "$shell_config" ] || [ "$shell_config" = ~/.bashrc ]; then
                echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$shell_config"
                echo "Updated $shell_config"
            fi
        done
        
        echo "Added ~/.local/bin to PATH in your shell config"
        echo "Please restart your terminal or run:"
        echo "  source ~/.bashrc  # (for bash)"
        echo "  source ~/.zshrc   # (for zsh)"
    fi
fi

echo ""
echo "Oggy installed successfully!"
echo "You can now run 'oggy' from anywhere in your terminal."
echo ""
echo "Next steps:"
echo "1. Get your Groq API key from: https://console.groq.com"
echo "2. Run: oggy setup"
echo "3. Or set GROQ_API_KEY environment variable:"
echo "   export GROQ_API_KEY='your_api_key_here'"
echo "4. Test with: oggy analyze"