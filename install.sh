#!/bin/bash
set -e

echo "Installing Oggy CLI globally..."

# Detect OS
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
case $OS in
  linux*) BINARY_NAME="oggy-linux" ;;
  darwin*) BINARY_NAME="oggy-macos" ;;
  *) echo "Unsupported OS: $OS"; exit 1 ;;
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
echo "Downloading Oggy ${LATEST_RELEASE} for ${OS}..."

curl -L -o oggy "$DOWNLOAD_URL"
if [ $? -ne 0 ]; then
    echo "Failed to download binary"
    exit 1
fi

chmod +x oggy

# Install globally
if [ "$EUID" -eq 0 ]; then
    # Running as root
    mv oggy /usr/local/bin/oggy
    echo "Oggy installed successfully to /usr/local/bin/"
else
    # Try to install to user directory
    mkdir -p ~/.local/bin
    mv oggy ~/.local/bin/oggy
    echo "Oggy installed successfully to ~/.local/bin/"
    echo "Make sure ~/.local/bin is in your PATH"
    
    # Add to PATH if not already there
    if ! echo "$PATH" | grep -q ~/.local/bin; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc 2>/dev/null || true
        echo "Added ~/.local/bin to PATH in your shell config"
        echo "Please restart your terminal or run: source ~/.bashrc"
    fi
fi

echo "Oggy installed successfully!"
echo "You can now run 'oggy' from anywhere in your terminal."