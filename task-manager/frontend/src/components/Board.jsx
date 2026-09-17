import Column from './Column.jsx';

export default function Board({ columns, onDropTask, onCardDragStart, onTaskClick, onTaskDelete }) {
  return (
    <div className="board">
      {columns.map((column) => (
        <Column
          key={column.id}
          column={column}
          tasks={column.tasks}
          onDropTask={onDropTask}
          onCardDragStart={onCardDragStart}
          onTaskClick={onTaskClick}
          onTaskDelete={onTaskDelete}
        />
      ))}
    </div>
  );
}
