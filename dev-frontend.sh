#!/bin/bash

# Script to run only the frontend development server

echo "Starting frontend development server..."

cd frontend || {
    echo "Error: Frontend directory not found!"
    exit 1
}

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Start the development server
npm run dev
