const API_URL = "/api/torneos";

let cacheTorneos = [];
let tipoSeleccionado = "torneo";
let textoBusquedaActual = "";

// ============================
// HELPERS
// ============================

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

function generarSlugDesdeNombre(nombre = "") {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bfmj\b/g, "")
    .replace(/\btorneo\b/g, "")
    .replace(/\bcopa\b/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function obtenerSlugResultado(torneo) {
  return torneo.slug || torneo.torneoSlug || generarSlugDesdeNombre(torneo.nombre);
}

function obtenerNombreTipoPlural(tipo) {
  switch (tipo) {
    case "curso":
      return "Cursos";
    case "capacitacion":
      return "Capacitaciones";
    case "evento":
      return "Eventos";
    case "torneo":
    default:
      return "Torneos";
  }
}

function obtenerDescripcionTipo(tipo) {
  switch (tipo) {
    case "curso":
      return "Cursos cargados en el sistema.";
    case "capacitacion":
      return "Capacitaciones disponibles y finalizadas.";
    case "evento":
      return "Eventos institucionales de la FMJ.";
    case "torneo":
    default:
      return "Competencias cargadas en el sistema.";
  }
}

function obtenerNombreTipoSingular(tipo) {
  switch (tipo) {
    case "curso":
      return "Curso";
    case "capacitacion":
      return "Capacitación";
    case "evento":
      return "Evento";
    case "torneo":
    default:
      return "Torneo";
  }
}

function renderBotonesTransmisiones(torneo) {
  if (!Array.isArray(torneo.transmisiones) || torneo.transmisiones.length === 0) {
    return "";
  }

  return torneo.transmisiones
    .filter((transmision) => transmision.url)
    .map((transmision, index) => `
      <a
        href="${transmision.url}"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-outline-danger"
      >
        <i class="bi bi-youtube"></i>
        ${transmision.titulo || `Ver transmisión ${index + 1}`}
      </a>
    `)
    .join("");
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
          alt="${torneo.nombre || "Evento"}"
          style="height: 220px; object-fit: cover;"
          onerror="this.src='../assets/Logos/Logo1.png'"
        >

        <div class="card-body d-flex flex-column">
          <h5 class="card-title fw-bold">
            ${torneo.nombre || "Evento sin nombre"}
          </h5>

          <p class="mb-2">
            <strong>Tipo:</strong> ${obtenerNombreTipoSingular(torneo.tipo || "torneo")}
          </p>

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
            ${renderBotonesTransmisiones(torneo)}

            <a
  href="https://fmj-resultados.infinityfreeapp.com/resultados/${slug}/"
  target="_blank"
  rel="noopener noreferrer"
  class="btn btn-danger"
>
  Ver resultados
</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================
// RENDER PRINCIPAL
// ============================

function renderTorneosActuales(torneos) {
  const contenedor = document.getElementById("listaTorneosActuales");
  if (!contenedor) return;

  const filtrados = torneos
    .filter((torneo) => (torneo.tipo || "torneo") === tipoSeleccionado)
    .filter((torneo) => coincideBusqueda(torneo, textoBusquedaActual))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  contenedor.innerHTML = "";

  if (filtrados.length === 0) {
    contenedor.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">
          No hay ${obtenerNombreTipoPlural(tipoSeleccionado).toLowerCase()} cargados por el momento.
        </div>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = filtrados
    .map((torneo) => crearCardTorneo(torneo, esTorneoAnterior(torneo.fecha)))
    .join("");
}

// ============================
// RENDER ANTERIORES
// ============================

function renderTorneosAnteriores(torneos) {
  const contenedor = document.getElementById("listaTorneosAnteriores");
  if (!contenedor) return;

  const anteriores = torneos
    .filter(
      (torneo) =>
        (torneo.tipo || "torneo") === "torneo" &&
        esTorneoAnterior(torneo.fecha)
    )
    .filter((torneo) => coincideBusqueda(torneo, textoBusquedaActual))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  contenedor.innerHTML = "";

  if (anteriores.length === 0) {
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
// CARRUSEL
// ============================

function renderCarousel(torneos) {
  const contenedor = document.getElementById("carouselTorneosInner");
  if (!contenedor) return;

  const todos = torneos
    .filter((torneo) => (torneo.tipo || "torneo") === tipoSeleccionado)
    .filter((torneo) => coincideBusqueda(torneo, textoBusquedaActual))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  contenedor.innerHTML = "";

  if (todos.length === 0) {
    contenedor.innerHTML = `
      <div class="carousel-item active">
        <img
          src="../assets/Logos/Logo1.png"
          class="d-block mx-auto"
          alt="Sin eventos"
          style="max-height: 300px; object-fit: contain;"
        >

        <div class="carousel-caption bg-dark bg-opacity-75 rounded p-2">
          <h5>No hay ${obtenerNombreTipoPlural(tipoSeleccionado).toLowerCase()} cargados</h5>
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

        <div class="d-flex justify-content-center gap-2 flex-wrap">
          ${renderBotonesTransmisiones(torneo)}

          <a
  href="https://fmj-resultados.infinityfreeapp.com/resultados/${obtenerSlugResultado(torneo)}/"
  target="_blank"
  rel="noopener noreferrer"
  class="btn btn-danger"
>
  Ver resultados
</a>
        </div>
      </div>
    </div>
  `).join("");
}

// ============================
// FILTROS
// ============================

function coincideBusqueda(torneo, texto) {
  if (!texto) return true;

  const nombre = (torneo.nombre || "").toLowerCase();
  const direccion = (torneo.direccion || torneo.sede || "").toLowerCase();
  const fecha = formatearFecha(torneo.fecha).toLowerCase();
  const tipo = (torneo.tipo || "torneo").toLowerCase();
  const categorias = Array.isArray(torneo.categorias) ? torneo.categorias : [];

  return (
    nombre.includes(texto) ||
    direccion.includes(texto) ||
    fecha.includes(texto) ||
    tipo.includes(texto) ||
    categorias.some((categoria) =>
      String(categoria).toLowerCase().includes(texto)
    )
  );
}

function filtrarActuales(e) {
  textoBusquedaActual = e.target.value.toLowerCase().trim();

  renderTorneosActuales(cacheTorneos);
  renderCarousel(cacheTorneos);
}

function filtrarAnteriores(e) {
  textoBusquedaActual = e.target.value.toLowerCase().trim();

  renderTorneosAnteriores(cacheTorneos);
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

function activarFiltrosTipo() {
  const botones = document.querySelectorAll(".filtro-tipo-btn");

  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      tipoSeleccionado = boton.dataset.tipo || "torneo";

      botones.forEach((btn) => {
        btn.classList.remove("active", "btn-danger");
        btn.classList.add("btn-outline-danger");
      });

      boton.classList.add("active", "btn-danger");
      boton.classList.remove("btn-outline-danger");

      textoBusquedaActual = "";

      const inputActuales = document.getElementById("buscadorTorneosActuales");
      if (inputActuales) inputActuales.value = "";

      actualizarTextosListado();
      renderTorneosActuales(cacheTorneos);
      renderCarousel(cacheTorneos);
    });
  });
}

function actualizarTextosListado() {
  const tituloListado = document.getElementById("tituloListadoTorneos");
  const descripcionListado = document.getElementById("descripcionListadoTorneos");
  const tituloCarousel = document.getElementById("tituloCarouselTorneos");
  const descripcionCarousel = document.getElementById("descripcionCarouselTorneos");

  const nombreTipo = obtenerNombreTipoPlural(tipoSeleccionado);

  if (tituloListado) {
    tituloListado.textContent = nombreTipo;
  }

  if (descripcionListado) {
    descripcionListado.textContent =
      `Listado completo de ${nombreTipo.toLowerCase()} cargados en el sistema.`;
  }

  if (tituloCarousel) {
    tituloCarousel.textContent = `${nombreTipo} destacados`;
  }

  if (descripcionCarousel) {
    descripcionCarousel.textContent = obtenerDescripcionTipo(tipoSeleccionado);
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

    cacheTorneos = torneos;

    actualizarTextosListado();
    renderTorneosActuales(cacheTorneos);
    renderTorneosAnteriores(cacheTorneos);
    renderCarousel(cacheTorneos);
    activarBuscador();
    activarFiltrosTipo();

  } catch (error) {
    console.error("❌ Error al cargar torneos:", error);

    const mensajeError = `
      <div class="col-12">
        <div class="alert alert-danger text-center">
          Error al cargar eventos.
        </div>
      </div>
    `;

    if (contenedorActuales) contenedorActuales.innerHTML = mensajeError;
    if (contenedorAnteriores) contenedorAnteriores.innerHTML = mensajeError;
  }
}