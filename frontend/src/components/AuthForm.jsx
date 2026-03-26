import { useState } from "react";

export function AuthForm({ mode, onSubmit, loading, error }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  return (
    <form className="panel auth-panel" onSubmit={(event) => {
      event.preventDefault();
      onSubmit(form);
    }}>
      <h2>{mode === "login" ? "Sign in" : "Create account"}</h2>
      <p>Secure JWT authentication with rate-limited API access.</p>
      {mode === "register" ? (
        <label>
          Name
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Ada Lovelace"
            required
          />
        </label>
      ) : null}
      <label>
        Email
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          placeholder="engineer@waygood.ai"
          required
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          placeholder="Minimum 8 characters"
          minLength={8}
          required
        />
      </label>
      {error ? <div className="error">{error}</div> : null}
      <button type="submit" disabled={loading}>
        {loading ? "Working..." : mode === "login" ? "Login" : "Register"}
      </button>
    </form>
  );
}

