import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import apiRoutes from './src/routes/RoutesMain.js';
import connectDB from './src/config/db.js';

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
   VERIFICACIÓN RÁPIDA
========================= */

app.get('/test', (req, res) => {
  res.json({ mensaje: "Servidor funcionando correctamente" });
});

/* =========================
   FRONTEND
========================= */

app.use(express.static(path.join(__dirname, '../Frontend')));

/* =========================
   API
========================= */

app.use('/api', apiRoutes);

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