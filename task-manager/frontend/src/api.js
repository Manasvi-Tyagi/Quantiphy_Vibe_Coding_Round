const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || `Request failed: ${res.status}`);
  return body.data;
}

export const api = {
  listBoards: () => request('/boards'),
  createBoard: (payload) => request('/boards', { method: 'POST', body: JSON.stringify(payload) }),
  getBoard: (boardId) => request(`/boards/${boardId}`),
  updateBoard: (boardId, payload) => request(`/boards/${boardId}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  createColumn: (boardId, payload) => request(`/boards/${boardId}/columns`, { method: 'POST', body: JSON.stringify(payload) }),

  createTask: (payload) => request('/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  updateTask: (taskId, payload) => request(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteTask: (taskId) => request(`/tasks/${taskId}`, { method: 'DELETE' }),
};
