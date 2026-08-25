const API_URL = "/api/profesores";

export async function cargarProfesores() {
  const contenedor =
    document.getElementById("lista-profesores");

  if (!contenedor) return;

  try {
    const res = await fetch(API_URL);

    if (!res.ok) {
      throw new Error(
        "Error al obtener profesores"
      );
    }

    const personas = await res.json();


    /* =====================================================
       SEPARAR AUTORIDADES Y PROFESORES

       Si no tiene rol, se considera profesor para que los
       registros anteriores sigan funcionando.
    ===================================================== */

    const autoridades =
      personas.filter(
        (persona) =>
          persona.rol === "autoridad"
      );

    const profesores =
      personas.filter(
        (persona) =>
          persona.rol !== "autoridad"
      );


    contenedor.innerHTML = "";


    /* =====================================================
       AUTORIDADES
    ===================================================== */

    if (autoridades.length > 0) {
      const seccionAutoridades =
        document.createElement("section");

      seccionAutoridades.className =
        "autoridades-seccion";

      seccionAutoridades.innerHTML = `
        <div class="autoridades-header">

          <span class="autoridades-eyebrow">
            Federación Metropolitana de Judo
          </span>

          <h2>
            Autoridades
          </h2>

        </div>

        <div class="autoridades-grid"></div>
      `;

      const autoridadesGrid =
        seccionAutoridades.querySelector(
          ".autoridades-grid"
        );


      autoridades.forEach(
        (autoridad) => {
          autoridadesGrid.innerHTML +=
            crearCardPersona(
              autoridad,
              true
            );
        }
      );


      contenedor.appendChild(
        seccionAutoridades
      );
    }


    /* =====================================================
       PROFESORES
    ===================================================== */

    const seccionProfesores =
      document.createElement("section");

    seccionProfesores.className =
      "profesores-seccion";

    seccionProfesores.innerHTML = `
      <div class="profesores-seccion-header">

        <span class="profesores-eyebrow">
          Federación Metropolitana de Judo
        </span>

        <h2>
          Profesores
        </h2>

      </div>

      <div class="profesores-grid"></div>
    `;


    const grid =
      seccionProfesores.querySelector(
        ".profesores-grid"
      );


    if (!profesores.length) {
      grid.innerHTML = `
        <p class="text-muted">
          No hay profesores registrados.
        </p>
      `;
    } else {
      profesores.forEach(
        (profesor) => {
          grid.innerHTML +=
            crearCardPersona(
              profesor,
              false
            );
        }
      );
    }


    contenedor.appendChild(
      seccionProfesores
    );


  } catch (error) {
    console.error(
      "Error cargando profesores:",
      error
    );

    contenedor.innerHTML = `
      <p class="text-danger">
        Error al cargar profesores
      </p>
    `;
  }
}


/* =========================================================
   CREAR CARD
========================================================= */

function crearCardPersona(persona, esAutoridad = false) {
  const foto = persona.foto
    ? persona.foto
    : "../assets/placeholder-profesor.jpg";

  const capacitaciones =
    persona.capacitaciones || [];


  return `
    <div class="profesor-card ${
      esAutoridad
        ? "autoridad-card"
        : ""
    }">

      <img
        src="${foto}"
        alt="${persona.nombre} ${persona.apellido}"
      >

      <h3>
        ${persona.nombre}
        ${persona.apellido}
      </h3>

      <span class="grado">
        ${
          persona.club ||
          (
            esAutoridad
              ? "Autoridad FMJ"
              : "Profesor FMJ"
          )
        }
      </span>

      <p>
        ${persona.descripcion || ""}
      </p>


      ${
        capacitaciones.length > 0
          ? `
            <details class="profesor-capacitaciones">

              <summary>
                Capacitaciones
                (${capacitaciones.length})
              </summary>

              <ul>

                ${
                  capacitaciones
                    .map(
                      (cap) => `
                        <li>

                          <strong>
                            ${cap.titulo}
                          </strong>

                          <span>
                            Club:
                            ${cap.club}
                          </span>

                          ${
                            cap.fecha
                              ? `
                                <br>

                                <small>
                                  ${
                                    cap.fecha
                                      .split("T")[0]
                                      .split("-")
                                      .reverse()
                                      .join("/")
                                  }
                                </small>
                              `
                              : ""
                          }

                          ${
                            cap.descripcion
                              ? `
                                <br>

                                <em>
                                  ${cap.descripcion}
                                </em>
                              `
                              : ""
                          }

                        </li>
                      `
                    )
                    .join("")
                }

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
        persona.cv
          ? `
            <a
              href="${persona.cv}"
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
}