const API_RANKING = "/api/ranking";
const FOTO_INCOGNITO = "/assets/imagenes/incognito.png";

/*
  Columnas de la tabla:
  Pos, Foto, Judoka, Cat., Club,
  Abierto Ciudad, Juegos Porteños, Copa Doblas, Juegos UFeDeM, Metropolitano,
  Total
  = 11
*/
const TOTAL_COLUMNAS = 11;

let rankingUsuarios = [];
let ordenActual = "desc";
let sexoSeleccionado = "";
let pesoSeleccionado = "";

export async function cargarRankingUsuarios() {
  const tbody = document.getElementById("rankingBody");

  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="${TOTAL_COLUMNAS}">Cargando ranking...</td>
    </tr>
  `;

  try {
    const response = await fetch(API_RANKING);

    if (!response.ok) {
      throw new Error("Error al obtener ranking");
    }

    const usuarios = await response.json();

    if (!Array.isArray(usuarios)) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${TOTAL_COLUMNAS}">Error en el formato del ranking.</td>
        </tr>
      `;
      return;
    }

    rankingUsuarios = usuarios.map((usuario) => ({
      ...usuario,
      puntos: Number(usuario.puntajeTotal ?? 0),
    }));

    cargarCategoriasRanking();
    inicializarEventosRanking();
    aplicarFiltrosRanking();
  } catch (error) {
    console.error("Error cargando ranking:", error);

    tbody.innerHTML = `
      <tr>
        <td colspan="${TOTAL_COLUMNAS}">Error al cargar ranking.</td>
      </tr>
    `;
  }
}

function obtenerFotoUsuario(usuario) {
  const foto = String(usuario?.foto || "").trim();

  if (!foto) {
    return FOTO_INCOGNITO;
  }

  // Cloudinary o cualquier URL externa
  if (foto.startsWith("http://") || foto.startsWith("https://")) {
    return foto;
  }

  // Ruta interna del frontend
  if (foto.startsWith("/")) {
    return foto;
  }

  // Por si viene como assets/...
  return `/${foto.replace(/^\.?\//, "")}`;
}

function obtenerPesoDesdeCategoria(categoria = "") {
  const texto = String(categoria).toUpperCase();
  const match = texto.match(/([+-]?\d+)$/);

  if (!match) return null;

  return match[1];
}

