import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import "../styles/Register.css";

export default function Register() {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (password !== password2) {
      setErr("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/register/", { username, email, password, password2 });
      setOk("¡Cuenta creada! Redirigiendo al login...");
      setTimeout(() => nav("/login", { replace: true }), 1500);
    } catch (e2) {
      const data = e2?.response?.data;
      const msg = (typeof data === "string" && data) || data?.detail || "Error al registrar.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-top">
          <h2 className="register-title">Registro</h2>
          <p className="register-subtitle">Crea tu cuenta para empezar.</p>
        </div>

        {err && <div className="register-alert register-alert--error">{err}</div>}
        {ok && <div className="register-alert register-alert--success">{ok}</div>}

        <form onSubmit={onSubmit} className="register-form">
          <label className="register-label">
            Usuario
            <input
              className="register-input"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              required
            />
          </label>

          <label className="register-label">
            Email
            <input
              className="register-input"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>

          <label className="register-label">
            Contraseña
            <input
              className="register-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </label>

          <label className="register-label">
            Repetir contraseña
            <input
              className="register-input"
              placeholder="••••••••"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              type="password"
              required
            />
          </label>

          <button className="register-btn" disabled={loading} type="submit">
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="register-footer">
          ¿Ya tienes cuenta? <Link className="register-link" to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}