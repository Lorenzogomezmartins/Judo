// src/routes/club.routes.js
import { Router } from 'express';

import crearClub from '../controllers/Clubes/crearClub.js';
import listarClubes from '../controllers/Clubes/listarClubes.js';
import obtenerClub from '../controllers/Clubes/obtenerClub.js';
import actualizarClub from '../controllers/Clubes/actualizarClub.js';
import eliminarClub from '../controllers/Clubes/eliminarClub.js';

import { uploadLogoClub } from '../middlewares/uploadLogoClub.js';

const router = Router();

/* =========================
   RUTAS CLUBES
========================= */

// Listar todos
router.get('/', listarClubes);

// Obtener por nombre 
router.get('/nombre/:nombre', obtenerClub);

// Crear club
router.post(
  '/',
  uploadLogoClub.single('logo'),
  crearClub
);

// Actualizar por ID
router.put(
  '/:id',
  uploadLogoClub.single('logo'),
  actualizarClub
);

// Eliminar por ID
router.delete('/:id', eliminarClub);

export default router;
