import TaskCard from './TaskCard.jsx';

export default function Column({ column, tasks, onDropTask, onCardDragStart, onTaskClick, onTaskDelete }) {
  return (
    <div
      className="column"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDropTask(e, column.id)}
    >
      <div className="column__header">
        <h3>{column.name}</h3>
        <span className="column__count">{tasks.length}</span>
      </div>
      <div className="column__body">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={onCardDragStart}
            onClick={onTaskClick}
            onDelete={onTaskDelete}
          />
        ))}
        {tasks.length === 0 && <p className="column__empty">No tasks</p>}
      </div>
    </div>
  );
}
