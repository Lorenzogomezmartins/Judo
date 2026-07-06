const API_GALERIA = "/api/galeria";

/* =============================
   HOME - TOP 5 MÁS LIKEADAS
============================= */

export async function cargarGaleriaHome() {
  const grid = document.getElementById("galeriaHomeGrid");
  if (!grid) return;

  grid.innerHTML = "<p>Cargando galería...</p>";

  try {
    const response = await fetch(API_GALERIA);
    const fotos = await response.json();

    const fotosOrdenadas = Array.isArray(fotos)
      ? fotos
          .filter((foto) => cantidadLikes(foto) > 0)
          .sort((a, b) => cantidadLikes(b) - cantidadLikes(a))
          .slice(0, 5)
      : [];

    if (!fotosOrdenadas.length) {
      grid.innerHTML = "<p>Todavía no hay fotos con Me gusta.</p>";
      return;
    }

    grid.innerHTML = "";

    fotosOrdenadas.forEach((foto) => {
      grid.appendChild(crearCardGaleriaHome(foto));
    });

    inicializarCarruselHome(grid);
  } catch (error) {
    console.error("Error cargando galería home:", error);
    grid.innerHTML = "<p>Error al cargar galería.</p>";
  }
}

function inicializarCarruselHome(grid) {
  const prev = document.getElementById("galeriaPrev");
  const next = document.getElementById("galeriaNext");

  if (!prev || !next) return;

  prev.onclick = () => {
    grid.scrollBy({
      left: -grid.clientWidth,
      behavior: "smooth",
    });
  };

  next.onclick = () => {
    grid.scrollBy({
      left: grid.clientWidth,
      behavior: "smooth",
    });
  };
}

/* =============================
   GALERÍA PÚBLICA COMPLETA
============================= */

export async function cargarGaleria() {
  const grid = document.getElementById("galeriaGridPublica");
  if (!grid) return;

  const inputTitulo = document.getElementById("filtroGaleriaTitulo");
  const inputDesde = document.getElementById("filtroGaleriaDesde");
  const inputHasta = document.getElementById("filtroGaleriaHasta");
  const btnLimpiar = document.getElementById("btnLimpiarGaleria");

  async function cargar() {
    grid.innerHTML = "<p>Cargando fotos...</p>";

    const params = new URLSearchParams();

    if (inputTitulo?.value.trim()) {
      params.append("titulo", inputTitulo.value.trim());
    }

    if (inputDesde?.value) {
      params.append("desde", inputDesde.value);
    }

    if (inputHasta?.value) {
      params.append("hasta", inputHasta.value);
    }

    const query = params.toString() ? `?${params.toString()}` : "";

    try {
      const response = await fetch(`${API_GALERIA}${query}`);
      const fotos = await response.json();

      if (!Array.isArray(fotos) || !fotos.length) {
        grid.innerHTML = "<p>No se encontraron fotos.</p>";
        return;
      }

      renderGaleriaMasonry(grid, fotos);
      
    } catch (error) {
      console.error("Error cargando galería:", error);
      grid.innerHTML = "<p>Error al cargar la galería.</p>";
    }
  }

  inputTitulo?.addEventListener("input", cargar);
  inputDesde?.addEventListener("change", cargar);
  inputHasta?.addEventListener("change", cargar);

  btnLimpiar?.addEventListener("click", () => {
    if (inputTitulo) inputTitulo.value = "";
    if (inputDesde) inputDesde.value = "";
    if (inputHasta) inputHasta.value = "";

    cargar();
  });

  

  await cargar();
}

/* =============================
   CARD HOME
============================= */

function crearCardGaleriaHome(foto) {
  const card = document.createElement("article");
  card.className = "galeria-home-card";

  card.innerHTML = `
    <div class="galeria-home-img-wrap">
      <img src="${foto.imagen}" alt="${foto.titulo || "Foto FMJ"}">

      <button class="galeria-home-like-btn" type="button">
        <i class="bi bi-heart-fill"></i>
        <span>${cantidadLikes(foto)}</span>
      </button>
    </div>

    <div class="galeria-home-card-info">
      ${foto.titulo ? `<h4>${foto.titulo}</h4>` : ""}
      ${foto.fecha ? `<p>${formatearFechaGaleria(foto.fecha)}</p>` : ""}
    </div>
  `;

  const btnLike = card.querySelector(".galeria-home-like-btn");

  btnLike.addEventListener("click", async () => {
    await alternarLike(foto._id, btnLike);
  });

  return card;
}

/* =============================
   CARD GALERÍA PÚBLICA
============================= */

