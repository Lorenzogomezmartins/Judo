const API_RESULTADOS = "/api/resultados";

function obtenerTorneoSlugDesdeURL() {
  const partes = window.location.pathname.split("/").filter(Boolean);
  const indexResultados = partes.indexOf("resultados");
  if (indexResultados !== -1 && partes[indexResultados + 1]) {
    return partes[indexResultados + 1];
  }
  return partes[partes.length - 1] !== "index.html" ? partes[partes.length - 1] : partes[partes.length - 2];
}

function formatearNombre(slug) {
  if (!slug) return "Torneo";
  return slug
    .split("-")
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
}

function renderAnios(resultados) {
  const select = document.getElementById("selectAnioResultados");
  if (!select) return;

  const anios = [...new Set(resultados.map((r) => r.anio))]
    .filter(Boolean)
    .sort((a, b) => b - a);

  select.innerHTML = `<option value="">Todos los años</option>`;

  anios.forEach((anio) => {
    select.innerHTML += `<option value="${anio}">${anio}</option>`;
  });
}

function renderResultados(resultados) {
  const container = document.getElementById("resultadosContainer");
  if (!container) return;

  if (!resultados || !resultados.length) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">
          Todavía no hay resultados publicados para este torneo.
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  resultados.forEach((resultado) => {
    container.innerHTML += `
      <div class="col-md-4 mb-4">
        <div class="card shadow h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${resultado.archivoNombre || "Resultado"}</h5>

            <p class="text-muted mb-1">
              Año: ${resultado.anio || "N/D"}
            </p>

            <p class="text-muted small">
              Carpeta: ${resultado.carpetaFTP || ""}
            </p>

            <a
            href="/resultados/${resultado.carpetaFTP || torneoSlug}/${resultado.archivoNombre}"
            target="_blank"
            class="btn btn-primary mt-auto"
          >
            Abrir resultado
          </a>
          </div>
        </div>
      </div>
    `;
  });
}

export async function initResultados() {
  const torneoSlug = obtenerTorneoSlugDesdeURL();
  const titulo = document.getElementById("tituloResultados");
  const select = document.getElementById("selectAnioResultados");

  if (!torneoSlug) {
    renderResultados([]);
    return;
  }

  if (titulo) {
    titulo.textContent = `Resultados - ${formatearNombre(torneoSlug)}`;
  }

  try {
    const response = await fetch(`${API_RESULTADOS}/${torneoSlug}`);
    const resultados = await response.json();

    if (!response.ok) {
      throw new Error(resultados.mensaje || "Error cargando resultados");
    }

    renderAnios(resultados);
    renderResultados(resultados);

    if (select) {
      select.addEventListener("change", () => {
        const anio = select.value;

        const filtrados = anio
          ? resultados.filter((r) => String(r.anio) === anio)
          : resultados;

        renderResultados(filtrados);
      });
    }
  } catch (error) {
    const container = document.getElementById("resultadosContainer");

    if (container) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">
            Error cargando resultados: ${error.message}
          </div>
        </div>
      `;
    }
  }
}