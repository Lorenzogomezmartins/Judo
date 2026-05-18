const API_USUARIOS = "/api/usuarios";

let rankingUsuarios = [];
let ordenActual = "desc";
let sexoSeleccionado = "";
let pesoSeleccionado = "";

export async function cargarRankingUsuarios() {
  const tbody = document.getElementById("rankingBody");

  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="6">Cargando ranking...</td>
    </tr>
  `;

  try {
    const response = await fetch(API_USUARIOS);
    const usuarios = await response.json();

    if (!response.ok) {
      throw new Error("Error al obtener usuarios");
    }

    if (!Array.isArray(usuarios)) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">Error en el formato de usuarios.</td>
        </tr>
      `;
      return;
    }

    rankingUsuarios = usuarios.map((usuario) => ({
      ...usuario,
      puntos: obtenerPuntosUsuario(usuario),
    }));

    cargarCategoriasRanking();
    inicializarEventosRanking();
    aplicarFiltrosRanking();

  } catch (error) {
    console.error("Error cargando ranking:", error);

    tbody.innerHTML = `
      <tr>
        <td colspan="6">Error al cargar ranking.</td>
      </tr>
    `;
  }
}

function obtenerPuntosUsuario(usuario) {
  return Number(usuario.Puntos ?? usuario.puntos ?? 0);
}

function obtenerFotoUsuario(usuario) {
  return usuario.ft || "/assets/imagenes/default.png";
}

function cargarCategoriasRanking() {
  const filtroCategoria = document.getElementById("filtroCategoria");

  if (!filtroCategoria) return;

  const categorias = [
    "senior",
    "cadete",
    "junior",
    "infantil-b",
  ];

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

  // BUSCADOR
  if (texto) {
    usuariosFiltrados = usuariosFiltrados.filter((usuario) => {
      const nombre = String(usuario.nombre || "").toLowerCase();

      const apellido = String(usuario.apellido || "").toLowerCase();

      const nombreCompleto =
        `${nombre} ${apellido}`.trim();

      const dni = String(usuario.dni || "").toLowerCase();

      return (
        nombre.includes(texto) ||
        apellido.includes(texto) ||
        nombreCompleto.includes(texto) ||
        dni.includes(texto)
      );
    });
  }

  // CATEGORÍA
  if (categoria) {
    usuariosFiltrados = usuariosFiltrados.filter(
      (usuario) => usuario.clasificacion === categoria
    );
  }

  // SEXO - filtra, pero no se muestra
  if (sexoSeleccionado) {
    usuariosFiltrados = usuariosFiltrados.filter(
      (usuario) => usuario.sexo === sexoSeleccionado
    );
  }

  // PESO - filtra, pero no se muestra como columna nueva
  if (pesoSeleccionado) {
    usuariosFiltrados = usuariosFiltrados.filter((usuario) => {
      const pesoUsuario = Number(usuario.peso);

      if (!pesoUsuario) return false;

      if (pesoSeleccionado.includes("+")) {
        const pesoMinimo = Number(pesoSeleccionado.replace("+", ""));
        return pesoUsuario > pesoMinimo;
      }

      return pesoUsuario <= Number(pesoSeleccionado);
    });
  }

  // ORDEN
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
        <td colspan="6">
          No hay usuarios para mostrar.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";

  usuarios.forEach((usuario, index) => {
    const fila = document.createElement("tr");

    const foto = obtenerFotoUsuario(usuario);

    fila.innerHTML = `
      <td class="fw-bold">
        ${index + 1}
      </td>

      <td>
        <img
          src="${foto}"
          alt="${usuario.nombre || "Usuario"}"
          class="ranking-foto"
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
        ${usuario.clasificacion || "-"}
      </td>

      <td>
        ${usuario.peso || "-"} kg
      </td>

      <td class="fw-bold text-danger">
        ${usuario.puntos}
      </td>
    `;

    tbody.appendChild(fila);
  });
}