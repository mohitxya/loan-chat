#!/usr/bin/env bash
set -e

echo "🔨 Building Borrower Copilot for production..."
npm run build

echo "📦 Preparing deployment to gh-pages branch..."
git --work-tree=dist add -A
TREE_ID=$(git write-tree)
COMMIT_ID=$(git commit-tree "$TREE_ID" -m "Deploy production build to GitHub Pages [$(date -u +'%Y-%m-%d %H:%M:%S UTC')]")

echo "🚀 Pushing compiled dist to origin/gh-pages..."
git push origin "$COMMIT_ID:refs/heads/gh-pages" --force

echo "🧹 Cleaning up index..."
git reset HEAD

echo "✅ Successfully deployed to gh-pages branch!"
