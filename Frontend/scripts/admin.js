const API_URL = "/api/clubes";
const API_PATROCINADORES = "/api/patrocinadores";
const API_TORNEOS = "/api/torneos";
const BACKEND_URL = "";
const API_PROFESORES = "/api/profesores";
const API_VERIFICAR_ADMIN = "/api/admin/verificar";
const API_RANKING = "/api/ranking";
const API_GALERIA = "/api/galeria";

// ============================
// SEGURIDAD ADMIN
// ============================

function tokenExpirado(token) {
  try {
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(atob(payloadBase64));
    const ahora = Math.floor(Date.now() / 1000);

    return payload.exp < ahora;
  } catch (error) {
    return true;
  }
}

function obtenerTokenAdmin() {
  return localStorage.getItem("tokenAdmin");
}

function limpiarSesionAdmin() {
  localStorage.removeItem("tokenAdmin");
  localStorage.removeItem("adminData");
}

function redirigirLogin() {
  limpiarSesionAdmin();
  window.location.href = "../partials/loginAdmin.html";
}

function protegerAdmin() {
  const token = obtenerTokenAdmin();

  if (!token || tokenExpirado(token)) {
    redirigirLogin();
    return false;
  }

  return true;
}

function getAuthHeaders(extra = {}) {
  const token = obtenerTokenAdmin();

  return {
    Authorization: `Bearer ${token}`,
    ...extra
  };
}

async function verificarAccesoAdminBackend() {
  try {
    const response = await fetch(API_VERIFICAR_ADMIN, {
      method: "GET",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      redirigirLogin();
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error verificando acceso admin:", error);
    redirigirLogin();
    return false;
  }
}

async function fetchProtegido(url, options = {}) {
  const token = obtenerTokenAdmin();

  if (!token || tokenExpirado(token)) {
    redirigirLogin();
    throw new Error("Sesión vencida");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 401 || response.status === 403) {
    redirigirLogin();
    throw new Error("No autorizado");
  }

  return response;
}

if (!protegerAdmin()) {
  throw new Error("Acceso no autorizado");
}

document.addEventListener("DOMContentLoaded", async () => {
  const accesoValido = await verificarAccesoAdminBackend();
  if (!accesoValido) return;

  cargarClubesAdmin();
  cargarPatrocinadoresAdmin();
  cargarProfesoresAdmin();
  cargarTorneosAdmin();
  cargarInscripcionesAdmin();

  const btnImportarInscripciones = document.getElementById("btnImportarInscripciones");

  if (btnImportarInscripciones) {
    btnImportarInscripciones.addEventListener("click", importarInscripcionesSheets);
  }

  // ============================
  // LOGOUT
  // ============================
  const btnLogout = document.querySelector(".navbar .btn.btn-outline-light");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      limpiarSesionAdmin();
      window.location.href = "../partials/loginAdmin.html";
    });
  }

  // ============================
  // CLUBES
  // ============================
  const btnNuevoClub = document.getElementById("btnNuevoClub");
  if (btnNuevoClub) {
    btnNuevoClub.addEventListener("click", abrirFormulario);
  }

  const btnCancelarClub = document.getElementById("btnCancelarClub");
  if (btnCancelarClub) {
    btnCancelarClub.addEventListener("click", cerrarFormulario);
  }

  const formClub = document.getElementById("formClub");
  if (formClub) {
    formClub.addEventListener("submit", guardarClub);
  }

  const filtroClubes = document.getElementById("filtroClubes");
  if (filtroClubes) {
    filtroClubes.addEventListener("input", () => {
      cargarClubesAdmin(filtroClubes.value);
    });
  }

  // ============================
  // PATROCINADORES
  // ============================
  const btnNuevoPatrocinador = document.getElementById("btnNuevoPatrocinador");
  if (btnNuevoPatrocinador) {
    btnNuevoPatrocinador.addEventListener("click", abrirFormularioPatrocinador);
  }

  const btnCancelarPatrocinador = document.getElementById("btnCancelarPatrocinador");
  if (btnCancelarPatrocinador) {
    btnCancelarPatrocinador.addEventListener("click", cerrarFormularioPatrocinador);
  }

  const formPatrocinador = document.getElementById("formPatrocinador");
  if (formPatrocinador) {
    formPatrocinador.addEventListener("submit", guardarPatrocinador);
  }

  const filtroPatrocinadores = document.getElementById("filtroPatrocinadores");
  if (filtroPatrocinadores) {
    filtroPatrocinadores.addEventListener("input", (e) => {
      cargarPatrocinadoresAdmin(e.target.value);
    });
  }

  // ============================
  // PROFESORES
  // ============================
  const btnNuevoProfesorr = document.getElementById("btnNuevoProfesorr");
  if (btnNuevoProfesorr) {
    btnNuevoProfesorr.addEventListener("click", abrirFormularioProfesor);
  }

  const btnCancelarProfesor = document.getElementById("btnCancelarProfesor");
  if (btnCancelarProfesor) {
    btnCancelarProfesor.addEventListener("click", cerrarFormularioProfesor);
  }

  const formProfesor = document.getElementById("formProfesor");
  if (formProfesor) {
    formProfesor.addEventListener("submit", guardarProfesor);
  }

  const filtroProfesores = document.getElementById("filtroProfesores");
  if (filtroProfesores) {
    filtroProfesores.addEventListener("input", (e) => {
      cargarProfesoresAdmin(e.target.value);
    });
  }
  // ============================
  // TORNEOS
  // ============================
  const filtroTorneos = document.getElementById("filtroTorneos");
  if (filtroTorneos) {
    filtroTorneos.addEventListener("input", (e) => {
      cargarTorneosAdmin(e.target.value);
    });
  }
});


