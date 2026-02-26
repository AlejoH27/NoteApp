import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";
import Header from "../components/header";
import "../styles/Profile.css";

export default function Profile() {
  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    photo: null, // URL del backend
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const fileRef = useRef(null);

  // Preview local
  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  // Limpia objectURL
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
      setFile(null);
    } catch (e) {
      setErr("No se pudo cargar el perfil. ¿Sesión expirada?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const onPickFile = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("username", form.username || "");
      fd.append("first_name", form.first_name || "");
      fd.append("last_name", form.last_name || "");
      if (file) fd.append("photo", file); // clave: "photo"

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

  if (loading) return <div className="profile-loading">Cargando perfil...</div>;

  const currentPhoto = form.photo;
  const shownPhoto = previewUrl || currentPhoto;

  return (
    <>
      <Header title="Notas" />

      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-top">
            <h2 className="profile-title">Perfil</h2>
            <p className="profile-subtitle">
              Actualiza tu información. El email es de solo lectura.
            </p>
          </div>

          <div className="profile-header">
            <div className="avatar-wrap">
              <img
                src={shownPhoto || "https://via.placeholder.com/150?text=Avatar"}
                alt="Foto de perfil"
              />
            </div>

            <div className="profile-header-right">
              <div className="file-row">
                <button
                  type="button"
                  className="file-button"
                  onClick={() => fileRef.current?.click()}
                >
                  Seleccionar foto
                </button>

                <span className="file-hint">
                  {file ? file.name : "JPG/PNG · recomendado 400x400"}
                </span>

                <input
                  ref={fileRef}
                  className="hidden-file"
                  type="file"
                  accept="image/*"
                  onChange={onPickFile}
                />
              </div>

              {shownPhoto && (
                <div className="photo-note">
                  {previewUrl ? "Vista previa (aún no guardada)" : "Foto actual"}
                </div>
              )}
            </div>
          </div>

          <form className="profile-form" onSubmit={onSave}>
            <div className="form-grid">
              <div className="field">
                <label>Usuario</label>
                <input
                  className="input"
                  value={form.username || ""}
                  onChange={onChange("username")}
                  placeholder="Tu usuario"
                />
              </div>

              <div className="field">
                <label>Email (solo lectura)</label>
                <input className="readonly" value={form.email || ""} readOnly />
              </div>

              <div className="field">
                <label>Nombre</label>
                <input
                  className="input"
                  value={form.first_name || ""}
                  onChange={onChange("first_name")}
                  placeholder="Nombre"
                />
              </div>

              <div className="field">
                <label>Apellido</label>
                <input
                  className="input"
                  value={form.last_name || ""}
                  onChange={onChange("last_name")}
                  placeholder="Apellido"
                />
              </div>
            </div>

            <div className="actions">
              <button className="btn-primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>

            {err && <p className="msg msg-error">{err}</p>}
            {ok && <p className="msg msg-ok">{ok}</p>}
          </form>
        </div>
      </div>
    </>
  );
}