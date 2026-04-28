const API_URL = "http://localhost:3000/api/clubes";
const API_PATROCINADORES = "http://localhost:3000/api/patrocinadores";
const API_TORNEOS = "http://localhost:3000/api/torneos";
const BACKEND_URL = "http://localhost:3000";
const API_PROFESORES = "http://localhost:3000/api/profesores";
const API_VERIFICAR_ADMIN = "http://localhost:3000/api/admin/verificar";
const API_INSCRIPCIONES = "http://localhost:3000/api/inscripciones";

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

const filtroEstadoInscripciones = document.getElementById("filtroEstadoInscripciones");
if (filtroEstadoInscripciones) {
  filtroEstadoInscripciones.addEventListener("change", () => {
    cargarInscripcionesAdmin(filtroEstadoInscripciones.value);
  });
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

/* ============================= 
   CLUBES
============================= */
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
      const logoUrl = club.logo
        ? (club.logo.startsWith("http") ? club.logo : BACKEND_URL + club.logo)
        : "https://via.placeholder.com/80?text=Logo";

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
      const logoUrl = patrocinador.logo
        ? (patrocinador.logo.startsWith("http")
            ? patrocinador.logo
            : BACKEND_URL + patrocinador.logo)
        : "https://via.placeholder.com/80?text=Logo";

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
const formPatrocinador = document.getElementById("formPatrocinador");
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
formPatrocinador.addEventListener("submit", async (e) => {
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
      method: method,
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
});

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
/* CARGAR PROFESORES */
async function cargarProfesoresAdmin(filtroNombre = "") {
  const container = document.getElementById("profesoresGrid");
  if (!container) return;

  container.innerHTML = "<p>Cargando profesores...</p>";

  try {
    const response = await fetch(API_PROFESORES);
    let profesores = await response.json();

    if (filtroNombre) {
      const texto = filtroNombre.toLowerCase();

      profesores = profesores.filter(p =>
        p.nombre.toLowerCase().includes(texto) ||
        p.apellido.toLowerCase().includes(texto)
      );
    }

    if (!profesores.length) {
      container.innerHTML = "<p>No hay profesores registrados.</p>";
      return;
    }

    container.innerHTML = "";

    profesores.forEach(profesor => {
      const fotoUrl = profesor.foto
        ? (profesor.foto.startsWith("http")
            ? profesor.foto
            : "http://localhost:3000/uploads/" + profesor.foto)
        : "https://via.placeholder.com/80?text=Foto";

      const row = document.createElement("div");
      row.classList.add("club-admin-row");

      row.innerHTML = `
        <div class="club-admin-logo">
          <img src="${fotoUrl}" alt="${profesor.nombre}">
        </div>

        <div class="club-col">
          ${profesor.nombre || "-"}
        </div>

        <div class="club-col">
          ${profesor.apellido || "-"}
        </div>

        <div class="club-col">
          ${profesor.descripcion || "-"}
        </div>

        <div class="club-admin-actions d-flex gap-2 align-items-center">
          <button 
            class="btn btn-outline-primary btn-sm"
            onclick="editarProfesor('${profesor._id}')">
            <i class="bi bi-pencil"></i>
          </button>

          <button 
            class="btn btn-outline-danger btn-sm"
            onclick="eliminarProfesor('${profesor._id}')">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;

      container.appendChild(row);
    });

  } catch (error) {
    console.error("Error cargando profesores:", error);
    container.innerHTML = "<p>Error al cargar profesores.</p>";
  }
}

/* AGREGAR PROFESORES */
function abrirFormularioProfesor() {
  const container = document.getElementById("formProfesorContainer");

  container.style.display = "block";
  document.getElementById("formProfesor").reset();
  document.getElementById("profesorId").value = "";
}

function cerrarFormularioProfesor() {
  const container = document.getElementById("formProfesorContainer");
  container.style.display = "none";
}

async function guardarProfesor(e) {
  e.preventDefault();

  const id = document.getElementById("profesorId").value.trim();
  const nombre = document.getElementById("profesorNombre").value.trim();
  const apellido = document.getElementById("profesorApellido").value.trim();
  const descripcion = document.getElementById("profesorDescripcion").value.trim();
  const fotoInput = document.getElementById("profesorFoto");

  if (!nombre || !apellido) {
    alert("Nombre y apellido son obligatorios");
    return;
  }

  try {
    if (!id) {
      const responseProfesores = await fetch(API_PROFESORES);
      const profesores = await responseProfesores.json();

      const existe = profesores.find(p =>
        p.nombre.toLowerCase() === nombre.toLowerCase() &&
        p.apellido.toLowerCase() === apellido.toLowerCase()
      );

      if (existe) {
        alert("Ya existe un profesor con ese nombre y apellido");
        return;
      }
    }

    const formData = new FormData();

    formData.append("nombre", nombre);
    formData.append("apellido", apellido);
    formData.append("descripcion", descripcion);

    if (fotoInput.files.length > 0) {
      formData.append("foto", fotoInput.files[0]);
    }

    const url = id
      ? `${API_PROFESORES}/${id}`
      : API_PROFESORES;

    const method = id ? "PUT" : "POST";

    const response = await fetchProtegido(url, {
      method: method,
      body: formData
    });

    if (!response.ok) {
      throw new Error("Error guardando profesor");
    }

    alert(
      id
        ? "Profesor actualizado correctamente"
        : "Profesor creado correctamente"
    );

    cerrarFormularioProfesor();

    document.getElementById("formProfesor").reset();
    document.getElementById("profesorId").value = "";

    cargarProfesoresAdmin();

  } catch (error) {
    console.error("Error:", error);
    alert("Error al guardar profesor");
  }
}

/* ELIMINAR PROFESORES */
async function eliminarProfesor(id) {
  if (!confirm("¿Seguro que querés eliminar este profesor?")) return;

  try {
    const response = await fetchProtegido(`${API_PROFESORES}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Error al eliminar profesor");
    }

    alert("Profesor eliminado correctamente");
    cargarProfesoresAdmin();

  } catch (error) {
    console.error("Error:", error);
    alert("No se pudo eliminar el profesor");
  }
}

/* EDITAR PROFESORES */
async function editarProfesor(id) {
  console.log("Editar profesor:", id);

  try {
    const response = await fetch(`${API_PROFESORES}/${id}`);
    const profesor = await response.json();

    abrirFormularioProfesor();

    document.getElementById("profesorId").value = profesor._id;
    document.getElementById("profesorNombre").value = profesor.nombre || "";
    document.getElementById("profesorApellido").value = profesor.apellido || "";
    document.getElementById("profesorDescripcion").value = profesor.descripcion || "";

  } catch (error) {
    console.error("Error cargando profesor:", error);
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

  if (!nombre || !fecha) {
    alert("Nombre y fecha son obligatorios");
    return;
  }

  const categorias = categoriasTexto
    ? categoriasTexto.split(",").map(c => c.trim()).filter(Boolean)
    : [];

  try {
    let response;

    if (!id) {
      response = await fetchProtegido(API_TORNEOS, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre,
          fecha,
          direccion,
          reglas,
          categorias
        })
      });
    } else {
      const hayFoto = fotoInput && fotoInput.files && fotoInput.files.length > 0;

      if (hayFoto) {
        const formData = new FormData();
        formData.append("nombre", nombre);
        formData.append("fecha", fecha);
        formData.append("direccion", direccion);
        formData.append("reglas", reglas);
        formData.append("categorias", JSON.stringify(categorias));
        formData.append("foto", fotoInput.files[0]);

        response = await fetchProtegido(`${API_TORNEOS}/${id}`, {
          method: "PUT",
          body: formData
        });
      } else {
        response = await fetchProtegido(`${API_TORNEOS}/${id}`, {
          method: "PUT",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nombre,
            fecha,
            direccion,
            reglas,
            categorias
          })
        });
      }
    }

    const resultado = await response.json();
    console.log("RESPUESTA BACKEND TORNEO:", resultado);

    if (!response.ok) {
      throw new Error(resultado.mensaje || resultado.error || "Error al guardar torneo");
    }

    alert(
      id
        ? "Torneo actualizado correctamente"
        : "Torneo creado correctamente"
    );

    const form = document.getElementById("formTorneo");
    if (form) form.reset();

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
      ? new Date(torneo.fecha).toISOString().split("T")[0]
      : "";
    document.getElementById("torneoDireccion").value = torneo.direccion || "";
    document.getElementById("torneoCategorias").value = Array.isArray(torneo.categorias)
      ? torneo.categorias.join(", ")
      : (torneo.categorias || "");
    document.getElementById("torneoReglas").value = torneo.reglas || "";

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
  return new Date(fecha).toLocaleDateString("es-AR");
}

