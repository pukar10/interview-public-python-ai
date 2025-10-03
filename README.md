# Interview Python AI - Chat Application

Full-stack chat application with FastAPI + LangChain + Ollama backend and React + TypeScript frontend. Features real-time streaming responses from local LLMs.

## Pre-Interview

### All Candidates
- [ ] Clone this repository to your local machine
- [ ] Successfully run the application stack (see Quick Start below)
- [ ] Verify you can access both the frontend and backend
- [ ] Review the codebase structure and familiarize yourself with the key components

### DevSecOps Candidates Only
Additionally install:
- [ ] Azure CLI
- [ ] Terraform
- [ ] Kubernetes CLI (kubectl)

## Quick Start

**Prerequisites**: Docker and Docker Compose installed

```bash
# Start the complete stack (recommended)
./scripts/init-dev.sh

# Or manually start all services:
docker-compose up

# To shutdown
docker-compose down
```

This will start all required services: frontend, backend, PostgreSQL database, and Ollama for LLM functionality.

### Accessing the Application

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React chat interface |
| Backend API | http://localhost:8000/docs | FastAPI Swagger documentation |

## Structure 

```
interview-python-ai/
├── backend/
│   ├── app/
│   │   ├── routers/      # FastAPI routes and endpoints
│   │   ├── services/     # Business logic and integrations (e.g., LangChain, Ollama)
│   │   ├── config.py     # App configuration and settings
│   │   ├── database.py   # Database session and connection
│   │   ├── models.py     # SQLAlchemy models
│   │   ├── schemas.py    # Pydantic schemas
│   │   ├── main.py       # FastAPI application entrypoint
│   ├── alembic/          # Database migrations
└── frontend/
    ├── src/
    │   ├── api/          # Generated API client
    │   ├── components/   # React UI components
    │   ├── hooks/        # Custom React hooks
    │   ├── lib/          # Utility libraries
    │   ├── App.tsx       # Main React application
    │   └── main.tsx      # React entrypoint
    └── public/           # Static assets
```

## Development

**Database migrations**:
```bash
docker-compose exec backend alembic revision --autogenerate -m "description"
docker-compose exec backend alembic upgrade head
```

**Frontend API client regeneration** (when backend changes):
```bash
cd frontend && npx kubb
```

version: 0.1.5 <!-- x-release-please-version -->


# Deployment Steps

1. Deploy infrastructure via Terraform
2. Configure VM(s) and install k8s using ansible-playbooks
3. Deploy K8s resouces (frontend/backend/postgres/ollama) via `kubectl apply` (Upgrade this to use Helm)

* Deploy ArgoCD to manage the k8s resources and implement a true gitOps first deployment.
