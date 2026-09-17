# Relational data model

`projects` is the persisted Kanban board. The API still exposes board routes for backwards compatibility.

| Entity | Table | Key relationships |
| --- | --- | --- |
| User | `users` | Can join projects and be assigned tasks. |
| Project | `projects` | Owns columns, tasks, labels, and members. |
| ProjectMember | `project_members` | Connects a user and project; retains their role. |
| Column | `columns` | Belongs to a project and orders its tasks. |
| Task | `tasks` | Belongs to a project and column; may have many assignees and labels. |
| TaskAssignment | `task_assignments` | Connects a task and assigned user. |
| Label | `labels` | Project-scoped classification with a display color. |
| TaskLabel | `task_labels` | Connects a task and label. |

Workload balancing is derived from `task_assignments`, joined with `tasks` and `columns`: count assignments in the `In Progress` column per user. A count above five should activate the pulsing avatar warning in the client.