function formatearCategoriasAdmin(categorias) {
  if (!categorias) return "-";
  if (Array.isArray(categorias)) return categorias.join(", ");
  return categorias;
}





/* ============================= 
   INSCRIPCIONES
============================= */

async function importarInscripcionesSheets() {
  if (!confirm("¿Querés importar las nuevas inscripciones desde Google Sheets?")) {
    return;
  }

  try {
    const response = await fetchProtegido(`${API_INSCRIPCIONES}/importar-sheets`, {
      method: "POST"
    });

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(resultado.mensaje || resultado.error || "Error importando inscripciones");
    }

    alert(
      `${resultado.mensaje}\n\n` +
      `Creadas: ${resultado.creadas}\n` +
      `Duplicadas: ${resultado.duplicadas}\n` +
      `Errores: ${resultado.errores?.length || 0}`
    );

    const filtro = document.getElementById("filtroEstadoInscripciones")?.value || "pendiente";
    cargarInscripcionesAdmin(filtro);

  } catch (error) {
    console.error("Error importando inscripciones:", error);
    alert("Error importando inscripciones: " + error.message);
  }
}

async function cargarInscripcionesAdmin(estado = "pendiente") {
  const container = document.getElementById("inscripcionesGrid");
  if (!container) return;

  container.innerHTML = "<p>Cargando inscripciones...</p>";

  try {
    const url = estado
      ? `${API_INSCRIPCIONES}?estado=${estado}`
      : API_INSCRIPCIONES;

    const response = await fetchProtegido(url, {
      method: "GET"
    });

    const inscripciones = await response.json();

    if (!response.ok) {
      throw new Error(inscripciones.mensaje || "Error cargando inscripciones");
    }

    if (!Array.isArray(inscripciones) || !inscripciones.length) {
      container.innerHTML = "<p>No hay inscripciones para mostrar.</p>";
      return;
    }

    container.innerHTML = "";

    inscripciones.forEach((inscripcion) => {
      const row = document.createElement("div");
      row.classList.add("club-admin-row");

      row.innerHTML = `
        <div class="club-col">
          ${inscripcion.nombre || "-"} ${inscripcion.apellido || ""}
        </div>

        <div class="club-col">
          ${inscripcion.dni || "-"}
        </div>

        <div class="club-col">
          ${inscripcion.email || "-"}
        </div>

        <div class="club-col">
          ${inscripcion.clasificacion || "-"}
          <br>
          <small class="text-muted">
            Puntos: ${inscripcion.Puntos ?? 0}
          </small>
        </div>

        <div class="club-col">
          <span class="badge ${obtenerClaseEstadoInscripcion(inscripcion.estado)}">
            ${inscripcion.estado || "-"}
          </span>
        </div>

        <div class="club-admin-actions d-flex gap-2 align-items-center flex-wrap">
          <button 
            class="btn btn-outline-info btn-sm"
            onclick="verInscripcion('${inscripcion._id}')">
            <i class="bi bi-eye"></i>
          </button>

          <button 
            class="btn btn-outline-primary btn-sm"
            onclick="editarInscripcion('${inscripcion._id}')">
            <i class="bi bi-pencil"></i>
          </button>

          <button 
            class="btn btn-outline-success btn-sm"
            onclick="aprobarInscripcion('${inscripcion._id}')">
            <i class="bi bi-check-lg"></i>
          </button>

          <button 
            class="btn btn-outline-danger btn-sm"
            onclick="rechazarInscripcion('${inscripcion._id}')">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      `;

      container.appendChild(row);
    });

  } catch (error) {
    console.error("Error cargando inscripciones:", error);
    container.innerHTML = "<p>Error al cargar inscripciones.</p>";
  }
}

