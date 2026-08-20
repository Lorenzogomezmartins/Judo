const API_RANKING = "/api/ranking";

let rankingUsuarios = [];
let ordenActual = "desc";
let sexoSeleccionado = "";
let pesoSeleccionado = "";

export async function cargarRankingUsuarios() {
  const tbody = document.getElementById("rankingBody");

  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="9">Cargando ranking...</td>
    </tr>
  `;

  try {
    const response = await fetch(API_RANKING);
    const usuarios = await response.json();

    if (!response.ok) {
      throw new Error("Error al obtener ranking");
    }

    if (!Array.isArray(usuarios)) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9">Error en el formato del ranking.</td>
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
        <td colspan="9">Error al cargar ranking.</td>
      </tr>
    `;
  }
}

const FOTO_INCOGNITO = "/assets/imagenes/incognito.png";

function obtenerFotoUsuario(usuario) {
  const foto = String(usuario?.foto || "").trim();

  if (!foto) {
    return FOTO_INCOGNITO;
  }

  // Cloudinary o cualquier URL externa
  if (
    foto.startsWith("http://") ||
    foto.startsWith("https://")
  ) {
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

  const categorias = [
    ...new Set(
      rankingUsuarios
        .map((usuario) => usuario.categoria)
        .filter(Boolean)
    ),
  ];

  categorias.sort((a, b) =>
    a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );

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

  searchInput?.addEventListener("input", aplicarFiltrosRanking);
  filtroCategoria?.addEventListener("change", aplicarFiltrosRanking);

  sortDesc?.addEventListener("click", () => {
    ordenActual = "desc";
    aplicarFiltrosRanking();
  });

  sortAsc?.addEventListener("click", () => {
    ordenActual = "asc";
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
    return ordenActual === "asc"
      ? a.puntos - b.puntos
      : b.puntos - a.puntos;
  });

  renderizarRanking(usuariosFiltrados);
}

function renderizarRanking(usuarios) {
  const tbody = document.getElementById("rankingBody");

  if (!tbody) return;

  if (!usuarios.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
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
    ${usuarios.indexOf(usuario) + 1}
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
  ${usuario.categoria || "-"}
</td>

<td>
  ${usuario.institucion || "-"}
</td>

<td>
  <div class="fw-semibold">
    Posición:
    ${usuario.abiertoCiudad2026?.posicion || "-"}
  </div>

  <small class="text-muted">
    Puntaje:
    ${usuario.abiertoCiudad2026?.puntaje ?? 0}
  </small>
</td>

<td>
  <div class="fw-semibold">
    Posición:
    ${usuario.copaDoblas2026?.posicion || "-"}
  </div>

  <small class="text-muted">
    Puntaje:
    ${usuario.copaDoblas2026?.puntaje ?? 0}
  </small>
</td>

<td>
  <div class="fw-semibold">
    Posición:
    ${usuario.torneoMetropolitano2026?.posicion || "-"}
  </div>

  <small class="text-muted">
    Puntaje:
    ${usuario.torneoMetropolitano2026?.puntaje ?? 0}
  </small>
</td>

<td class="fw-bold text-danger">
  ${usuario.puntos}
</td>
`;

tbody.appendChild(fila);
});
}