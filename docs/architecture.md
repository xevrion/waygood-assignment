# Architecture Document

## Overview

The platform uses a React frontend, an Express API, MongoDB for persistence, Redis as the queue transport, and a Python worker fleet for asynchronous execution. The backend writes task records in MongoDB, stores an initial audit trail, and pushes lightweight job payloads into Redis. Workers consume queue items independently and update the original task document with status transitions, result data, timestamps, and execution logs.

## Request and Processing Flow

1. A user registers or logs in through the frontend.
2. The backend hashes passwords with bcrypt, issues a JWT, and protects task endpoints with bearer-token authentication.
3. When the user creates a task, the backend persists a MongoDB task document with `pending` status and appends initial logs.
4. The backend enqueues a compact Redis payload containing the task id, input text, and requested operation.
5. A Python worker claims the queue item, marks the task as `running`, executes the operation, and updates the task with either `success` or `failed`.
6. The frontend polls the API for task status, logs, and results.

## Worker Scaling Strategy

Workers are deliberately stateless. They read from Redis and write to MongoDB, so horizontal scaling is straightforward: add more replicas and let Redis distribute queue items via `BLPOP`. In Kubernetes the worker deployment is configured with multiple replicas by default, and additional replicas can be added safely because task ownership is determined by queue pop semantics rather than in-memory coordination.

For higher throughput, scale workers based on queue depth and CPU saturation. A practical production pattern is to expose Redis queue length as a metric and drive a Horizontal Pod Autoscaler or KEDA scaler from that signal. Because jobs are independent and short-lived, this workload parallelizes efficiently.

## Database Indexing Strategy

The task collection is indexed on `(userId, createdAt)` to support the main dashboard query that lists a user’s tasks newest-first. It is also indexed on `(status, createdAt)` to support operational queries like stuck-running or failed-task investigations. The user collection enforces a unique index on email for secure identity management and fast login lookups.

If task volume grows materially, a compound index such as `(userId, status, createdAt)` can support filtered dashboards without a collection scan. Logs are stored inline because assignment jobs are small; if tasks become verbose, logs should move to a separate append-only collection or object storage sink.

## Handling 100k Tasks per Day

One hundred thousand tasks per day is well within the reach of this architecture if the platform is deployed with enough worker replicas and moderate Redis and MongoDB sizing. The critical controls are queue depth, worker concurrency, and MongoDB write throughput.

Recommended operational measures:

- Run multiple backend replicas to absorb bursty API traffic.
- Run worker autoscaling based on queue depth.
- Keep Redis payloads minimal and store only task references plus required input.
- Use MongoDB indexes that match user-facing queries.
- Add alerting on queue latency, failed task rate, and worker restart frequency.

If throughput expands further, the next step would be a more explicit job framework such as BullMQ or Redis Streams, but the current design remains valid for the assignment scope.

## Handling Redis Failure

Redis is a queue transport dependency, so task submission depends on it being available. The backend should fail task creation rather than accepting work it cannot enqueue. In this implementation, Redis connection failure surfaces immediately at API startup or enqueue time, which prevents silent data loss.

Production hardening should include:

- Redis persistence or managed Redis with failover.
- Kubernetes readiness probes that keep broken pods out of service.
- Retry policies and circuit breaking around queue pushes.
- Monitoring on queue length, connection errors, and memory pressure.

If Redis is unavailable after a task record is created but before enqueue succeeds, a compensating state such as `failed` plus an enqueue error log should be written in a follow-up enhancement.

## Staging and Production Deployment Strategy

The infrastructure repository uses a base-plus-overlay layout. The base contains common manifests, while environment overlays replace hostnames, image tags, replica counts, or secrets references. Argo CD points to the environment overlay and auto-syncs repository changes into the target cluster.

This supports clean promotion:

- Build images in CI.
- Push immutable tags to the container registry.
- Update the staging overlay automatically.
- Validate in staging.
- Promote the same image tags into production by changing the production overlay in the infra repository.

## Security Controls

The stack applies the required controls:

- Password hashing with bcrypt.
- JWT authentication.
- Helmet middleware.
- Express rate limiting.
- Secrets injected via environment variables, Kubernetes Secrets, or CI secrets rather than hardcoded source values.

