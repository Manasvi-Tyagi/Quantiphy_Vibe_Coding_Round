export default function TaskCard({ task, onDragStart, onClick, onDelete }) {
  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onClick(task)}
    >
      <div className="task-card__header">
        <span className={`priority-tag priority-tag--${task.priority}`}>{task.priority}</span>
        <button
          className="task-card__delete"
          title="Delete task"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task);
          }}
        >
          ×
        </button>
      </div>
      <h4 className="task-card__title">{task.title}</h4>
      {task.description && <p className="task-card__description">{task.description}</p>}
      <div className="task-card__footer">
        {task.due_date && <span className="task-card__due">Due {new Date(task.due_date).toLocaleDateString()}</span>}
        {task.assignee && <span className="task-card__assignee">{task.assignee}</span>}
      </div>
    </div>
  );
}
