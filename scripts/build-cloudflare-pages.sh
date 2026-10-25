#!/usr/bin/env bash
# Cloudflare Pages build for Andaz Vibe Stay V1.0.0.
# Set Cloudflare Pages: Framework=None, Build command="bash scripts/build-cloudflare-pages.sh",
# Build output directory="dist", Root directory="/", Production branch="main".
# IMPORTANT: never deploy repository root "." because wordpress/ contains PMS source.
set -euo pipefail
cd "$(dirname "$0")/.."
umask 022

if [ -L dist ]; then
  echo "Refusing to replace symlinked dist directory" >&2
  exit 1
fi
rm -rf -- dist
mkdir -p dist

files=(
  index.html
  rooms.html
  experiences.html
  explore.html
  contact.html
  assets/site.css
  assets/site.js
  robots.txt
  sitemap.xml
  release-manifest.json
)
for file in "${files[@]}"; do
  if [ ! -f "$file" ] || [ -L "$file" ]; then
    echo "Missing, invalid or symlinked site file: $file" >&2
    exit 1
  fi
  mkdir -p "dist/$(dirname "$file")"
  cp -- "$file" "dist/$file"
done

# Preview-branch-only: copy a public QA notice without private source/secrets.
test -f qa/synergica/index.html && test ! -L qa/synergica/index.html || exit 1
test -f qa/synergica/_headers && test ! -L qa/synergica/_headers || exit 1
mkdir -p dist/_qa/synergica
cp qa/synergica/index.html dist/_qa/synergica/index.html
cp qa/synergica/_headers dist/_headers
files+=( _qa/synergica/index.html _headers )
grep -qi 'noindex' dist/_qa/synergica/index.html || exit 1

# Confirm the output is exactly the reviewed public website file allowlist.
actual="$(find dist -type f | sed 's#^dist/##' | LC_ALL=C sort)"
expected="$(printf '%s\n' "${files[@]}" | LC_ALL=C sort)"
if [ "$actual" != "$expected" ]; then
  echo "Cloudflare output allowlist mismatch; deployment aborted" >&2
  exit 1
fi
if [ -e dist/wordpress ] || [ -e dist/.github ]; then
  echo "Private source directory detected in output; deployment aborted" >&2
  exit 1
fi
for page in index rooms experiences explore contact; do
  grep -qi '<html' "dist/$page.html" || {
    echo "Invalid HTML page $page" >&2
    exit 1
  }
done
echo "Andaz Cloudflare static build verified: ${#files[@]} public files only"