document.addEventListener("click", async (e) => {
  if (e.target.id !== "btn-importar-profesores") return;

  const confirmar = confirm(
    "¿Querés importar los profesores desde Google Sheets?"
  );

  if (!confirmar) return;

  try {
    const respuesta = await fetchProtegido(
      "/api/profesores/importar-sheets",
      {
        method: "POST",
      }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.error || resultado.mensaje
      );
    }

    alert(
      `Importación terminada.\n\n` +
      `Creados: ${resultado.creados}\n` +
      `Actualizados: ${resultado.actualizados}\n` +
      `Errores: ${JSON.stringify(resultado.errores, null, 2)}`
    );

    // Volver a cargar profesores
    if (typeof cargarProfesores === "function") {
      await cargarProfesores();
    }
  } catch (error) {
    console.error(error);
    alert(
      "Error importando profesores: " +
      error.message
    );
  }
});
 // ============================
  // GALERIA
  // ============================
cargarGaleriaAdmin();

const btnNuevaFotoGaleria = document.getElementById("btnNuevaFotoGaleria");
if (btnNuevaFotoGaleria) {
  btnNuevaFotoGaleria.addEventListener("click", abrirFormularioGaleria);
}

const btnCancelarGaleria = document.getElementById("btnCancelarGaleria");
if (btnCancelarGaleria) {
  btnCancelarGaleria.addEventListener("click", cerrarFormularioGaleria);
}

const formGaleria = document.getElementById("formGaleria");
if (formGaleria) {
  formGaleria.addEventListener("submit", guardarFotoGaleria);
}

const filtroGaleria = document.getElementById("filtroGaleria");
if (filtroGaleria) {
  filtroGaleria.addEventListener("input", (e) => {
    cargarGaleriaAdmin(e.target.value);
  });
}
/* ============================= 
   CLUBES
============================= */


async function importarClubesSheets() {
  if (!confirm("¿Querés importar los clubes desde Google Sheets?")) {
    return;
  }

  const boton = document.getElementById("btnImportarClubes");

  try {
    if (boton) {
      boton.disabled = true;
      boton.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2"></span>
        Importando...
      `;
    }

    const response = await fetchProtegido(
      `${API_CLUBES}/importar`,
      {
        method: "POST",
      }
    );

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(
        resultado.mensaje ||
        resultado.error ||
        "Error importando clubes"
      );
    }

    let mensaje = `${resultado.mensaje}\n\n`;

    mensaje += `Creados: ${resultado.creados ?? 0}\n`;
    mensaje += `Actualizados: ${resultado.actualizados ?? 0}\n`;
    mensaje += `Sin cambios: ${resultado.sinCambios ?? 0}\n`;
    mensaje += `Sin nombre: ${resultado.omitidosSinNombre ?? 0}\n`;
    mensaje += `Duplicados: ${resultado.erroresDuplicados ?? 0}\n`;
    mensaje += `Errores: ${resultado.errores?.length ?? 0}`;

    alert(mensaje);

    await cargarClubesAdmin();

  } catch (error) {
    console.error("Error importando clubes:", error);
    alert("Error importando clubes: " + error.message);

  } finally {
    if (boton) {
      boton.disabled = false;
      boton.innerHTML = `
        <i class="bi bi-cloud-download"></i>
        Importar desde Google Sheets
      `;
    }
  }
}
/* CARGAR CLUBES*/
async function cargarClubesAdmin(filtroNombre = "") { 
  const container = document.getElementById("clubesGrid");
  if (!container) return;

  container.innerHTML = "<p>Cargando clubes...</p>";

  try {
    const response = await fetch(API_URL);
    let clubes = await response.json();

    // Filtrar por nombre si hay texto
    if (filtroNombre) {
      const texto = filtroNombre.toLowerCase();
      clubes = clubes.filter(c => c.nombre.toLowerCase().includes(texto));
    }

    if (!clubes.length) {
      container.innerHTML = "<p>No hay clubes registrados.</p>";
      return;
    }

    container.innerHTML = "";

    clubes.forEach(club => {
  const logoUrl = club.logo || "/assets/imagenes/default.png";

      const webOriginal = club.sitioWeb || "";
      const webUrl = webOriginal
        ? (webOriginal.startsWith("http") ? webOriginal : "https://" + webOriginal)
        : null;

      const row = document.createElement("div");
      row.classList.add("club-admin-row");

      row.innerHTML = `
        <div class="club-admin-logo">
          <img src="${logoUrl}" alt="${club.nombre}">
        </div>

        <div class="club-col">${club.nombre || "-"}</div>
        <div class="club-col">${club.telefono || "-"}</div>
        <div class="club-col">${club.direccion || "-"}</div>
        <div class="club-col">
          ${webUrl ? `<a href="${webUrl}" target="_blank" rel="noopener noreferrer">${webOriginal}</a>` : "-"}
        </div>

        <div class="club-admin-actions d-flex gap-2 align-items-center">
          <button 
            class="btn btn-outline-primary btn-sm"
            onclick="editarClub('${club._id}')">
            <i class="bi bi-pencil"></i>
          </button>

          <button 
            class="btn btn-outline-danger btn-sm" 
            onclick="eliminarClub('${club._id}')">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;

      container.appendChild(row);
    });

  } catch (error) {
    console.error("Error cargando clubes:", error);
    container.innerHTML = "<p>Error al cargar clubes.</p>";
  }
}

/* ELIMINAR CLUBES*/
async function eliminarClub(id) {
  if (!confirm("¿Seguro que querés eliminar este club?")) return;

  try {
    const response = await fetchProtegido(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || "Error al eliminar");
    }

    alert("Club eliminado correctamente");
    cargarClubesAdmin();

  } catch (error) {
    console.error("Error eliminando club:", error);
    alert("No se pudo eliminar el club.");
  }
}

/* CARGAR CLUBES*/
function abrirFormulario() {
  const container = document.getElementById("formClubContainer");
  container.style.display = "block";
  container.scrollIntoView({ behavior: "smooth" });
  document.getElementById("formClub").reset();
  document.getElementById("clubId").value = "";
}

function cerrarFormulario() {
  const container = document.getElementById("formClubContainer");
  container.style.display = "none";
}

