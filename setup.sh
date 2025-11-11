#!/bin/bash

# FileWatcher Pro v1.2 - Environment Setup Script
# This script sets up the testing environment

set -e  # Exit on error

echo "=========================================="
echo "FileWatcher Pro v1.2 - Environment Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed."
    exit 1
fi

echo "✓ npm found: $(npm --version)"
echo ""

# Create test directories
echo "Creating test directories..."
mkdir -p logs
mkdir -p test_files
mkdir -p test_output
echo "✓ Test directories created"
echo ""

# Create initial test files
echo "Creating initial test files..."
echo "Initial content" > test_files/test1.txt
echo "Initial content" > test_files/test2.json
echo "Initial content" > logs/initial.log
echo "✓ Initial test files created"
echo ""

# Clean up any existing log files
echo "Cleaning up old log files..."
rm -f watcher.log test-watcher.log test.log 2>/dev/null || true
echo "✓ Old log files cleaned"
echo ""

# Verify filewatcher.js exists
if [ ! -f "filewatcher.js" ]; then
    echo "ERROR: filewatcher.js not found in current directory"
    exit 1
fi

echo "✓ filewatcher.js found"
echo ""

# Run a quick syntax check
echo "Checking filewatcher.js syntax..."
if node -c filewatcher.js 2>/dev/null; then
    echo "✓ filewatcher.js syntax is valid"
else
    echo "WARNING: filewatcher.js may have syntax errors"
fi
echo ""

echo "=========================================="
echo "Setup completed successfully!"
echo "=========================================="
echo ""
echo "You can now run tests with:"
echo "  ./run_tests.sh"
echo ""

