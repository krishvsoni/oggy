#!/usr/bin/env bash

set -e

echo "Welcome to Oggy Setup!"
echo ""

if ! command -v bun &> /dev/null; then
    echo "Bun is not installed"
    echo "   Install it from: https://bun.sh"
    exit 1
fi

echo "Bun is installed"

if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Not in a git repository"
    echo "   Initialize git first: git init"
    exit 1
fi

echo "Git repository detected"

echo ""
echo "Installing dependencies..."
bun install

if [ ! -f ".env" ]; then
    echo ""
    echo "Creating .env file..."
    cp .env.example .env
    echo ""
    echo "Please add your Groq API key to .env"
    echo "   Get your key from: https://console.groq.com"
    echo ""
    read -p "Enter your Groq API key (or press Enter to skip): " api_key
    
    if [ ! -z "$api_key" ]; then
        echo "GROQ_API_KEY=$api_key" > .env
        echo "GROQ_MODEL=llama-3.1-70b-versatile" >> .env
        echo "API key saved to .env"
    else
        echo "You'll need to add GROQ_API_KEY to .env later"
    fi
else
    echo ".env file exists"
fi

if [ ! -f "oggy.config.yaml" ]; then
    echo ""
    echo "Would you like to create oggy.config.yaml? (y/n)"
    read -p "> " create_config
    
    if [ "$create_config" = "y" ] || [ "$create_config" = "Y" ]; then
        bun run src/cli.ts init
    fi
else
    echo "oggy.config.yaml exists"
fi

echo ""
echo "Would you like to set up automatic commit analysis? (y/n)"
read -p "> " setup_hooks

if [ "$setup_hooks" = "y" ] || [ "$setup_hooks" = "Y" ]; then
    bun run setup-hooks
fi

echo ""
echo "Testing installation..."

if [ -z "$api_key" ] && ! grep -q "GROQ_API_KEY=" .env 2>/dev/null; then
    echo "Cannot test without API key"
    echo "   Add your key to .env and run: bun run src/cli.ts analyze"
else
    echo "   Running: bun run src/cli.ts config"
    bun run src/cli.ts config
fi

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Make sure GROQ_API_KEY is set in .env"
echo "  2. Run: bun run src/cli.ts analyze"
echo "  3. Check out EXAMPLES.md for usage examples"
echo ""
echo "Happy coding!"
