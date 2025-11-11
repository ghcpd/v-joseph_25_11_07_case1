#!/bin/bash

# FileWatcher Pro v1.2 - Test Runner
# This script runs all test cases for FileWatcher Pro

set -e  # Exit on error

echo "=========================================="
echo "FileWatcher Pro v1.2 - Test Runner"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if filewatcher.js exists
if [ ! -f "filewatcher.js" ]; then
    echo "ERROR: filewatcher.js not found in current directory"
    exit 1
fi

# Clean up test directories and files
echo "Cleaning up test environment..."
rm -rf logs test_output 2>/dev/null || true
mkdir -p logs test_output
rm -f watcher.log test-watcher.log test.log 2>/dev/null || true
echo "✓ Test environment cleaned"
echo ""

# Run setup if setup.sh exists
if [ -f "setup.sh" ]; then
    echo "Running setup..."
    bash setup.sh
    echo ""
fi

# Run individual test files
echo "=========================================="
echo "Running Test Suite"
echo "=========================================="
echo ""

# Test 1: README example (should fail with recursiveMode)
echo "Test 1: Testing README example (expected to show issue)..."
node test_example.js 2>&1 | head -10
echo ""

# Test 2: All features test
echo "Test 2: Testing all features..."
node test_all_features.js
echo ""

# Test 3: Functionality test
echo "Test 3: Testing functionality..."
node test_functionality.js
echo ""

# Test 4: Comprehensive test suite
echo "Test 4: Running comprehensive test suite..."
node test_suite.js
echo ""

echo "=========================================="
echo "All tests completed!"
echo "=========================================="
echo ""
echo "Check the output above for test results."
echo "Review defects.txt for documentation issues."
echo ""

