import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import apiRoutes from './src/routes/RoutesMain.js';
import connectDB from './src/config/db.js';
import sincronizarResultadosFTPAutomatico from "./src/controllers/resultados/sincronizarResultadosFTPAutomatico.js";
import Resultado from './src/models/Resultado.js';
import Torneo from './src/models/Torneo.js'; // NUEVO: fallback por slug del torneo

dotenv.config();
connectDB();

const app = express();

// Necesario para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   FRONTEND / ASSETS
========================= */

app.use(express.static(path.join(__dirname, '../Frontend')));

/* =========================
   RESULTADOS REDIRECCIÓN HOSTINGER (RÁPIDO Y TOTAL)
========================= */

const RESULTADOS_BASE_URL =
  process.env.RESULTADOS_BASE_URL ||
  "https://mediumaquamarine-pelican-819722.hostingersite.com/resultados";

// ---------------------------------------------------------------
// NUEVO: preferir index1.html (versión móvil) y, si no existe o
// falla por cualquier motivo, caer en index.html (versión normal).
// ---------------------------------------------------------------
const INDEX_PREFERIDO = "index1.html";   // versión móvil
const INDEX_RESPALDO = "index.html";     // versión normal
const CARPETA_FMJ = "fmj";               // subcarpeta con el sistema nuevo dentro de cada torneo
const TIMEOUT_CHEQUEO_MS = 4000;         // máximo de espera al chequear
const CACHE_CHEQUEO_MS = 30 * 1000;      // recordar el resultado 30 s

// NUEVO: torneos cuyo botón "Ver resultados" NO va a index.html sino a otra ruta
// dentro de la carpeta de resultados de Hostinger.
//   clave = slug del torneo (en minúsculas, como figura en Mongo)
//   valor = ruta relativa a RESULTADOS_BASE_URL (terminar con "/" si es una carpeta)
const PORTADAS_ESPECIALES = {
  "metropolitano-2026": "metropolitano-2026/fmj/",
};

const cacheChequeos = new Map(); // url -> { ok, hasta }

// Detecta si quien visita está en un celular o tablet.
function esDispositivoMovil(req) {
  // Header moderno que mandan Chrome/Edge/Android: "?1" = móvil
  const chMobile = req.headers["sec-ch-ua-mobile"];
  if (chMobile === "?1") return true;
  if (chMobile === "?0") return false;

  // Respaldo: User-Agent (Safari/iPhone y otros no mandan el header anterior)
  const ua = String(req.headers["user-agent"] || "");
  return /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile|BlackBerry|webOS/i.test(ua);
}

// Devuelve true solo si la URL responde OK y es un HTML.
// Ante cualquier error, timeout o respuesta rara devuelve false.
async function existeArchivoHTML(url) {
  const ahora = Date.now();
  const guardado = cacheChequeos.get(url);

  if (guardado && guardado.hasta > ahora) {
    return guardado.ok;
  }

  let ok = false;
  const controlador = new AbortController();
  const timer = setTimeout(() => controlador.abort(), TIMEOUT_CHEQUEO_MS);

  try {
    const respuesta = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controlador.signal,
      headers: { "Cache-Control": "no-cache" },
    });

    const tipo = (respuesta.headers.get("content-type") || "").toLowerCase();

    ok = respuesta.ok && tipo.includes("text/html");

    // Descartamos el cuerpo para no gastar memoria
    if (respuesta.body && typeof respuesta.body.cancel === "function") {
      respuesta.body.cancel().catch(() => {});
    }
  } catch (error) {
    ok = false;
  } finally {
    clearTimeout(timer);
  }

  cacheChequeos.set(url, { ok, hasta: ahora + CACHE_CHEQUEO_MS });
  return ok;
}

