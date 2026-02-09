import { useEffect, useState } from "react";
import { api } from "../api";

export default function Profile() {
  const [form, setForm] = useState({ username: "", first_name: "", last_name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const load = async () => {
    setErr(""); setOk("");
    setLoading(true);
    try {
      const res = await api.get("/profile/");
      setForm(res.data);
    } catch (e) {
      setErr("No se pudo cargar el perfil. ¿Sesión expirada?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const onSave = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");
    setSaving(true);
    try {
      const res = await api.patch("/profile/", {
        username: form.username,
        first_name: form.first_name,
        last_name: form.last_name,
      });
      setForm(res.data);
      setOk("Perfil actualizado ✅");
    } catch (e2) {
      const data = e2?.response?.data;
      setErr((data && JSON.stringify(data)) || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Cargando perfil...</div>;

  return (
    <div style={{ maxWidth: 520, margin: "60px auto", padding: 16 }}>
      <h2>Perfil</h2>

      <form onSubmit={onSave} style={{ display: "grid", gap: 10 }}>
        <label>
          Usuario
          <input value={form.username || ""} onChange={onChange("username")} />
        </label>

        <label>
          Email (solo lectura)
          <input value={form.email || ""} disabled />
        </label>

        <label>
          Nombre
          <input value={form.first_name || ""} onChange={onChange("first_name")} />
        </label>

        <label>
          Apellido
          <input value={form.last_name || ""} onChange={onChange("last_name")} />
        </label>

        <button disabled={saving} type="submit">
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>

        {err && <p style={{ color: "crimson" }}>{err}</p>}
        {ok && <p style={{ color: "green" }}>{ok}</p>}
      </form>
    </div>
  );
}