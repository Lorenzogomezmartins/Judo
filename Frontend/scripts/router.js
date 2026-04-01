const rutas = {
  home: "../partials/home.html",
  calendario: "../partials/calendario.html",
  ranking: "../partials/ranking.html",
  torneos: "../partials/torneos.html",
  "torneos-actuales": "../partials/torneos-actuales.html",
  "torneos-anteriores": "../partials/torneos-anteriores.html",
  clubes: "../partials/clubes.html",
  cursos: "../partials/cursos.html",
  profesores: "../partials/profesores.html",
  patrocinadores: "../partials/patrocinadores.html",
  objetivos: "../partials/objetivos.html",
  loginAdmin: "../partials/loginAdmin.html"
};

/* ================= CARGAR VISTA ================= */

async function cargarVista(vista) {
  const contenedor = document.getElementById("contenido");
  const ruta = rutas[vista] || rutas.home;

  const header = document.querySelector("header");
  const footer = document.querySelector("footer");

  // Ocultar header y footer en login
  if (vista === "loginAdmin") {
    if (header) header.style.display = "none";
    if (footer) footer.style.display = "none";
  } else {
    if (header) header.style.display = "block";
    if (footer) footer.style.display = "block";
  }

  try {
    const response = await fetch(ruta);

    if (!response.ok) {
      throw new Error("No se pudo cargar la vista");
    }

    const html = await response.text();
    contenedor.innerHTML = html;

    /* ================= HOOKS POR SECCIÓN ================= */

    // CALENDARIO
    if (vista === "calendario" && typeof inicializarCalendario === "function") {
      inicializarCalendario();
    }

    // PATROCINADORES
    if (vista === "patrocinadores" && typeof cargarPatrocinadores === "function") {
      cargarPatrocinadores();
    }

    // CLUBES
    if (vista === "clubes" && typeof cargarClubes === "function") {
      cargarClubes();
    }

    // PROFESORES
    if (vista === "profesores" && typeof cargarProfesores === "function") {
      cargarProfesores();
    }

    // LOGIN ADMIN
    if (vista === "loginAdmin" && typeof iniciarLoginAdmin === "function") {
      iniciarLoginAdmin();
    }

    // TORNEOS
    if (
      (vista === "torneos-actuales" || vista === "torneos-anteriores") &&
      typeof initTorneos === "function"
    ) {
      initTorneos();
    }

  } catch (error) {
    console.error("Error cargando vista:", error);

    contenedor.innerHTML = `
      <div class="alert alert-danger">
        Error al cargar la sección.
      </div>
    `;
  }
}

/* ================= ROUTER SPA ================= */

function router() {
  const hash = window.location.hash.replace("#/", "");
  const vista = hash || "home";

  cargarVista(vista);
}

/* ================= EVENTOS ================= */

// Vista inicial
document.addEventListener("DOMContentLoaded", router);

// Cambio de URL
window.addEventListener("hashchange", router);