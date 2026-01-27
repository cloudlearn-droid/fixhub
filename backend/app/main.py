from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import engine, Base
from app.models import user, project, ticket, comment, attachment
from app.auth.routes import router as auth_router
from app.projects.routes import router as project_router
from app.tickets.routes import router as ticket_router
from app.dashboard.routes import router as dashboard_router
from app.kanban.routes import router as kanban_router
from app.comments.routes import router as comment_router
from app.attachments.routes import router as attachment_router
from app.project_members.routes import router as project_member_router

app = FastAPI(title="FixHub API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",  # vite frontend
                   ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(project_router)
app.include_router(ticket_router)
app.include_router(dashboard_router)
app.include_router(kanban_router)
app.include_router(comment_router)
app.include_router(attachment_router)
app.include_router(project_member_router)


@app.get("/")
def root():
    return {
        "app": "FixHub",
        "status": "Production-ready",
        "version": "1.0"
    }
