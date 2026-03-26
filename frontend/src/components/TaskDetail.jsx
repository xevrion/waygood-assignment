export function TaskDetail({ task }) {
  if (!task) {
    return (
      <div className="panel">
        <h2>Task Detail</h2>
        <p className="muted">Select a task to inspect logs and results.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="section-header">
        <h2>{task.title}</h2>
        <span className={`status status-${task.status}`}>{task.status}</span>
      </div>
      <dl className="detail-grid">
        <div>
          <dt>Operation</dt>
          <dd>{task.operation}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{new Date(task.createdAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt>Result</dt>
          <dd><pre>{task.result === null ? "Pending" : JSON.stringify(task.result, null, 2)}</pre></dd>
        </div>
        <div>
          <dt>Error</dt>
          <dd>{task.errorMessage ?? "None"}</dd>
        </div>
      </dl>
      <h3>Logs</h3>
      <div className="logs">
        {task.logs?.map((log, index) => (
          <div key={`${task._id}-${index}`} className="log-line">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

