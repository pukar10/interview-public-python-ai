from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import conversations, messages, chat
from app.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Chat API",
    description="API for managing conversations between users and LLMs",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(conversations.router)
app.include_router(messages.router)
app.include_router(chat.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Chat API",
        "docs": "/docs",
        "endpoints": {
            "conversations": "/conversations",
            "chat": "/chat"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
