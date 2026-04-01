const API_URL = "http://localhost:3000/api/torneos";

let cacheTorneos = [];

function esTorneoActual(fecha) {
  const hoy = new Date();
  const fechaTorneo = new Date(fecha);

  hoy.setHours(0, 0, 0, 0);
  fechaTorneo.setHours(0, 0, 0, 0);

  return fechaTorneo >= hoy;
}

function esTorneoAnterior(fecha) {
  const hoy = new Date();
  const fechaTorneo = new Date(fecha);

  hoy.setHours(0, 0, 0, 0);
  fechaTorneo.setHours(0, 0, 0, 0);

  return fechaTorneo < hoy;
}

function obtenerImagenTorneo(torneo) {
  if (torneo.fotos && torneo.fotos.length > 0) {
    return torneo.fotos[0];
  }
  return "../assets/Logos/Logo1.png";
}

function formatearCategorias(categorias) {
  if (!categorias || categorias.length === 0) {
    return "Sin categorías";
  }
  return categorias.join(", ");
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-AR");
}

function renderTorneosActuales(torneos) {
  const contenedor = document.getElementById("listaTorneosActuales");
  if (!contenedor) return;

  const actuales = torneos.filter(t => esTorneoActual(t.fecha));

  contenedor.innerHTML = "";

  if (actuales.length === 0) {
    contenedor.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">
          No hay torneos disponibles por el momento.
        </div>
      </div>
    `;
    return;
  }

  actuales.forEach(torneo => {
    contenedor.innerHTML += `
      <div class="col-md-4">
        <div class="card h-100 shadow">
          <img
            src="${obtenerImagenTorneo(torneo)}"
            class="card-img-top"
            alt="${torneo.nombre}"
            style="height: 220px; object-fit: cover;"
          >
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${torneo.nombre}</h5>
            <p><strong>Fecha:</strong> ${formatearFecha(torneo.fecha)}</p>
            <p><strong>Dirección:</strong> ${torneo.direccion || "A confirmar"}</p>
            <p><strong>Categorías:</strong> ${formatearCategorias(torneo.categorias)}</p>
            <p><strong>Participantes:</strong> ${torneo.participantes?.length || 0}</p>
            <button class="btn btn-primary w-100 mt-auto">Inscribirse</button>
          </div>
        </div>
      </div>
    `;
  });
}

function renderTorneosAnteriores(torneos) {
  const contenedor = document.getElementById("listaTorneosAnteriores");
  if (!contenedor) return;

  const anteriores = torneos
    .filter(t => esTorneoAnterior(t.fecha))
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

  anteriores.forEach(torneo => {
    contenedor.innerHTML += `
      <div class="col-md-4">
        <div class="card h-100 shadow">
          <img
            src="${obtenerImagenTorneo(torneo)}"
            class="card-img-top"
            alt="${torneo.nombre}"
            style="height: 220px; object-fit: cover;"
          >
          <div class="card-body">
            <h5 class="card-title">${torneo.nombre}</h5>
            <p><strong>Fecha:</strong> ${formatearFecha(torneo.fecha)}</p>
            <p><strong>Dirección:</strong> ${torneo.direccion || "Sin dirección"}</p>
            <p><strong>Categorías:</strong> ${formatearCategorias(torneo.categorias)}</p>
            <p><strong>Participantes:</strong> ${torneo.participantes?.length || 0}</p>
          </div>
        </div>
      </div>
    `;
  });
}

function renderCarousel(torneos) {
  const contenedor = document.getElementById("carouselTorneosInner");
  if (!contenedor) return;

  const anteriores = torneos
    .filter(t => esTorneoAnterior(t.fecha))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  contenedor.innerHTML = "";

  if (anteriores.length === 0) {
    contenedor.innerHTML = `
      <div class="carousel-item active">
        <img
          src="../assets/Logos/Logo1.png"
          class="d-block mx-auto"
          alt="Sin torneos"
          style="max-height: 300px; object-fit: contain;"
        >
        <div class="carousel-caption bg-dark bg-opacity-75 rounded p-2">
          <h5>No hay torneos finalizados</h5>
        </div>
      </div>
    `;
    return;
  }

  anteriores.slice(0, 5).forEach((torneo, index) => {
    contenedor.innerHTML += `
      <div class="carousel-item ${index === 0 ? "active" : ""}">
        <img
          src="${obtenerImagenTorneo(torneo)}"
          class="d-block w-100"
          alt="${torneo.nombre}"
          style="height: 450px; object-fit: cover;"
        >
        <div class="carousel-caption bg-dark bg-opacity-75 rounded p-2">
          <h5>${torneo.nombre}</h5>
          <p>${formatearFecha(torneo.fecha)} · ${torneo.direccion || "Sin dirección"}</p>
        </div>
      </div>
    `;
  });
}

function filtrarActuales(e) {
  const texto = e.target.value.toLowerCase().trim();

  const filtrados = cacheTorneos.filter(t =>
    esTorneoActual(t.fecha) &&
    (
      (t.nombre || "").toLowerCase().includes(texto) ||
      (t.direccion || "").toLowerCase().includes(texto) ||
      (t.categorias || []).some(cat => cat.toLowerCase().includes(texto))
    )
  );

  renderTorneosActuales(filtrados);
}

function filtrarAnteriores(e) {
  const texto = e.target.value.toLowerCase().trim();

  const filtrados = cacheTorneos.filter(t =>
    esTorneoAnterior(t.fecha) &&
    (
      (t.nombre || "").toLowerCase().includes(texto) ||
      (t.direccion || "").toLowerCase().includes(texto) ||
      (t.categorias || []).some(cat => cat.toLowerCase().includes(texto))
    )
  );

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

async function initTorneos() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const torneos = await response.json();
    console.log("Torneos cargados:", torneos);

    cacheTorneos = torneos;

    renderTorneosActuales(cacheTorneos);
    renderTorneosAnteriores(cacheTorneos);
    renderCarousel(cacheTorneos);
    activarBuscador();
  } catch (error) {
    console.error("Error al cargar torneos:", error);
  }
}