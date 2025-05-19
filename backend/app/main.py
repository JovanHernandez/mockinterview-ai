import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="MockInterview.AI API",
    description="API for transcribing and evaluating interview answers",
    version="1.0.0"
)

# Get allowed origins from environment variable or use default
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
print(f"Allowed origins: {allowed_origins}")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Read from environment variable
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to MockInterview.AI API"}


