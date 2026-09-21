from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import models
import database

app = FastAPI(
    title="EthioShield API",
    description="Hackathon Qiyas Project 2026 - Digital Financial Cyber-Defense",
    version="1.0.0"
)

# Allow frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
database.init_db()

DANGER_KEYWORDS = [
    "password", "otp", "pin", "click here", "urgent", "verify account",
    "account locked", "suspend", "confirm now",
    "በይለፍ ቃል", "ኦቲፒ", "ፒን", "አስቸኳይ", "አረጋግጥ", "ተዘግቷል"
]

@app.get("/")
def root():
    return {
        "project": "EthioShield",
        "hackathon": "Qiyas Project 2026",
        "status": "running",
        "docs": "/docs"
    }

@app.post("/analyze")
def analyze(req: models.AnalyzeRequest):
    text_lower = req.text.lower()
    danger_count = sum(1 for k in DANGER_KEYWORDS if k in text_lower)

    if danger_count >= 2:
        result_type = "scan"
        title = "⚠️ Dangerous Message Detected!"
        message = "This message contains strong phishing or scam indicators. Do not click any links."
    elif danger_count >= 1:
        result_type = "warning"
        title = "⚠️ Looks Suspicious"
        message = "Some suspicious keywords were found. Please review carefully."
    else:
        result_type = "normal"
        title = "✅ Appears Safe"
        message = "No dangerous indicators were found."

    # Save to database
    database.save_scan(req.text, result_type)

    return {
        "type": result_type,
        "title": title,
        "text": message
    }

@app.post("/report")
def report(req: models.ReportRequest):
    database.save_report(req.text, req.reason)
    return {"status": "ok", "message": "Report saved successfully"}

@app.get("/stats")
def stats():
    data = database.get_stats()
    return data