function crearCardGaleriaPublica(foto) {
  const card = document.createElement("article");
  card.className = "galeria-publica-card";

  card.innerHTML = `
    <div class="galeria-publica-img-wrap">
      <img src="${foto.imagen}" alt="${foto.titulo || "Foto FMJ"}">

      <button class="galeria-publica-like-btn" type="button">
        <i class="bi bi-heart-fill"></i>
        <span>${cantidadLikes(foto)}</span>
      </button>
    </div>

    <div class="galeria-publica-card-info">
      ${foto.titulo ? `<h4>${foto.titulo}</h4>` : ""}
      ${foto.fecha ? `<p>${formatearFechaGaleria(foto.fecha)}</p>` : ""}
    </div>
  `;

 

  const btnLike = card.querySelector(".galeria-publica-like-btn");

  btnLike.addEventListener("click", async () => {
    await alternarLike(foto._id, btnLike);
  });

  return card;
}

/* =============================
   GRID GALERÍA PÚBLICA
============================= */

function ajustarCardPublica(card) {
  const grid = document.getElementById("galeriaGridPublica");
  if (!grid || !card) return;

  const rowHeight = parseInt(
    window.getComputedStyle(grid).getPropertyValue("grid-auto-rows")
  );

  const gap = parseInt(
    window.getComputedStyle(grid).getPropertyValue("gap")
  );

  const alturaCard = card.getBoundingClientRect().height;
  const span = Math.ceil((alturaCard + gap) / (rowHeight + gap));

  card.style.gridRowEnd = `span ${span}`;
}

function actualizarGridPublica() {
  const cards = document.querySelectorAll(".galeria-publica-card");

  cards.forEach((card) => {
    const img = card.querySelector("img");

    if (img && img.complete) {
      aplicarClaseCollage(card, img);
      ajustarCardPublica(card);
    } else if (img) {
      img.addEventListener(
        "load",
        () => {
          aplicarClaseCollage(card, img);
          ajustarCardPublica(card);
        },
        { once: true }
      );
    }
  });
}

function aplicarClaseCollage(card, img) {
  const ancho = img.naturalWidth;
  const alto = img.naturalHeight;

  if (!ancho || !alto) return;

  const relacion = alto / ancho;

  card.classList.remove(
    "foto-horizontal",
    "foto-cuadrada",
    "foto-vertical",
    "foto-alta"
  );

  if (relacion > 1.65) {
    card.classList.add("foto-alta");
  } else if (relacion > 1.18) {
    card.classList.add("foto-vertical");
  } else if (relacion < 0.78) {
    card.classList.add("foto-horizontal");
  } else {
    card.classList.add("foto-cuadrada");
  }
}

/* =============================
   LIKE
============================= */

async function alternarLike(id, boton) {
  try {
    const response = await fetch(`${API_GALERIA}/${id}/like`, {
      method: "POST",
    });

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(resultado.mensaje || "Error al dar like");
    }

    boton.classList.toggle("activo", resultado.dioLike);
    boton.querySelector("span").textContent = resultado.likes;
  } catch (error) {
    console.error("Error like:", error);
    alert("No se pudo actualizar el like");
  }
}


async function renderGaleriaMasonry(grid, fotos) {
  grid.innerHTML = "";

  const cantidadColumnas =
    window.innerWidth <= 550 ? 1 :
    window.innerWidth <= 900 ? 2 :
    3;

  grid.className = "galeria-publica-grid";

  const columnas = Array.from({ length: cantidadColumnas }, () => {
    const col = document.createElement("div");
    col.className = "galeria-publica-columna";
    grid.appendChild(col);
    return col;
  });

  const alturasColumnas = Array(cantidadColumnas).fill(0);

  for (const foto of fotos) {
    const card = crearCardGaleriaPublica(foto);
    const img = card.querySelector("img");

    await esperarImagen(img);

   const ancho = img.naturalWidth || 1;
const alto = img.naturalHeight || 1;

const relacion = ancho / alto;
const proporcion = alto / ancho;

if (relacion > 2.3) {
  card.classList.add("foto-super-horizontal");
} else if (relacion > 1.5) {
  card.classList.add("foto-horizontal");
} else if (relacion < 0.75) {
  card.classList.add("foto-vertical");
}

    const indiceColumnaMasBaja = alturasColumnas.indexOf(
      Math.min(...alturasColumnas)
    );

    columnas[indiceColumnaMasBaja].appendChild(card);

    alturasColumnas[indiceColumnaMasBaja] += proporcion;
  }
}

function esperarImagen(img) {
  return new Promise((resolve) => {
    if (!img) return resolve();

    if (img.complete && img.naturalWidth > 0) {
      resolve();
      return;
    }

    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
}
/* =============================
   HELPERS
============================= */

function cantidadLikes(foto) {
  return Array.isArray(foto.likes) ? foto.likes.length : 0;
}

function formatearFechaGaleria(fecha) {
  const fechaTexto = String(fecha).split("T")[0];
  const [anio, mes, dia] = fechaTexto.split("-");

  return `${dia}/${mes}/${anio}`;
}