from pydantic import BaseModel
from datetime import datetime


class AttachmentOut(BaseModel):
    id: int
    filename: str
    uploaded_at: datetime
    ticket_id: int
    uploaded_by: int

    class Config:
        from_attributes = True
