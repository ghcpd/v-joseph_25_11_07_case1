#!/usr/bin/env bash
set -e

# Runs all Node test scripts in test_files/

echo "Running FileWatcher Pro tests..."

PASS=0
FAIL=0

for t in test_files/test_*.js; do
  echo "-----"
  echo "Running $t"
  node "$t"
  rc=$?
  if [ $rc -eq 0 ]; then
    echo "$t: PASS"
    PASS=$((PASS+1))
  else
    echo "$t: FAIL (exit $rc)"
    FAIL=$((FAIL+1))
  fi
done

echo "-----"
echo "Tests complete. PASS=$PASS FAIL=$FAIL"

if [ $FAIL -ne 0 ]; then
  exit 2
fi
