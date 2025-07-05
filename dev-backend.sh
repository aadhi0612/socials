#!/bin/bash

# Script to run only the backend development server

echo "Starting backend development server..."

cd backend || {
    echo "Error: Backend directory not found!"
    exit 1
}

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Start the backend server
echo "Starting backend server..."
if [ -f "app.py" ]; then
    python3 app.py
elif [ -f "main.py" ]; then
    python3 main.py
elif [ -f "server.py" ]; then
    python3 server.py
elif [ -f "app/main.py" ]; then
    python3 -m app.main
elif [ -f "run.py" ]; then
    python3 run.py
else
    echo "Error: No standard Python entry point found."
    echo "Please specify your backend start command manually."
    echo "Common files checked: app.py, main.py, server.py, app/main.py, run.py"
fi
