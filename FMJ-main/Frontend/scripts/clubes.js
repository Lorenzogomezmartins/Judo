export async function cargarClubes() {
  const grid = document.getElementById("clubesGrid");
  if (!grid) return;

  try {
    const res = await fetch("/api/clubes");
    const clubes = await res.json();

    grid.innerHTML = "";

    clubes.forEach(c => {
  const logoUrl = c.logo || "/assets/imagenes/default.png";
  
      const club = document.createElement("div");
      club.className = "club-logo-container";

      club.innerHTML = `
        <img src="${logoUrl}" alt="${c.nombre}">
      `;

      club.addEventListener("click", () => {
        abrirClub(
          c.nombre,
          logoUrl,
          c.telefono || "",
          c.direccion || "",
          c.sitioWeb || ""
        );
      });

      grid.appendChild(club);
    });

  } catch (error) {
    console.error("Error cargando clubes", error);
    grid.innerHTML = "<p>Error al cargar clubes</p>";
  }
}

function abrirClub(nombre, logo, telefono, direccion, sitioWeb) {
  cerrarClub();

  const overlay = document.createElement("div");
  overlay.className = "club-overlay";
  overlay.id = "clubOverlay";

  overlay.innerHTML = `
    <div class="club-modal">
      <button class="cerrar-modal">✕</button>

      <img src="${logo}" alt="${nombre}" class="modal-logo">

      <h3>${nombre}</h3>

      ${telefono ? `<p><strong>Tel:</strong> ${telefono}</p>` : ""}
      ${direccion ? `<p><strong>Dirección:</strong> ${direccion}</p>` : ""}
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

  overlay.querySelector(".cerrar-modal").addEventListener("click", cerrarClub);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) cerrarClub();
  });
}

function cerrarClub() {
  const overlay = document.getElementById("clubOverlay");
  if (overlay) overlay.remove();
}
