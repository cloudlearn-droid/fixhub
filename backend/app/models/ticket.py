from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database.db import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    type = Column(String, nullable=False)      # bug / task / feature
    status = Column(String, default="todo")    # todo / in_progress / done
    priority = Column(String, default="medium")
    position = Column(Integer, default=0)

    project_id = Column(Integer, ForeignKey("projects.id"))
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)

    is_deleted = Column(Boolean, default=False)

    project = relationship("Project")
    assignee = relationship("User")
