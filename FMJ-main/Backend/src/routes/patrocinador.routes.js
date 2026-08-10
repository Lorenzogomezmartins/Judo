// routes/patrocinador.routes.js
import { Router } from 'express';

import crearPatrocinador from '../controllers/Patrocinadores/crearPatrocinador.js';
import listarPatrocinadores from '../controllers/Patrocinadores/listarPatrocinadores.js';
import obtenerPatrocinador from '../controllers/Patrocinadores/obtenerPatrocinador.js';
import actualizarPatrocinador from '../controllers/Patrocinadores/actualizarPatrocinador.js';
import eliminarPatrocinador from '../controllers/Patrocinadores/eliminarPatrocinador.js';

import { uploadLogo } from '../middlewares/uploadLogo.js';
import { authMiddleware, adminOnly } from '../middlewares/authMiddleware.js';

const router = Router();

// Públicas
router.get('/', listarPatrocinadores);
router.get('/:id', obtenerPatrocinador);

// Protegidas
router.post(
  '/',
  authMiddleware,
  adminOnly,
  uploadLogo.single('logo'),
  crearPatrocinador
);

router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  uploadLogo.single('logo'),
  actualizarPatrocinador
);

router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  eliminarPatrocinador
);

export default router;