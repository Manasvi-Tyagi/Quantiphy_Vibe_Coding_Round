import { useState } from 'react';
import { PRIORITIES } from '../constants.js';

export default function Toolbar({ priorityFilter, onFilterChange, onNewTask, onAddMember }) {
  const [memberInput, setMemberInput] = useState('');
  const [showMemberForm, setShowMemberForm] = useState(false);

  function submitMember(e) {
    e.preventDefault();
    if (!memberInput.trim()) return;
    onAddMember(memberInput.trim());
    setMemberInput('');
    setShowMemberForm(false);
  }

  return (
    <div className="toolbar">
      <button className="btn btn--primary" onClick={onNewTask}>
        + New Task
      </button>

      {showMemberForm ? (
        <form className="toolbar__member-form" onSubmit={submitMember}>
          <input
            autoFocus
            placeholder="Name or email"
            value={memberInput}
            onChange={(e) => setMemberInput(e.target.value)}
          />
          <button type="submit" className="btn">Add</button>
          <button type="button" className="btn btn--ghost" onClick={() => setShowMemberForm(false)}>Cancel</button>
        </form>
      ) : (
        <button className="btn" onClick={() => setShowMemberForm(true)}>
          + Add User
        </button>
      )}

      <label className="toolbar__filter">
        Priority
        <select value={priorityFilter} onChange={(e) => onFilterChange(e.target.value)}>
          <option value="all">All</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
