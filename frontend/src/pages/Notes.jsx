import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import Header from "../components/header";

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
      <Header />

      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.topRow}>
            <div>
              <h1 style={styles.h1}>Notas</h1>
              <p style={styles.subtitle}>Crea, edita y organiza tus notas.</p>
            </div>
          </div>

          {err && <div style={styles.alert}>{err}</div>}

          {/* Crear */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Nueva nota</div>

            <div style={styles.formGrid}>
              <label style={styles.label}>
                Título
                <input
                  style={styles.input}
                  placeholder="Ej. Recordatorio"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>

              <label style={styles.label}>
                Contenido
                <input
                  style={styles.input}
                  placeholder="Ej. Llamar al proveedor..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </label>

              <div style={styles.actionsRow}>
                <button
                  style={{
                    ...styles.primaryBtn,
                    opacity: !canCreate || saving ? 0.6 : 1,
                    cursor: !canCreate || saving ? "not-allowed" : "pointer",
                  }}
                  disabled={!canCreate || saving}
                  onClick={createNote}
                >
                  {saving ? "Guardando..." : "Crear"}
                </button>

                <button
                  style={styles.ghostBtn}
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

          {/* Listado */}
          <div style={styles.listHeader}>
            <h2 style={styles.h2}>Tus notas</h2>
            <span style={styles.badge}>{notes.length}</span>
          </div>

          {loading ? (
            <div style={styles.card}>Cargando notas...</div>
          ) : notes.length === 0 ? (
            <div style={styles.card}>
              Aún no hay notas. Crea la primera arriba 👆
            </div>
          ) : (
            <div style={styles.grid}>
              {notes.map((n) => {
                const isEditing = editingId === n.id;

                return (
                  <div key={n.id} style={styles.noteCard}>
                    {!isEditing ? (
                      <>
                        <div style={styles.noteTop}>
                          <div style={styles.noteTitle}>
                            {n.title?.trim() ? n.title : "Sin título"}
                          </div>
                          <div style={styles.noteDate}>
                            {n.created_at
                              ? new Date(n.created_at).toLocaleString()
                              : ""}
                          </div>
                        </div>

                        {n.content?.trim() ? (
                          <div style={styles.noteContent}>{n.content}</div>
                        ) : (
                          <div style={styles.noteMuted}>Sin contenido</div>
                        )}

                        <div style={styles.noteActions}>
                          <button
                            style={styles.smallBtn}
                            onClick={() => startEdit(n)}
                          >
                            Editar
                          </button>
                          <button
                            style={{ ...styles.smallBtn, ...styles.dangerBtn }}
                            onClick={() => deleteNote(n.id)}
                          >
                            Borrar
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={styles.noteTop}>
                          <div style={styles.noteTitle}>Editando</div>
                          <div style={styles.noteDate}>#{n.id}</div>
                        </div>

                        <label style={styles.label}>
                          Título
                          <input
                            style={styles.input}
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        </label>

                        <label style={styles.label}>
                          Contenido
                          <textarea
                            style={styles.textarea}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={4}
                          />
                        </label>

                        <div style={styles.noteActions}>
                          <button
                            style={styles.smallBtn}
                            disabled={saving}
                            onClick={() => saveEdit(n.id)}
                          >
                            {saving ? "Guardando..." : "Guardar"}
                          </button>
                          <button
                            style={styles.smallBtn}
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

const styles = {
  page: {
    padding: 16,
    background: "#f6f7fb",
    minHeight: "calc(100vh - 64px)",
  },
  container: {
    maxWidth: 980,
    margin: "0 auto",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
    marginBottom: 12,
  },
  h1: { margin: 0, fontSize: 28 },
  subtitle: { margin: "6px 0 0", color: "#555" },

  card: {
    background: "white",
    border: "1px solid #e6e8ef",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    marginBottom: 14,
  },
  cardTitle: { fontWeight: 700, marginBottom: 10 },

  formGrid: { display: "grid", gap: 10 },
  label: { display: "grid", gap: 6, fontSize: 13, color: "#333" },
  input: {
    padding: "10px 10px",
    borderRadius: 10,
    border: "1px solid #dfe3ee",
    outline: "none",
    fontSize: 14,
    background: "white",
  },
  textarea: {
    padding: "10px 10px",
    borderRadius: 10,
    border: "1px solid #dfe3ee",
    outline: "none",
    fontSize: 14,
    resize: "vertical",
  },

  actionsRow: { display: "flex", gap: 10, alignItems: "center" },
  primaryBtn: {
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 700,
    background: "#111827",
    color: "white",
  },
  ghostBtn: {
    border: "1px solid #dfe3ee",
    borderRadius: 10,
    padding: "10px 14px",
    background: "white",
  },

  alert: {
    background: "#fff3f3",
    border: "1px solid #ffd2d2",
    color: "#7a1a1a",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },

  listHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "10px 0 10px",
  },
  h2: { margin: 0, fontSize: 18 },
  badge: {
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 999,
    background: "#e9eefc",
    border: "1px solid #d8e1ff",
    color: "#243b88",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 12,
  },
  noteCard: {
    background: "white",
    border: "1px solid #e6e8ef",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    display: "grid",
    gap: 10,
  },
  noteTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 10,
  },
  noteTitle: { fontWeight: 800 },
  noteDate: { fontSize: 12, color: "#666" },
  noteContent: { whiteSpace: "pre-wrap", color: "#222" },
  noteMuted: { color: "#888", fontStyle: "italic" },

  noteActions: { display: "flex", gap: 10 },
  smallBtn: {
    border: "1px solid #dfe3ee",
    borderRadius: 10,
    padding: "8px 10px",
    background: "white",
  },
  dangerBtn: {
    borderColor: "#ffd2d2",
    background: "#fff3f3",
    color: "#7a1a1a",
  },
};