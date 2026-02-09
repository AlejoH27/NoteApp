import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";
export default function Header({ title = "NotesApp" }) {
  const nav = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    nav("/login", { replace: true });
  };

  return (
    <header style={styles.header}>
      <div style={styles.left} onClick={() => nav("/notes")} role="button" tabIndex={0}>
        <span style={styles.logo}>🗒️</span>
        <span style={styles.title}>{title}</span>
      </div>

     <Link to="/profile">Perfil</Link>
      <nav style={styles.nav}>
        <button style={styles.btn} onClick={() => nav("/notes")}>
          Notas
        </button>

        <button style={{ ...styles.btn, ...styles.danger }} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </nav>
    </header>
  );
}

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 18px",
    borderBottom: "1px solid #e5e7eb",
    background: "#fff",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    userSelect: "none",
  },
  logo: { fontSize: 18 },
  title: { fontWeight: 700, letterSpacing: 0.2 },
  nav: { display: "flex", gap: 10 },
  btn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  danger: {
    border: "1px solid #fecaca",
    background: "#fff5f5",
  },
};