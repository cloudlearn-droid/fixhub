from pydantic import BaseModel
from app.schemas.ticket import TicketOut


class KanbanBoard(BaseModel):
    todo: list[TicketOut]
    in_progress: list[TicketOut]
    done: list[TicketOut]
