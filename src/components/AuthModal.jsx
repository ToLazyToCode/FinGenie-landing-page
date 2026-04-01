import { useEffect, useState } from "react";

const initialForm = { email: "", password: "" };

export default function AuthModal({
  open,
  defaultMode = "user",
  loading,
  error,
  onClose,
  onUserLogin,
  onAdminLogin,
}) {
  const [mode, setMode] = useState("user");
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
      setForm(initialForm);
      return;
    }
    setMode(defaultMode);
    setForm(initialForm);
  }, [open, defaultMode]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = form.email.trim();
    const password = form.password;
    if (!email || !password) {
      return;
    }

    if (mode === "admin") {
      await onAdminLogin({ email, password });
      return;
    }
    await onUserLogin({ email, password });
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="auth-modal-header">
          <h3>{mode === "admin" ? "Admin Sign In" : "User Sign In"}</h3>
          <button className="auth-close-btn" onClick={onClose} aria-label="Close login modal">
            x
          </button>
        </div>

        <div className="auth-mode-switch" role="tablist" aria-label="Select login mode">
          <button
            className={`auth-mode-btn ${mode === "user" ? "active" : ""}`}
            onClick={() => setMode("user")}
            type="button"
          >
            User
          </button>
          <button
            className={`auth-mode-btn ${mode === "admin" ? "active" : ""}`}
            onClick={() => setMode("admin")}
            type="button"
          >
            Admin
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder={mode === "admin" ? "admin@fingenie.com" : "you@example.com"}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="********"
              autoComplete={mode === "admin" ? "current-password" : "current-password"}
              required
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="btn btn-primary auth-submit-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : mode === "admin" ? "Sign In as Admin" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

