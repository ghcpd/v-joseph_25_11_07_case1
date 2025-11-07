#!/usr/bin/env bash
# run_tests.sh - Run all tests for FileWatcher Pro

# Create test directory
mkdir -p test_logs
rm -f test_logs/*

TESTS=(\
  "tests/basicChangeTest.js" \
  "tests/filterTest.js" \
  "tests/debounceTest.js" \
  "tests/waitForFileTest.js" \
  "tests/logFileTest.js" \
)

for t in "${TESTS[@]}"; do
  echo "Running $t";
  node "$t" || { echo "Test $t failed"; exit 1; }
  echo "OK";
  # small pause to let OS flush events
  sleep 0.5
done

echo "All tests passed";
exit 0
