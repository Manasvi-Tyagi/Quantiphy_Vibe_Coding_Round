# API guide

All request and response bodies are JSON. Successful resources are returned as `{ "data": ... }`.

## Boards

Create a board (which includes **To do**, **In progress**, and **Done** columns):

```http
POST /api/boards
Content-Type: application/json

{ "name": "Product launch", "description": "Q4 campaign work", "members": ["sam@example.com"] }
```

`GET /api/boards/:boardId` returns the board, ordered columns, and each column's ordered tasks.

## Columns

```http
POST /api/boards/:boardId/columns
Content-Type: application/json

{ "name": "Review" }
```

Use `PATCH /api/columns/:columnId` to rename or reposition a column, and `DELETE /api/columns/:columnId` to remove it and its tasks.

## Tasks

Create a new task inside a project column:

```http
POST /api/boards/:projectId/tasks
Content-Type: application/json

{
  "columnId": "COLUMN_ID",
  "title": "Write launch email",
  "description": "Use the approved campaign voice.",
  "priority": "high",
  "dueDate": "2026-10-15"
}
```

Add an existing task to a project. This moves it into the provided project column and appends it to that column:

```http
POST /api/boards/:projectId/tasks/existing
Content-Type: application/json

{ "taskId": "EXISTING_TASK_ID", "columnId": "COLUMN_ID" }
```

The generic creation route remains available:

```http
POST /api/tasks
Content-Type: application/json

{
  "column": "COLUMN_ID",
  "title": "Write launch email",
  "priority": "high",
  "labels": ["marketing"],
  "assignee": "sam@example.com",
  "dueDate": "2026-10-15"
}
```

Use `PATCH /api/tasks/:taskId` for task fields, including moving a task by supplying a new `column` and optional `position`. Delete with `DELETE /api/tasks/:taskId`.

## Database migration

Run `npm run db:migrate` from `server` after setting `DATABASE_URL`. The idempotent SQL migration creates the boards, columns, and tasks tables, constraints, and indexes.
