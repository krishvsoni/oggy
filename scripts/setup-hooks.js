#!/usr/bin/env node

/**
 * Setup Git Hooks for Oggy
 * This script installs the pre-commit hook
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const hookSource = path.join(__dirname, '../.git-hooks/pre-commit');
const gitHooksDir = path.join(__dirname, '../.git/hooks');
const hookDest = path.join(gitHooksDir, 'pre-commit');

try {
  if (!fs.existsSync(gitHooksDir)) {
    console.error('Not a git repository. Initialize git first.');
    process.exit(1);
  }

  if (fs.existsSync(hookSource)) {
    fs.copyFileSync(hookSource, hookDest);
    
    if (process.platform !== 'win32') {
      fs.chmodSync(hookDest, '755');
    }
    
    console.log('Git pre-commit hook installed successfully!');
    console.log('Oggy will now analyze commits automatically.');
    console.log('Use --no-verify to skip the hook if needed.');
  } else {
    console.error('Hook source file not found');
    process.exit(1);
  }
} catch (error) {
  console.error('Failed to install git hook:', error.message);
  process.exit(1);
}
