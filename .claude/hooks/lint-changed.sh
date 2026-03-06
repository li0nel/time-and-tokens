#!/bin/bash
# PostToolUse hook: runs eslint on changed TypeScript files
# Triggered after file write/edit operations

REPO_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$REPO_ROOT" ]; then
  exit 0
fi

MOBILE_DIR="$REPO_ROOT/mobile"

# Get changed .ts/.tsx files in mobile/
CHANGED=$(git -C "$REPO_ROOT" diff --name-only HEAD 2>/dev/null | grep -E '^mobile/.*\.(ts|tsx)$' | sed "s|^mobile/||")

if [ -z "$CHANGED" ]; then
  exit 0
fi

echo "Running ESLint on changed files..."
cd "$MOBILE_DIR" && echo "$CHANGED" | xargs npx eslint --ext .ts,.tsx 2>&1
