from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import user, content, ai

app = FastAPI()

app.include_router(user.router, prefix="/users", tags=["users"])
app.include_router(content.router)
app.include_router(ai.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or ["*"] for all origins (dev only)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Backend is running!"}