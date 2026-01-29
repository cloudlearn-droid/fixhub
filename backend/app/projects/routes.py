from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.project import ProjectCreate, ProjectOut
from app.schemas.project_member import ProjectMemberCreate
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.user import User
from app.core.deps import get_db, get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])


# -------------------------------
# CREATE PROJECT (AUTO ADMIN)
# -------------------------------
@router.post("/", response_model=ProjectOut)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_project = Project(
        name=project.name,
        description=project.description,
        owner_id=current_user.id,
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    # auto assign creator as admin
    admin_member = ProjectMember(
        project_id=new_project.id,
        user_id=current_user.id,
        role="admin",
    )
    db.add(admin_member)
    db.commit()

    return new_project


# -------------------------------
# LIST PROJECTS
# -------------------------------
@router.get("/", response_model=list[ProjectOut])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Project)
        .join(ProjectMember)
        .filter(ProjectMember.user_id == current_user.id)
        .all()
    )


# -------------------------------
# ADD PROJECT MEMBER (ADMIN ONLY)
# -------------------------------
@router.post("/{project_id}/members")
def add_project_member(
    project_id: int,
    data: ProjectMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # only admin can add members
    admin = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id,
            ProjectMember.role == "admin",
        )
        .first()
    )
    if not admin:
        raise HTTPException(status_code=403, detail="Admin only")

    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="User already a member")

    member = ProjectMember(
        project_id=project_id,
        user_id=user.id,
        role=data.role,
    )
    db.add(member)
    db.commit()
    db.refresh(member)

    return {
        "id": member.id,
        "email": user.email,
        "role": member.role,
    }


# -------------------------------
# ✅ GET PROJECT MEMBERS (FIX)
# -------------------------------
@router.get("/{project_id}/members")
def get_project_members(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    members = (
        db.query(ProjectMember, User)
        .join(User, User.id == ProjectMember.user_id)
        .filter(ProjectMember.project_id == project_id)
        .all()
    )

    return [
        {
            "id": pm.id,
            "email": user.email,
            "role": pm.role,
        }
        for pm, user in members
    ]
# -------------------------------
# GET CURRENT USER ROLE IN PROJECT
# -------------------------------


@router.get("/{project_id}/my-role")
def get_my_project_role(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id,
        )
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=404,
            detail="User is not a member of this project",
        )

    return {
        "role": member.role,
    }
