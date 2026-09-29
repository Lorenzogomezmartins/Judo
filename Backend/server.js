import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
   RESULTADOS REDIRECCIÓN HOSTINGER (RÁPIDO Y TOTAL)
========================= */

const servirResultadosFTP = async (req, res) => {
  try {
    const { slug, archivo = 'index.html' } = req.params;
    const slugLimpio = slug.toLowerCase().trim();

    const resultadoDB = await Resultado.findOne({ 
      $or: [
        { torneoSlug: slugLimpio },
        { carpetaFTP: { $regex: new RegExp(slugLimpio, 'i') } }
      ]
    });

    if (!resultadoDB || !resultadoDB.carpetaFTP) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><title>No encontrado</title></head>
        <body style="background:#0f172a;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">
            <div style="background:#1e293b;padding:2rem;border-radius:8px;text-align:center;">
                <h1>Torneo no encontrado</h1>
                <p>El torneo "${slug}" no está disponible o sincronizado.</p>
            </div>
        </body>
        </html>
      `);
    }

    // Redirige directamente a la URL pública de Hostinger para el index o cualquier sub-archivo
    const urlHostinger = `https://mediumaquamarine-pelican-819722.hostingersite.com/resultados/${resultadoDB.carpetaFTP}/${archivo}`;
    
    return res.redirect(302, urlHostinger);

  } catch (error) {
    console.error("Error al redirigir resultado:", error);
    return res.status(500).send("Error interno al procesar la solicitud.");
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