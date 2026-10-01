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

const servirResultadosFTP = async (req, res) => {
  try {
    const slug = String(req.params.slug || "").toLowerCase().trim();

    // Express 5: el comodín (*archivo) llega como array -> lo unimos con "/"
    const p = req.params.archivo;
    const archivo = Array.isArray(p) ? p.join("/") : (p || "index.html");

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

    // Codifica cada tramo de la ruta (carpeta y subcarpetas/archivos)
    const archivoCodificado = archivo
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    const urlHostinger = `${RESULTADOS_BASE_URL}/${encodeURIComponent(carpeta)}/${archivoCodificado}`;

    console.log("-> Redirigiendo a Hostinger:", urlHostinger);
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