function obtenerClaseEstadoInscripcion(estado) {
  switch (estado) {
    case "pendiente":
      return "bg-warning text-dark";
    case "aprobado":
      return "bg-success";
    case "rechazado":
      return "bg-danger";
    case "duplicado":
      return "bg-secondary";
    case "error":
      return "bg-dark";
    default:
      return "bg-light text-dark";
  }
}

async function verInscripcion(id) {
  try {
    const response = await fetchProtegido(`${API_INSCRIPCIONES}/${id}`, {
      method: "GET"
    });

    const inscripcion = await response.json();

    if (!response.ok) {
      throw new Error(inscripcion.mensaje || "Error obteniendo inscripción");
    }

    const detalle = `
Nombre: ${inscripcion.nombre || "-"} ${inscripcion.apellido || ""}
DNI: ${inscripcion.dni || "-"}
Email: ${inscripcion.email || "-"}
Teléfono: ${inscripcion.telefono || "-"}
Sexo: ${inscripcion.sexo || "-"}
Peso: ${inscripcion.peso || "-"}
Clasificación: ${inscripcion.clasificacion || "-"}
Puntos: ${inscripcion.Puntos ?? 0}
Estado: ${inscripcion.estado || "-"}
Observación: ${inscripcion.observacion || "-"}
Fila Google Sheet: ${inscripcion.filaGoogleSheet || "-"}
Foto Drive: ${inscripcion.fotoDriveUrl || "Sin foto"}
    `;

    alert(detalle);

    if (inscripcion.fotoDriveUrl) {
      const abrirFoto = confirm("¿Querés abrir la foto original en Google Drive?");
      if (abrirFoto) {
        window.open(inscripcion.fotoDriveUrl, "_blank");
      }
    }

  } catch (error) {
    console.error("Error viendo inscripción:", error);
    alert("Error viendo inscripción: " + error.message);
  }
}

