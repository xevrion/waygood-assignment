import { useCallback, useEffect, useState } from "react";
import { AuthForm } from "./components/AuthForm.jsx";
import { TaskComposer } from "./components/TaskComposer.jsx";
import { TaskDetail } from "./components/TaskDetail.jsx";
import { TaskList } from "./components/TaskList.jsx";
import { usePolling } from "./hooks/usePolling.js";
import { api } from "./lib/api.js";

export function App() {
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [taskError, setTaskError] = useState("");

  const refreshTasks = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const { tasks: nextTasks } = await api.listTasks();
      setTasks(nextTasks);
      if (!activeTaskId && nextTasks[0]) {
        setActiveTaskId(nextTasks[0]._id);
      }
    } catch (refreshError) {
      setTaskError(refreshError.message);
    }
  }, [activeTaskId, user]);

  useEffect(() => {
    async function bootstrap() {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        return;
      }

      try {
        const { user: currentUser } = await api.me();
        setUser(currentUser);
      } catch {
        localStorage.removeItem("auth_token");
      }
    }

    bootstrap();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    refreshTasks();
  }, [refreshTasks, user]);

  usePolling(refreshTasks, 3000, Boolean(user));

  const activeTask = tasks.find((task) => task._id === activeTaskId) ?? null;

  async function handleAuth(payload) {
    setLoading(true);
    setError("");
    try {
      const action = mode === "login" ? api.login : api.register;
      const response = await action(payload);
      localStorage.setItem("auth_token", response.token);
      setUser(response.user);
    } catch (authError) {
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(payload) {
    setLoading(true);
    setTaskError("");
    try {
      const { task } = await api.createTask(payload);
      await refreshTasks();
      setActiveTaskId(task._id);
    } catch (createError) {
      setTaskError(createError.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("auth_token");
    setUser(null);
    setTasks([]);
    setActiveTaskId(null);
  }

  if (!user) {
    return (
      <main className="auth-shell">
        <section className="hero">
          <p className="eyebrow">AI Task Processing Platform</p>
          <h1>Asynchronous string processing with MERN, Redis, and Python workers.</h1>
          <p className="hero-copy">
            Create tasks, queue them instantly, and inspect execution logs in a single operational dashboard.
          </p>
        </section>
        <section className="auth-stack">
          <div className="toggle">
            <button type="button" className={mode === "login" ? "selected" : ""} onClick={() => setMode("login")}>
              Login
            </button>
            <button type="button" className={mode === "register" ? "selected" : ""} onClick={() => setMode("register")}>
              Register
            </button>
          </div>
          <AuthForm mode={mode} onSubmit={handleAuth} loading={loading} error={error} />
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Operations Console</p>
          <h1>Welcome, {user.name}</h1>
        </div>
        <button type="button" className="secondary" onClick={logout}>Logout</button>
      </header>
      {taskError ? <div className="error banner">{taskError}</div> : null}
      <section className="dashboard-grid">
        <TaskComposer onSubmit={handleCreateTask} loading={loading} />
        <TaskDetail task={activeTask} />
      </section>
      <TaskList tasks={tasks} activeTaskId={activeTaskId} onSelect={setActiveTaskId} />
    </main>
  );
}