function cargarCategoriasRanking() {
  const filtroCategoria = document.getElementById("filtroCategoria");

  if (!filtroCategoria) return;

  const ordenCategorias = [
    "J11M-28", "J11M-30", "J11M-33", "J11M-36", "J11M-40", "J11M-45", "J11M-50", "J11M+50",
    "J11F-28", "J11F-30", "J11F-33", "J11F-36", "J11F-40", "J11F-45", "J11F-50", "J11F+50",

    "J13M-35", "J13M-40", "J13M-45", "J13M-50", "J13M-55", "J13M-60", "J13M-66", "J13M-73", "J13M+73",
    "J13F-32", "J13F-36", "J13F-40", "J13F-44", "J13F-48", "J13F-52", "J13F-57", "J13F-63", "J13F+63",

    "J15M-40", "J15M-45", "J15M-50", "J15M-55", "J15M-60", "J15M-66", "J15M-73", "J15M-81", "J15M+81",
    "J15F-36", "J15F-40", "J15F-44", "J15F-48", "J15F-52", "J15F-57", "J15F-63", "J15F-70", "J15F+70",

    "CNM-50", "CNM-55", "CNM-60", "CNM-66", "CNM-73", "CNM-81", "CNM-90", "CNM+90",
    "CNF-40", "CNF-44", "CNF-48", "CNF-52", "CNF-57", "CNF-63", "CNF-70", "CNF+70",

    "CGM-50", "CGM-55", "CGM-60", "CGM-66", "CGM-73", "CGM-81", "CGM-90", "CGM+90",
    "CGF-40", "CGF-44", "CGF-48", "CGF-52", "CGF-57", "CGF-63", "CGF-70", "CGF+70",

    "JNM-55", "JNM-60", "JNM-66", "JNM-73", "JNM-81", "JNM-90", "JNM-100", "JNM+100",
    "JNF-44", "JNF-48", "JNF-52", "JNF-57", "JNF-63", "JNF-70", "JNF-78", "JNF+78",

    "JGM-55", "JGM-60", "JGM-66", "JGM-73", "JGM-81", "JGM-90", "JGM-100", "JGM+100",
    "JGF-44", "JGF-48", "JGF-52", "JGF-57", "JGF-63", "JGF-70", "JGF-78", "JGF+78",

    "KN1M-55", "KN1M-60", "KN1M-66", "KN1M-73", "KN1M-81", "KN1M-90", "KN1M-100", "KN1M+100",
    "KN1F-44", "KN1F-48", "KN1F-52", "KN1F-57", "KN1F-63", "KN1F-70", "KN1F-78", "KN1F+78",

    "KN2M-55", "KN2M-60", "KN2M-66", "KN2M-73", "KN2M-81", "KN2M-90", "KN2M-100", "KN2M+100",
    "KN2F-44", "KN2F-48", "KN2F-52", "KN2F-57", "KN2F-63", "KN2F-70", "KN2F-78", "KN2F+78",

    "KGM-55", "KGM-60", "KGM-66", "KGM-73", "KGM-81", "KGM-90", "KGM-100", "KGM+100",
    "KGF-44", "KGF-48", "KGF-52", "KGF-57", "KGF-63", "KGF-70", "KGF-78", "KGF+78",

    "SM-60", "SM-66", "SM-73", "SM-81", "SM-90", "SM-100", "SM+100",
    "SF-48", "SF-52", "SF-57", "SF-63", "SF-70", "SF-78", "SF+78",

    "VM1-60", "VM1-66", "VM1-73", "VM1-81", "VM1-90", "VM1-100", "VM1+100",
    "VM2-60", "VM2-66", "VM2-73", "VM2-81", "VM2-90", "VM2-100", "VM2+100",
    "VM3-60", "VM3-66", "VM3-73", "VM3-81", "VM3-90", "VM3-100", "VM3+100",
    "VM4-60", "VM4-66", "VM4-73", "VM4-81", "VM4-90", "VM4-100", "VM4+100",
    "VM5-60", "VM5-66", "VM5-73", "VM5-81", "VM5-90", "VM5-100", "VM5+100",
    "VM6-60", "VM6-66", "VM6-73", "VM6-81", "VM6-90", "VM6-100", "VM6+100",
    "VM7-60", "VM7-66", "VM7-73", "VM7-81", "VM7-90", "VM7-100", "VM7+100",
    "VM8-60", "VM8-66", "VM8-73", "VM8-81", "VM8-90", "VM8-100", "VM8+100",
    "VM9-60", "VM9-66", "VM9-73", "VM9-81", "VM9-90", "VM9-100", "VM9+100",
    "VM10-60", "VM10-66", "VM10-73", "VM10-81", "VM10-90", "VM10-100", "VM10+100",
    "VM11-60", "VM11-66", "VM11-73", "VM11-81", "VM11-90", "VM11-100", "VM11+100",

    "VF1-48", "VF1-52", "VF1-57", "VF1-63", "VF1-70", "VF1-78", "VF1+78",
    "VF2-48", "VF2-52", "VF2-57", "VF2-63", "VF2-70", "VF2-78", "VF2+78",
    "VF3-48", "VF3-52", "VF3-57", "VF3-63", "VF3-70", "VF3-78", "VF3+78",
    "VF4-48", "VF4-52", "VF4-57", "VF4-63", "VF4-70", "VF4-78", "VF4+78",
    "VF5-48", "VF5-52", "VF5-57", "VF5-63", "VF5-70", "VF5-78", "VF5+78",
    "VF6-48", "VF6-52", "VF6-57", "VF6-63", "VF6-70", "VF6-78", "VF6+78",
    "VF7-48", "VF7-52", "VF7-57", "VF7-63", "VF7-70", "VF7-78", "VF7+78",
    "VF8-48", "VF8-52", "VF8-57", "VF8-63", "VF8-70", "VF8-78", "VF8+78",
    "VF9-48", "VF9-52", "VF9-57", "VF9-63", "VF9-70", "VF9-78", "VF9+78",
    "VF10-48", "VF10-52", "VF10-57", "VF10-63", "VF10-70", "VF10-78", "VF10+78",
    "VF11-48", "VF11-52", "VF11-57", "VF11-63", "VF11-70", "VF11-78", "VF11+78",
  ];

  const categorias = [
    ...new Set(
      rankingUsuarios
        .map((usuario) => usuario.categoria)
        .filter(Boolean)
    ),
  ];

  categorias.sort((a, b) => {
    const indiceA = ordenCategorias.indexOf(a);
    const indiceB = ordenCategorias.indexOf(b);

    // Las categorías que están en la lista van primero
    if (indiceA !== -1 && indiceB !== -1) {
      return indiceA - indiceB;
    }

    // Si aparece alguna categoría nueva que no está en la lista,
    // queda al final.
    if (indiceA !== -1) return -1;
    if (indiceB !== -1) return 1;

    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  filtroCategoria.innerHTML = `
    <option value="">Todas</option>
  `;

  categorias.forEach((categoria) => {
    filtroCategoria.innerHTML += `
      <option value="${categoria}">
        ${categoria}
      </option>
    `;
  });
}

function inicializarEventosRanking() {
  const searchInput = document.getElementById("searchInput");
  const filtroCategoria = document.getElementById("filtroCategoria");
  const sortDesc = document.getElementById("sortDesc");
  const sortAsc = document.getElementById("sortAsc");
  const botonesPeso = document.querySelectorAll(".peso-btn");
  const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");

  searchInput?.addEventListener("input", aplicarFiltrosRanking);
  filtroCategoria?.addEventListener("change", aplicarFiltrosRanking);

  sortDesc?.addEventListener("click", () => {
    ordenActual = "desc";

    sortDesc.classList.add("active");
    sortAsc?.classList.remove("active");

    aplicarFiltrosRanking();
  });

  sortAsc?.addEventListener("click", () => {
    ordenActual = "asc";

    sortAsc.classList.add("active");
    sortDesc?.classList.remove("active");

    aplicarFiltrosRanking();
  });

  botonesPeso.forEach((boton) => {
    boton.addEventListener("click", () => {
      sexoSeleccionado = boton.dataset.sexo || "";
      pesoSeleccionado = boton.dataset.peso || "";

      botonesPeso.forEach((btn) => btn.classList.remove("active"));
      boton.classList.add("active");

      aplicarFiltrosRanking();
    });
  });

  btnLimpiarFiltros?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    if (filtroCategoria) filtroCategoria.value = "";

    sexoSeleccionado = "";
    pesoSeleccionado = "";
    ordenActual = "desc";

    sortDesc?.classList.add("active");
    sortAsc?.classList.remove("active");

    botonesPeso.forEach((btn) => btn.classList.remove("active"));

    aplicarFiltrosRanking();
  });
}

