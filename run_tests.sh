#!/usr/bin/env bash
# run_tests.sh - Run the FileWatcher Pro example tests

set -e

echo "Running test/test_examples.js..."
node ./test/test_examples.js

if [ $? -eq 0 ]; then
  echo "Test script completed successfully."
else
  echo "Test script failed. Check console output for details.";
  exit 1
fi
