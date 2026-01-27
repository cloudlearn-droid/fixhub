from pydantic import BaseModel


class KanbanMove(BaseModel):
    ticket_id: int
    new_status: str
    new_position: int
