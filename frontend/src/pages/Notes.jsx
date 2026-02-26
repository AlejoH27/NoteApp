import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import Header from "../components/header";
import "../styles/Notes.css";

export default function Notes() {
  const [notes, setNotes] = useState([]);

  // Crear
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Editar
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const canCreate = useMemo(() => {
    return title.trim().length > 0 || content.trim().length > 0;
  }, [title, content]);

  const loadNotes = async () => {
    setErr("");
    setLoading(true);
    try {
      const { data } = await api.get("/notes/");
      setNotes(data);
    } catch (e) {
      setErr("No se pudieron cargar las notas.");
      console.error(e?.response?.data || e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const createNote = async () => {
    if (!canCreate) return;

    setErr("");
    setSaving(true);
    try {
      await api.post("/notes/", {
        title: title.trim(),
        content: content.trim(),
        note_type: "note",
        reminder_datetime: null,
      });

      setTitle("");
      setContent("");
      await loadNotes();
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        "No se pudo crear la nota (revisa campos requeridos).";
      setErr(msg);
      console.error(e?.response?.data || e);
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (id) => {
    const ok = window.confirm(
      "Seguro que quieres borrar esta nota? Esta acción no se puede deshacer."
    );
    if (!ok) return;

    setErr("");
    try {
      await api.delete(`/notes/${id}/`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      setErr("No se pudo borrar la nota.");
      console.error(e?.response?.data || e);
    }
  };

  const startEdit = (n) => {
    setEditingId(n.id);
    setEditTitle(n.title ?? "");
    setEditContent(n.content ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
  };

  const saveEdit = async (id) => {
    setErr("");
    setSaving(true);
    try {
      await api.patch(`/notes/${id}/`, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      await loadNotes();
      cancelEdit();
    } catch (e) {
      setErr("No se pudo guardar la edición.");
      console.error(e?.response?.data || e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header title="Notas" />

      <div className="notes-page">
        <div className="notes-container">
          <div className="notes-top">
            <div>
              <h1 className="notes-h1">Notas</h1>
              <p className="notes-subtitle">Crea, edita y organiza tus notas.</p>
            </div>
          </div>

          {err && <div className="notes-alert">{err}</div>}

          {/* Crear */}
          <div className="notes-card">
            <div className="notes-card-title">Nueva nota</div>

            <div className="notes-form">
              <label className="notes-label">
                Título
                <input
                  className="notes-input"
                  placeholder="Ej. Recordatorio"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>

              <label className="notes-label">
                Contenido
                <input
                  className="notes-input"
                  placeholder="Ej. Llamar al proveedor..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </label>

              <div className="notes-actions-row">
                <button
                  className="notes-btn notes-btn-primary"
                  disabled={!canCreate || saving}
                  onClick={createNote}
                >
                  {saving ? "Guardando..." : "Crear"}
                </button>

                <button
                  className="notes-btn notes-btn-ghost"
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setContent("");
                    setErr("");
                  }}
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* Header listado */}
          <div className="notes-list-header">
            <h2 className="notes-h2">Tus notas</h2>
            <span className="notes-badge">{notes.length}</span>
          </div>

          {loading ? (
            <div className="notes-card">Cargando notas...</div>
          ) : notes.length === 0 ? (
            <div className="notes-card">
              Aún no hay notas. Crea la primera arriba 👆
            </div>
          ) : (
            <div className="notes-grid">
              {notes.map((n) => {
                const isEditing = editingId === n.id;

                return (
                  <div key={n.id} className="note-card">
                    {!isEditing ? (
                      <>
                        <div className="note-top">
                          <div className="note-title">
                            {n.title?.trim() ? n.title : "Sin título"}
                          </div>
                          <div className="note-date">
                            {n.created_at
                              ? new Date(n.created_at).toLocaleString()
                              : ""}
                          </div>
                        </div>

                        {n.content?.trim() ? (
                          <div className="note-content">{n.content}</div>
                        ) : (
                          <div className="note-muted">Sin contenido</div>
                        )}

                        <div className="note-actions">
                          <button
                            className="notes-btn notes-btn-small"
                            onClick={() => startEdit(n)}
                          >
                            Editar
                          </button>
                          <button
                            className="notes-btn notes-btn-small notes-btn-danger"
                            onClick={() => deleteNote(n.id)}
                          >
                            Borrar
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="note-top">
                          <div className="note-title">Editando</div>
                          <div className="note-date">#{n.id}</div>
                        </div>

                        <label className="notes-label">
                          Título
                          <input
                            className="notes-input"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        </label>

                        <label className="notes-label">
                          Contenido
                          <textarea
                            className="notes-textarea"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={4}
                          />
                        </label>

                        <div className="note-actions">
                          <button
                            className="notes-btn notes-btn-small notes-btn-primary"
                            disabled={saving}
                            onClick={() => saveEdit(n.id)}
                          >
                            {saving ? "Guardando..." : "Guardar"}
                          </button>
                          <button
                            className="notes-btn notes-btn-small notes-btn-ghost"
                            type="button"
                            onClick={cancelEdit}
                          >
                            Cancelar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}