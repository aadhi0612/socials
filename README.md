# Social Media Application

A full-stack social media application with React frontend and Python backend.

## Project Structure

```
socials/
├── frontend/           # React/Vite frontend application
│   ├── src/           # Source code
│   ├── package.json   # Node.js dependencies
│   └── ...           # Other frontend files
├── backend/           # Python backend application
│   ├── app/          # Application code
│   ├── requirements.txt # Python dependencies
│   ├── venv/         # Virtual environment (created automatically)
│   └── .env          # Environment variables
├── start.sh          # Startup script
└── README.md         # This file
```

## Quick Start

### Automatic Setup (Recommended)

Run the startup script to automatically install dependencies and start both services:

```bash
./start.sh
```

The script will:
1. Install Node.js and Python3 if not present
2. Set up Python virtual environment
3. Install all dependencies (npm and pip)
4. Start both frontend and backend services

### Manual Setup

#### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- npm or yarn

#### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app.py  # or your main Python file
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Available URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000 (or your configured port)

## Environment Variables

Make sure to configure your environment variables in:
- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration (if needed)

## Development

### Frontend Development
The frontend is built with:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

### Backend Development
The backend uses:
- Python 3
- Virtual environment for dependency isolation

## Scripts

- `./start.sh` - Start both frontend and backend
- `./start.sh --help` - Show help information

## Stopping Services

Press `Ctrl+C` in the terminal where you ran `./start.sh` to stop all services.

## Troubleshooting

1. **Port conflicts**: If ports 5173 or 8000 are in use, modify the configuration in the respective service files.
2. **Permission issues**: Make sure `start.sh` is executable: `chmod +x start.sh`
3. **Missing dependencies**: The start script should handle most dependency installation automatically.

## Contributing

1. Make changes in the appropriate directory (`frontend/` or `backend/`)
2. Test your changes locally using `./start.sh`
3. Commit your changes with descriptive messages
