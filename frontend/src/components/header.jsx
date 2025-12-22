import { useNavigate } from "react-router-dom";
import { logout } from "../auth/logouth";

export default function Header() {
    const nav = useNavigate();

    const handleLogout = async () => {
        await logout();
        nav("/login", {replace: true});
    };

    return <button onClick={handleLogout}>Cerrar sesion</button>
};
