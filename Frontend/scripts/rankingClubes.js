const API_CLUBES = "/api/clubes";
const LOGO_DEFAULT = "/assets/imagenes/default.png";
const TOTAL_COLUMNAS_CLUBES = 27; // Posición + Logo + Club + 6 grupos x 4 medallas // Pos + Logo + Club + 5 grupos x 4 medallas

let rankingClubes = [];
let ordenClubes = "asc"; // asc = 1° al último
let clubesCargados = false;
let clubesEventosIniciados = false;

/* ============================================
   UTILIDADES
============================================ */

function escaparHtml(valor = "") {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizarBusqueda(valor = "") {
  return String(valor ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function esUrlSegura(url = "") {
  return /^https?:\/\//i.test(String(url).trim());
}

function obtenerLogoClub(club) {
  const logo = String(club?.logo || "").trim();

  if (!logo) return "";

  if (logo.startsWith("http://") || logo.startsWith("https://")) {
    return logo;
  }

  if (logo.startsWith("/")) return logo;

  return `/${logo.replace(/^\.?\//, "")}`;
}
function obtenerPosicionClub(club) {
  const ranking = Number(club?.ranking);

  if (!Number.isFinite(ranking) || ranking <= 0) return null;

  return ranking;
}

/* ============================================
   SELECTOR JUDOKAS / CLUBES
============================================ */

export function inicializarSelectorRanking() {
  const tabJudokas = document.getElementById("tabJudokas");
  const tabClubes = document.getElementById("tabClubes");
  const panelJudokas = document.getElementById("panelJudokas");
  const panelClubes = document.getElementById("panelClubes");

  if (!tabJudokas || !tabClubes || !panelJudokas || !panelClubes) return;

  // El router vuelve a insertar el HTML cada vez que se entra a la sección,
  // así que hay que reiniciar el estado para que los eventos se enganchen
  // al DOM nuevo.
  clubesCargados = false;
  clubesEventosIniciados = false;
  ordenClubes = "asc";
  rankingClubes = [];

  function mostrarRanking(tipo) {
    const esJudokas = tipo === "judokas";

    tabJudokas.classList.toggle("active", esJudokas);
    tabClubes.classList.toggle("active", !esJudokas);

    tabJudokas.setAttribute("aria-selected", String(esJudokas));
    tabClubes.setAttribute("aria-selected", String(!esJudokas));

    panelJudokas.hidden = !esJudokas;
    panelClubes.hidden = esJudokas;

    // Los clubes se cargan recién la primera vez que se abre la pestaña
    if (!esJudokas && !clubesCargados) {
      cargarRankingClubes();
    }
  }

  tabJudokas.addEventListener("click", () => mostrarRanking("judokas"));
  tabClubes.addEventListener("click", () => mostrarRanking("clubes"));

  // Estado inicial: judokas
  mostrarRanking("judokas");
}

/* ============================================
   CARGAR CLUBES
============================================ */

export async function cargarRankingClubes() {
  const tbody = document.getElementById("rankingClubesBody");

  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="${TOTAL_COLUMNAS_CLUBES}">Cargando clubes...</td>
    </tr>
  `;

  try {
    const response = await fetch(API_CLUBES);

    if (!response.ok) {
      throw new Error("Error al obtener clubes");
    }

    const clubes = await response.json();

    if (!Array.isArray(clubes)) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${TOTAL_COLUMNAS_CLUBES}">Error en el formato del ranking de clubes.</td>
        </tr>
      `;
      return;
    }

    rankingClubes = clubes;
    clubesCargados = true;

    inicializarEventosClubes();
    aplicarFiltrosClubes();
  } catch (error) {
    console.error("Error cargando ranking de clubes:", error);

    tbody.innerHTML = `
      <tr>
        <td colspan="${TOTAL_COLUMNAS_CLUBES}">Error al cargar el ranking de clubes.</td>
      </tr>
    `;
  }
}

/* ============================================
   EVENTOS
============================================ */

function inicializarEventosClubes() {
  if (clubesEventosIniciados) return;
  clubesEventosIniciados = true;

  const searchInput = document.getElementById("searchClubInput");
  const sortAsc = document.getElementById("sortClubAsc");
  const sortDesc = document.getElementById("sortClubDesc");
  const btnLimpiar = document.getElementById("btnLimpiarFiltrosClubes");

  searchInput?.addEventListener("input", aplicarFiltrosClubes);

  sortAsc?.addEventListener("click", () => {
    ordenClubes = "asc";

    sortAsc.classList.add("active");
    sortDesc?.classList.remove("active");

    aplicarFiltrosClubes();
  });

  sortDesc?.addEventListener("click", () => {
    ordenClubes = "desc";

    sortDesc.classList.add("active");
    sortAsc?.classList.remove("active");

    aplicarFiltrosClubes();
  });

  btnLimpiar?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";

    ordenClubes = "asc";

    sortAsc?.classList.add("active");
    sortDesc?.classList.remove("active");

    aplicarFiltrosClubes();
  });
}

