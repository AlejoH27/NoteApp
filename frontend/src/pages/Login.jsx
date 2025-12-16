import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, password);
      nav("/", { replace: true });
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
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h2>Iniciar sesión</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="text"
          required
        />
        <input
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />

        <button disabled={loading} type="submit">
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {err && <p style={{ color: "crimson" }}>{err}</p>}
      </form>
    </div>
  );
}