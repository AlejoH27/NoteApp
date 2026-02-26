import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/Login.css";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (localStorage.getItem("access")) {
      nav("/notes", { replace: true });
    }
  }, [nav]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      await login(email, password);
      nav("/notes", { replace: true });
    } catch (e2) {
      const msg =
        e2?.response?.data?.detail ||
        "No se pudo iniciar sesión. Revisa email/contraseña.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-top">
          <h2 className="login-title">Iniciar sesión</h2>
          <p className="login-subtitle">Accede para ver tus notas y tu perfil.</p>
        </div>

        {err && <div className="login-alert">{err}</div>}

        <form onSubmit={onSubmit} className="login-form">
          <label className="login-label">
            Email
            <input
              className="login-input"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              required
              autoComplete="email"
            />
          </label>

          <label className="login-label">
            Contraseña
            <input
              className="login-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              autoComplete="current-password"
            />
          </label>

          <button className="login-btn" disabled={loading} type="submit">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="login-footer">
          ¿No tienes cuenta? <Link className="login-link" to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}