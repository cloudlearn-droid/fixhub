from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.comment import CommentCreate, CommentOut
from app.models.comment import Comment
from app.models.ticket import Ticket
from app.models.project import Project
from app.models.user import User
from app.core.deps import get_db, get_current_user

router = APIRouter(prefix="/comments", tags=["Comments"])


@router.post("/", response_model=CommentOut)
def add_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(
        Ticket.id == comment.ticket_id,
        Ticket.is_deleted == False
    ).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    new_comment = Comment(
        content=comment.content,
        ticket_id=comment.ticket_id,
        user_id=current_user.id
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return {
        "id": new_comment.id,
        "content": new_comment.content,
        "created_at": new_comment.created_at,
        "user_id": current_user.id,
        "user_email": current_user.email,
        "user_role": current_user.role,
        "is_deleted": False
    }


@router.get("/ticket/{ticket_id}", response_model=list[CommentOut])
def list_comments(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    rows = (
        db.query(Comment, User)
        .join(User, User.id == Comment.user_id)
        .filter(
            Comment.ticket_id == ticket_id,
            Comment.is_deleted == False
        )
        .order_by(Comment.created_at.asc())
        .all()
    )

    return [
        {
            "id": c.id,
            "content": c.content,
            "created_at": c.created_at,
            "user_id": u.id,
            "user_email": u.email,
            "user_role": u.role,
            "is_deleted": c.is_deleted
        }
        for c, u in rows
    ]


@router.delete("/{comment_id}")
def soft_delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    ticket = db.query(Ticket).filter(Ticket.id == comment.ticket_id).first()
    project = db.query(Project).filter(Project.id == ticket.project_id).first()

    # Admin or comment owner
    if current_user.id != comment.user_id and current_user.id != project.owner_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    comment.is_deleted = True
    comment.content = "This comment was deleted"

    db.commit()
    return {"message": "Comment deleted"}