function aplicarFiltrosRanking() {
  const searchInput = document.getElementById("searchInput");
  const filtroCategoria = document.getElementById("filtroCategoria");

  const texto = searchInput
    ? searchInput.value.toLowerCase().trim()
    : "";

  const categoria = filtroCategoria
    ? filtroCategoria.value
    : "";

  let usuariosFiltrados = [...rankingUsuarios];

  if (texto) {
    usuariosFiltrados = usuariosFiltrados.filter((usuario) => {
      const nombre = String(usuario.nombre || "").toLowerCase();
      const apellido = String(usuario.apellido || "").toLowerCase();
      const nombreCompleto = `${nombre} ${apellido}`.trim();
      const dni = String(usuario.dni || "").toLowerCase();
      const institucion = String(usuario.institucion || "").toLowerCase();

      return (
        nombre.includes(texto) ||
        apellido.includes(texto) ||
        nombreCompleto.includes(texto) ||
        dni.includes(texto) ||
        institucion.includes(texto)
      );
    });
  }

  if (categoria) {
    usuariosFiltrados = usuariosFiltrados.filter(
      (usuario) => usuario.categoria === categoria
    );
  }

  if (sexoSeleccionado) {
    usuariosFiltrados = usuariosFiltrados.filter(
      (usuario) => usuario.sexo === sexoSeleccionado
    );
  }

  if (pesoSeleccionado) {
    usuariosFiltrados = usuariosFiltrados.filter((usuario) => {
      const pesoCategoria = obtenerPesoDesdeCategoria(usuario.categoria);

      if (!pesoCategoria) return false;

      if (pesoSeleccionado.includes("+")) {
        const pesoMinimo = Number(pesoSeleccionado.replace("+", ""));
        return Number(pesoCategoria) > pesoMinimo;
      }

      return Number(pesoCategoria) === Number(pesoSeleccionado);
    });
  }

 
usuariosFiltrados.sort((a, b) => {
  const rankingA = Number(a.ranking);
  const rankingB = Number(b.ranking);

  // Primero, ordenar por posición del Excel
  if (rankingA !== rankingB) {
    if (Number.isNaN(rankingA)) return 1;
    if (Number.isNaN(rankingB)) return -1;

    return rankingA - rankingB;
  }

  // Si tienen la misma posición, ordenar por puntaje total
  return Number(b.puntos) - Number(a.puntos);
});
;

  renderizarRanking(usuariosFiltrados);
}