// NUEVO: convierte un texto en slug conservando todas las palabras y el año
// (ej: "Metropolitano 2026" -> "metropolitano-2026")
function slugDesdeTexto(texto = "") {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// NUEVO: posibles nombres de la carpeta del torneo en Hostinger, por prioridad.
// Sirve cuando el slug de Mongo no coincide con el nombre real de la carpeta.
function candidatosCarpeta({ slug, nombre, carpetaFTP }) {
  const lista = [carpetaFTP, slug, slugDesdeTexto(nombre)]
    .map((x) => String(x || "").trim())
    .filter(Boolean);

  return [...new Set(lista)];
}

// NUEVO: true si la carpeta tiene alguna portada de resultados publicada
async function carpetaTieneResultados(carpeta) {
  const base = `${RESULTADOS_BASE_URL}/${encodeURIComponent(carpeta)}`;

  return (
    (await existeArchivoHTML(`${base}/${CARPETA_FMJ}/index.html`)) ||
    (await existeArchivoHTML(`${base}/${INDEX_PREFERIDO}`)) ||
    (await existeArchivoHTML(`${base}/${INDEX_RESPALDO}`))
  );
}

// NUEVO: devuelve la primera carpeta candidata que realmente existe en Hostinger.
// Si ninguna tiene resultados, devuelve la primera candidata con hay = false.
async function resolverCarpeta(datos) {
  const candidatos = candidatosCarpeta(datos);

  for (const carpeta of candidatos) {
    if (await carpetaTieneResultados(carpeta)) {
      return { carpeta, hay: true };
    }
  }

  return { carpeta: candidatos[0] || null, hay: false };
}

const servirResultadosFTP = async (req, res) => {
  try {
    const slug = String(req.params.slug || "").toLowerCase().trim();

    // Express 5: el comodín (*archivo) llega como array -> lo unimos con "/"
    const p = req.params.archivo;
    let archivo = Array.isArray(p) ? p.join("/") : (p || INDEX_RESPALDO);

    // NUEVO: si el torneo tiene portada especial, reemplaza al index.html
    if (archivo === INDEX_RESPALDO && PORTADAS_ESPECIALES[slug]) {
      const urlEspecial = `${RESULTADOS_BASE_URL}/${PORTADAS_ESPECIALES[slug]}`;

      console.log("-> Portada especial, redirigiendo a:", urlEspecial);
      res.set("Cache-Control", "no-store");
      return res.redirect(302, urlEspecial);
    }

    // 1) ¿Hay un Resultado sincronizado? (búsqueda exacta, sin regex)
    const resultadoDB = await Resultado.findOne({
      $or: [
        { torneoSlug: slug },
        { carpetaFTP: slug }
      ]
    });

    // 2) Datos del torneo (por slug) para conocer también su nombre
    const torneo = await Torneo.findOne({ slug });

    if (!resultadoDB && !torneo) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><title>No encontrado</title></head>
        <body style="background:#0f172a;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">
            <div style="background:#1e293b;padding:2rem;border-radius:8px;text-align:center;">
                <h1>Torneo no encontrado</h1>
                <p>El torneo "${slug}" no existe.</p>
            </div>
        </body>
        </html>
      `);
    }

    // 3) NUEVO: buscamos la carpeta real en Hostinger probando el nombre guardado,
    //    el slug y el nombre del torneo convertido a slug (con año).
    const { carpeta } = await resolverCarpeta({
      slug: torneo?.slug || slug,
      nombre: torneo?.nombre,
      carpetaFTP: resultadoDB?.carpetaFTP,
    });

    if (!carpeta) {
      return res.status(404).send("No se encontró la carpeta de resultados.");
    }

    // NUEVO: solo cuando piden la portada (index.html) probamos primero index1.html.
    // Cualquier otro archivo (categorías, medallas, etc.) se redirige igual que antes.
    // NUEVO: orden de prioridad para la portada de resultados:
    //   1) <carpeta>/fmj/index.html   (todos los dispositivos)
    //   2) <carpeta>/index1.html      (solo celulares)
    //   3) <carpeta>/index.html       (respaldo)
    if (archivo === INDEX_RESPALDO) {
      const urlFmj =
        `${RESULTADOS_BASE_URL}/${encodeURIComponent(carpeta)}/${CARPETA_FMJ}/index.html`;

      if (await existeArchivoHTML(urlFmj)) {
        console.log("-> Portada en carpeta fmj, redirigiendo a:", urlFmj);
        res.set("Vary", "User-Agent, Sec-CH-UA-Mobile");
        res.set("Cache-Control", "no-store");
        return res.redirect(302, urlFmj);
      }
    }

    // Solo en celulares/tablets se intenta la versión móvil; en PC va index.html.
    if (archivo === INDEX_RESPALDO && esDispositivoMovil(req)) {
      const urlPreferida =
        `${RESULTADOS_BASE_URL}/${encodeURIComponent(carpeta)}/${INDEX_PREFERIDO}`;

      const hayPreferido = await existeArchivoHTML(urlPreferida);

      if (hayPreferido) {
        archivo = INDEX_PREFERIDO;
      } else {
        console.log(`-> ${INDEX_PREFERIDO} no disponible en "${carpeta}", uso ${INDEX_RESPALDO}`);
      }
    }

    // Codifica cada tramo de la ruta (carpeta y subcarpetas/archivos)
    const archivoCodificado = archivo
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    const urlHostinger = `${RESULTADOS_BASE_URL}/${encodeURIComponent(carpeta)}/${archivoCodificado}`;

    console.log("-> Redirigiendo a Hostinger:", urlHostinger);
    res.set("Vary", "User-Agent, Sec-CH-UA-Mobile");
    res.set("Cache-Control", "no-store");
    return res.redirect(302, urlHostinger);

  } catch (error) {
    console.error("Error al redirigir resultado:", error);
    return res.status(500).send("Error interno al procesar la solicitud.");
  }
};

app.get('/resultados/:slug', servirResultadosFTP);
app.get('/resultados/:slug/*archivo', servirResultadosFTP);

// NUEVO: devuelve la lista de slugs de torneos que tienen resultados subidos
// (es decir, que existe un index.html en su carpeta de Hostinger).
// El frontend la usa para mostrar u ocultar el botón "Ver resultados".
app.get('/api/resultados-disponibles', async (req, res) => {
  try {
    const torneos = await Torneo.find({ slug: { $exists: true, $ne: "" } })
      .select("slug nombre")
      .lean();

    const resultados = await Resultado.find({})
      .select("torneoSlug carpetaFTP")
      .lean();

    const carpetaPorSlug = new Map(
      resultados.map((r) => [r.torneoSlug, (r.carpetaFTP || "").trim()])
    );

    const chequeos = await Promise.all(
      torneos.map(async (torneo) => {
        // Torneos con portada especial: el botón siempre se muestra
        if (PORTADAS_ESPECIALES[String(torneo.slug).toLowerCase()]) {
          return torneo.slug;
        }

        const { hay } = await resolverCarpeta({
          slug: torneo.slug,
          nombre: torneo.nombre,
          carpetaFTP: carpetaPorSlug.get(torneo.slug),
        });

        return hay ? torneo.slug : null;
      })
    );

    res.set("Cache-Control", "no-store");
    return res.json(chequeos.filter(Boolean));
  } catch (error) {
    console.error("Error en /api/resultados-disponibles:", error);
    return res.status(500).json({ error: error.message });
  }
});

/* =========================
   VERIFICACIÓN RÁPIDA
========================= */

app.get('/test', (req, res) => {
  res.json({ mensaje: "Servidor funcionando correctamente" });
});

/* =========================
   API
========================= */

app.use('/api', apiRoutes);

/* =========================
   FTP AL ARRANCAR (Solo para registrar carpetas/slugs en Mongo)
========================= */

const ejecutarSincronizacionAlArrancar = async () => {
  try {
    console.log("⏳ Sincronizando estructura con FTP al encender el servidor...");
    await sincronizarResultadosFTPAutomatico();
    console.log("✅ Sincronización inicial completada con éxito.");
  } catch (error) {
    console.error("❌ ERROR CRÍTICO EN SINCRONIZACIÓN INICIAL:", error);
  }
};

ejecutarSincronizacionAlArrancar();

/* =========================
   HOME
========================= */

app.get('/', (req, res) => {
  res.sendFile(
    path.join(__dirname, '../Frontend/pages/main.html')
  );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🟢 Servidor corriendo en http://localhost:${PORT}`);
});