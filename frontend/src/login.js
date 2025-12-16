import { api } from "./api";

export async function login(email, password) {
  const res = await api.post("/token/", {
    username: email,  // OJO: se manda como username, pero contiene email
    password,
  });

  localStorage.setItem("access", res.data.access);
  localStorage.setItem("refresh", res.data.refresh);
}