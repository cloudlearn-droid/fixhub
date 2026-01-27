import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.models.attachment import Attachment
from app.models.ticket import Ticket
from app.schemas.attachment import AttachmentOut

UPLOAD_DIR = "app/uploads"

router = APIRouter(prefix="/attachments", tags=["Attachments"])


@router.post("/ticket/{ticket_id}", response_model=AttachmentOut)
def upload_attachment(
    ticket_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    attachment = Attachment(
        filename=file.filename,
        file_path=file_path,
        ticket_id=ticket_id,
        uploaded_by=current_user.id
    )

    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return attachment


@router.get("/ticket/{ticket_id}", response_model=list[AttachmentOut])
def list_attachments(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return (
        db.query(Attachment)
        .filter(Attachment.ticket_id == ticket_id)
        .all()
    )
