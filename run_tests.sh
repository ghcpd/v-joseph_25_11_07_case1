#!/bin/bash
# run_tests.sh - Run all FileWatcher Pro test cases

echo ""
echo "=========================================="
echo "FileWatcher Pro v1.2 - Test Suite"
echo "=========================================="
echo ""

# Track test results
declare -a test_files=(
    "test_files/test-basic-watcher.js"
    "test_files/test-filter-option.js"
    "test_files/test-logfile-option.js"
    "test_files/test-debounce-events.js"
    "test_files/test-wait-for-file.js"
    "test_files/test-stopped-event.js"
    "test_files/test-logs-property.js"
    "test_files/test-recursive-option.js"
    "test_files/test-readme-example.js"
)

# Test naming
declare -a test_names=(
    "Basic Watcher"
    "Filter Option"
    "LogFile Option"
    "Debounce Events"
    "Wait For File"
    "Stopped Event"
    "Logs Property"
    "Recursive Option"
    "README Example"
)

passed=0
failed=0
test_count=${#test_files[@]}

# Run each test
for i in "${!test_files[@]}"; do
    test_file="${test_files[$i]}"
    test_name="${test_names[$i]}"
    
    if [ -f "$test_file" ]; then
        echo "[$(($i + 1))/$test_count] Running: $test_name"
        echo "---"
        
        if node "$test_file" 2>&1; then
            ((passed++))
        else
            ((failed++))
        fi
    else
        echo "❌ Test file not found: $test_file"
        ((failed++))
    fi
done

echo ""
echo "=========================================="
echo "Test Results Summary"
echo "=========================================="
echo "Total Tests:  $test_count"
echo "Passed:       $passed ✓"
echo "Failed:       $failed ❌"
echo "Pass Rate:    $(echo "scale=1; ($passed * 100) / $test_count" | bc)%"
echo "=========================================="
echo ""

if [ $failed -eq 0 ]; then
    echo "✓ All tests passed!"
    exit 0
else
    echo "❌ Some tests failed. Review the output above."
    exit 1
fi
