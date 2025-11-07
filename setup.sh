#!/usr/bin/env bash
# setup.sh - Setup environment for FileWatcher Pro tests

# Ensure Node.js is installed (v14+)
node -v || { echo "Node.js not found. Please install Node.js v14+"; exit 1; }

# Initialize npm project if not present
if [ ! -f package.json ]; then
  npm init -y
fi

# Set package to ES module to allow 'import' in tests
node -e "const fs=require('fs'); const p='package.json'; const pkg=JSON.parse(fs.readFileSync(p)); pkg.type='module'; fs.writeFileSync(p, JSON.stringify(pkg, null, 2)); console.log('package.json set to module');"

# Install dev dependencies (none required now)
# npm install --save-dev some-test-lib

echo "Setup complete. Run './run_tests.sh' to run tests."