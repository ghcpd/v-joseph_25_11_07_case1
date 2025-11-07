#!/usr/bin/env bash
# setup.sh - Setup environment for FileWatcher Pro tests

set -e

echo "== Checking Node.js and npm versions =="
node -v
npm -v || true

# Create test directory and sample files
TEST_DIR=./test/testdir
mkdir -p "$TEST_DIR"

echo "creating sample files..."
echo "hello" > "$TEST_DIR/sample.txt"
echo "log1" > "$TEST_DIR/sample.log"

# If package.json exists, install dependencies
if [ -f package.json ]; then
  echo "package.json found; running npm install"
  npm install
fi

echo "Setup complete. Run ./run_tests.sh to execute test suite."
