#!/bin/bash
# Render deployment script

echo "🐲 Deploying Dragon.io to Render..."

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "Installing Render CLI..."
    curl -fsSL https://raw.githubusercontent.com/render-oss/render-cli/main/install.sh | bash
fi

# Login to Render (requires API key)
echo "Please set your Render API key:"
echo "export RENDER_API_KEY=your_api_key"

# Create blueprint
echo "Creating render.yaml blueprint..."

cat > render.yaml << 'EOF'
services:
  - type: web
    name: dragon-io
    runtime: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    healthCheckPath: /
    autoDeploy: true
EOF

echo "✅ Render blueprint created!"
echo ""
echo "Next steps:"
echo "1. Go to https://dashboard.render.com/blueprints"
echo "2. Click 'New Blueprint Instance'"
echo "3. Connect your GitHub repo"
echo "4. Deploy!"