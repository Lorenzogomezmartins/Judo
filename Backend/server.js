import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import apiRoutes from './src/routes/RoutesMain.js';
import connectDB from './src/config/db.js';
import sincronizarResultadosFTPAutomatico from "./src/controllers/resultados/sincronizarResultadosFTPAutomatico.js";
import { ejecutarImportacionRanking } from "./src/controllers/ranking/importarRanking.controller.js";
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
   RESULTADOS FTP (MONGODB FLEXIBLE)
========================= */

const servirResultadosFTP = async (req, res) => {
  try {
    const { slug, archivo = 'index.html' } = req.params;
    
    // Limpieza flexible del slug para asegurar coincidencia con MongoDB
    const slugLimpio = slug.toLowerCase().trim();

    let resultadoDB = await Resultado.findOne({ 
      $or: [
        { torneoSlug: slugLimpio },
        { carpetaFTP: { $regex: new RegExp(slugLimpio, 'i') } }
      ]
    });

    // Si aún no lo encuentra, buscamos de forma parcial por cualquier coincidencia en la ruta
    if (!resultadoDB) {
      resultadoDB = await Resultado.findOne({
        rutaFTP: { $regex: new RegExp(slugLimpio, 'i') }
      });
    }

    if (resultadoDB && resultadoDB.contenidoOriginal) {
      return res.setHeader('Content-Type', 'text/html').send(resultadoDB.contenidoOriginal);
    }

    // Si no está en la base de datos de Mongo, devolvemos un mensaje claro en lugar de mandar a un Hostinger inexistente
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <title>Resultado no encontrado</title>
          <style>
              body { font-family: sans-serif; background: #0f172a; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
              .box { background: #1e293b; padding: 2rem; border-radius: 8px; text-align: center; border: 1px solid #334155; }
              h1 { color: #38bdf8; }
          </style>
      </head>
      <body>
          <div class="box">
              <h1>Torneo no sincronizado</h1>
              <p>El torneo con el identificador <strong>"${slug}"</strong> no se encontró en la base de datos o aún no se sincronizó desde el FTP.</p>
          </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error("Error al servir resultado:", error);
    return res.status(500).send("Error interno al procesar el resultado.");
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
   FTP AUTOMÁTICO
========================= */

setInterval(async () => {
  try {
    console.log("⏳ Revisando FTP automáticamente...");
    await sincronizarResultadosFTPAutomatico();
  } catch (error) {
    console.error("❌ Error en FTP automático:", error.message);
  }
}, 5 * 60 * 1000);



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