import { useEffect, useState } from "react";

function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado del formulario
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState("note");
  const [editingId, setEditingId] = useState(null); // null = creando, no editando

  const API_URL = "http://127.0.0.1:8000/api/notes/";

  // Cargar notas al inicio
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las notas");
    } finally {
      setLoading(false);
    }
  };

  // Limpiar formulario
  const resetForm = () => {
    setTitle("");
    setContent("");
    setNoteType("note");
    setEditingId(null);
  };

  // Crear o actualizar nota
  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Ponle al menos un título a la nota");
      return;
    }

    const payload = {
      title,
      content,
      note_type: noteType,
      reminder_datetime: null,
    };

    try {
      let res;

      if (editingId === null) {
        // Crear
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Actualizar
        res = await fetch(`${API_URL}${editingId}/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const savedNote = await res.json();

      if (editingId === null) {
        // Agregar nueva nota al inicio
        setNotes((prev) => [savedNote, ...prev]);
      } else {
        // Actualizar en el estado
        setNotes((prev) =>
          prev.map((n) => (n.id === editingId ? savedNote : n))
        );
      }

      resetForm();
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar la nota");
    }
  };

  // Preparar edición
  const handleEditNote = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setNoteType(note.note_type);
    setEditingId(note.id);
  };

  // Eliminar nota
  const handleDeleteNote = async (id) => {
    const confirmDelete = confirm("¿Seguro que quieres borrar esta nota?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      setNotes((prev) => prev.filter((n) => n.id !== id));

      // Si estabas editando esa nota, limpiar formulario
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo borrar la nota");
    }
  };

  if (loading) return <p style={{ padding: 16 }}>Cargando notas...</p>;
  if (error) return <p style={{ padding: 16, color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>
      <h1>Aprendizaje de Alejo – Notas</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmitNote} style={{ marginBottom: 24 }}>
        <h2>{editingId ? "Editar nota" : "Nueva nota"}</h2>

        <div style={{ marginBottom: 8 }}>
          <label>
            Título:{" "}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>
            Tipo:{" "}
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
            >
              <option value="note">Nota</option>
              <option value="reminder">Recordatorio</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>
            Contenido:
            <br />
            <textarea
              rows={4}
              style={{ width: "100%" }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </label>
        </div>

        <button type="submit">
          {editingId ? "Guardar cambios" : "Guardar nota"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            style={{ marginLeft: 8 }}
          >
            Cancelar edición
          </button>
        )}
      </form>

      {/* Lista de notas */}
      <h2>Notas</h2>
      {notes.length === 0 ? (
        <p>No hay notas todavía.</p>
      ) : (
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {notes.map((note) => (
            <li
              key={note.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <strong>{note.title}</strong> ({note.note_type})
              <br />
              <small>
                Creada: {new Date(note.created_at).toLocaleString()}
              </small>
              <p>{note.content}</p>
              <button onClick={() => handleEditNote(note)}>Editar</button>
              <button
                onClick={() => handleDeleteNote(note.id)}
                style={{ marginLeft: 8 }}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;