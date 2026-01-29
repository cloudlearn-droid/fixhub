from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.user import User
from app.schemas.project_member import (
    ProjectMemberCreate,
    ProjectMemberOut,
)

router = APIRouter(
    prefix="/projects/{project_id}/members", tags=["Project Members"])


@router.post("/", response_model=ProjectMemberOut)
def add_project_member(
    project_id: int,
    member: ProjectMemberCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Only project owner can manage team (Admin logic)
    if current_user.id != project.owner_id:
        raise HTTPException(
            status_code=403, detail="Only project owner can manage members")

    existing = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == member.user_id
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="User already in project")

    project_member = ProjectMember(
        project_id=project_id,
        user_id=member.user_id,
        role=member.role
    )

    db.add(project_member)
    db.commit()
    db.refresh(project_member)
    return project_member


@router.get("/", response_model=list[ProjectMemberOut])
def list_project_members(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return (
        db.query(ProjectMember)
        .filter(ProjectMember.project_id == project_id)
        .all()
    )
