#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC_DIR="$REPO_ROOT/src"

if [ ! -d "$SRC_DIR" ]; then
  echo "ERROR: src/ directory not found at $SRC_DIR"
  echo "This script expects generated code to live in src/"
  exit 1
fi

echo "============================================"
echo "  Code Quality Report - time-and-tokens"
echo "============================================"
echo ""

# ── 1. Lines of Code & Complexity (scc) ──────────────────────────
echo "── LOC & Complexity (scc) ──"
if command -v scc &>/dev/null; then
  scc "$SRC_DIR"
else
  echo "WARN: scc not installed. Install via: brew install scc"
  echo "      https://github.com/boyter/scc"
fi
echo ""

# ── 2. Linting ────────────────────────────────────────────────────
echo "── Linting ──"

# ESLint (JavaScript/TypeScript)
if command -v npx &>/dev/null && [ -f "$SRC_DIR/../package.json" ]; then
  echo "Running ESLint..."
  npx eslint "$SRC_DIR" --format stylish || true
else
  echo "PLACEHOLDER: ESLint not configured."
  echo "  To enable: npm init && npm install eslint --save-dev && npx eslint --init"
fi

# golangci-lint (Go)
# if command -v golangci-lint &>/dev/null; then
#   echo "Running golangci-lint..."
#   golangci-lint run "$SRC_DIR/..."
# fi

echo ""

# ── 3. Test Coverage ─────────────────────────────────────────────
echo "── Test Coverage ──"

# JavaScript/TypeScript (vitest / jest with coverage)
if command -v npx &>/dev/null && [ -f "$SRC_DIR/../package.json" ]; then
  echo "Running test coverage..."
  npx vitest run --coverage --reporter=verbose 2>/dev/null || \
  npx jest --coverage 2>/dev/null || \
  echo "PLACEHOLDER: No test runner configured."
  echo "  To enable: npm install vitest @vitest/coverage-v8 --save-dev"
else
  echo "PLACEHOLDER: Test coverage not configured."
fi

# lcov summary (if lcov.info exists)
# if [ -f "$REPO_ROOT/coverage/lcov.info" ]; then
#   echo ""
#   echo "LCOV Summary:"
#   lcov --summary "$REPO_ROOT/coverage/lcov.info"
# fi

echo ""
echo "============================================"
echo "  Report complete. Log output above."
echo "============================================"
