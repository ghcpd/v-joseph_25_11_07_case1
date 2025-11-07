#!/usr/bin/env bash
set -e

# Setup script for FileWatcher Pro v1.2 demo/tests
# Creates a minimal NodeJS project with ESM support and creates test directories

# ensure node present
if ! node -v >/dev/null 2>&1; then
  echo "Node is required. Please install Node.js v14+ and rerun."
  exit 1
fi

if [ ! -f package.json ]; then
  echo "Creating minimal package.json with type=module"
  cat > package.json <<'JSON'
{
  "name": "filewatcher-pro-sample",
  "private": true,
  "type": "module",
  "scripts": {}
}
JSON
else
  # add type=module if missing
  if ! grep -q '"type": *"module"' package.json; then
    node -e "let pkg=require('./package.json');pkg.type='module';require('fs').writeFileSync('package.json', JSON.stringify(pkg, null,2))"
  fi
fi

# Prepare test directories
mkdir -p test_files
rm -rf testdir_* || true

# All set
cat <<EOF
Setup complete.
Run tests: ./run_tests.sh
EOF
