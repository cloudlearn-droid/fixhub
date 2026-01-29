from pydantic import BaseModel, EmailStr
from typing import Literal


class ProjectMemberBase(BaseModel):
    role: Literal["admin", "developer", "viewer"]


# 🔹 Used when ADMIN adds a member by email
class ProjectMemberCreate(ProjectMemberBase):
    email: EmailStr


# 🔹 Response schema
class ProjectMemberOut(BaseModel):
    user_id: int
    email: EmailStr
    role: str

    class Config:
        from_attributes = True
