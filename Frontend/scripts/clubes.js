/* ============================================
   CLUBES (público)
   - Grilla con el logo de cada club
     (solo clubes que completaron el logo, en orden alfabético)
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

/*
  Devuelve una URL válida (con https://) o "" si no hay.
  Acepta links de Google Maps completos, cortos (maps.app.goo.gl)
  y también si vienen sin el "https://" delante.
*/
function normalizarUrl(valor) {
  const original = texto(valor);

  if (!original) return "";

  if (esUrlHttp(original)) return original;

  // Sin protocolo: "www.google.com/maps/...", "maps.app.goo.gl/..."
  if (/^(www\.|[a-z0-9-]+\.[a-z]{2,})(\/|$)/i.test(original) && !/\s/.test(original)) {
    return `https://${original}`;
  }

  return "";
}

/*
  Arma la URL para mostrar el mapa dentro de la tarjeta (iframe).
  Un link normal de Google Maps no se puede incrustar tal cual, así que
  se extrae de él el lugar y se usa el formato "embed".

  Orden de prioridad:
    1) coordenadas exactas del pin  (...!3d-34.63!4d-58.42...)
    2) nombre del lugar             (/maps/place/Parque+Chacabuco,...)
    3) coordenadas de la vista      (/@-34.63,-58.43,17z)
    4) la dirección escrita en la planilla
       (sirve para links cortos tipo maps.app.goo.gl, que no se pueden leer)
*/
function obtenerUrlMapaEmbebido(urlMapa, ubicacion = "") {
  const url = texto(urlMapa);

  let consulta = "";

  const pin = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);

  if (pin) {
    consulta = `${pin[1]},${pin[2]}`;
  }

  if (!consulta) {
    const lugar = url.match(/\/maps\/place\/([^/@?]+)/);

    if (lugar) {
      try {
        consulta = decodeURIComponent(lugar[1].replace(/\+/g, " ")).trim();
      } catch {
        consulta = "";
      }
    }
  }

  if (!consulta) {
    const vista = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);

    if (vista) {
      consulta = `${vista[1]},${vista[2]}`;
    }
  }

  if (!consulta) {
    consulta = texto(ubicacion);
  }

  if (!consulta) return "";

  return `https://www.google.com/maps?q=${encodeURIComponent(consulta)}&z=16&output=embed`;
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
  mapa: `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z"></path>
      <path d="M9 4v13"></path>
      <path d="M15 6.5v13"></path>
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

/*
  Solo se muestran los clubes que completaron el logo,
  ordenados alfabéticamente por nombre.
*/
function prepararClubes(clubes) {
  return clubes
    .filter((club) => texto(club?.logo) && texto(club?.nombre))
    .sort((a, b) =>
      texto(a.nombre).localeCompare(texto(b.nombre), "es", {
        sensitivity: "base",
        numeric: true,
      })
    );
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

    const datos = await res.json();

    if (!Array.isArray(datos)) {
      throw new Error("Formato de clubes inválido");
    }

    // Esta lista es la que usa la tarjeta, así los índices coinciden
    clubesCargados = prepararClubes(datos);

    if (!clubesCargados.length) {
      grid.innerHTML = "<p>Todavía no hay clubes con logo cargado.</p>";
      return;
    }

    grid.innerHTML = "";

    clubesCargados.forEach((club, indice) => {
      const nombre = texto(club.nombre);

      const boton = document.createElement("button");

      boton.type = "button";
      boton.className = "club-logo-container";
      boton.title = nombre;
      boton.setAttribute("aria-label", `Ver datos de ${nombre}`);

      const img = document.createElement("img");

      img.src = texto(club.logo);
      img.alt = "";
      img.loading = "lazy";

      // Si la imagen no carga, el club se quita de la grilla
      img.addEventListener("error", () => boton.remove());

      boton.appendChild(img);
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

/* Una fila de dato: ícono + etiqueta + contenido (+ bloque extra opcional) */
function filaDato(icono, etiqueta, contenidoHtml, extraHtml = "") {
  return `
    <li class="club-dato">
      <span class="club-dato-icono">${icono}</span>

      <span class="club-dato-texto">
        <small>${etiqueta}</small>
        ${contenidoHtml}
      </span>

      ${extraHtml ? `<div class="club-dato-extra">${extraHtml}</div>` : ""}
    </li>
  `;
}

/* Arma solo las filas que tienen información */
function construirDatos(club) {
  const filas = [];

  const ubicacion = texto(club.ubicacion || club.direccion);
  const urlMapa = normalizarUrl(club.ubicacionMaps);
  const telefono = texto(club.telefono);
  const email = texto(club.email);

  /*
    UBICACIÓN
    - Si hay dirección: se muestra el texto.
    - Si hay link de Google Maps (columna AB): se muestra el mapa
      chiquito dentro de la tarjeta, aunque no haya dirección escrita.
    - Si no se puede armar el mapa, queda un botón "Ver mapa".
  */
  if (ubicacion || urlMapa) {
    const nombre = texto(club.nombre) || "Club";

    const textoUbicacion = ubicacion
      ? `<span>${escaparHtml(ubicacion)}</span>`
      : "";

    const urlEmbebido = urlMapa
      ? obtenerUrlMapaEmbebido(urlMapa, ubicacion)
      : "";

    const mapaHtml = urlEmbebido
      ? `
        <div class="club-mapa-embed">
          <iframe
            src="${escaparHtml(urlEmbebido)}"
            title="Mapa de ${escaparHtml(nombre)}"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
          ></iframe>
        </div>
      `
      : "";

    const botonMapa =
      !urlEmbebido && urlMapa
        ? `
          <a
            href="${escaparHtml(urlMapa)}"
            target="_blank"
            rel="noopener noreferrer"
            class="club-mapa-link"
          >
            ${ICONOS.mapa}
            Ver mapa
          </a>
        `
        : "";

    filas.push(
      filaDato(
        ICONOS.ubicacion,
        "Ubicación",
        textoUbicacion + botonMapa,
        mapaHtml
      )
    );
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
    : "";

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

  // Si el logo no carga, simplemente no se muestra
  const imgLogo = overlay.querySelector(".modal-logo");

  imgLogo?.addEventListener("error", () => imgLogo.remove());

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