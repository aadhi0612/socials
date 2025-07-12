#!/bin/bash

# 🚀 Socials Platform - Production Deployment Script
# Deploys to AWS Amplify: https://socials.dataopslabs.com

echo "🚀 Deploying Socials Platform to Production..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run from project root.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Pre-deployment checklist:${NC}"
echo "✅ Frontend: React + Vite + TypeScript"
echo "✅ Backend: FastAPI + AWS Lambda"
echo "✅ Database: DynamoDB"
echo "✅ Storage: S3"
echo "✅ AI: Amazon Bedrock"
echo "✅ Social: Twitter + LinkedIn OAuth"

# Test build locally
echo -e "\n${YELLOW}🔧 Testing build locally...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Local build successful${NC}"
else
    echo -e "${RED}❌ Local build failed. Please fix errors before deploying.${NC}"
    exit 1
fi

# Check if dist folder exists and has index.html
if [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✅ index.html found in dist/${NC}"
else
    echo -e "${RED}❌ index.html not found in dist/. Build may have failed.${NC}"
    exit 1
fi

# Git status check
echo -e "\n${YELLOW}📝 Checking git status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️ You have uncommitted changes. Committing now...${NC}"
    git add .
    git commit -m "🚀 Production deployment - $(date '+%Y-%m-%d %H:%M:%S')"
else
    echo -e "${GREEN}✅ Git working directory clean${NC}"
fi

# Push to GitHub (triggers Amplify deployment)
echo -e "\n${BLUE}🚀 Pushing to GitHub (triggers Amplify deployment)...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub${NC}"
    echo -e "\n${BLUE}🌐 Deployment Information:${NC}"
    echo "📱 Frontend URL: https://socials.dataopslabs.com"
    echo "🔧 Backend API: https://socials.dataopslabs.com/api"
    echo "📊 Amplify Console: https://console.aws.amazon.com/amplify/home?region=us-east-2#/socials"
    echo ""
    echo -e "${YELLOW}⏳ Amplify is now building and deploying your app...${NC}"
    echo "This usually takes 3-5 minutes."
    echo ""
    echo -e "${GREEN}🎉 Deployment initiated successfully!${NC}"
    echo "Check the Amplify console for build progress."
else
    echo -e "${RED}❌ Failed to push to GitHub${NC}"
    exit 1
fi
