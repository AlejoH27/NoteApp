import { useEffect, useState } from "react";
import { api } from "../api";
import Header from "../components/header";
//import { useAuth } from "../auth/AuthContext";

export default function Notes() {

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const loadNotes = async () => {
    const { data } = await api.get("/notes/");
    setNotes(data);
  };

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

  const deleteNote = async (id) => {
    await api.delete(`/notes/${id}/`);
    loadNotes();
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <>
    <Header />

    <div style={{ padding: 16, maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Notas</h2>
        <div>
        
    </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Contenido" value={content} onChange={(e) => setContent(e.target.value)} />
        <button onClick={createNote}>Crear</button>
      </div>

      <ul>
        {notes.map((n) => (
          <li key={n.id} style={{ marginBottom: 12 }}>
            <strong>{n.title}</strong>
            <p>{n.content}</p>
            <small>{new Date(n.created_at).toLocaleString()}</small>
            <div>
              <button onClick={() => deleteNote(n.id)}>Borrar</button>
            </div>
          </li>
        ))}
      </ul>

    </div>
    </>
  );
}