async function editarInscripcion(id) {
  try {
    const response = await fetchProtegido(`${API_INSCRIPCIONES}/${id}`, {
      method: "GET"
    });

    const inscripcion = await response.json();

    if (!response.ok) {
      throw new Error(inscripcion.mensaje || "Error obteniendo inscripción");
    }

    document.getElementById("editInscripcionId").value = inscripcion._id;

    document.getElementById("editNombreCompleto").value =
      `${inscripcion.nombre || ""} ${inscripcion.apellido || ""}`.trim();

    document.getElementById("editDni").value =
      inscripcion.dni || "";

    document.getElementById("editPuntos").value =
      inscripcion.Puntos ?? 0;

    const modal = new bootstrap.Modal(
      document.getElementById("modalEditarInscripcion")
    );

    modal.show();

  } catch (error) {
    console.error("Error abriendo edición de Puntos:", error);
    alert("No se pudo abrir la edición de Puntos");
  }
}

async function aprobarInscripcion(id) {
  if (!confirm("¿Aprobar esta inscripción y crear el usuario final?")) {
    return;
  }

  try {
    const response = await fetchProtegido(`${API_INSCRIPCIONES}/${id}/aprobar`, {
      method: "PUT"
    });

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(resultado.mensaje || resultado.error || "Error aprobando inscripción");
    }

    alert("Inscripción aprobada y usuario creado correctamente");

    const filtro = document.getElementById("filtroEstadoInscripciones")?.value || "pendiente";
    cargarInscripcionesAdmin(filtro);

  } catch (error) {
    console.error("Error aprobando inscripción:", error);
    alert("Error aprobando inscripción: " + error.message);
  }
}

async function rechazarInscripcion(id) {
  if (!confirm("¿Seguro que querés rechazar esta inscripción? Se eliminará del panel.")) {
    return;
  }

  try {
    const response = await fetchProtegido(`${API_INSCRIPCIONES}/${id}/rechazar`, {
      method: "PUT"
    });

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(resultado.mensaje || resultado.error || "Error rechazando inscripción");
    }

    alert("Inscripción rechazada y eliminada correctamente");

    const filtro = document.getElementById("filtroEstadoInscripciones")?.value || "pendiente";
    cargarInscripcionesAdmin(filtro);

  } catch (error) {
    console.error("Error rechazando inscripción:", error);
    alert("No se pudo rechazar la inscripción");
  }
}

/* ============================= 
   GUARDAR EDICIÓN DE Puntos
============================= */

const formEditarInscripcion = document.getElementById("formEditarInscripcion");

if (formEditarInscripcion) {
  formEditarInscripcion.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editInscripcionId").value;
    const Puntos = Number(document.getElementById("editPuntos").value);

    if (Number.isNaN(Puntos) || Puntos < 0) {
      alert("Los Puntos deben ser un número válido mayor o igual a 0");
      return;
    }

    try {
      const response = await fetchProtegido(`${API_INSCRIPCIONES}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ Puntos })
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.mensaje || resultado.error || "Error actualizando Puntos");
      }

      const modalElement = document.getElementById("modalEditarInscripcion");
      const modal = bootstrap.Modal.getInstance(modalElement);

      if (modal) {
        modal.hide();
      }

      alert("Puntos actualizados correctamente");

      const filtro = document.getElementById("filtroEstadoInscripciones")?.value || "pendiente";
      cargarInscripcionesAdmin(filtro);

    } catch (error) {
      console.error("Error guardando Puntos:", error);
      alert("No se pudieron guardar los Puntos");
    }
  });
}