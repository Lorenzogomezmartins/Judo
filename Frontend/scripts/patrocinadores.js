async function cargarPatrocinadores() {
  const grid = document.getElementById("sponsorsGrid");
  if (!grid) return;

  try {
    const res = await fetch("http://localhost:3000/api/patrocinadores");
    const patrocinadores = await res.json();

    grid.innerHTML = "";

    patrocinadores.forEach(p => {
      const logoUrl = `http://localhost:3000${p.logo}`;

      grid.innerHTML += `
        <div class="sponsor-item">
          <img 
            src="${logoUrl}" 
            alt="${p.nombre}" 
            class="sponsor-logo"
            onclick="abrirSponsor(
              '${p.nombre}',
              '${logoUrl}',
              '${p.contacto || ""}',
              '${p.sitioWeb || ""}'
            )"
          >
        </div>
      `;
    });

  } catch (error) {
    console.error("Error cargando patrocinadores", error);
    grid.innerHTML = "<p>Error al cargar patrocinadores</p>";
  }
}

/* =========================
   DETALLE / MENSAJE
========================= */
function abrirSponsor(nombre, logo, contacto, sitioWeb) {
  cerrarSponsor();

  const overlay = document.createElement("div");
  overlay.id = "sponsorOverlay";

  overlay.innerHTML = `
    <div class="sponsor-modal">
      <button class="cerrar-modal" onclick="cerrarSponsor()">✕</button>

      <img src="${logo}" alt="${nombre}" class="modal-logo">

      <h3>${nombre}</h3>

      ${
        contacto
          ? `<p><strong>Contacto:</strong> ${contacto}</p>`
          : ""
      }

      ${
        sitioWeb
          ? `<a href="${sitioWeb}" target="_blank" class="modal-link">
               Visitar sitio web
             </a>`
          : ""
      }
    </div>
  `;

  document.body.appendChild(overlay);
}

function cerrarSponsor() {
  const overlay = document.getElementById("sponsorOverlay");
  if (overlay) overlay.remove();
}
