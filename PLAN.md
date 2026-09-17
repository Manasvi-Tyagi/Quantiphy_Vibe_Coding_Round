# Kanban Task Manager — Implementation Plan

## Current state (verified)

- `backend/` is an Express 5 + PostgreSQL API already scaffolded.
- Schema (`backend/db/migrations/001_initial.sql`): `boards`, `columns`, `tasks`.
  - `boards.members` is a plain `TEXT[]` (emails) — no real `users` table, no per-user permissions.
  - `tasks.assignee` is a free-text `VARCHAR`, not a foreign key.
- Routes/controllers exist for boards, columns, tasks (`backend/src/routes`, `backend/src/controllers`). No `models/` files yet (logic lives in controllers).
- No `users` table, no auth/permissions, no frontend directory at all.

This plan closes those gaps: (1) real relational users/permissions, (2) a frontend Kanban UI, (3) the workload-balancing "vibe check" feature.

## 1. Backend — data model changes

Add migration `002_users_and_permissions.sql`:

- `users` table: `id, name, email UNIQUE, avatar_color, created_at`.
- `board_members` join table: `board_id, user_id, role ('owner'|'member')`, replaces the `boards.members` text array (keep column temporarily, migrate data, drop in a follow-up).
- `tasks.assignee_id BIGINT REFERENCES users(id)` replacing free-text `assignee` (keep `assignee` column deprecated during transition or drop directly since app is pre-launch).
- Index `tasks(assignee_id, column_id)` — needed for the workload query below.

## 2. Backend — API additions

- `POST /api/users`, `GET /api/users`, `GET /api/boards/:boardId/users` — manage/add users to a project.
- `PATCH /api/tasks/:taskId` accepts `assigneeId` instead of `assignee` string.
- New: `GET /api/boards/:boardId/workload` → returns per-user counts of tasks in the "In Progress" column, e.g.:
  ```json
  { "data": [{ "userId": 3, "name": "Sam", "inProgressCount": 6, "overloaded": true }] }
  ```
  `overloaded = inProgressCount > 5`. Compute with a single grouped SQL query (`COUNT(*) ... WHERE column.name = 'In Progress' GROUP BY assignee_id`), not N+1 lookups.
- Update `docs/API.md` with the new endpoints once implemented.

## 3. Frontend — new `frontend/` app

Not present yet; scaffold with Vite + React (matches Node≥18 engine already required).

- `frontend/src/api/` — thin fetch wrapper for the existing REST API.
- `frontend/src/components/Board.jsx` — three fixed columns (To-Do, In Progress, Done), each rendering its task list and a header showing `<column name> (<count>)`.
- `frontend/src/components/TaskCard.jsx` — title, description, priority tag (color-coded), due date.
- `frontend/src/components/DragDropContext` — use `@dnd-kit/core` (actively maintained, no legacy react-dnd baggage) for drag-and-drop between columns; on drop, call `PATCH /api/tasks/:id` with new `column` + `position`.
- `frontend/src/components/Toolbar.jsx` — "New Task" button (opens a form modal), "Add User" button, priority filter dropdown (client-side filter over fetched tasks).
- `frontend/src/components/TeamList.jsx` — avatar per board member.

## 4. Frontend — workload balancing ("vibe check")

- On board load and after every task move/assign, refetch `GET /api/boards/:boardId/workload`.
- Column header task counters: derive directly from rendered column arrays (no extra call needed).
- `TeamList` avatar: if that user's `overloaded` flag is true, apply a CSS pulse:
  ```css
  @keyframes pulse-red {
    0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.7); }
    50% { box-shadow: 0 0 0 6px rgba(220,38,38,0); }
  }
  .avatar--overloaded { animation: pulse-red 1.5s ease-in-out infinite; }
  ```
- Threshold (`>5`) lives server-side (`overloaded` flag from the API), not recomputed independently in the frontend, so the rule can't drift between client and server.

## 5. Build order

1. Migration `002_users_and_permissions.sql` + update board/task controllers to join users instead of raw strings.
2. `GET /api/boards/:boardId/workload` endpoint + test.
3. Scaffold `frontend/` (Vite React), API wrapper, static board rendering (no DnD yet) against real data.
4. Add drag-and-drop, task create/edit modal, priority filter.
5. Add TeamList + workload polling + pulse animation.
6. Update `README.md` and `docs/API.md` for the new endpoints and `cd frontend && npm install && npm run dev` instructions.

## Open questions to confirm before coding

- Auth: is real login/session needed, or is "user" just a name picked from a project roster (no passwords)? Plan above assumes the latter (simpler, matches current `members` text-array design).
- Should "In Progress" burnout threshold (5) be configurable per board, or hardcoded as in the brief? Plan assumes hardcoded per the brief.
