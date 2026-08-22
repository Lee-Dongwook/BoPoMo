from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import evaluate, sentence

app = FastAPI(
    title="Bopomo AI Engine",
    description="LangGraph Multi-Agent based Chinese Learning API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sentence.router, prefix="/api/v1/sentence", tags=["Sentence"])
app.include_router(evaluate.router, prefix="/api/v1/evaluate", tags=["Evaluate"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "bopomo-ai-server"}
