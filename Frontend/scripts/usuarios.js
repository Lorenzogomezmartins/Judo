const API_USUARIOS = "http://localhost:3000/api/usuarios";

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
        <td colspan="6">Error al cargar el ranking.</td>
      </tr>
    `;
  }
}

function inicializarEventosRanking() {
  document.getElementById("searchInput")?.addEventListener("input", filtrarRanking);
  document.getElementById("sortDesc")?.addEventListener("click", () => ordenarRanking("desc"));
  document.getElementById("sortAsc")?.addEventListener("click", () => ordenarRanking("asc"));
}

function obtenerPuntosUsuario(usuario) {
  const puntosDirectos =
    usuario.Puntos ??
    usuario.puntos ??
    usuario.puntaje ??
    null;

  if (puntosDirectos !== null && puntosDirectos !== undefined) {
    return Number(puntosDirectos) || 0;
  }

  return calcularPuntos(usuario.historialTorneos);
}

function calcularPuntos(historialTorneos = []) {
  if (!Array.isArray(historialTorneos)) return 0;

  return historialTorneos.reduce((total, item) => {
    return total + Number(item.puntos || 0);
  }, 0);
}

function renderRanking(usuarios) {
  const tbody = document.getElementById("rankingBody");

  if (!tbody) return;

  if (!usuarios.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">No hay judokas aprobados para mostrar.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";

  usuarios.forEach((usuario, index) => {
    const nombreCompleto = `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim();
    const fotoUrl = obtenerFotoUsuario(usuario);
    const puntos = obtenerPuntosUsuario(usuario);

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${index + 1}</td>

      <td>
        <img
          src="${fotoUrl}"
          alt="${nombreCompleto || "Judoka"}"
          style="width: 52px; height: 52px; object-fit: cover; border-radius: 50%; border: 2px solid #dc3545;"
          onerror="this.src='../assets/Logos/Logo1.png'"
        >
      </td>

      <td>
        <strong>${nombreCompleto || "-"}</strong>
        <br>
        <small class="text-muted">DNI: ${usuario.dni || "-"}</small>
      </td>

      <td>${formatearClasificacion(usuario.clasificacion)}</td>
      <td>${usuario.peso ? `${usuario.peso} kg` : "-"}</td>
      <td><strong>${puntos}</strong></td>
    `;

    tbody.appendChild(tr);
  });
}

function obtenerFotoUsuario(usuario) {
  return (
    usuario.ft ||
    usuario.foto ||
    usuario.imagen ||
    usuario.fotoUrl ||
    usuario.foto_url ||
    "../assets/Logos/Logo1.png"
  );
}

function filtrarRanking() {
  const texto = document.getElementById("searchInput")?.value.toLowerCase().trim() || "";

  const filtrados = rankingUsuarios.filter((usuario) => {
    const nombreCompleto = `${usuario.nombre || ""} ${usuario.apellido || ""}`.toLowerCase();
    const dni = String(usuario.dni || "").toLowerCase();
    const email = String(usuario.email || "").toLowerCase();

    return (
      nombreCompleto.includes(texto) ||
      dni.includes(texto) ||
      email.includes(texto)
    );
  });

  renderRanking(filtrados);
}

function ordenarRanking(tipo) {
  const copia = [...rankingUsuarios];

  copia.sort((a, b) => {
    const puntosA = obtenerPuntosUsuario(a);
    const puntosB = obtenerPuntosUsuario(b);

    return tipo === "asc" ? puntosA - puntosB : puntosB - puntosA;
  });

  rankingUsuarios = copia;
  renderRanking(rankingUsuarios);
}

function formatearClasificacion(clasificacion = "") {
  switch (clasificacion) {
    case "senior":
      return "Senior";
    case "cadete":
      return "Cadete";
    case "junior":
      return "Junior";
    case "infantil-b":
      return "Infantil B";
    default:
      return "-";
  }
}