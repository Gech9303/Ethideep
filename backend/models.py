from pydantic import BaseModel
from typing import Optional

class AnalyzeRequest(BaseModel):
    text: str

class ReportRequest(BaseModel):
    text: str
    reason: Optional[str] = "user_report"
