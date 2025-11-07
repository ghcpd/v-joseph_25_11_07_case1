#!/usr/bin/env bash
set -e
echo "Running tests..."
node --experimental-modules tests/run_examples.js
echo "Tests finished"
