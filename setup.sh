#!/bin/bash
# setup.sh - Setup environment for FileWatcher Pro testing

echo "=========================================="
echo "FileWatcher Pro v1.2 - Test Environment Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js detected: $(node --version)"
echo "✓ npm detected: $(npm --version)"
echo ""

# Create test data directory structure
echo "Setting up test directories..."
mkdir -p test_data
mkdir -p test_files
echo "✓ Test directories created"
echo ""

# Initialize package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    echo "Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "filewatcher-pro-tests",
  "version": "1.0.0",
  "type": "module",
  "description": "Test suite for FileWatcher Pro v1.2",
  "main": "filewatcher.js",
  "scripts": {
    "test": "bash run_tests.sh",
    "test:basic": "node test_files/test-basic-watcher.js",
    "test:filter": "node test_files/test-filter-option.js",
    "test:logfile": "node test_files/test-logfile-option.js",
    "test:debounce": "node test_files/test-debounce-events.js",
    "test:waitfile": "node test_files/test-wait-for-file.js",
    "test:stopped": "node test_files/test-stopped-event.js",
    "test:logs": "node test_files/test-logs-property.js",
    "test:recursive": "node test_files/test-recursive-option.js",
    "test:readme": "node test_files/test-readme-example.js"
  },
  "keywords": ["filewatcher", "fs", "watch"],
  "author": "",
  "license": "MIT"
}
EOF
    echo "✓ package.json created"
else
    echo "✓ package.json already exists"
fi
echo ""

# Verify required files exist
echo "Verifying required files..."
files=("filewatcher.js" "README.md" "corrected_readme.md" "defects.txt")
all_exist=true

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ❌ Missing: $file"
        all_exist=false
    fi
done
echo ""

if [ "$all_exist" = true ]; then
    echo "=========================================="
    echo "✓ Setup Complete!"
    echo "=========================================="
    echo ""
    echo "Run tests with:"
    echo "  npm test              (run all tests)"
    echo "  bash run_tests.sh     (run all tests)"
    echo "  npm run test:basic    (run specific test)"
    echo ""
    echo "For more information, see corrected_readme.md"
    exit 0
else
    echo "=========================================="
    echo "⚠ Setup incomplete - some files are missing"
    echo "=========================================="
    exit 1
fi
