export function TaskList({ tasks, activeTaskId, onSelect }) {
  return (
    <div className="panel">
      <div className="section-header">
        <h2>Task Queue</h2>
        <span>{tasks.length} items</span>
      </div>
      <div className="task-list">
        {tasks.map((task) => (
          <button
            key={task._id}
            type="button"
            className={`task-card ${task._id === activeTaskId ? "active" : ""}`}
            onClick={() => onSelect(task._id)}
          >
            <div>
              <strong>{task.title}</strong>
              <p>{task.operation}</p>
            </div>
            <span className={`status status-${task.status}`}>{task.status}</span>
          </button>
        ))}
        {tasks.length === 0 ? <p className="muted">No tasks yet.</p> : null}
      </div>
    </div>
  );
}

