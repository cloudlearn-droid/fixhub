from pydantic import BaseModel


class TicketCreate(BaseModel):
    title: str
    description: str | None = None
    type: str
    priority: str = "medium"
    project_id: int
    assigned_to: int | None = None


class TicketUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: str | None = None
    assigned_to: int | None = None


class TicketOut(BaseModel):
    id: int
    title: str
    description: str | None
    type: str
    status: str
    priority: str
    project_id: int
    assigned_to: int | None

    class Config:
        from_attributes = True
