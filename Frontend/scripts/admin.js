const API_URL = "http://localhost:4000/api/clubes";
const API_PATROCINADORES = "http://localhost:4000/api/patrocinadores";
const BACKEND_URL = "http://localhost:4000";

// ============================
// VERIFICAR LOGIN ADMIN
// ============================

const token = localStorage.getItem("tokenAdmin");

if (!token) {
  window.location.href = "../partials/loginAdmin.html";
}

document.addEventListener("DOMContentLoaded", () => {
  cargarClubesAdmin();
  cargarPatrocinadoresAdmin();
  cargarProfesoresAdmin();

  // Botón Agregar Club
  const btnNuevoClub = document.getElementById("btnNuevoClub");
  btnNuevoClub.addEventListener("click", abrirFormulario);

  // Cancelar formulario
  const btnCancelar = document.getElementById("btnCancelarClub");
  btnCancelar.addEventListener("click", cerrarFormulario);

  // Enviar formulario
  const form = document.getElementById("formClub");
  form.addEventListener("submit", guardarClub);

  // Filtro por nombre
  const filtro = document.getElementById("filtroClubes");
  filtro.addEventListener("input", () => cargarClubesAdmin(filtro.value));

 

document.getElementById("btnNuevoPatrocinador")
  .addEventListener("click", abrirFormularioPatrocinador);

document.getElementById("btnCancelarPatrocinador")
  .addEventListener("click", cerrarFormularioPatrocinador);

document.getElementById("formPatrocinador")
  .addEventListener("submit", guardarPatrocinador);

document.getElementById("filtroPatrocinadores")
  .addEventListener("input", e =>
    cargarPatrocinadoresAdmin(e.target.value)
  );

});
/* ============================= 
   PROFESORES EVENTOS
============================= */

document.getElementById("btnNuevoProfesorr")
  .addEventListener("click", abrirFormularioProfesor);

document.getElementById("btnCancelarProfesor")
  .addEventListener("click", cerrarFormularioProfesor);

document.getElementById("formProfesor")
  .addEventListener("submit", guardarProfesor);

document.getElementById("filtroProfesores")
  .addEventListener("input", e =>
    cargarProfesoresAdmin(e.target.value)
  );
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
    const response = await fetch(`${API_URL}/${id}`, {
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
      response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        body: formData
      });
    } else {
      response = await fetch(API_URL, {
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

    // Guardamos el ID oculto
    document.getElementById("clubId").value = club._id;

    // Cargamos datos
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

    // Filtrar por nombre si hay texto
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
      row.classList.add("club-admin-row"); // usamos la misma clase que clubes

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

    const response = await fetch(url, {
      method: method,
      body: formData
    });

    if (!response.ok) {
      throw new Error("Error al guardar patrocinador");
    }

    alert(id
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
    const response = await fetch(`${API_PATROCINADORES}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Error al eliminar");
    }

    alert("Patrocinador eliminado correctamente");

    cargarPatrocinadoresAdmin(); // refrescar lista

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

/* ============================= 
   PROFESORES
============================= */
/* CARGAR PROFESORES */
async function cargarProfesoresAdmin(filtroNombre = "") {

  const container = document.getElementById("profesoresGrid");
  if (!container) return;

  container.innerHTML = "<p>Cargando profesores...</p>";

  try {

    const response = await fetch("http://localhost:4000/api/profesores");
    let profesores = await response.json();

    // FILTRAR POR NOMBRE O APELLIDO
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
            : "http://localhost:4000/uploads/" + profesor.foto)
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

    /* ===============================
       VERIFICAR DUPLICADOS SOLO SI CREA
    =============================== */

    if (!id) {

      const responseProfesores = await fetch("http://localhost:4000/api/profesores");
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

    /* ===============================
       ARMAR FORM DATA
    =============================== */

    const formData = new FormData();

    formData.append("nombre", nombre);
    formData.append("apellido", apellido);
    formData.append("descripcion", descripcion);

    if (fotoInput.files.length > 0) {
      formData.append("foto", fotoInput.files[0]);
    }

    /* ===============================
       CREAR O ACTUALIZAR
    =============================== */

    const url = id
      ? `http://localhost:4000/api/profesores/${id}`
      : `http://localhost:4000/api/profesores`;

    const method = id ? "PUT" : "POST";

    const response = await fetch(url, {
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

    const response = await fetch(`http://localhost:4000/api/profesores/${id}`, {
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

    const response = await fetch(`http://localhost:4000/api/profesores/${id}`);
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