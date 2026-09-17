const { pool } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

const getBoards = asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM projects ORDER BY updated_at DESC');
  res.json({ data: rows });
});

const createBoard = asyncHandler(async (req, res) => {
  const { name, description = '', members = [] } = req.body;
  if (!name) return res.status(400).json({ message: 'Board name is required.' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [board] } = await client.query('INSERT INTO projects (name, description, members) VALUES ($1, $2, $3) RETURNING *', [name, description, members]);
    await client.query(`INSERT INTO columns (project_id, name, position) VALUES ($1, 'To do', 0), ($1, 'In progress', 1), ($1, 'Done', 2)`, [board.id]);
    await client.query('COMMIT');
    res.status(201).json({ data: board });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
});

const getBoard = asyncHandler(async (req, res) => {
  const { rows: [board] } = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.boardId]);
  if (!board) return res.status(404).json({ message: 'Board not found.' });
  const { rows: columns } = await pool.query('SELECT * FROM columns WHERE project_id = $1 ORDER BY position', [board.id]);
  const { rows: tasks } = await pool.query('SELECT * FROM tasks WHERE project_id = $1 ORDER BY position', [board.id]);
  res.json({ data: { ...board, columns: columns.map((column) => ({ ...column, tasks: tasks.filter((task) => task.column_id === column.id) })) } });
});

const updateBoard = asyncHandler(async (req, res) => {
  const { name, description, members } = req.body;
  const { rows: [board] } = await pool.query(`UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description), members = COALESCE($3, members), updated_at = NOW() WHERE id = $4 RETURNING *`, [name, description, members, req.params.boardId]);
  if (!board) return res.status(404).json({ message: 'Board not found.' });
  res.json({ data: board });
});

const deleteBoard = asyncHandler(async (req, res) => {
  const result = await pool.query('DELETE FROM projects WHERE id = $1', [req.params.boardId]);
  if (!result.rowCount) return res.status(404).json({ message: 'Board not found.' });
  res.status(204).send();
});

module.exports = { getBoards, createBoard, getBoard, updateBoard, deleteBoard };
