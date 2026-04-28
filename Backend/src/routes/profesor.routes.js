// src/routes/profesor.routes.js
import { Router } from 'express';

import crearProfesor from '../controllers/Profesores/crearProfesor.js';
import listarProfesores from '../controllers/Profesores/listarProfesores.js';
import obtenerProfesor from '../controllers/Profesores/obtenerProfesor.js';
import actualizarProfesor from '../controllers/Profesores/actualizarProfesor.js';
import eliminarProfesor from '../controllers/Profesores/eliminarProfesor.js';

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
  uploadFotoProfesor.single('foto'),
  crearProfesor
);

router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  uploadFotoProfesor.single('foto'),
  actualizarProfesor
);

router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  eliminarProfesor
);

export default router;