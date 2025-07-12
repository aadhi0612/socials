#!/bin/bash

# Deployment script for Socials Backend
set -e

echo "🚀 Starting deployment of Socials Backend..."

# Set variables
STACK_NAME="socials-backend-stack"
REGION="us-east-2"
PROFILE="socials-deploy"
STAGE="prod"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo "❌ SAM CLI is not installed. Please install it first."
    echo "Install with: pip install aws-sam-cli"
    exit 1
fi

echo "📦 Building SAM application..."
sam build --profile $PROFILE

echo "🚀 Deploying to AWS..."
sam deploy \
    --stack-name $STACK_NAME \
    --region $REGION \
    --profile $PROFILE \
    --parameter-overrides Stage=$STAGE \
    --capabilities CAPABILITY_IAM \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset

echo "✅ Deployment completed!"

# Get the API endpoint
API_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --profile $PROFILE \
    --query 'Stacks[0].Outputs[?OutputKey==`SocialsApiUrl`].OutputValue' \
    --output text)

echo ""
echo "🌐 Your API is deployed at: $API_URL"
echo "📚 API Documentation: ${API_URL}docs"
echo "🔍 Health Check: ${API_URL}health"
echo ""
echo "🎉 Deployment successful!"
