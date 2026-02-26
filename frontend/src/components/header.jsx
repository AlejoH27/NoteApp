import { useMemo, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/Header.css";

export default function Header({ title = "NotesApp" }) {
  const nav = useNavigate();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = useMemo(
    () => ({
      notes: location.pathname.startsWith("/notes"),
      profile: location.pathname.startsWith("/profile"),
    }),
    [location.pathname]
  );

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    nav("/login", { replace: true });
  };

  return (
    <>
      <header className="hdr">
        <div className="hdr__container">
          {/* Logo y Título */}
          <div className="hdr__left" onClick={() => nav("/notes")}>
            <div className="hdr__logo">🗒️</div>
            <span className="hdr__title">{title}</span>
          </div>

          {/* Nav de Escritorio (Ahora arreglado el nombre de clase) */}
          <nav className="hdr__nav">
            <button
              className={`hdr__navLink ${isActive.notes ? "is-active" : ""}`}
              onClick={() => nav("/notes")}
            >
              Notas
            </button>
            <Link
              to="/profile"
              className={`hdr__navLink ${isActive.profile ? "is-active" : ""}`}
            >
              Perfil
            </Link>
            <div className="hdr__divider"></div>
            <button className="hdr__btn--danger" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </nav>

          {/* Botón Hamburguesa */}
          <button
            className={`hdr__burger ${open ? "is-open" : ""}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <span className="hdr__bLine" />
            <span className="hdr__bLine" />
            <span className="hdr__bLine" />
          </button>
        </div>
      </header>

      {/* Menú Móvil */}
      {open && (
        <>
          <div className="hdr__backdrop" onClick={() => setOpen(false)} />
          <div className="hdr__menu">
            <button className={`hdr__menuItem ${isActive.notes ? "is-active" : ""}`} onClick={() => nav("/notes")}>
              🗒️ Notas
            </button>
            <button className={`hdr__menuItem ${isActive.profile ? "is-active" : ""}`} onClick={() => nav("/profile")}>
              👤 Perfil
            </button>
            <hr className="hdr__menuDivider" />
            <button className="hdr__menuItem hdr__menuItem--danger" onClick={handleLogout}>
              🚪 Cerrar sesión
            </button>
          </div>
        </>
      )}
    </>
  );
}