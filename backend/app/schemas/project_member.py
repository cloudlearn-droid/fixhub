from pydantic import BaseModel


class ProjectMemberAdd(BaseModel):
    user_id: int
    role: str  # admin / developer / viewer


class ProjectMemberOut(BaseModel):
    user_id: int
    role: str

    class Config:
        from_attributes = True
