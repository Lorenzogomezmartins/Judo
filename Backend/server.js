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
   RESULTADOS FTP (HOSTINGER FIX DEFINITIVO)
========================= */

const servirResultadosFTP = (req, res) => {
  const { slug, archivo = 'index.html' } = req.params;

  // Rutas posibles en la estructura de Hostinger (subiendo un nivel desde el backend o buscando en la raíz absoluta)
  const posiblesRutas = [
    path.join(__dirname, '../../public_html/resultados', slug, archivo), // Si Backend está dentro de una carpeta al mismo nivel que public_html
    path.join(__dirname, '../public_html/resultados', slug, archivo),
    path.join(process.cwd(), '../public_html/resultados', slug, archivo),
    path.join(process.cwd(), 'public_html/resultados', slug, archivo),
    `/home/mediumaquamarine/public_html/resultados/${slug}/${archivo}`,
    `/home/u12345678/public_html/resultados/${slug}/${archivo}`
  ];

  for (const ruta of posiblesRutas) {
    if (fs.existsSync(ruta) && fs.statSync(ruta).isFile()) {
      return res.sendFile(ruta);
    }
  }

  // Búsqueda alternativa del index.html dentro de la carpeta del torneo
  const posiblesCarpetas = [
    path.join(__dirname, '../../public_html/resultados', slug),
    path.join(__dirname, '../public_html/resultados', slug),
    path.join(process.cwd(), '../public_html/resultados', slug),
    path.join(process.cwd(), 'public_html/resultados', slug)
  ];

  for (const carpeta of posiblesCarpetas) {
    const indexHtml = path.join(carpeta, 'index.html');
    if (fs.existsSync(indexHtml)) {
      return res.sendFile(indexHtml);
    }
  }

  return res.status(404).send(`[Error] No se encontró el resultado físico para el torneo: ${slug}`);
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