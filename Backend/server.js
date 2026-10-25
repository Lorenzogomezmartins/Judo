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
const TIMEOUT_CHEQUEO_MS = 4000;         // máximo de espera al chequear
const CACHE_CHEQUEO_MS = 30 * 1000;      // recordar el resultado 30 s

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

const servirResultadosFTP = async (req, res) => {
  try {
    const slug = String(req.params.slug || "").toLowerCase().trim();

    // Express 5: el comodín (*archivo) llega como array -> lo unimos con "/"
    const p = req.params.archivo;
    let archivo = Array.isArray(p) ? p.join("/") : (p || INDEX_RESPALDO);

    // 1) ¿Hay un Resultado sincronizado? (búsqueda exacta, sin regex)
    const resultadoDB = await Resultado.findOne({
      $or: [
        { torneoSlug: slug },
        { carpetaFTP: slug }
      ]
    });

    let carpeta = resultadoDB?.carpetaFTP?.trim();

    // 2) Si no hay Resultado, usamos el slug del torneo
    //    (es el mismo nombre con el que se creó la carpeta en el FTP)
    if (!carpeta) {
      const torneo = await Torneo.findOne({ slug });

      if (!torneo) {
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

      carpeta = torneo.slug;
    }

    // NUEVO: solo cuando piden la portada (index.html) probamos primero index1.html.
    // Cualquier otro archivo (categorías, medallas, etc.) se redirige igual que antes.
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