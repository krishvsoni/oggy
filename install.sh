#!/bin/bash
echo "Installing Oggy CLI globally..."

# Check if running with sudo
if [ "$EUID" -ne 0 ]; then
    echo "Please run with sudo for global installation:"
    echo "sudo ./install.sh"
    exit 1
fi

# Create directory
mkdir -p /usr/local/bin

# Copy executable (assuming Linux version would be named oggy)
cp oggy /usr/local/bin/oggy
chmod +x /usr/local/bin/oggy

echo "Oggy installed successfully!"
echo "You can now run 'oggy' from anywhere in your terminal."