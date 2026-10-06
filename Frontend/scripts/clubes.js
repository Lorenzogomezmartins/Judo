/* ============================================
   CLUBES (público)
   - Grilla con solo el logo de cada club
   - Al tocar un logo se abre una tarjeta con sus datos
   - Los datos que no existen NO se muestran
============================================ */

let clubesCargados = [];
let overlayKeyHandler = null;

/* ============================================
   UTILIDADES
============================================ */

function escaparHtml(valor = "") {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function texto(valor) {
  return String(valor ?? "").trim();
}

function esUrlHttp(url = "") {
  return /^https?:\/\//i.test(texto(url));
}

/* Iniciales para cuando el club no tiene logo (o falla la imagen) */
function obtenerIniciales(nombre = "") {
  const palabras = texto(nombre)
    .split(/\s+/)
    .filter((palabra) => /[A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(palabra));

  if (!palabras.length) return "?";

  return palabras
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join("");
}

/*
  Convierte lo que venga de la planilla en un link válido.
  Acepta:
    - https://instagram.com/usuario
    - instagram.com/usuario
    - @usuario
    - usuario
*/
function normalizarRedSocial(valor, dominio) {
  const original = texto(valor);

  if (!original) return "";

  if (esUrlHttp(original)) return original;

  if (original.toLowerCase().includes(dominio)) {
    return `https://${original.replace(/^\/+/, "")}`;
  }

  if (/\s/.test(original)) return "";

  const usuario = original.replace(/^@/, "");

  if (!usuario) return "";

  return `https://www.${dominio}/${encodeURIComponent(usuario)}`;
}

function hrefTelefono(telefono) {
  const limpio = texto(telefono).replace(/[^\d+]/g, "");

  return limpio ? `tel:${limpio}` : "";
}

/* ============================================
   ÍCONOS
============================================ */

const ICONOS = {
  ubicacion: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"></path>
      <circle cx="12" cy="10" r="2.5"></circle>
    </svg>
  `,
  telefono: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"></path>
    </svg>
  `,
  email: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2"></rect>
      <path d="m3 7 9 6 9-6"></path>
    </svg>
  `,
  facebook: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  `,
  instagram: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5"></rect>
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M17.5 6.5h.01"></path>
    </svg>
  `,
};

/* ============================================
   GRILLA DE LOGOS
============================================ */

function crearFallbackLogo(nombre) {
  const fallback = document.createElement("div");

  fallback.className = "club-logo-fallback";
  fallback.textContent = obtenerIniciales(nombre);
  fallback.setAttribute("aria-hidden", "true");

  return fallback;
}

function crearLogoGrilla(club) {
  const logo = texto(club.logo);

  if (!logo) return crearFallbackLogo(club.nombre);

  const img = document.createElement("img");

  img.src = logo;
  img.alt = "";
  img.loading = "lazy";

  // Si la imagen no carga, mostramos las iniciales
  img.addEventListener("error", () => {
    img.replaceWith(crearFallbackLogo(club.nombre));
  });

  return img;
}

export async function cargarClubes() {
  const grid = document.getElementById("clubesGrid");

  if (!grid) return;

  grid.innerHTML = "<p>Cargando clubes...</p>";

  try {
    const res = await fetch("/api/clubes");

    if (!res.ok) {
      throw new Error("Error al obtener clubes");
    }

    const clubes = await res.json();

    if (!Array.isArray(clubes) || !clubes.length) {
      grid.innerHTML = "<p>Todavía no hay clubes cargados.</p>";
      return;
    }

    clubesCargados = clubes;
    grid.innerHTML = "";

    clubes.forEach((club, indice) => {
      const nombre = texto(club.nombre) || "Club";

      const boton = document.createElement("button");

      boton.type = "button";
      boton.className = "club-logo-container";
      boton.title = nombre;
      boton.setAttribute("aria-label", `Ver datos de ${nombre}`);

      boton.appendChild(crearLogoGrilla(club));

      boton.addEventListener("click", () => abrirClub(indice));

      grid.appendChild(boton);
    });
  } catch (error) {
    console.error("Error cargando clubes", error);
    grid.innerHTML = "<p>Error al cargar clubes</p>";
  }
}

/* ============================================
   TARJETA DEL CLUB
============================================ */

/* Una fila de dato: ícono + etiqueta + contenido */
function filaDato(icono, etiqueta, contenidoHtml) {
  return `
    <li class="club-dato">
      <span class="club-dato-icono">${icono}</span>

      <span class="club-dato-texto">
        <small>${etiqueta}</small>
        ${contenidoHtml}
      </span>
    </li>
  `;
}

/* Arma solo las filas que tienen información */
function construirDatos(club) {
  const filas = [];

  const ubicacion = texto(club.ubicacion || club.direccion);
  const ubicacionMaps = texto(club.ubicacionMaps);
  const telefono = texto(club.telefono);
  const email = texto(club.email);

  if (ubicacion) {
    const contenido = esUrlHttp(ubicacionMaps)
      ? `<a href="${escaparHtml(ubicacionMaps)}" target="_blank" rel="noopener noreferrer">${escaparHtml(ubicacion)}</a>`
      : `<span>${escaparHtml(ubicacion)}</span>`;

    filas.push(filaDato(ICONOS.ubicacion, "Ubicación", contenido));
  }

  if (telefono) {
    const href = hrefTelefono(telefono);

    const contenido = href
      ? `<a href="${escaparHtml(href)}">${escaparHtml(telefono)}</a>`
      : `<span>${escaparHtml(telefono)}</span>`;

    filas.push(filaDato(ICONOS.telefono, "Teléfono", contenido));
  }

  if (email) {
    filas.push(
      filaDato(
        ICONOS.email,
        "E-mail",
        `<a href="mailto:${escaparHtml(email)}">${escaparHtml(email)}</a>`
      )
    );
  }

  return filas;
}

function construirRedes(club) {
  const redes = [];

  const facebook = normalizarRedSocial(club.facebook, "facebook.com");
  const instagram = normalizarRedSocial(club.instagram, "instagram.com");

  if (facebook) {
    redes.push(`
      <a
        href="${escaparHtml(facebook)}"
        target="_blank"
        rel="noopener noreferrer"
        class="club-red club-red-facebook"
      >
        ${ICONOS.facebook}
        Facebook
      </a>
    `);
  }

  if (instagram) {
    redes.push(`
      <a
        href="${escaparHtml(instagram)}"
        target="_blank"
        rel="noopener noreferrer"
        class="club-red club-red-instagram"
      >
        ${ICONOS.instagram}
        Instagram
      </a>
    `);
  }

  return redes;
}

function abrirClub(indice) {
  const club = clubesCargados[indice];

  if (!club) return;

  cerrarClub();

  const nombre = texto(club.nombre) || "Club";
  const logo = texto(club.logo);

  const filas = construirDatos(club);
  const redes = construirRedes(club);

  const logoHtml = logo
    ? `<img src="${escaparHtml(logo)}" alt="Logo de ${escaparHtml(nombre)}" class="modal-logo">`
    : `<div class="modal-logo-fallback" aria-hidden="true">${escaparHtml(obtenerIniciales(nombre))}</div>`;

  const sinDatos = !filas.length && !redes.length;

  const overlay = document.createElement("div");

  overlay.className = "club-overlay";
  overlay.id = "clubOverlay";

  overlay.innerHTML = `
    <div
      class="club-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clubModalTitulo"
    >
      <button type="button" class="cerrar-modal" aria-label="Cerrar">✕</button>

      <div class="club-modal-header">
        ${logoHtml}

        <h3 id="clubModalTitulo">${escaparHtml(nombre)}</h3>
      </div>

      ${
        filas.length
          ? `<ul class="club-datos">${filas.join("")}</ul>`
          : ""
      }

      ${
        redes.length
          ? `<div class="club-redes">${redes.join("")}</div>`
          : ""
      }

      ${
        sinDatos
          ? `<p class="club-sin-datos">Este club todavía no cargó sus datos de contacto.</p>`
          : ""
      }
    </div>
  `;

  // Si el logo no carga, lo reemplazamos por las iniciales
  const imgLogo = overlay.querySelector(".modal-logo");

  imgLogo?.addEventListener("error", () => {
    const fallback = document.createElement("div");

    fallback.className = "modal-logo-fallback";
    fallback.textContent = obtenerIniciales(nombre);
    fallback.setAttribute("aria-hidden", "true");

    imgLogo.replaceWith(fallback);
  });

  document.body.appendChild(overlay);
  document.body.classList.add("club-modal-abierto");

  const botonCerrar = overlay.querySelector(".cerrar-modal");

  botonCerrar.addEventListener("click", cerrarClub);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) cerrarClub();
  });

  overlayKeyHandler = (e) => {
    if (e.key === "Escape") cerrarClub();
  };

  document.addEventListener("keydown", overlayKeyHandler);

  botonCerrar.focus();
}

function cerrarClub() {
  const overlay = document.getElementById("clubOverlay");

  if (overlay) overlay.remove();

  document.body.classList.remove("club-modal-abierto");

  if (overlayKeyHandler) {
    document.removeEventListener("keydown", overlayKeyHandler);
    overlayKeyHandler = null;
  }
}