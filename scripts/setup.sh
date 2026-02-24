#!/usr/bin/env bash
set -euo pipefail

echo "=== AI Open-Access Journal — Local Dev Setup ==="
echo ""

ENV_FILE=".env.local"

if [ -f "$ENV_FILE" ]; then
  echo "Found existing $ENV_FILE"
  read -p "Overwrite? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Keeping existing $ENV_FILE. Run 'npm run dev' to start."
    exit 0
  fi
fi

echo "You'll need:"
echo "  1. A Neon Postgres database  → https://console.neon.tech"
echo "  2. A GitHub OAuth app        → https://github.com/settings/developers"
echo "  3. An Anthropic API key      → https://console.anthropic.com"
echo ""

# --- DATABASE_URL ---
echo "--- Step 1: Neon Postgres ---"
echo "Create a project at https://console.neon.tech (free tier is fine)."
echo "Copy the connection string (looks like: postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require)"
echo ""
read -p "DATABASE_URL: " DATABASE_URL

# --- GitHub OAuth ---
echo ""
echo "--- Step 2: GitHub OAuth App ---"
echo "Go to https://github.com/settings/developers → 'New OAuth App'"
echo "  Application name: AI Open Access Journal (dev)"
echo "  Homepage URL:     http://localhost:3000"
echo "  Callback URL:     http://localhost:3000/api/auth/callback/github"
echo ""
read -p "GITHUB_CLIENT_ID: " AUTH_GITHUB_ID
read -p "GITHUB_CLIENT_SECRET: " AUTH_GITHUB_SECRET

# --- Auth Secret ---
AUTH_SECRET=$(openssl rand -base64 32)
echo ""
echo "Generated AUTH_SECRET automatically."

# --- Anthropic ---
echo ""
echo "--- Step 3: Anthropic API Key ---"
echo "Get one at https://console.anthropic.com/settings/keys"
echo "(Leave blank to skip — paper generation won't work without it)"
echo ""
read -p "ANTHROPIC_API_KEY: " ANTHROPIC_API_KEY

# --- Write .env.local ---
cat > "$ENV_FILE" << ENVEOF
# Database (Neon Postgres)
DATABASE_URL=${DATABASE_URL}

# Auth.js
AUTH_SECRET=${AUTH_SECRET}
AUTH_GITHUB_ID=${AUTH_GITHUB_ID}
AUTH_GITHUB_SECRET=${AUTH_GITHUB_SECRET}

# AI (optional for local dev — paper generation requires this)
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_TRUST_HOST=true
ENVEOF

echo ""
echo "Wrote $ENV_FILE"
echo ""

# --- Push schema ---
echo "--- Pushing database schema to Neon ---"
npx drizzle-kit push
echo ""

echo "=== Setup complete! ==="
echo ""
echo "Run:  npm run dev"
echo "Open: http://localhost:3000"
echo ""
