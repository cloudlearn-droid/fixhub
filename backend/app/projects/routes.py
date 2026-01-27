from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.project import ProjectCreate, ProjectOut
from app.models.project import Project
from app.core.deps import get_db, get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/", response_model=ProjectOut)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_project = Project(
        name=project.name,
        description=project.description,
        owner_id=current_user.id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


@router.get("/", response_model=list[ProjectOut])
def list_projects(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Project).filter(Project.owner_id == current_user.id).all()
