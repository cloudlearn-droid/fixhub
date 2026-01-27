from pydantic import BaseModel


class KanbanColumn(BaseModel):
    status: str
    tickets: int


class DashboardOut(BaseModel):
    project_id: int
    summary: list[KanbanColumn]
