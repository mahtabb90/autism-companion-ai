from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .crud import seed_database_if_empty
from .routers import emotions, situations, stories

# Create database tables (SQLite) on startup
Base.metadata.create_all(bind=engine)

# Seed database with initial situations & stories if empty
db = SessionLocal()
try:
    seed_database_if_empty(db)
finally:
    db.close()

app = FastAPI(
    title="Autism Companion AI API",
    description="Supportive educational API for children with autism and their parents.",
    version="1.0.0"
)

# CORS Configuration for local development with React/Vite
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register endpoints under '/api' prefix
app.include_router(emotions.router, prefix="/api")
app.include_router(situations.router, prefix="/api")
app.include_router(stories.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Autism Companion AI API.",
        "status": "online",
        "description": "Supportive educational tool. Not a medical or therapy app."
    }
