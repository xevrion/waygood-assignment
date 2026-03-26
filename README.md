# Waygood AI Task Processing Platform

This repository contains a complete assignment implementation for an AI task processing platform built with React, Express, MongoDB, Redis, a Python worker, Docker, Kubernetes manifests, Argo CD configuration, CI/CD workflow, and supporting documentation.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express + Mongoose
- Worker: Python + Redis + PyMongo
- Data: MongoDB + Redis
- Delivery: Docker, docker-compose, Kubernetes manifests, Argo CD, GitHub Actions

## Features

- User registration and login with bcrypt password hashing and JWT auth
- Create asynchronous AI tasks with `uppercase`, `lowercase`, `reverse`, and `word_count`
- Background execution through a Redis-backed worker queue
- Task status tracking with `pending`, `running`, `success`, and `failed`
- Task logs, results, and timestamps
- Helmet and API rate limiting
- Kubernetes deployment manifests with namespace, ingress, config, secrets, probes, and resource controls

## Repository Layout

- `frontend/`: React UI
- `backend/`: Express API
- `worker/`: Python job processor
- `infra/`: Kubernetes and Argo CD manifests for the separate infrastructure repository
- `docs/architecture.md`: required architecture document
- `.github/workflows/ci-cd.yml`: CI/CD pipeline

## Local Setup

1. Copy `.env.example` to `.env`.
2. Set `JWT_SECRET` and any local overrides you need.
3. Run `docker compose up --build`.
4. Open `http://localhost:8080`.

For non-Docker development you can install dependencies in `backend/` and `frontend/`, create a Python virtualenv in `worker/`, and run each service separately.

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:taskId`

## Docker

Each service has its own Dockerfile:

- `frontend/Dockerfile`
- `backend/Dockerfile`
- `worker/Dockerfile`

`docker-compose.yml` runs the full local stack together with MongoDB and Redis.

## Kubernetes and Argo CD

The `infra/` directory is structured so it can be copied into a dedicated infrastructure repository:

- `base/`: shared manifests
- `overlays/staging/`: environment-specific overrides
- `argocd/application.yaml`: Argo CD application with auto-sync enabled

Update the placeholder image names and repository URLs before deployment.

## CI/CD

The GitHub Actions workflow:

- runs linting
- builds the frontend and backend
- builds and pushes Docker images
- updates infra image tags through `scripts/update-infra-tags.sh`

In a real split-repository setup, the last step should commit the overlay change into the dedicated infra repository.

## Submission Notes

The assignment asks for an Argo CD screenshot and optionally a live deployed URL. Those cannot be generated purely from local source code, so they remain deployment-time deliverables after you point the manifests at a real cluster and registry.
