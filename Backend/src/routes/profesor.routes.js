// src/routes/profesor.routes.js
import { Router } from 'express';

import crearProfesor from '../controllers/Profesores/crearProfesor.js';
import listarProfesores from '../controllers/Profesores/listarProfesores.js';
import obtenerProfesor from '../controllers/Profesores/obtenerProfesor.js';
import actualizarProfesor from '../controllers/Profesores/actualizarProfesor.js';
import eliminarProfesor from '../controllers/Profesores/eliminarProfesor.js';
import {
  importarProfesoresDesdeSheets,
} from "../controllers/Profesores/importarProfesoresSheets.js";

import { uploadFotoProfesor } from '../middlewares/uploadFotoProfesor.js';
import { authMiddleware, adminOnly } from '../middlewares/authMiddleware.js';

const router = Router();

// Públicas
router.get('/', listarProfesores);
router.get('/:id', obtenerProfesor);

// Protegidas
router.post(
  '/',
  authMiddleware,
  adminOnly,
  uploadFotoProfesor.fields([
    { name: "foto", maxCount: 1 },
    { name: "cv", maxCount: 1 },
  ]),
  crearProfesor
);

router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  uploadFotoProfesor.fields([
    { name: "foto", maxCount: 1 },
    { name: "cv", maxCount: 1 },
  ]),
  actualizarProfesor
);
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  eliminarProfesor
);
router.post(
  "/importar-sheets",
  authMiddleware,
  adminOnly,
  importarProfesoresDesdeSheets
);
export default router;