# Problem Statement: Task Management App
The Mission: Create a streamlined task management application with Kanban-style
organization for personal or team productivity.

Frontend UI & User Interaction:
   - Kanban Board: Three columns: 'To-Do', 'In Progress', 'Done', with drag-and-drop capability.
   - Task Cards: Individual items with priority tags, due dates, and descriptions.
   - User Controls: Buttons to create tasks, add users to projects, and filter by priority.
     
Backend Logic & State Management:
   - Custom CRUD API: Manages task states and user associations.
   - Relational Data: PostgreSQL stores task hierarchy (projects -> tasks) and user permissions.

The Vibe Check:
   - Introduce "Workload Balancing." Add a counter to each column indicating the number of tasks. If any user has more than 5 tasks in "In Progress", the background color of their avatar in the team list must pulse red to warn of potential burnout.

# Kanban Task Manager

A Kanban board (React frontend + Express/PostgreSQL API) for personal or team task tracking. No authentication — anyone with access to the app can use it.

## Quick start

### Backend

1. Ensure PostgreSQL is running and create a `kanban_task_manager` database.
2. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`.
3. Apply the schema and run the API:

   ```bash
   cd backend
   npm run db:migrate
   npm run dev
   ```

The server starts at `http://localhost:5000`. Check `GET /api/health` to confirm it is available.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app starts at `http://localhost:3000` and talks to the API at `http://localhost:5000/api` (override with `VITE_API_URL`, see `frontend/.env.example`).

## API overview

| Resource | Endpoint |
| --- | --- |
| Boards | `/api/boards` |
| Columns | `/api/boards/:boardId/columns` |
| Tasks | `/api/tasks` |

See [docs/API.md](docs/API.md) for request examples.

The entity relationships are documented in [backend/db/models.md](backend/db/models.md).
