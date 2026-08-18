import { Router } from "express";

import crearInscripcion from "../controllers/inscripcionesTorneo/crearnscrIpcion.js";
import listarInscripciones from "../controllers/inscripcionesTorneo/listarInscripciones.js";
import obtenerInscripcion from "../controllers/inscripcionesTorneo/obtenerInscripcion.js";
import actualizarInscripcion from "../controllers/inscripcionesTorneo/actualizarInscripcion.js";
import eliminarInscripcion from "../controllers/inscripcionesTorneo/eliminarInscripcion.js";
import exportarInscripcionesCSV from "../controllers/inscripcionesTorneo/exportarInscripcionesCSV.js";

import {
  authMiddleware,
  adminOnly,
} from "../middlewares/authMiddleware.js";

const router = Router();

// ======================================================
// PÚBLICO
// ======================================================

// Crear inscripción desde la página pública
router.post(
  "/",
  crearInscripcion
);

// ======================================================
// ADMINISTRADOR
// ======================================================

// Listar y filtrar
router.get(
  "/",
  authMiddleware,
  adminOnly,
  listarInscripciones
);

// Exportar CSV
//
// IMPORTANTE:
// Esta ruta tiene que estar ANTES de /:id
// para que "exportar" no sea interpretado como un ID.
//

router.get(
  "/exportar",
  authMiddleware,
  adminOnly,
  exportarInscripcionesCSV
);

// Obtener una inscripción
router.get(
  "/:id",
  authMiddleware,
  adminOnly,
  obtenerInscripcion
);

// Actualizar
router.put(
  "/:id",
  authMiddleware,
  adminOnly,
  actualizarInscripcion
);

// Eliminar
router.delete(
  "/:id",
  authMiddleware,
  adminOnly,
  eliminarInscripcion
);

export default router;