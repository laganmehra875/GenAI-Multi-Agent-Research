from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os

from tools import get_weather
from pipeline import run_research_pipeline
from tenacity import retry, stop_after_attempt, wait_exponential

app = FastAPI(title="GenAI Multi-Agent Research API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static folder exists
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

class ResearchRequest(BaseModel):
    topic: str

@app.get("/")
def read_root():
    with open("static/index.html", "r") as f:
        return HTMLResponse(content=f.read())

@app.get("/api/weather")
def api_weather(location: str):
    """Bypasses LLM to get raw string output from the tool."""
    try:
        # invoke tool directly
        result = get_weather.invoke(location)
        return {"status": "success", "weather": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=2, min=4, max=10))
def resilient_run_pipeline(topic: str):
    return run_research_pipeline(topic)

@app.post("/api/research")
def api_research(req: ResearchRequest):
    """Trigger the multi agent pipeline with the user's raw topic."""
    try:
        state = resilient_run_pipeline(req.topic)
        return {"status": "success", "report": state.get("report", ""), "feedback": state.get("feedback", "")}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
