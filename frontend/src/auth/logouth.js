import { api } from "../api";

export async function logout() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return;

  try {
    await api.post("/logout/", { refresh });
  } finally {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  }
}