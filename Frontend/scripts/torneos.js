const API_URL = "/api/torneos";

let cacheTorneos = [];

// ============================
// HELPERS
// ============================

function esTorneoActual(fecha) {
  if (!fecha) return false;

  const hoy = new Date();
  const fechaTorneo = new Date(fecha);

  hoy.setHours(0, 0, 0, 0);
  fechaTorneo.setHours(0, 0, 0, 0);

  return fechaTorneo >= hoy;
}

function esTorneoAnterior(fecha) {
  if (!fecha) return false;

  const hoy = new Date();
  const fechaTorneo = new Date(fecha);

  hoy.setHours(0, 0, 0, 0);
  fechaTorneo.setHours(0, 0, 0, 0);

  return fechaTorneo < hoy;
}

function obtenerImagenTorneo(torneo) {
  if (Array.isArray(torneo.fotos) && torneo.fotos.length > 0) {
    return torneo.fotos[0];
  }

  if (torneo.imagen) {
    return torneo.imagen;
  }

  return "../assets/Logos/Logo1.png";
}

function formatearCategorias(categorias) {
  if (!Array.isArray(categorias) || categorias.length === 0) {
    return "Sin categorías";
  }

  return categorias.join(", ");
}

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function obtenerSlugTorneo(torneo) {
  return torneo.slug || torneo.torneoSlug || torneo._id || "";
}

