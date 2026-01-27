from pydantic import BaseModel
from datetime import datetime


class CommentCreate(BaseModel):
    content: str
    ticket_id: int


class CommentOut(BaseModel):
    id: int
    content: str
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True
