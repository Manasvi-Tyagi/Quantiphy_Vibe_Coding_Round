const { pool } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

const createTask = asyncHandler(async (req, res) => {
  const { column: columnId, columnId: alternateColumnId, title, description = '', priority = 'medium', labels = [], assignee = '', dueDate = null } = req.body;
  const destinationColumnId = columnId || alternateColumnId;
  if (!destinationColumnId || !title) return res.status(400).json({ message: 'Task title and column are required.' });
  const { rows: [column] } = await pool.query('SELECT id, project_id FROM columns WHERE id = $1', [destinationColumnId]);
  if (!column) return res.status(404).json({ message: 'Column not found.' });
  if (req.params.projectId && column.project_id !== Number(req.params.projectId)) {
    return res.status(400).json({ message: 'Column does not belong to this project.' });
  }
  const { rows: [task] } = await pool.query(`INSERT INTO tasks (project_id, column_id, title, description, position, priority, labels, assignee, due_date) VALUES ($1, $2, $3, $4, COALESCE((SELECT MAX(position) + 1 FROM tasks WHERE column_id = $2), 0), $5, $6, $7, $8) RETURNING *`, [column.project_id, column.id, title, description, priority, labels, assignee, dueDate]);
  res.status(201).json({ data: task });
});

const addExistingTask = asyncHandler(async (req, res) => {
  const { taskId, columnId } = req.body;
  if (!taskId || !columnId) return res.status(400).json({ message: 'taskId and columnId are required.' });
  const { rows: [task] } = await pool.query('SELECT id FROM tasks WHERE id = $1', [taskId]);
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  const { rows: [column] } = await pool.query('SELECT id, project_id FROM columns WHERE id = $1', [columnId]);
  if (!column) return res.status(404).json({ message: 'Column not found.' });
  if (column.project_id !== Number(req.params.projectId)) {
    return res.status(400).json({ message: 'Column does not belong to this project.' });
  }
  const { rows: [updatedTask] } = await pool.query(
    `UPDATE tasks SET project_id = $1, column_id = $2,
     position = COALESCE((SELECT MAX(position) + 1 FROM tasks WHERE column_id = $2), 0), updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [column.project_id, column.id, task.id]
  );
  res.json({ data: updatedTask });
});

const updateTask = asyncHandler(async (req, res) => {
  const { rows: [existing] } = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.taskId]);
  if (!existing) return res.status(404).json({ message: 'Task not found.' });
  const { column: columnId = existing.column_id, title = existing.title, description = existing.description, position = existing.position, priority = existing.priority, labels = existing.labels, assignee = existing.assignee, dueDate = existing.due_date } = req.body;
  const { rows: [column] } = await pool.query('SELECT id, project_id FROM columns WHERE id = $1', [columnId]);
  if (!column) return res.status(404).json({ message: 'Destination column not found.' });
  const { rows: [task] } = await pool.query(`UPDATE tasks SET project_id = $1, column_id = $2, title = $3, description = $4, position = $5, priority = $6, labels = $7, assignee = $8, due_date = $9, updated_at = NOW() WHERE id = $10 RETURNING *`, [column.project_id, column.id, title, description, position, priority, labels, assignee, dueDate, existing.id]);
  res.json({ data: task });
});

const deleteTask = asyncHandler(async (req, res) => {
  const result = await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.taskId]);
  if (!result.rowCount) return res.status(404).json({ message: 'Task not found.' });
  res.status(204).send();
});

module.exports = { createTask, addExistingTask, updateTask, deleteTask };
