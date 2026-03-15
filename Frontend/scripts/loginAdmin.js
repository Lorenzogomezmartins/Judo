(() => {

var API_URL = "http://localhost:3000/api/Administradores/login";

function iniciarLoginAdmin(){

  const form = document.getElementById("formAdmin");
  const errorLogin = document.getElementById("errorLogin");

  if(!form) return;

  form.addEventListener("submit", async (e)=>{

    e.preventDefault();

    errorLogin.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try{

      const res = await fetch(API_URL,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await res.json();

      if(!res.ok){
        errorLogin.textContent = data.mensaje || "Credenciales incorrectas";
        return;
      }

      // guardar token
      localStorage.setItem("tokenAdmin", data.token);

      // redirigir al panel
      window.location.href = "../pages/admin.html";

    }catch(error){

      console.error(error);
      errorLogin.textContent = "Error al conectar con el servidor";

    }

  });

}

window.iniciarLoginAdmin = iniciarLoginAdmin;

})();