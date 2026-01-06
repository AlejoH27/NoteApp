import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";

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
      await api.post("/register/", {
        username,
        email,
        password,
        password2,
      });

      setOk("Usuario creado. Ahora inicia sesión.");
      // redirige al login después de 1s
      setTimeout(() => nav("/login", { replace: true }), 1000);
    } catch (e2) {
      const data = e2?.response?.data;

      // intenta sacar un mensaje claro del backend
      const msg =
        (typeof data === "string" && data) ||
        data?.detail ||
        (data && JSON.stringify(data)) ||
        "No se pudo registrar. Revisa los datos.";

      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h2>Registro</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          required
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />

        <input
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />

        <input
          placeholder="Repetir contraseña"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          type="password"
          required
        />

        <button disabled={loading} type="submit">
          {loading ? "Creando..." : "Crear cuenta"}
        </button>

        {err && <p style={{ color: "crimson" }}>{err}</p>}
        {ok && <p style={{ color: "green" }}>{ok}</p>}
      </form>

      <p style={{ marginTop: 12 }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}