import { api } from "../api";

export async function login(username, password){
    const res = await api.post("/token/", {username, password});

    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);
}