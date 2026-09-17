import { useState } from 'react';
import { PRIORITIES } from '../constants.js';

export default function TaskModal({ columns, members, task, onClose, onSubmit }) {
  const isEdit = Boolean(task);
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    assignee: task?.assignee || '',
    dueDate: task?.due_date ? task.due_date.slice(0, 10) : '',
    column: task?.column_id || columns[0]?.id || '',
  });

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.column) return;
    onSubmit({
      title: form.title.trim(),
      description: form.description,
      priority: form.priority,
      assignee: form.assignee,
      dueDate: form.dueDate || null,
      column: form.column,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>{isEdit ? 'Edit Task' : 'New Task'}</h3>

        <label>
          Title
          <input value={form.title} onChange={(e) => update('title', e.target.value)} autoFocus required />
        </label>

        <label>
          Description
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} />
        </label>

        <div className="modal__row">
          <label>
            Priority
            <select value={form.priority} onChange={(e) => update('priority', e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>

          <label>
            Column
            <select value={form.column} onChange={(e) => update('column', e.target.value)}>
              {columns.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="modal__row">
          <label>
            Assignee
            <select value={form.assignee} onChange={(e) => update('assignee', e.target.value)}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>

          <label>
            Due date
            <input type="date" value={form.dueDate} onChange={(e) => update('dueDate', e.target.value)} />
          </label>
        </div>

        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary">{isEdit ? 'Save' : 'Create'}</button>
        </div>
      </form>
    </div>
  );
}
