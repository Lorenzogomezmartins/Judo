// ================= IMPORTS =================

import { initTorneos } from "./torneos.js";
import { cargarClubes } from "./clubes.js";
import { inicializarCalendario } from "./calendario.js";
import { cargarProfesores } from "./profesores.js";
import { cargarPatrocinadores } from "./patrocinadores.js";
import { iniciarLoginAdmin } from "./loginAdmin.js";
import { cargarRankingUsuarios } from "./usuarios.js";

// ================= RUTAS =================

const rutas = {
  home: "../partials/home.html",
  calendario: "../partials/calendario.html",
  ranking: "../partials/ranking.html",
  torneos: "../partials/torneos.html",
  "torneos-actuales": "../partials/torneos-actuales.html",
  "torneos-anteriores": "../partials/torneos-anteriores.html",
  resultados: "../partials/resultados.html",
  clubes: "../partials/clubes.html",
  cursos: "../partials/cursos.html",
  profesores: "../partials/profesores.html",
  patrocinadores: "../partials/patrocinadores.html",
  objetivos: "../partials/objetivos.html",
  loginAdmin: "../partials/LoginAdmin.html",
  sistema: "../partials/sistema.html",
};

// ================= CARGAR VISTA =================

async function cargarVista(vista) {
  const contenedor = document.getElementById("contenido");
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");

  if (!contenedor) {
    console.error("No existe el contenedor #contenido");
    return;
  }

  const vistaFinal = rutas[vista] ? vista : "home";
  const ruta = rutas[vistaFinal];

  if (vistaFinal === "loginAdmin") {
    header?.style.setProperty("display", "none");
    footer?.style.setProperty("display", "none");
  } else {
    header?.style.setProperty("display", "block");
    footer?.style.setProperty("display", "block");
  }

  try {
    const response = await fetch(ruta);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const html = await response.text();
    contenedor.innerHTML = html;

    switch (vistaFinal) {
      case "calendario":
        await inicializarCalendario();
        break;

      case "clubes":
        await cargarClubes();
        break;

      case "profesores":
        await cargarProfesores();
        break;

      case "patrocinadores":
        await cargarPatrocinadores();
        break;

      case "loginAdmin":
        await iniciarLoginAdmin();
        break;

      case "ranking":
        await cargarRankingUsuarios();
        break;

      case "torneos":
      case "torneos-actuales":
      case "torneos-anteriores":
        await initTorneos();
        break;

      default:
        break;
    }
  } catch (error) {
    console.error("Error cargando vista:", error);

    contenedor.innerHTML = `
      <div class="alert alert-danger text-center">
        Error al cargar la sección
      </div>
    `;
  }
}

// ================= ROUTER =================

function obtenerVistaDesdeHash() {
  let hash = window.location.hash || "#/home";

  hash = hash.replace("#/", "");
  hash = hash.replace("#", "");
  hash = hash.trim();

  const vista = hash.split("?")[0];

  return vista || "home";
}

function router() {
  const vista = obtenerVistaDesdeHash();
  cargarVista(vista);
}

// ================= EVENTOS =================

window.addEventListener("DOMContentLoaded", router);
window.addEventListener("hashchange", router);