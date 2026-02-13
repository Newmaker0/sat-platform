#!/usr/bin/env sh
set -eu

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

git -C "$REPO_ROOT" config core.hooksPath .githooks
echo "Configured git hooks path: .githooks"
echo "Conventional Commits validation is now active on commit-msg."