/* GUARDAR CLUBES*/
async function guardarClub(e) {
  e.preventDefault();

  const id = document.getElementById("clubId").value.trim();
  const nombre = document.getElementById("clubNombre").value.trim();
  const telefono = document.getElementById("clubTelefono").value.trim();
  const direccion = document.getElementById("clubDireccion").value.trim();
  const sitioWeb = document.getElementById("clubWeb").value.trim();
  const logoInput = document.getElementById("clubLogo");

  const formData = new FormData();
  formData.append("nombre", nombre);
  formData.append("telefono", telefono);
  formData.append("direccion", direccion);
  formData.append("sitioWeb", sitioWeb);

  if (logoInput.files.length > 0) {
    formData.append("logo", logoInput.files[0]);
  }

  try {
    let response;

    if (id) {
      response = await fetchProtegido(`${API_URL}/${id}`, {
        method: "PUT",
        body: formData
      });
    } else {
      response = await fetchProtegido(API_URL, {
        method: "POST",
        body: formData
      });
    }

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(resultado.mensaje || "Error guardando club");
    }

    document.getElementById("clubId").value = "";

    const form = document.getElementById("formClub");
    if (form) form.reset();

    cerrarFormulario();
    cargarClubesAdmin();

  } catch (error) {
    console.error("Error guardando club:", error);
    alert("Error: " + error.message);
  }
}

/* EDITAR CLUBES*/
async function editarClub(id) {
  try {
    const response = await fetch(`${API_URL}`);
    const clubes = await response.json();

    const club = clubes.find(c => c._id === id);
    if (!club) {
      alert("Club no encontrado");
      return;
    }

    abrirFormulario();

    document.getElementById("clubId").value = club._id;
    document.getElementById("clubNombre").value = club.nombre || "";
    document.getElementById("clubTelefono").value = club.telefono || "";
    document.getElementById("clubDireccion").value = club.direccion || "";
    document.getElementById("clubWeb").value = club.sitioWeb || "";

  } catch (error) {
    console.error("Error cargando club para editar:", error);
  }
}