/*
  Celda de un torneo: posición + puntaje.
  Se usa para los 5 torneos, así no se repite el mismo HTML cinco veces.
*/
function renderizarCeldaTorneo(resultado) {
  const posicion = resultado?.posicion || "-";
  const puntaje = resultado?.puntaje ?? 0;

  return `
      <td>
        <div class="fw-semibold">
          Posición:
          ${posicion}
        </div>

        <small class="text-muted">
          Puntaje:
          ${puntaje}
        </small>
      </td>
  `;
}

function renderizarRanking(usuarios) {
  const tbody = document.getElementById("rankingBody");

  if (!tbody) return;

  if (!usuarios.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${TOTAL_COLUMNAS}">
          No hay usuarios para mostrar.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";

  usuarios.forEach((usuario) => {
    const fila = document.createElement("tr");
    const foto = obtenerFotoUsuario(usuario);

    fila.innerHTML = `
      <td class="fw-bold">
        ${usuario.ranking ?? "-"}
      </td>

      <td>
        <img
          src="${foto}"
          alt="${usuario.nombre || "Usuario"}"
          class="ranking-foto"
          onerror="this.onerror=null; this.src='/assets/imagenes/incognito.png';"
          style="
            width: 85px;
            height: 85px;
            object-fit: cover;
            border-radius: 50%;
            border: 3px solid #b30000;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          "
        >
      </td>

      <td class="fw-semibold">
        ${usuario.nombre || "-"} ${usuario.apellido || "-"}
      </td>

      <td>
        <button
          type="button"
          class="categoria-filtro-btn"
          data-categoria="${usuario.categoria || ""}"
        >
          ${usuario.categoria || "-"}
        </button>
      </td>

      <td>
        ${usuario.institucion || "-"}
      </td>

      <td class="fw-bold text-danger">
        ${usuario.puntos}
      </td>

      ${renderizarCeldaTorneo(usuario.abiertoCiudad2026)}
      ${renderizarCeldaTorneo(usuario.juegosPortenos2026)}
      ${renderizarCeldaTorneo(usuario.copaDoblas2026)}
      ${renderizarCeldaTorneo(usuario.juegosUFedem2026)}
      ${renderizarCeldaTorneo(usuario.torneoMetropolitano2026)}
    `;

    tbody.appendChild(fila);

    const botonCategoria = fila.querySelector(".categoria-filtro-btn");

    botonCategoria?.addEventListener("click", () => {
      const categoria = botonCategoria.dataset.categoria || "";

      const filtroCategoria = document.getElementById("filtroCategoria");
      const searchInput = document.getElementById("searchInput");

      if (filtroCategoria) {
        filtroCategoria.value = categoria;
      }

      if (searchInput) {
        searchInput.value = "";
      }

      aplicarFiltrosRanking();
    });
  });
}





