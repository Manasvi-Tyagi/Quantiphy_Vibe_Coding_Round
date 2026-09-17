import { WORKLOAD_LIMIT } from '../constants.js';

function initials(name) {
  return name.trim().slice(0, 2).toUpperCase();
}

export default function TeamList({ members, workload }) {
  if (members.length === 0) return <p className="team-list__empty">No members yet.</p>;

  return (
    <ul className="team-list">
      {members.map((member) => {
        const count = workload[member] || 0;
        const overloaded = count > WORKLOAD_LIMIT;
        return (
          <li key={member} className="team-list__item" title={`${member}: ${count} in progress`}>
            <span className={`avatar ${overloaded ? 'avatar--overloaded' : ''}`}>{initials(member)}</span>
            <span className="team-list__name">{member}</span>
            <span className="team-list__count">{count}</span>
          </li>
        );
      })}
    </ul>
  );
}
