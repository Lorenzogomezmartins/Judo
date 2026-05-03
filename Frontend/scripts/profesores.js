const API_URL = "/api/profesores";

export async function cargarProfesores() {

  const contenedor = document.getElementById("lista-profesores");

  if (!contenedor) return;

  try {

    const res = await fetch(API_URL);

    if (!res.ok) {
      throw new Error("Error al obtener profesores");
    }

    const profesores = await res.json();

    contenedor.innerHTML = `<div class="profesores-grid"></div>`;

    const grid = contenedor.querySelector(".profesores-grid");

    profesores.forEach(profesor => {

      // imagen desde Mongo (base64)
      const foto = profesor.foto
        ? profesor.foto
        : "../assets/placeholder-profesor.jpg";

      const card = `
        <div class="profesor-card">

          <img 
            src="${foto}" 
            alt="${profesor.nombre} ${profesor.apellido}"
          >

          <h3>
            ${profesor.nombre} ${profesor.apellido}
          </h3>

          <span class="grado">
            Profesor FMJ
          </span>

          <p>
            ${profesor.descripcion || ""}
          </p>

        </div>
      `;

      grid.innerHTML += card;

    });

  } catch (error) {

    console.error("Error cargando profesores:", error);

    contenedor.innerHTML = `
      <p class="text-danger">
        Error al cargar profesores
      </p>
    `;
  }
}