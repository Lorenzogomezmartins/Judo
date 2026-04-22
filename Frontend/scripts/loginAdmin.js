// ../scripts/loginAdmin.js

const API_URL = "http://localhost:3000/api/Administradores/login";

export function iniciarLoginAdmin() {
  const form = document.getElementById("formAdmin");
  const errorLogin = document.getElementById("errorLogin");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorLogin.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        errorLogin.textContent = data.mensaje || "Credenciales incorrectas";
        return;
      }

      localStorage.setItem("tokenAdmin", data.token);
      localStorage.setItem("adminData", JSON.stringify(data.admin));

      window.location.href = "../pages/admin.html";

    } catch (error) {
      console.error(error);
      errorLogin.textContent = "Error al conectar con el servidor";
    }
  });
}