function generarSlugDesdeNombre(nombre = "") {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\d{4}/g, "")
    .replace(/\bfmj\b/g, "")
    .replace(/\btorneo\b/g, "")
    .replace(/\bcopa\b/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function obtenerSlugResultado(torneo) {
  return torneo.slug || torneo.torneoSlug || generarSlugDesdeNombre(torneo.nombre);
}
// ============================
// CARD
// ============================

function crearCardTorneo(torneo, esAnterior = false) {
  const slug = obtenerSlugResultado(torneo);

  return `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card h-100 shadow border-0 rounded-4 overflow-hidden">
        <img
          src="${obtenerImagenTorneo(torneo)}"
          class="card-img-top"
          alt="${torneo.nombre || "Torneo"}"
          style="height: 220px; object-fit: cover;"
          onerror="this.src='../assets/Logos/Logo1.png'"
        >

        <div class="card-body d-flex flex-column">
          <h5 class="card-title fw-bold">
            ${torneo.nombre || "Torneo sin nombre"}
          </h5>

          <p class="mb-2">
            <strong>Fecha:</strong> ${formatearFecha(torneo.fecha)}
          </p>

          <p class="mb-2">
            <strong>Dirección:</strong> ${torneo.direccion || torneo.sede || "A confirmar"}
          </p>

          <p class="mb-3">
            <strong>Categorías:</strong> ${formatearCategorias(torneo.categorias)}
          </p>

          <div class="mt-auto d-grid gap-2">
            ${
  esAnterior && torneo.resultadosSubidos
    ? `
      <a
        href="https://fmj-resultados.infinityfreeapp.com/resultados/${slug}/"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-danger"
      >
        Ver resultados
      </a>
    `
    : esAnterior
      ? ``
      : `
        <span class="badge bg-success py-2">
          Evento disponible
        </span>
      `
}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================
// RENDER ACTUALES
// ============================

function renderTorneosActuales(torneos) {
  const contenedor = document.getElementById("listaTorneosActuales");
  if (!contenedor) return;

  const todos = [...torneos].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  contenedor.innerHTML = "";

  if (todos.length === 0) {
    contenedor.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">
          No hay torneos cargados por el momento.
        </div>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = todos
    .map((torneo) =>
      crearCardTorneo(torneo, esTorneoAnterior(torneo.fecha))
    )
    .join("");
}

// ============================
// RENDER ANTERIORES
// ============================

function renderTorneosAnteriores(torneos) {
  const contenedor = document.getElementById("listaTorneosAnteriores");
  if (!contenedor) return;

  const anteriores = torneos
    .filter((torneo) => esTorneoAnterior(torneo.fecha))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  contenedor.innerHTML = "";

  if (todos.length === 0) {
    contenedor.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">
          No hay torneos finalizados para mostrar.
        </div>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = anteriores
    .map((torneo) => crearCardTorneo(torneo, true))
    .join("");
}

// ============================
// CARRUSEL ANTERIORES
// ============================

function renderCarousel(torneos) {
  const contenedor = document.getElementById("carouselTorneosInner");
  if (!contenedor) return;

  const todos = [...torneos].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  contenedor.innerHTML = "";

  if (todos.length === 0) {
    contenedor.innerHTML = `
      <div class="carousel-item active">
        <img
          src="../assets/Logos/Logo1.png"
          class="d-block mx-auto"
          alt="Sin torneos"
          style="max-height: 300px; object-fit: contain;"
        >

        <div class="carousel-caption bg-dark bg-opacity-75 rounded p-2">
          <h5>No hay eventos cargados</h5>
        </div>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = todos.slice(0, 5).map((torneo, index) => `
    <div class="carousel-item ${index === 0 ? "active" : ""}">
      <img
        src="${obtenerImagenTorneo(torneo)}"
        class="d-block w-100"
        alt="${torneo.nombre || "Evento"}"
        style="height: 450px; object-fit: contain; background: #f5f5f5;"
        onerror="this.src='../assets/Logos/Logo1.png'"
      >

      <div class="carousel-caption bg-dark bg-opacity-75 rounded p-3">
        <h5>${torneo.nombre || "Evento sin nombre"}</h5>

        <p class="mb-3">
          ${formatearFecha(torneo.fecha)} ·
          ${torneo.direccion || torneo.sede || "Sin dirección"}
        </p>

        ${
          torneo.resultadosSubidos
            ? `
              <a
                href="https://fmj-resultados.infinityfreeapp.com/resultados/${obtenerSlugResultado(torneo)}/"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-danger"
              >
                Ver resultados
              </a>
            `
            : ""
        }
      </div>
    </div>
  `).join("");
}
// ============================
// FILTROS
// ============================

function coincideBusqueda(torneo, texto) {
  const nombre = (torneo.nombre || "").toLowerCase();
  const direccion = (torneo.direccion || torneo.sede || "").toLowerCase();
  const fecha = formatearFecha(torneo.fecha).toLowerCase();
  const categorias = Array.isArray(torneo.categorias) ? torneo.categorias : [];

  return (
    nombre.includes(texto) ||
    direccion.includes(texto) ||
    fecha.includes(texto) ||
    categorias.some((categoria) =>
      String(categoria).toLowerCase().includes(texto)
    )
  );
}

function filtrarActuales(e) {
  const texto = e.target.value.toLowerCase().trim();

  const filtrados = cacheTorneos.filter((torneo) => {
    return coincideBusqueda(torneo, texto);
  });

  renderTorneosActuales(filtrados);
}

function filtrarAnteriores(e) {
  const texto = e.target.value.toLowerCase().trim();

  const filtrados = cacheTorneos.filter((torneo) => {
    return esTorneoAnterior(torneo.fecha) && coincideBusqueda(torneo, texto);
  });

  renderTorneosAnteriores(filtrados);
}

function activarBuscador() {
  const inputActuales = document.getElementById("buscadorTorneosActuales");
  const inputAnteriores = document.getElementById("buscadorTorneosAnteriores");

  if (inputActuales) {
    inputActuales.removeEventListener("input", filtrarActuales);
    inputActuales.addEventListener("input", filtrarActuales);
  }

  if (inputAnteriores) {
    inputAnteriores.removeEventListener("input", filtrarAnteriores);
    inputAnteriores.addEventListener("input", filtrarAnteriores);
  }
}

// ============================
// INIT
// ============================

export async function initTorneos() {
  const contenedorActuales = document.getElementById("listaTorneosActuales");
  const contenedorAnteriores = document.getElementById("listaTorneosAnteriores");

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const torneos = await response.json();

    if (!Array.isArray(torneos)) {
      console.error("La API no devolvió un array:", torneos);
      return;
    }

    console.log("✅ Torneos cargados:", torneos);

    cacheTorneos = torneos;

    renderTorneosActuales(cacheTorneos);
    renderTorneosAnteriores(cacheTorneos);
    renderCarousel(cacheTorneos);
    activarBuscador();

  } catch (error) {
    console.error("❌ Error al cargar torneos:", error);

    const mensajeError = `
      <div class="col-12">
        <div class="alert alert-danger text-center">
          Error al cargar torneos.
        </div>
      </div>
    `;

    if (contenedorActuales) contenedorActuales.innerHTML = mensajeError;
    if (contenedorAnteriores) contenedorAnteriores.innerHTML = mensajeError;
  }
}