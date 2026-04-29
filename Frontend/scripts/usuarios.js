const API_USUARIOS = "/api/usuarios";

let rankingUsuarios = [];

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

    console.log("USUARIOS RANKING:", usuarios);

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

    ordenarRanking("desc");
    inicializarEventosRanking();

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

function inicializarEventosRanking() {
  const filtroRanking = document.getElementById("filtroRanking");
  const ordenRanking = document.getElementById("ordenRanking");

  if (filtroRanking) {
    filtroRanking.addEventListener("input", () => {
      aplicarFiltrosRanking();
    });
  }

  if (ordenRanking) {
    ordenRanking.addEventListener("change", () => {
      aplicarFiltrosRanking();
    });
  }
}

function aplicarFiltrosRanking() {
  const filtroRanking = document.getElementById("filtroRanking");
  const ordenRanking = document.getElementById("ordenRanking");

  const texto = filtroRanking
    ? filtroRanking.value.toLowerCase().trim()
    : "";

  const orden = ordenRanking
    ? ordenRanking.value
    : "desc";

  let usuariosFiltrados = [...rankingUsuarios];

  if (texto) {
    usuariosFiltrados = usuariosFiltrados.filter((usuario) => {
      const nombreCompleto = `${usuario.nombre || ""} ${usuario.apellido || ""}`.toLowerCase();
      const dni = String(usuario.dni || "").toLowerCase();
      const email = String(usuario.email || "").toLowerCase();
      const clasificacion = String(usuario.clasificacion || "").toLowerCase();

      return (
        nombreCompleto.includes(texto) ||
        dni.includes(texto) ||
        email.includes(texto) ||
        clasificacion.includes(texto)
      );
    });
  }

  usuariosFiltrados.sort((a, b) => {
    return orden === "asc"
      ? a.puntos - b.puntos
      : b.puntos - a.puntos;
  });

  renderizarRanking(usuariosFiltrados);
}

function ordenarRanking(orden = "desc") {
  rankingUsuarios.sort((a, b) => {
    return orden === "asc"
      ? a.puntos - b.puntos
      : b.puntos - a.puntos;
  });

  renderizarRanking(rankingUsuarios);
}

function renderizarRanking(usuarios) {
  const tbody = document.getElementById("rankingBody");

  if (!tbody) return;

  if (!usuarios.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">No hay usuarios para mostrar.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";

  usuarios.forEach((usuario, index) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${index + 1}</td>
      <td>${usuario.nombre || "-"}</td>
      <td>${usuario.apellido || "-"}</td>
      <td>${usuario.dni || "-"}</td>
      <td>${usuario.clasificacion || "-"}</td>
      <td>${usuario.puntos}</td>
    `;

    tbody.appendChild(fila);
  });
}