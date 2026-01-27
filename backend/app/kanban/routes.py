from app.schemas.kanban_move import KanbanMove
from fastapi import HTTPException
from app.core.workflow import is_valid_transition
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.models.ticket import Ticket
from app.schemas.kanban import KanbanBoard

router = APIRouter(prefix="/kanban", tags=["Kanban"])


@router.get("/project/{project_id}", response_model=KanbanBoard)
def get_kanban_board(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    tickets = db.query(Ticket).filter(Ticket.project_id == project_id).all()

    return {
        "todo": [t for t in tickets if t.status == "todo"],
        "in_progress": [t for t in tickets if t.status == "in_progress"],
        "done": [t for t in tickets if t.status == "done"],
    }


@router.post("/move")
def move_ticket(
    move: KanbanMove,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == move.ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Validate workflow transition
    if ticket.status != move.new_status:
        if not is_valid_transition(ticket.status, move.new_status):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status transition: {ticket.status} → {move.new_status}"
            )
        ticket.status = move.new_status

    ticket.position = move.new_position

    db.commit()
    return {"message": "Ticket moved successfully"}
