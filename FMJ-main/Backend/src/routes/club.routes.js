// src/routes/club.routes.js
import { Router } from 'express';

import crearClub from '../controllers/Clubes/crearClub.js';
import listarClubes from '../controllers/Clubes/listarClubes.js';
import obtenerClub from '../controllers/Clubes/obtenerClub.js';
import actualizarClub from '../controllers/Clubes/actualizarClub.js';
import eliminarClub from '../controllers/Clubes/eliminarClub.js';

import { uploadLogoClub } from '../middlewares/uploadLogoClub.js';
import { authMiddleware, adminOnly } from '../middlewares/authMiddleware.js';

const router = Router();

/* =========================
   RUTAS CLUBES
========================= */

// Públicas
router.get('/', listarClubes);
router.get('/nombre/:nombre', obtenerClub);

// Protegidas
router.post(
  '/',
  authMiddleware,
  adminOnly,
  uploadLogoClub.single('logo'),
  crearClub
);

router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  uploadLogoClub.single('logo'),
  actualizarClub
);

router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  eliminarClub
);

export default router;