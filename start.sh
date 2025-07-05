#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js if not present
install_nodejs() {
    if ! command_exists node; then
        print_status "Node.js not found. Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        print_success "Node.js is already installed ($(node --version))"
    fi
}

# Function to install Python if not present
install_python() {
    if ! command_exists python3; then
        print_status "Python3 not found. Installing Python3..."
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip python3-venv
    else
        print_success "Python3 is already installed ($(python3 --version))"
    fi
}

# Function to setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend || {
        print_error "Backend directory not found!"
        exit 1
    }
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    print_status "Activating virtual environment..."
    source venv/bin/activate
    
    # Install Python dependencies
    if [ -f "requirements.txt" ]; then
        print_status "Installing Python dependencies..."
        pip install -r requirements.txt
    else
        print_warning "No requirements.txt found in backend directory"
    fi
    
    cd ..
}

# Function to setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend || {
        print_error "Frontend directory not found!"
        exit 1
    }
    
    # Install npm dependencies
    if [ -f "package.json" ]; then
        print_status "Installing npm dependencies..."
        npm install
    else
        print_error "No package.json found in frontend directory"
        exit 1
    fi
    
    cd ..
}

# Function to start backend service
start_backend() {
    print_status "Starting backend service..."
    
    cd backend || {
        print_error "Backend directory not found!"
        exit 1
    }
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Check for common Python entry points
    if [ -f "app.py" ]; then
        python3 app.py &
    elif [ -f "main.py" ]; then
        python3 main.py &
    elif [ -f "server.py" ]; then
        python3 server.py &
    elif [ -f "app/main.py" ]; then
        python3 -m app.main &
    elif [ -f "run.py" ]; then
        python3 run.py &
    else
        print_warning "No standard Python entry point found. Please specify your backend start command."
        print_warning "Common files checked: app.py, main.py, server.py, app/main.py, run.py"
    fi
    
    BACKEND_PID=$!
    print_success "Backend started with PID: $BACKEND_PID"
    
    cd ..
}

# Function to start frontend service
start_frontend() {
    print_status "Starting frontend service..."
    
    cd frontend || {
        print_error "Frontend directory not found!"
        exit 1
    }
    
    # Start the development server
    npm run dev &
    FRONTEND_PID=$!
    print_success "Frontend started with PID: $FRONTEND_PID"
    
    cd ..
}

# Function to cleanup processes on exit
cleanup() {
    print_status "Shutting down services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        print_success "Backend service stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        print_success "Frontend service stopped"
    fi
    exit 0
}

# Trap cleanup function on script exit
trap cleanup SIGINT SIGTERM EXIT

# Main execution
main() {
    print_status "Starting Social Media Application Setup..."
    
    # Check and install dependencies
    install_nodejs
    install_python
    
    # Setup services
    setup_backend
    setup_frontend
    
    # Start services
    start_backend
    sleep 2  # Give backend time to start
    start_frontend
    
    print_success "All services are starting up!"
    print_status "Frontend will be available at: http://localhost:5173"
    print_status "Backend API will be available at: http://localhost:8000 (or your configured port)"
    print_status ""
    print_status "Press Ctrl+C to stop all services"
    
    # Keep script running
    while true; do
        sleep 1
    done
}

# Check if script is run with --help flag
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "Social Media Application Startup Script"
    echo ""
    echo "Usage: ./start.sh [OPTIONS]"
    echo ""
    echo "This script will:"
    echo "  1. Install Node.js and Python3 if not present"
    echo "  2. Set up Python virtual environment for backend"
    echo "  3. Install all dependencies (npm and pip)"
    echo "  4. Start both frontend and backend services"
    echo ""
    echo "Options:"
    echo "  -h, --help    Show this help message"
    echo ""
    echo "Directory structure expected:"
    echo "  ├── frontend/     (React/Vite application)"
    echo "  ├── backend/      (Python application)"
    echo "  └── start.sh      (This script)"
    echo ""
    exit 0
fi

# Run main function
main
