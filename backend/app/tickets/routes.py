from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.ticket import TicketCreate, TicketUpdate, TicketOut
from app.models.ticket import Ticket
from app.models.project import Project
from app.core.deps import get_db, get_current_user
from app.core.workflow import is_valid_transition
from app.models.project_member import ProjectMember

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.post("/", response_model=TicketOut)
def create_ticket(
    ticket: TicketCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == ticket.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    member = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == ticket.project_id,
            ProjectMember.user_id == current_user.id
        )
        .first()
    )

    if not member or member.role == "viewer":
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to create tickets in this project"
        )

    new_ticket = Ticket(
        title=ticket.title,
        description=ticket.description,
        type=ticket.type,
        priority=ticket.priority,
        project_id=ticket.project_id,
        assigned_to=ticket.assigned_to
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket


@router.get("/project/{project_id}", response_model=list[TicketOut])
def list_tickets_by_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Ticket).filter(Ticket.project_id == project_id).all()


@router.put("/{ticket_id}", response_model=TicketOut)
def update_ticket(
    ticket_id: int,
    updates: TicketUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    project = db.query(Project).filter(Project.id == ticket.project_id).first()

    # Permission check
    if current_user.id != project.owner_id and current_user.id != ticket.assigned_to:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this ticket"
        )

    from app.core.workflow import is_valid_transition

    update_data = updates.dict(exclude_unset=True)

    if "status" in update_data:
        if not is_valid_transition(ticket.status, update_data["status"]):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status transition: {ticket.status} → {update_data['status']}"
            )

    for key, value in update_data.items():
        setattr(ticket, key, value)

    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("/search", response_model=list[TicketOut])
def search_tickets(
    status: str | None = None,
    priority: str | None = None,
    assignee: int | None = None,
    project_id: int | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Ticket)

    if project_id is not None:
        query = query.filter(Ticket.project_id == project_id)

    if status is not None:
        query = query.filter(Ticket.status == status)

    if priority is not None:
        query = query.filter(Ticket.priority == priority)

    if assignee is not None:
        query = query.filter(Ticket.assigned_to == assignee)

    if q is not None:
        search = f"%{q}%"
        query = query.filter(
            (Ticket.title.ilike(search)) |
            (Ticket.description.ilike(search))
        )

    return query.all()


@router.delete("/{ticket_id}")
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    project = db.query(Project).filter(Project.id == ticket.project_id).first()

    if current_user.id != project.owner_id:
        raise HTTPException(
            status_code=403,
            detail="Only project owner can delete tickets"
        )

    db.delete(ticket)
    db.commit()
    return {"message": "Ticket deleted successfully"}
