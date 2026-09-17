const { pool } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

const createColumn = asyncHandler(async (req, res) => {
  const { rows: [board] } = await pool.query('SELECT id FROM projects WHERE id = $1', [req.params.boardId]);
  if (!board) return res.status(404).json({ message: 'Board not found.' });
  if (!req.body.name) return res.status(400).json({ message: 'Column name is required.' });
  const { rows: [column] } = await pool.query(`INSERT INTO columns (project_id, name, position) VALUES ($1, $2, COALESCE((SELECT MAX(position) + 1 FROM columns WHERE project_id = $1), 0)) RETURNING *`, [board.id, req.body.name]);
  res.status(201).json({ data: column });
});

const updateColumn = asyncHandler(async (req, res) => {
  const { name, position } = req.body;
  const { rows: [column] } = await pool.query('UPDATE columns SET name = COALESCE($1, name), position = COALESCE($2, position), updated_at = NOW() WHERE id = $3 RETURNING *', [name, position, req.params.columnId]);
  if (!column) return res.status(404).json({ message: 'Column not found.' });
  res.json({ data: column });
});

const deleteColumn = asyncHandler(async (req, res) => {
  const result = await pool.query('DELETE FROM columns WHERE id = $1', [req.params.columnId]);
  if (!result.rowCount) return res.status(404).json({ message: 'Column not found.' });
  res.status(204).send();
});

module.exports = { createColumn, updateColumn, deleteColumn };
