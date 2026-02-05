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
    user_email: str
    user_role: str
    is_deleted: bool

    class Config:
        from_attributes = True
