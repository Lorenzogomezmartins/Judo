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

    profesores.forEach((profesor) => {
      const foto = profesor.foto
        ? profesor.foto
        : "../assets/placeholder-profesor.jpg";

      const capacitaciones = profesor.capacitaciones || [];

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
            ${profesor.club || "Profesor FMJ"}
          </span>

          <p>
            ${profesor.descripcion || ""}
          </p>

          ${
            capacitaciones.length > 0
              ? `
                <details class="profesor-capacitaciones">

                  <summary>
                    Capacitaciones (${capacitaciones.length})
                  </summary>

                  <ul>
                    ${capacitaciones
                      .map(
                        (cap) => `
                          <li>
                            <strong>${cap.titulo}</strong>

                            <span>
                              Club: ${cap.club}
                            </span>

                            ${
                              cap.fecha
                                ? `
                                  <br>
                                  <small>
                                    ${cap.fecha
                                      .split("T")[0]
                                      .split("-")
                                      .reverse()
                                      .join("/")}
                                  </small>
                                `
                                : ""
                            }

                            ${
                              cap.descripcion
                                ? `
                                  <br>
                                  <em>${cap.descripcion}</em>
                                `
                                : ""
                            }
                          </li>
                        `
                      )
                      .join("")}
                  </ul>

                </details>
              `
              : `
                <p class="text-muted mt-2">
                  Sin capacitaciones registradas
                </p>
              `
                    }

          ${
            profesor.cv
              ? `
                <a
                  href="${profesor.cv}"
                  target="_blank"
                  class="btn btn-outline-primary mt-3 w-100"
                >
                  Descargar CV
                </a>
              `
              : ""
          }

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