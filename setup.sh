#!/usr/bin/env bash
# Setup environment for running tests
set -e
node -v || echo "Ensure Node.js is installed"
mkdir -p test_files/logs
echo "initialized" > test_files/logs/initial.log
echo "Setup complete"