/* ============================= 
   PATROCINADORES
============================= */
/* CARGAR PATROCINADORES*/
async function cargarPatrocinadoresAdmin(filtroNombre = "") {
  const container = document.getElementById("patrocinadoresGrid");
  if (!container) return;

  container.innerHTML = "<p>Cargando patrocinadores...</p>";

  try {
    const response = await fetch(API_PATROCINADORES);
    let patrocinadores = await response.json();

    if (filtroNombre) {
      const texto = filtroNombre.toLowerCase();
      patrocinadores = patrocinadores.filter(p =>
        p.nombre.toLowerCase().includes(texto)
      );
    }

    if (!patrocinadores.length) {
      container.innerHTML = "<p>No hay patrocinadores registrados.</p>";
      return;
    }

    container.innerHTML = "";

    patrocinadores.forEach(patrocinador => {
  const logoUrl = patrocinador.logo || "/assets/imagenes/default.png";

      const webOriginal = patrocinador.sitioWeb || "";
      const webUrl = webOriginal
        ? (webOriginal.startsWith("http")
            ? webOriginal
            : "https://" + webOriginal)
        : null;

      const row = document.createElement("div");
      row.classList.add("club-admin-row");

      row.innerHTML = `
        <div class="club-admin-logo">
          <img src="${logoUrl}" alt="${patrocinador.nombre}">
        </div>

        <div class="club-col">${patrocinador.nombre || "-"}</div>
        <div class="club-col">${patrocinador.contacto || "-"}</div>
        <div class="club-col">
          ${webUrl
            ? `<a href="${webUrl}" target="_blank" rel="noopener noreferrer">${webOriginal}</a>`
            : "-"}
        </div>

        <div class="club-admin-actions d-flex gap-2 align-items-center">
          <button 
            class="btn btn-outline-primary btn-sm"
            onclick="editarPatrocinador('${patrocinador._id}')">
            <i class="bi bi-pencil"></i>
          </button>

          <button 
            class="btn btn-outline-danger btn-sm" 
            onclick="eliminarPatrocinador('${patrocinador._id}')">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;

      container.appendChild(row);
    });

  } catch (error) {
    console.error("Error cargando patrocinadores:", error);
    container.innerHTML = "<p>Error al cargar patrocinadores.</p>";
  }
}

/* AGREGAR PATROCINADORES*/
const formContainer = document.getElementById("formPatrocinadorContainer");
const btnNuevoPatrocinador = document.getElementById("btnNuevoPatrocinador");
const btnCancelarPatrocinador = document.getElementById("btnCancelarPatrocinador");
const inputFiltroPatrocinadores = document.getElementById("filtroPatrocinadores");

// Mostrar formulario 
btnNuevoPatrocinador.addEventListener("click", () => {
  formContainer.style.display = "block";
  formPatrocinador.reset();
  document.getElementById("patrocinadorId").value = "";
});

// Cancelar formulario
btnCancelarPatrocinador.addEventListener("click", () => {
  formContainer.style.display = "none";
  formPatrocinador.reset();
  document.getElementById("patrocinadorId").value = "";
});

// Enviar formulario (CREATE + UPDATE)


// Filtrar patrocinadores 
if (inputFiltroPatrocinadores) {
  inputFiltroPatrocinadores.addEventListener("input", (e) => {
    const texto = e.target.value.trim();
    cargarPatrocinadoresAdmin(texto);
  });
}

/* ELIMINAR PATROCINADORES*/
async function eliminarPatrocinador(id) {
  if (!confirm("¿Seguro que querés eliminar este patrocinador?")) {
    return;
  }

  try {
    const response = await fetchProtegido(`${API_PATROCINADORES}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Error al eliminar");
    }

    alert("Patrocinador eliminado correctamente");
    cargarPatrocinadoresAdmin();

  } catch (error) {
    console.error("Error eliminando:", error);
    alert("Error al eliminar patrocinador");
  }
}

/* ACTUALIZAR PATROCINADORES*/
async function editarPatrocinador(id) {
  try {
    const response = await fetch(`${API_PATROCINADORES}/${id}`);
    const patrocinador = await response.json();

    document.getElementById("patrocinadorId").value = patrocinador._id;
    document.getElementById("patrocinadorNombre").value = patrocinador.nombre || "";
    document.getElementById("patrocinadorContacto").value = patrocinador.contacto || "";
    document.getElementById("patrocinadorWeb").value = patrocinador.sitioWeb || "";

    formContainer.style.display = "block";

  } catch (error) {
    console.error("Error cargando patrocinador:", error);
    alert("Error al cargar patrocinador");
  }
}

function abrirFormularioPatrocinador() {
  if (!formContainer || !formPatrocinador) return;

  formContainer.style.display = "block";
  formPatrocinador.reset();
  document.getElementById("patrocinadorId").value = "";
}

function cerrarFormularioPatrocinador() {
  if (!formContainer || !formPatrocinador) return;

  formContainer.style.display = "none";
  formPatrocinador.reset();
  document.getElementById("patrocinadorId").value = "";
}

async function guardarPatrocinador(e) {
  e.preventDefault();

  const id = document.getElementById("patrocinadorId").value.trim();
  const nombre = document.getElementById("patrocinadorNombre").value.trim();
  const contacto = document.getElementById("patrocinadorContacto").value.trim();
  const sitioWeb = document.getElementById("patrocinadorWeb").value.trim();
  const logoFile = document.getElementById("patrocinadorLogo").files[0];

  if (!nombre) {
    alert("El nombre es obligatorio");
    return;
  }

  const formData = new FormData();
  formData.append("nombre", nombre);
  formData.append("contacto", contacto);
  formData.append("sitioWeb", sitioWeb);

  if (logoFile) {
    formData.append("logo", logoFile);
  }

  try {
    const url = id
      ? `${API_PATROCINADORES}/${id}`
      : API_PATROCINADORES;

    const method = id ? "PUT" : "POST";

    const response = await fetchProtegido(url, {
      method,
      body: formData
    });

    if (!response.ok) {
      throw new Error("Error al guardar patrocinador");
    }

    alert(
      id
        ? "Patrocinador actualizado correctamente"
        : "Patrocinador creado correctamente"
    );

    formContainer.style.display = "none";
    formPatrocinador.reset();
    document.getElementById("patrocinadorId").value = "";

    cargarPatrocinadoresAdmin();

  } catch (error) {
    console.error("Error:", error);
    alert("Error al guardar patrocinador");
  }
}

/* ============================= 
   PROFESORES
============================= */
/* =========================================================
   PROFESORES Y AUTORIDADES
========================================================= */

/* CARGAR PROFESORES */

async function cargarProfesoresAdmin(filtroNombre = "") {
  const container = document.getElementById("profesoresGrid");

  if (!container) return;

  container.innerHTML = "<p>Cargando profesores...</p>";

  try {
    const response = await fetch(API_PROFESORES);

    if (!response.ok) {
      throw new Error("Error al cargar profesores");
    }

    let profesores = await response.json();

    if (filtroNombre) {
      const texto = filtroNombre.toLowerCase();

      profesores = profesores.filter((p) =>
        p.nombre.toLowerCase().includes(texto) ||
        p.apellido.toLowerCase().includes(texto)
      );
    }

    if (!profesores.length) {
      container.innerHTML = "<p>No hay profesores o autoridades registrados.</p>";
      return;
    }

    container.innerHTML = "";

    profesores.forEach((profesor) => {
      const fotoUrl =
        profesor.foto ||
        "/assets/imagenes/default.png";

      const rol =
        profesor.rol === "autoridad"
          ? "autoridad"
          : "profesor";

      const rolTexto =
        rol === "autoridad"
          ? "Autoridad"
          : "Profesor";

      const row = document.createElement("div");

      row.classList.add("club-admin-row");

      row.innerHTML = `
        <div class="club-admin-logo">
          <img
            src="${fotoUrl}"
            alt="${profesor.nombre}"
          >
        </div>

        <div class="club-col">
          ${profesor.nombre || "-"}
        </div>

        <div class="club-col">
          ${profesor.apellido || "-"}
        </div>

        <div class="club-col">
          ${profesor.club || "-"}
        </div>

        <div class="club-col">
          <span class="badge ${
            rol === "autoridad"
              ? "text-bg-danger"
              : "text-bg-secondary"
          }">
            ${rolTexto}
          </span>
        </div>

        <div class="club-admin-actions d-flex gap-2 align-items-center">

          <button
            class="btn btn-outline-primary btn-sm"
            onclick="editarProfesor('${profesor._id}')"
          >
            <i class="bi bi-pencil"></i>
          </button>

          <button
            class="btn btn-outline-danger btn-sm"
            onclick="eliminarProfesor('${profesor._id}')"
          >
            <i class="bi bi-trash"></i>
          </button>

        </div>
      `;

      container.appendChild(row);
    });

  } catch (error) {
    console.error("Error cargando profesores:", error);

    container.innerHTML =
      "<p>Error al cargar profesores.</p>";
  }
}


/* =========================================================
   ABRIR / CERRAR FORMULARIO
========================================================= */

function abrirFormularioProfesor() {
  const container =
    document.getElementById("formProfesorContainer");

  container.style.display = "block";

  document.getElementById("formProfesor").reset();

  document.getElementById("profesorId").value = "";

  document.getElementById("profesorRol").value =
    "profesor";
}


function cerrarFormularioProfesor() {
  const container =
    document.getElementById("formProfesorContainer");

  container.style.display = "none";
}


/* =========================================================
   GUARDAR PROFESOR / AUTORIDAD
========================================================= */

async function guardarProfesor(e) {
  e.preventDefault();

  const id =
    document.getElementById("profesorId").value.trim();

  const nombre =
    document.getElementById("profesorNombre").value.trim();

  const apellido =
    document.getElementById("profesorApellido").value.trim();

  const rol =
    document.getElementById("profesorRol").value;

  const club =
    document.getElementById("profesorClub").value.trim();

  const descripcion =
    document.getElementById("profesorDescripcion").value.trim();

  const fotoInput =
    document.getElementById("profesorFoto");

  const cvInput =
    document.getElementById("profesorCv");


  /* CAPACITACIONES */

  const capacitacionesTexto =
    document
      .getElementById("profesorCapacitaciones")
      .value
      .trim();

  const capacitaciones = capacitacionesTexto
    ? capacitacionesTexto
        .split("\n")
        .map((linea) => {
          const [
            titulo,
            clubCapacitacion,
            fecha,
            descripcionCapacitacion,
          ] = linea
            .split("|")
            .map((valor) => valor.trim());

          return {
            titulo,
            club: clubCapacitacion,
            fecha,
            descripcion: descripcionCapacitacion,
          };
        })
        .filter(
          (capacitacion) =>
            capacitacion.titulo &&
            capacitacion.club
        )
    : [];


  /* VALIDACIONES */

  if (!nombre || !apellido) {
    alert("Nombre y apellido son obligatorios");
    return;
  }

  if (
    rol !== "profesor" &&
    rol !== "autoridad"
  ) {
    alert("Seleccioná un tipo válido");
    return;
  }


  try {

    /* EVITAR DUPLICADOS */

    if (!id) {
      const responseProfesores =
        await fetch(API_PROFESORES);

      const profesores =
        await responseProfesores.json();

      const existe = profesores.find(
        (p) =>
          p.nombre.toLowerCase() ===
            nombre.toLowerCase() &&
          p.apellido.toLowerCase() ===
            apellido.toLowerCase()
      );

      if (existe) {
        alert(
          "Ya existe una persona registrada con ese nombre y apellido"
        );

        return;
      }
    }


    /* FORMDATA */

    const formData = new FormData();

    formData.append("nombre", nombre);
    formData.append("apellido", apellido);
    formData.append("rol", rol);
    formData.append("club", club);
    formData.append("descripcion", descripcion);

    formData.append(
      "capacitaciones",
      JSON.stringify(capacitaciones)
    );


    /* FOTO */

    if (fotoInput.files.length > 0) {
      formData.append(
        "foto",
        fotoInput.files[0]
      );
    }


    /* CV */

    if (cvInput.files.length > 0) {
      formData.append(
        "cv",
        cvInput.files[0]
      );
    }


    /* URL Y MÉTODO */

    const url = id
      ? `${API_PROFESORES}/${id}`
      : API_PROFESORES;

    const method =
      id
        ? "PUT"
        : "POST";


    /* REQUEST */

    const response =
      await fetchProtegido(url, {
        method,
        body: formData,
      });


    if (!response.ok) {
      const error =
        await response.json();

      console.log(error);

      throw new Error(
        error.mensaje ||
        "Error guardando profesor"
      );
    }


    alert(
      id
        ? "Registro actualizado correctamente"
        : "Registro creado correctamente"
    );


    cerrarFormularioProfesor();

    document
      .getElementById("formProfesor")
      .reset();

    document
      .getElementById("profesorId")
      .value = "";


    cargarProfesoresAdmin();

  } catch (error) {
    console.error("Error:", error);

    alert(
      error.message ||
      "Error al guardar profesor"
    );
  }
}


/* =========================================================
   ELIMINAR PROFESOR / AUTORIDAD
========================================================= */

async function eliminarProfesor(id) {
  if (
    !confirm(
      "¿Seguro que querés eliminar este registro?"
    )
  ) {
    return;
  }

  try {
    const response =
      await fetchProtegido(
        `${API_PROFESORES}/${id}`,
        {
          method: "DELETE",
        }
      );

    if (!response.ok) {
      throw new Error(
        "Error al eliminar profesor"
      );
    }

    alert(
      "Registro eliminado correctamente"
    );

    cargarProfesoresAdmin();

  } catch (error) {
    console.error("Error:", error);

    alert(
      "No se pudo eliminar el registro"
    );
  }
}


/* =========================================================
   EDITAR PROFESOR / AUTORIDAD
========================================================= */

async function editarProfesor(id) {
  console.log(
    "Editar profesor:",
    id
  );

  try {
    const response =
      await fetch(
        `${API_PROFESORES}/${id}`
      );

    if (!response.ok) {
      throw new Error(
        "Error al cargar el registro"
      );
    }

    const profesor =
      await response.json();


    abrirFormularioProfesor();


    document
      .getElementById("profesorId")
      .value = profesor._id;


    document
      .getElementById("profesorNombre")
      .value = profesor.nombre || "";


    document
      .getElementById("profesorApellido")
      .value = profesor.apellido || "";


    document
      .getElementById("profesorRol")
      .value =
        profesor.rol === "autoridad"
          ? "autoridad"
          : "profesor";


    document
      .getElementById("profesorClub")
      .value = profesor.club || "";


    document
      .getElementById("profesorDescripcion")
      .value =
        profesor.descripcion || "";


    document
      .getElementById("profesorCapacitaciones")
      .value =
        Array.isArray(
          profesor.capacitaciones
        )
          ? profesor.capacitaciones
              .map(
                (capacitacion) => {
                  const fecha =
                    capacitacion.fecha
                      ? capacitacion.fecha
                          .split("T")[0]
                      : "";

                  return `${capacitacion.titulo || ""} | ${capacitacion.club || ""} | ${fecha} | ${capacitacion.descripcion || ""}`;
                }
              )
              .join("\n")
          : "";

  } catch (error) {
    console.error(
      "Error cargando profesor:",
      error
    );

    alert(
      "No se pudo cargar el registro"
    );
  }
}
/* ============================= 
   TORNEOS
============================= */

// BOTONES / EVENTOS TORNEOS
const btnNuevoTorneo = document.getElementById("btnNuevoTorneo");
if (btnNuevoTorneo) {
  btnNuevoTorneo.addEventListener("click", abrirFormularioTorneo);
}

const btnCancelarTorneo = document.getElementById("btnCancelarTorneo");
if (btnCancelarTorneo) {
  btnCancelarTorneo.addEventListener("click", cerrarFormularioTorneo);
}

const formTorneo = document.getElementById("formTorneo");
if (formTorneo) {
  formTorneo.addEventListener("submit", guardarTorneo);
}

// CARGAR TORNEOS
async function cargarTorneosAdmin(filtroNombre = "") {
  const container = document.getElementById("torneosGrid");
  if (!container) return;

  container.innerHTML = "<p>Cargando torneos...</p>";

  try {
    const response = await fetch(API_TORNEOS);

    if (!response.ok) {
      throw new Error("No se pudieron obtener los torneos");
    }

    let torneos = await response.json();

    if (!Array.isArray(torneos)) {
      container.innerHTML = "<p>Error en el formato de torneos.</p>";
      return;
    }

    if (filtroNombre) {
      const texto = filtroNombre.toLowerCase().trim();
      torneos = torneos.filter((t) =>
        (t.nombre || "").toLowerCase().includes(texto)
      );
    }

    if (!torneos.length) {
      container.innerHTML = "<p>No hay torneos registrados.</p>";
      return;
    }

    container.innerHTML = "";

    torneos.forEach((torneo) => {
      const primeraFoto =
        Array.isArray(torneo.fotos) && torneo.fotos.length > 0
          ? torneo.fotos[0]
          : "";

      const fotoUrl = primeraFoto
        ? (primeraFoto.startsWith("http")
            ? primeraFoto
            : `${BACKEND_URL}${primeraFoto}`)
        : "../assets/Logos/Logo1.png";

      const row = document.createElement("div");
      row.classList.add("club-admin-row");

      row.innerHTML = `
        <div class="club-admin-logo">
          <img src="${fotoUrl}" alt="${torneo.nombre || "Torneo"}">
        </div>

        <div class="club-col">${torneo.nombre || "-"}</div>
        <div class="club-col">${formatearFechaAdmin(torneo.fecha)}</div>
        <div class="club-col">${torneo.direccion || "-"}</div>
        <div class="club-col">${formatearCategoriasAdmin(torneo.categorias)}</div>
        <div class="club-col">

        <div class="club-admin-actions d-flex gap-2 align-items-center">
          <button 
            class="btn btn-outline-primary btn-sm"
            onclick="editarTorneo('${torneo._id}')">
            <i class="bi bi-pencil"></i>
          </button>

          <button 
            class="btn btn-outline-danger btn-sm" 
            onclick="eliminarTorneo('${torneo._id}')">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;

      container.appendChild(row);
    });

  } catch (error) {
    console.error("Error cargando torneos:", error);
    container.innerHTML = "<p>Error al cargar torneos.</p>";
  }
}

// ABRIR FORMULARIO
function abrirFormularioTorneo() {
  const container = document.getElementById("formTorneoContainer");
  if (!container) return;

  container.style.display = "block";
  container.scrollIntoView({ behavior: "smooth" });

  const form = document.getElementById("formTorneo");
  if (form) form.reset();

  document.getElementById("torneoId").value = "";
}

// CERRAR FORMULARIO
function cerrarFormularioTorneo() {
  const container = document.getElementById("formTorneoContainer");
  if (!container) return;

  container.style.display = "none";
}

// GUARDAR TORNEO (CREAR / EDITAR)
async function guardarTorneo(e) {
  e.preventDefault();

  const id = document.getElementById("torneoId").value.trim();
  const nombre = document.getElementById("torneoNombre").value.trim();
  const fecha = document.getElementById("torneoFecha").value;
  const direccion = document.getElementById("torneoDireccion").value.trim();
  const categoriasTexto = document.getElementById("torneoCategorias").value.trim();
  const reglas = document.getElementById("torneoReglas").value.trim();
  const fotoInput = document.getElementById("torneoFoto");

  const transmisionesTexto = document
    .getElementById("torneoTransmisiones")
    .value
    .trim();

  const transmisiones = transmisionesTexto
  ? transmisionesTexto
      .split("\n")
      .map((linea, index) => {
        const texto = linea.trim();

        if (!texto) return null;

        if (texto.includes("|")) {
          const [titulo, url] = texto.split("|");

          return {
            titulo: titulo.trim(),
            url: url.trim(),
          };
        }

        return {
          titulo: "",
          url: texto,
        };
      })
      .filter((t) => t.url)
  : [];

  console.log("VERSION NUEVA PARSEO URLS SOLAS");
  if (!nombre || !fecha) {
    alert("Nombre y fecha son obligatorios");
    return;
  }

  const categorias = categoriasTexto
    ? categoriasTexto.split(",").map((c) => c.trim()).filter(Boolean)
    : [];

  const formData = new FormData();

  formData.append("nombre", nombre);
  formData.append("fecha", fecha);
  formData.append("direccion", direccion);
  formData.append("reglas", reglas);
  formData.append("categorias", JSON.stringify(categorias));
  formData.append("transmisiones", JSON.stringify(transmisiones));

  if (fotoInput.files.length > 0) {
    formData.append("foto", fotoInput.files[0]);
  }

  try {
    const url = id ? `${API_TORNEOS}/${id}` : API_TORNEOS;
    const method = id ? "PUT" : "POST";



    console.log("Transmisiones texto:", transmisionesTexto);
    console.log("Transmisiones parseadas:", transmisiones);

    const response = await fetchProtegido(url, {
      method,
      body: formData,
    });

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(
        resultado.mensaje ||
        resultado.error ||
        "Error al guardar torneo"
      );
    }

    const slugReal = resultado?.torneo?.slug || "";

alert(
  `${id ? "Torneo actualizado correctamente" : "Torneo creado correctamente"}` +
  (slugReal ? `\n\nRuta para subir resultados:\n/resultados/${slugReal}/` : "")
);

    document.getElementById("formTorneo").reset();
    document.getElementById("torneoId").value = "";

    cerrarFormularioTorneo();
    cargarTorneosAdmin();
  } catch (error) {
    console.error("Error guardando torneo:", error);
    alert("Error: " + error.message);
  }
}

// EDITAR TORNEO
async function editarTorneo(id) {
  try {
    const response = await fetch(`${API_TORNEOS}/${id}`);

    if (!response.ok) {
      throw new Error("No se pudo obtener el torneo");
    }

    const torneo = await response.json();

    abrirFormularioTorneo();

    document.getElementById("torneoId").value = torneo._id || "";
    document.getElementById("torneoNombre").value = torneo.nombre || "";
    document.getElementById("torneoFecha").value = torneo.fecha
  ? String(torneo.fecha).split("T")[0]
  : "";
    document.getElementById("torneoDireccion").value = torneo.direccion || "";
    document.getElementById("torneoCategorias").value = Array.isArray(torneo.categorias)
      ? torneo.categorias.join(", ")
      : (torneo.categorias || "");
    document.getElementById("torneoReglas").value = torneo.reglas || "";
    document.getElementById("torneoTransmisiones").value =
  Array.isArray(torneo.transmisiones)
    ? torneo.transmisiones
        .map((transmision) => {
          return `${transmision.titulo || ""} | ${transmision.url || ""}`;
        })
        .join("\n")
    : "";
    

  } catch (error) {
    console.error("Error cargando torneo para editar:", error);
    alert("No se pudo cargar el torneo");
  }
}

// ELIMINAR TORNEO
async function eliminarTorneo(id) {
  if (!confirm("¿Seguro que querés eliminar este torneo?")) return;

  try {
    const response = await fetchProtegido(`${API_TORNEOS}/${id}`, {
      method: "DELETE"
    });

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(resultado.mensaje || resultado.error || "Error al eliminar torneo");
    }

    alert("Torneo eliminado correctamente");
    cargarTorneosAdmin();

  } catch (error) {
    console.error("Error eliminando torneo:", error);
    alert("No se pudo eliminar el torneo");
  }
}

// HELPERS
function formatearFechaAdmin(fecha) {
  if (!fecha) return "-";

  const fechaTexto = String(fecha).split("T")[0];
  const [anio, mes, dia] = fechaTexto.split("-");

  return `${dia}/${mes}/${anio}`;
}

function formatearCategoriasAdmin(categorias) {
  if (!categorias) return "-";
  if (Array.isArray(categorias)) return categorias.join(", ");
  return categorias;
}

/* ============================= 
   RANKING
============================= */

async function importarInscripcionesSheets() {
  if (!confirm("¿Querés importar el ranking desde Google Sheets?")) {
    return;
  }

  const boton = document.getElementById("btnImportarInscripciones");

  try {
    if (boton) {
      boton.disabled = true;
      boton.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2"></span>
        Importando...
      `;
    }

    const response = await fetchProtegido(
      `${API_RANKING}/importar-sheets`,
      {
        method: "POST",
      }
    );

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(
        resultado.mensaje ||
        resultado.error ||
        "Error importando ranking"
      );
    }

    let mensaje = `${resultado.mensaje}\n\n`;

    mensaje += `Creadas: ${resultado.creadas ?? 0}\n`;
    mensaje += `Actualizadas: ${resultado.actualizadas ?? 0}\n`;
    mensaje += `Sin cambios: ${resultado.sinCambios ?? 0}\n`;
    mensaje += `Sin DNI: ${resultado.omitidasSinDni ?? 0}\n`;
    mensaje += `DNI duplicados en la planilla: ${resultado.erroresDuplicados ?? 0}\n`;
    mensaje += `Errores: ${resultado.errores?.length ?? 0}`;

    alert(mensaje);


    function obtenerFotoRankingAdmin(usuario) {
  const foto = String(usuario?.foto || "").trim();

  if (!foto) {
    return "./assets/imagenes/incognito.jpg";
  }

  if (
    foto.startsWith("http://") ||
    foto.startsWith("https://") ||
    foto.startsWith("data:image/")
  ) {
    return foto;
  }

  if (foto.startsWith("/assets/")) {
    return `.${foto}`;
  }

  if (foto.startsWith("assets/")) {
    return `./${foto}`;
  }

  return foto;
}
    await cargarInscripcionesAdmin();

  } catch (error) {
    console.error("Error importando ranking:", error);

    alert(
      "Error importando ranking: " + error.message
    );

  } finally {
    if (boton) {
      boton.disabled = false;
      boton.innerHTML = `
        <i class="bi bi-cloud-download"></i>
        Importar desde Google Sheets
      `;
    }
  }
}
function obtenerFotoRankingAdmin(usuario) {
  const FOTO_INCOGNITO = "/assets/imagenes/incognito.png";

  if (!usuario || !usuario.foto) {
    return FOTO_INCOGNITO;
  }

  const foto = String(usuario.foto).trim();

  if (!foto) {
    return FOTO_INCOGNITO;
  }

  // Cloudinary / cualquier URL externa
  if (
    foto.startsWith("http://") ||
    foto.startsWith("https://")
  ) {
    return foto;
  }

  // Foto local
  if (foto.startsWith("/")) {
    return foto;
  }

  return `/${foto}`;
}
async function cargarInscripcionesAdmin() {
  const container =
    document.getElementById("inscripcionesGrid");

  if (!container) return;

  container.innerHTML =
    "<p>Cargando ranking...</p>";

  try {
    const response = await fetchProtegido(
      API_RANKING,
      {
        method: "GET",
      }
    );

    const ranking = await response.json();

    if (!response.ok) {
      throw new Error(
        ranking.mensaje ||
        "Error cargando ranking"
      );
    }

    if (!Array.isArray(ranking) || !ranking.length) {
      container.innerHTML =
        "<p>No hay ranking importado.</p>";

      return;
    }

    container.innerHTML = "";

    ranking.forEach((usuario) => {
      const row = document.createElement("div");

      row.classList.add("club-admin-row");

      row.innerHTML = `
        <div class="club-col">
          ${usuario.apellido || "-"},
          ${usuario.nombre || "-"}
        </div>

        <div class="club-col">
          ${usuario.dni || "-"}
        </div>

        <div class="club-col">
          ${usuario.institucion || "-"}
        </div>

        <div class="club-col">
          ${usuario.categoria || "-"}
        </div>

        <div class="club-col">
          ${usuario.puntajeTotal ?? 0}
        </div>

        <div class="club-col">
  <img 
    src="${obtenerFotoRankingAdmin(usuario)}"
    alt="${usuario.nombre || "Usuario"}"
    onerror="this.onerror=null; this.src='./assets/imagenes/incognito.png';"
    style="
      width:50px;
      height:50px;
      border-radius:50%;
      object-fit:cover;
    "
  >
</div>
      `;

      container.appendChild(row);
    });

  } catch (error) {
    console.error("Error cargando ranking:", error);

    container.innerHTML =
      "<p>Error al cargar ranking.</p>";
  }
}



/* ============================= 
   GALERÍA
============================= */

async function cargarGaleriaAdmin(filtroTitulo = "") {
  const container = document.getElementById("galeriaGrid");
  if (!container) return;

  container.innerHTML = "<p>Cargando galería...</p>";

  try {
    const query = filtroTitulo
      ? `?titulo=${encodeURIComponent(filtroTitulo)}`
      : "";

    const response = await fetch(`${API_GALERIA}${query}`);

    if (!response.ok) {
      throw new Error("No se pudo obtener la galería");
    }

    const fotos = await response.json();

    if (!Array.isArray(fotos) || !fotos.length) {
      container.innerHTML = "<p>No hay fotos cargadas.</p>";
      return;
    }

    container.innerHTML = "";

    fotos.forEach((foto) => {
      const row = document.createElement("div");
      row.classList.add("club-admin-row");

      row.innerHTML = `
        <div class="club-admin-logo">
          <img src="${foto.imagen}" alt="${foto.titulo || "Foto galería"}">
        </div>

        <div class="club-col">
          ${foto.titulo || "-"}
        </div>

        <div class="club-col">
  ${formatearFechaAdmin(foto.fecha)}
</div>

<div class="club-col">
  ❤️ ${Array.isArray(foto.likes) ? foto.likes.length : 0}
</div>

<div class="club-admin-actions d-flex gap-2 align-items-center">
          <button 
            class="btn btn-outline-primary btn-sm"
            onclick="editarFotoGaleria('${foto._id}')">
            <i class="bi bi-pencil"></i>
          </button>

          <button 
            class="btn btn-outline-danger btn-sm"
            onclick="eliminarFotoGaleria('${foto._id}')">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;

      container.appendChild(row);
    });
  } catch (error) {
    console.error("Error cargando galería:", error);
    container.innerHTML = "<p>Error al cargar la galería.</p>";
  }
}

function abrirFormularioGaleria() {
  const container = document.getElementById("formGaleriaContainer");
  if (!container) return;

  container.style.display = "block";
  container.scrollIntoView({ behavior: "smooth" });

  const form = document.getElementById("formGaleria");
  if (form) form.reset();

  document.getElementById("galeriaId").value = "";
}

function cerrarFormularioGaleria() {
  const container = document.getElementById("formGaleriaContainer");
  if (!container) return;

  container.style.display = "none";

  const form = document.getElementById("formGaleria");
  if (form) form.reset();

  document.getElementById("galeriaId").value = "";
}

async function guardarFotoGaleria(e) {
  e.preventDefault();

  const id = document.getElementById("galeriaId").value.trim();
  const titulo = document.getElementById("galeriaTitulo").value.trim();
  const fecha = document.getElementById("galeriaFecha").value;
  const imagenInput = document.getElementById("galeriaImagen");

  if (!id && imagenInput.files.length === 0) {
    alert("La imagen es obligatoria al crear una foto");
    return;
  }

  const formData = new FormData();

  formData.append("titulo", titulo);
  formData.append("fecha", fecha);

  if (imagenInput.files.length > 0) {
    formData.append("imagen", imagenInput.files[0]);
  }

  try {
    const url = id ? `${API_GALERIA}/${id}` : API_GALERIA;
    const method = id ? "PUT" : "POST";

    const response = await fetchProtegido(url, {
      method,
      body: formData,
    });

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(
        resultado.mensaje ||
        resultado.error ||
        "Error al guardar la foto"
      );
    }

    alert(
      id
        ? "Foto actualizada correctamente"
        : "Foto subida correctamente"
    );

    cerrarFormularioGaleria();
    cargarGaleriaAdmin();

  } catch (error) {
    console.error("Error guardando foto:", error);
    alert("Error: " + error.message);
  }
}

async function editarFotoGaleria(id) {
  try {
    const response = await fetch(`${API_GALERIA}/${id}`);

    if (!response.ok) {
      throw new Error("No se pudo obtener la foto");
    }

    const foto = await response.json();

    abrirFormularioGaleria();

    document.getElementById("galeriaId").value = foto._id || "";
    document.getElementById("galeriaTitulo").value = foto.titulo || "";
    document.getElementById("galeriaFecha").value = foto.fecha
      ? String(foto.fecha).split("T")[0]
      : "";
  } catch (error) {
    console.error("Error cargando foto:", error);
    alert("No se pudo cargar la foto");
  }
}

async function eliminarFotoGaleria(id) {
  if (!confirm("¿Seguro que querés eliminar esta foto?")) return;

  try {
    const response = await fetchProtegido(`${API_GALERIA}/${id}`, {
      method: "DELETE",
    });

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(
        resultado.mensaje ||
        resultado.error ||
        "Error al eliminar la foto"
      );
    }

    alert("Foto eliminada correctamente");
    cargarGaleriaAdmin();
  } catch (error) {
    console.error("Error eliminando foto:", error);
    alert("No se pudo eliminar la foto");
  }
}