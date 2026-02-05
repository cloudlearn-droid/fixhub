from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.ticket import TicketCreate, TicketUpdate, TicketOut
from app.models.ticket import Ticket
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.user import User
from app.core.deps import get_db, get_current_user
from app.core.workflow import is_valid_transition

router = APIRouter(prefix="/tickets", tags=["Tickets"])


# -----------------------------
# Helper: resolve project role
# -----------------------------
def get_project_role(db: Session, project_id: int, user_id: int) -> str | None:
    member = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
        .first()
    )
    return member.role if member else None


# -----------------------------
# Create ticket
# -----------------------------
@router.post("/", response_model=TicketOut)
def create_ticket(
    ticket: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == ticket.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    role = get_project_role(db, ticket.project_id, current_user.id)

    if role is None or role == "viewer":
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to create tickets in this project",
        )

    new_ticket = Ticket(
        title=ticket.title,
        description=ticket.description,
        type=ticket.type,
        priority=ticket.priority,
        project_id=ticket.project_id,
        assigned_to=ticket.assigned_to,
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket


# -----------------------------
# List tickets by project
# -----------------------------
@router.get("/project/{project_id}", response_model=list[TicketOut])
def list_tickets_by_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Ticket)
        .filter(
            Ticket.project_id == project_id,
            Ticket.is_deleted == False
        )
        .all()
    )


# -----------------------------
# Search tickets
# -----------------------------
@router.get("/search", response_model=list[TicketOut])
def search_tickets(
    status: str | None = None,
    priority: str | None = None,
    assignee: int | None = None,
    project_id: int | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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


# -----------------------------
# Delete ticket (ADMIN ONLY)
# -----------------------------
@router.delete("/{ticket_id}")
def soft_delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    role = get_project_role(db, ticket.project_id, current_user.id)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    ticket.is_deleted = True
    db.commit()

    return {"message": "Ticket archived"}


# -----------------------------
# Update ticket (RBAC enforced)
# -----------------------------
@router.put("/{ticket_id}", response_model=TicketOut)
def update_ticket(
    ticket_id: int,
    data: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    role = get_project_role(db, ticket.project_id, current_user.id)

    if role is None:
        raise HTTPException(
            status_code=403,
            detail="Not a project member",
        )

    # 🔒 Viewer cannot edit anything
    if role == "viewer":
        raise HTTPException(
            status_code=403,
            detail="Viewers cannot edit tickets",
        )

    # 🔒 Developer can edit ONLY assigned tickets
    if role == "developer":
        if ticket.assigned_to != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Developers can only edit tickets assigned to them",
            )

    # 🔒 Admin-only reassignment
    if (
        data.assigned_to is not None
        and data.assigned_to != ticket.assigned_to
    ):
        if role != "admin":
            raise HTTPException(
                status_code=403,
                detail="Only admins can reassign tickets",
            )

    # --- perform update ---
    if data.title is not None:
        ticket.title = data.title

    if data.description is not None:
        ticket.description = data.description

    if data.status is not None:
        ticket.status = data.status

    if data.priority is not None:
        ticket.priority = data.priority

    if data.assigned_to != ticket.assigned_to:
        ticket.assigned_to = data.assigned_to

    db.commit()
    db.refresh(ticket)

    return ticket
