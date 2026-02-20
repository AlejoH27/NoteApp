import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

export default function Profile() {
  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    photo: null, // ✅ para mostrar la URL que venga del backend
  });

  const [file, setFile] = useState(null); // ✅ archivo seleccionado
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // Preview local (antes de guardar)
  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  // Limpia el objectURL para evitar leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const load = async () => {
    setErr("");
    setOk("");
    setLoading(true);
    try {
      const res = await api.get("/profile/");
      setForm(res.data);
      setFile(null); // resetea selección
    } catch (e) {
      setErr("No se pudo cargar el perfil. ¿Sesión expirada?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const onSave = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    setSaving(true);

    try {
      // ✅ FormData para soportar foto + campos normales
      const fd = new FormData();
      fd.append("username", form.username || "");
      fd.append("first_name", form.first_name || "");
      fd.append("last_name", form.last_name || "");
      if (file) fd.append("photo", file); // ✅ clave: "photo"

      // ✅ NO fuerces Content-Type; axios lo pone con boundary
      const res = await api.patch("/profile/", fd);

      setForm(res.data);
      setFile(null);
      setOk("Perfil actualizado ✅");
    } catch (e2) {
      const data = e2?.response?.data;
      setErr((data && JSON.stringify(data)) || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Cargando perfil...</div>;

  const currentPhoto = form.photo; // URL del backend
  const shownPhoto = previewUrl || currentPhoto;

  return (
    <div style={{ maxWidth: 520, margin: "60px auto", padding: 16 }}>
      <h2>Perfil</h2>

      <form onSubmit={onSave} style={{ display: "grid", gap: 10 }}>
        <label>
          Foto de perfil
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

        {shownPhoto && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={shownPhoto}
              alt="Foto de perfil"
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid #ddd",
              }}
            />
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              {previewUrl ? "Vista previa (aún no guardada)" : "Foto actual"}
            </div>
          </div>
        )}

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
          <input
            value={form.first_name || ""}
            onChange={onChange("first_name")}
          />
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