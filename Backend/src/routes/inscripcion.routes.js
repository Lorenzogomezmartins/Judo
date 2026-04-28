// src/routes/inscripcion.routes.js
import { Router } from 'express';

import { importarInscripcionesDesdeSheets } from '../controllers/inscripciones/importarInscripciones.controller.js';
import { listarInscripciones } from '../controllers/inscripciones/listarInscripciones.controller.js';
import { obtenerInscripcionPorId } from '../controllers/inscripciones/obtenerInscripcion.controller.js';
import { actualizarInscripcion } from '../controllers/inscripciones/actualizarInscripcion.controller.js';
import { aprobarInscripcion } from '../controllers/inscripciones/aprobarInscripcion.controller.js';
import { rechazarInscripcion } from '../controllers/inscripciones/rechazarInscripcion.controller.js';

const router = Router();

router.post('/importar-sheets', importarInscripcionesDesdeSheets);
router.get('/', listarInscripciones);
router.get('/:id', obtenerInscripcionPorId);
router.put('/:id', actualizarInscripcion);
router.put('/:id/aprobar', aprobarInscripcion);
router.put('/:id/rechazar', rechazarInscripcion);

export default router;