// src/routes/inscripcion.routes.js
import { Router } from 'express';

import { importarInscripcionesDesdeSheets } from '../controllers/Inscripciones/importarInscripciones.controller.js';
import { listarInscripciones } from '../controllers/Inscripciones/listarInscripciones.controller.js';
import { obtenerInscripcionPorId } from '../controllers/Inscripciones/obtenerInscripcion.controller.js';
import { actualizarInscripcion } from '../controllers/Inscripciones/actualizarInscripcion.controller.js';
import { aprobarInscripcion } from '../controllers/Inscripciones/aprobarInscripcion.controller.js';
import { rechazarInscripcion } from '../controllers/Inscripciones/rechazarInscripcion.controller.js';

const router = Router();

router.post('/importar-sheets', importarInscripcionesDesdeSheets);
router.get('/', listarInscripciones);
router.get('/:id', obtenerInscripcionPorId);
router.put('/:id', actualizarInscripcion);
router.put('/:id/aprobar', aprobarInscripcion);
router.put('/:id/rechazar', rechazarInscripcion);

export default router;