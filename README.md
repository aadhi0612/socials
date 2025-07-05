# Socials Application

A full-stack social media application with React frontend and FastAPI backend.

## Project Structure

```
socials/
├── frontend/          # React + Vite frontend
│   ├── src/
│   ├── package.json
│   └── .env
├── backend/           # FastAPI backend
│   ├── app/
│   ├── requirements.txt
│   └── .env
├── start.sh          # Script to start both servers
└── README.md
```

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

## Quick Start

1. **Clone and navigate to the project:**
   ```bash
   cd socials
   ```

2. **Start both servers:**
   ```bash
   ./start.sh
   ```

This will:
- Create a Python virtual environment (if it doesn't exist)
- Install backend dependencies
- Install frontend dependencies
- Start the FastAPI backend on `http://localhost:8000`
- Start the React frontend on `http://localhost:5173`

## Manual Setup

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Frontend (.env)
```
VITE_AWS_S3_BUCKET=socials-aws-1
REACT_APP_AWS_REGION=us-east-2
VITE_API_URL=http://localhost:8000
```

### Backend (.env)
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-2
AWS_BEDROCK_REGION=us-east-1
AWS_S3_BUCKET=socials-aws-1
```

## API Documentation

Once the backend is running, you can access:
- API Documentation: `http://localhost:8000/docs`
- Alternative API Docs: `http://localhost:8000/redoc`

## CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (React dev server)
- `http://127.0.0.1:5173`
- `http://127.0.0.1:3000`

## Stopping the Application

Press `Ctrl+C` in the terminal where `start.sh` is running to stop both servers.

## Troubleshooting

### CORS Issues
- Ensure the frontend is running on the allowed origins
- Check that the backend CORS middleware is properly configured
- Verify the API URL in frontend environment variables

### Port Conflicts
- Backend runs on port 8000
- Frontend runs on port 5173
- Make sure these ports are available

### Environment Variables
- Ensure `.env` files are in the correct directories
- Check that environment variables are properly loaded
- Verify AWS credentials and permissions
