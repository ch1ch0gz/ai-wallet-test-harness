#!/usr/bin/env bash
# ship.sh — stage all changes, commit with a message, and push to origin/main
# Usage:
#   ./scripts/ship.sh "your commit message"
#   ./scripts/ship.sh  (prompts for message interactively)

set -euo pipefail

REPO_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# ── Require a clean working tree check ───────────────────────────────────────
if git diff --cached --quiet && git diff --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo "Nothing to commit — working tree is clean."
  exit 0
fi

# ── Get commit message ────────────────────────────────────────────────────────
if [ -n "${1:-}" ]; then
  MSG="$1"
else
  echo "Changed files:"
  git status --short
  echo ""
  printf "Commit message: "
  read -r MSG
  if [ -z "$MSG" ]; then
    echo "Aborted — empty commit message."
    exit 1
  fi
fi

# ── Stage all tracked/untracked files (.gitignore already excludes .env etc.) ──
git add -A

# ── Commit ────────────────────────────────────────────────────────────────────
git commit -m "$MSG"

# ── Push ─────────────────────────────────────────────────────────────────────
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
git push origin "$BRANCH"

echo ""
echo "Shipped → origin/$BRANCH"
git log --oneline -1
