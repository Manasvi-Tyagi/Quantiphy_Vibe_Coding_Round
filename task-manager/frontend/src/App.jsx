import { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from './api.js';
import Board from './components/Board.jsx';
import Toolbar from './components/Toolbar.jsx';
import TeamList from './components/TeamList.jsx';
import TaskModal from './components/TaskModal.jsx';
import { IN_PROGRESS_COLUMN_NAME } from './constants.js';

export default function App() {
  const [boards, setBoards] = useState([]);
  const [boardId, setBoardId] = useState(null);
  const [board, setBoard] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [modalTask, setModalTask] = useState(undefined); // undefined = closed, null = new, object = edit
  const [error, setError] = useState('');
  const [newBoardName, setNewBoardName] = useState('');

  const loadBoards = useCallback(async () => {
    const data = await api.listBoards();
    setBoards(data);
    if (data.length > 0 && !boardId) setBoardId(data[0].id);
  }, [boardId]);

  const loadBoard = useCallback(async (id) => {
    if (!id) return;
    const data = await api.getBoard(id);
    setBoard(data);
  }, []);

  useEffect(() => {
    loadBoards().catch((e) => setError(e.message));
  }, [loadBoards]);

  useEffect(() => {
    loadBoard(boardId).catch((e) => setError(e.message));
  }, [boardId, loadBoard]);

  async function handleCreateBoard(e) {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    try {
      const created = await api.createBoard({ name: newBoardName.trim() });
      setNewBoardName('');
      await loadBoards();
      setBoardId(created.id);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleAddMember(member) {
    if (!board) return;
    try {
      const members = Array.from(new Set([...(board.members || []), member]));
      await api.updateBoard(board.id, { members });
      await loadBoard(board.id);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleTaskSubmit(payload) {
    try {
      if (modalTask) {
        await api.updateTask(modalTask.id, payload);
      } else {
        await api.createTask(payload);
      }
      setModalTask(undefined);
      await loadBoard(board.id);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleTaskDelete(task) {
    try {
      await api.deleteTask(task.id);
      await loadBoard(board.id);
    } catch (e) {
      setError(e.message);
    }
  }

  function handleCardDragStart(e, task) {
    e.dataTransfer.setData('text/plain', String(task.id));
  }

  async function handleDropTask(e, columnId) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;
    try {
      await api.updateTask(taskId, { column: columnId });
      await loadBoard(board.id);
    } catch (e) {
      setError(e.message);
    }
  }

  const filteredColumns = useMemo(() => {
    if (!board) return [];
    return board.columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task) => priorityFilter === 'all' || task.priority === priorityFilter),
    }));
  }, [board, priorityFilter]);

  const workload = useMemo(() => {
    if (!board) return {};
    const inProgress = board.columns.find((c) => c.name.toLowerCase() === IN_PROGRESS_COLUMN_NAME);
    if (!inProgress) return {};
    return inProgress.tasks.reduce((acc, task) => {
      if (!task.assignee) return acc;
      acc[task.assignee] = (acc[task.assignee] || 0) + 1;
      return acc;
    }, {});
  }, [board]);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Kanban Task Manager</h1>
        {boards.length > 0 && (
          <select value={boardId || ''} onChange={(e) => setBoardId(Number(e.target.value))}>
            {boards.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}
        <form className="app__new-board" onSubmit={handleCreateBoard}>
          <input
            placeholder="New board name"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
          />
          <button type="submit" className="btn">Create Board</button>
        </form>
      </header>

      {error && <div className="app__error" onClick={() => setError('')}>{error}</div>}

      {!board && <p className="app__empty">Create a board to get started.</p>}

      {board && (
        <>
          <Toolbar
            priorityFilter={priorityFilter}
            onFilterChange={setPriorityFilter}
            onNewTask={() => setModalTask(null)}
            onAddMember={handleAddMember}
          />

          <div className="app__body">
            <Board
              columns={filteredColumns}
              onDropTask={handleDropTask}
              onCardDragStart={handleCardDragStart}
              onTaskClick={setModalTask}
              onTaskDelete={handleTaskDelete}
            />
            <aside className="app__sidebar">
              <h3>Team</h3>
              <TeamList members={board.members || []} workload={workload} />
            </aside>
          </div>
        </>
      )}

      {modalTask !== undefined && (
        <TaskModal
          columns={board.columns}
          members={board.members || []}
          task={modalTask}
          onClose={() => setModalTask(undefined)}
          onSubmit={handleTaskSubmit}
        />
      )}
    </div>
  );
}