/* ============================================
   FILTROS Y ORDEN
============================================ */

function aplicarFiltrosClubes() {
  const searchInput = document.getElementById("searchClubInput");

  const texto = normalizarBusqueda(searchInput?.value || "");

  let clubes = [...rankingClubes];

  if (texto) {
    clubes = clubes.filter((club) =>
      normalizarBusqueda(club.nombre).includes(texto)
    );
  }

  clubes.sort((a, b) => {
    const posA = obtenerPosicionClub(a);
    const posB = obtenerPosicionClub(b);

    // Los clubes sin ranking siempre quedan al final
    if (posA === null && posB === null) {
      return String(a.nombre || "").localeCompare(
        String(b.nombre || ""),
        "es",
        { sensitivity: "base" }
      );
    }

    if (posA === null) return 1;
    if (posB === null) return -1;

    return ordenClubes === "asc" ? posA - posB : posB - posA;
  });

  renderizarRankingClubes(clubes);
}

/* ============================================
   RENDER
============================================ */

/*
  Devuelve 4 <td> (oro, plata, bronce, quinto) para una competencia.
  La primera celda lleva la clase ranking-group-start para dibujar
  el separador entre competencias.
  El medallero global recibe además ranking-group-global.
*/
function renderizarCeldasMedallas(resultado, esGlobal = false) {
  const medallas = [
    { clave: "oro", valor: resultado?.oro },
    { clave: "plata", valor: resultado?.plata },
    { clave: "bronce", valor: resultado?.bronce },
    { clave: "quinto", valor: resultado?.quinto },
  ];

  return medallas
    .map(({ clave, valor }, indice) => {
      const cantidad = Number(valor ?? 0) || 0;

      const clases = [
        "ranking-medal-cell",
        `ranking-medal-cell-${clave}`,
        indice === 0 ? "ranking-group-start" : "",
        esGlobal ? "ranking-group-global" : "",
        cantidad === 0 ? "ranking-medal-zero" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return `<td class="${clases}">${cantidad}</td>`;
    })
    .join("");
}


function renderizarRankingClubes(clubes) {
  const tbody = document.getElementById("rankingClubesBody");

  if (!tbody) return;

  if (!clubes.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${TOTAL_COLUMNAS_CLUBES}">
          No hay clubes para mostrar.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";

  clubes.forEach((club) => {
    const fila = document.createElement("tr");

    const posicion = obtenerPosicionClub(club);
    const logo = escaparHtml(obtenerLogoClub(club));
    const nombre = escaparHtml(club.nombre || "-");

    fila.innerHTML = `
      <td class="fw-bold">
        ${posicion ?? "-"}
      </td>

     <td>
  ${
    logo
      ? `
        <img
          src="${logo}"
          alt="${nombre}"
          class="ranking-foto ranking-club-logo"
          onerror="this.onerror=null; this.style.display='none';"
          style="
            width: 85px;
            height: 85px;
            object-fit: contain;
            border-radius: 50%;
            border: 3px solid #b30000;
            background: #fff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          "
        >
      `
      : ""
  }
</td>

      <td>
        <div class="fw-semibold">${nombre}</div>
        
      
        
      </td>

      ${renderizarCeldasMedallas(club.medalleroGlobal, true)}
      ${renderizarCeldasMedallas(club.abiertoCiudad2026)}
      ${renderizarCeldasMedallas(club.juegosPortenos2026)}
      ${renderizarCeldasMedallas(club.copaDoblas2026)}
      ${renderizarCeldasMedallas(club.juegosUFedem2026)}
      ${renderizarCeldasMedallas(club.torneoMetropolitano2026)}
      
    `;

    tbody.appendChild(fila);
  });
}