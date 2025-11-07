#!/usr/bin/env bash
set -e
# Basic setup script for Linux/macOS
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Please install Node 16+"
  exit 1
fi
npm init -y
# No external deps, but ensure permissions on scripts
chmod +x run_tests.sh

echo "Setup complete. Run './run_tests.sh' to execute tests."