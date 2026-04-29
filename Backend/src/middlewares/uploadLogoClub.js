// src/middlewares/uploadLogoClub.js

import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ruta al Frontend real
const uploadPath = path.resolve(
  __dirname,
  "../../../Frontend/assets/Clubes"
);

// crear carpeta si no existe
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// permitir solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes"), false);
  }
};

// exportar middleware
export const uploadLogoClub = multer({
  storage,
  fileFilter
});