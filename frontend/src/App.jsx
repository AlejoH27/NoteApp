import { useEffect, useState } from "react";
import { api } from "./api";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  //Mostrar las notas
  const loadNotes = async () => {
    const { data } = await api.get("/notes/");
    setNotes(data);
  };

  //Crear las notas
  const createNote = async () => {
    await api.post("/notes/", {
      title,
      content,
      note_type: "note",
      reminder_datetime: null,
    });
    setTitle("");
    setContent("");
    loadNotes();
  };

  //Eliminar las notas
  const deleteNote = async (id) => {
    if(!window.confirm("¿Quieres eliminar esta nota?")) return;
    await api.delete(`/notes/${id}/`);
    loadNotes();
  }

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Notas</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Contenido"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={createNote}>Crear</button>
      </div>

      <ul>
        {notes.map(note => (
          <li key={note.id} style={{marginBottom: 8}}>
            <strong>{note.title}</strong>
            <p>{note.content}</p>
            <small>{new Date(note.created_at).toLocaleString()}</small>
            <button onClick={() => deleteNote(note.id)}>Borrar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}