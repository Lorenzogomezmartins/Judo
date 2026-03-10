// routes/patrocinador.routes.js
import { Router } from 'express';

import crearPatrocinador from '../controllers/Patrocinadores/crearPatrocinador.js';
import listarPatrocinadores from '../controllers/Patrocinadores/listarPatrocinadores.js';
import obtenerPatrocinador from '../controllers/Patrocinadores/obtenerPatrocinador.js';
import actualizarPatrocinador from '../controllers/Patrocinadores/actualizarPatrocinador.js';
import eliminarPatrocinador from '../controllers/Patrocinadores/eliminarPatrocinador.js';

import { uploadLogo } from '../middlewares/uploadLogo.js';

const router = Router();

router.get('/', listarPatrocinadores);
router.get('/:id', obtenerPatrocinador);
router.post('/', uploadLogo.single('logo'), crearPatrocinador);
router.put('/:id', uploadLogo.single('logo'), actualizarPatrocinador);
router.delete('/:id', eliminarPatrocinador);

export default router;
