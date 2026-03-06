#!/bin/bash
# Stop hook: runs full quality check before ending session
# Runs lint, typecheck, and tests in the mobile directory

REPO_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$REPO_ROOT" ]; then
  exit 0
fi

MOBILE_DIR="$REPO_ROOT/mobile"

echo "=== Quality Gate ==="
echo "Running npm run check in $MOBILE_DIR..."
cd "$MOBILE_DIR" && npm run check 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "Quality gate FAILED. Fix the issues above before committing."
  exit $EXIT_CODE
fi

echo ""
echo "Quality gate PASSED."
