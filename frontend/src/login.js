export async function login(email, password) {
  const res = await axios.post("http://127.0.0.1:8000/api/token/", {
    username: email,  // OJO: se manda como username, pero contiene email
    password,
  });

  localStorage.setItem("access", res.data.access);
  localStorage.setItem("refresh", res.data.refresh);
}