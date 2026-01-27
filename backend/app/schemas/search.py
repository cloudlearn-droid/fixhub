from pydantic import BaseModel


class TicketSearchParams(BaseModel):
    status: str | None = None
    priority: str | None = None
    assignee: int | None = None
    project_id: int | None = None
    q: str | None = None
