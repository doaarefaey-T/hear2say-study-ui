#!/usr/bin/env bash
# Build source UI to the root and docs artifacts required by this repository's active Pages mode.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${VITE_SUPABASE_URL:?Set VITE_SUPABASE_URL}"
: "${VITE_SUPABASE_PUBLISHABLE_KEY:?Set VITE_SUPABASE_PUBLISHABLE_KEY}"
: "${VITE_API_BASE_URL:?Set VITE_API_BASE_URL}"
cp index.source.html index.html
rm -rf dist
pnpm exec vite build
rm -rf docs/assets assets
mkdir -p docs assets
cp -a dist/. docs/
cp -a dist/assets/. assets/
cp dist/index.html index.html
