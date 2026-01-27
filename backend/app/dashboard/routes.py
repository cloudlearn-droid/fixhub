from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.deps import get_db, get_current_user
from app.models.ticket import Ticket
from app.schemas.dashboard import DashboardOut, KanbanColumn

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/project/{project_id}", response_model=DashboardOut)
def project_dashboard(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    rows = (
        db.query(Ticket.status, func.count(Ticket.id))
        .filter(Ticket.project_id == project_id)
        .group_by(Ticket.status)
        .all()
    )

    summary = [
        KanbanColumn(status=status, tickets=count)
        for status, count in rows
    ]

    return {
        "project_id": project_id,
        "summary": summary
    }
