from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.db import Base


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    uploaded_by = Column(Integer, ForeignKey("users.id"))

    ticket = relationship("Ticket")
    uploader = relationship("User")
