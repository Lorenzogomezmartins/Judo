import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import ftp from "basic-ftp";
import { Writable } from "stream";

import apiRoutes from './src/routes/RoutesMain.js';
import connectDB from './src/config/db.js';
import sincronizarResultadosFTPAutomatico from "./src/controllers/resultados/sincronizarResultadosFTPAutomatico.js";
import Resultado from './src/models/Resultado.js';

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
   RESULTADOS FTP (PUERTA + ARCHIVOS DIRECTOS)
========================= */

function obtenerConfigFTP() {
  return {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: false,
  };
}

async function descargarArchivoEspecificoFTP(carpetaFTP, archivoDeseado) {
  const client = new ftp.Client();
  client.ftp.timeout = 15000;
  const baseDir = (process.env.FTP_BASE_DIR || "public_html/resultados").replace(/^\/+/, "");
  
  try {
    await client.access(obtenerConfigFTP());
    
    let encontrado = false;
    const rutasProbar = [
      `/${baseDir}/${carpetaFTP}/${archivoDeseado}`,
      `/mediumaquamarine-pelican-819722.hostingersite.com/${baseDir}/${carpetaFTP}/${archivoDeseado}`
    ];

    let chunks = [];
    for (const ruta of rutasProbar) {
      try {
        chunks = [];
        await client.downloadTo(
          new Writable({
            write(chunk, encoding, callback) {
              chunks.push(chunk);
              callback();
            },
          }),
          ruta
        );
        encontrado = true;
        break;
      } catch (e) {
        // Probar siguiente ruta
      }
    }

    if (!encontrado) return null;
    return Buffer.concat(chunks);
  } catch (error) {
    return null;
  } finally {
    client.close();
  }
}

const servirResultadosFTP = async (req, res) => {
  try {
    const { slug, archivo = 'index.html' } = req.params;
    const slugLimpio = slug.toLowerCase().trim();

    let resultadoDB = await Resultado.findOne({ 
      $or: [
        { torneoSlug: slugLimpio },
        { carpetaFTP: { $regex: new RegExp(slugLimpio, 'i') } }
      ]
    });

    if (!resultadoDB) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><title>No encontrado</title></head>
        <body style="background:#0f172a;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">
            <div style="background:#1e293b;padding:2rem;border-radius:8px;text-align:center;">
                <h1>Torneo no encontrado</h1>
                <p>El torneo "${slug}" no está sincronizado.</p>
            </div>
        </body>
        </html>
      `);
    }

    // Si pide el index principal, lo servimos desde MongoDB
    if (archivo === 'index.html' && resultadoDB.contenidoOriginal) {
      return res.setHeader('Content-Type', 'text/html').send(resultadoDB.contenidoOriginal);
    }

    // Si pide archivos secundarios (otros html, css, js, imágenes), los buscamos directo al FTP
    const archivoBuffer = await descargarArchivoEspecificoFTP(resultadoDB.carpetaFTP, archivo);
    
    if (!archivoBuffer) {
      return res.status(404).send("Archivo no encontrado en el servidor FTP.");
    }

    // Headers correspondientes
    if (archivo.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
    else if (archivo.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
    else if (archivo.endsWith('.png')) res.setHeader('Content-Type', 'image/png');
    else if (archivo.endsWith('.jpg') || archivo.endsWith('.jpeg')) res.setHeader('Content-Type', 'image/jpeg');
    else res.setHeader('Content-Type', 'text/html');

    return res.send(archivoBuffer);

  } catch (error) {
    console.error("Error al servir resultado:", error);
    return res.status(500).send("Error interno al procesar el archivo.");
  }
};

app.get('/resultados/:slug', servirResultadosFTP);
app.get('/resultados/:slug/:archivo', servirResultadosFTP);

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
   FTP AL ARRANCAR
========================= */

const ejecutarSincronizacionAlArrancar = async () => {
  try {
    console.log("⏳ Sincronizando con FTP al encender el servidor...");
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