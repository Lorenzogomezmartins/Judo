// src/routes/profesor.routes.js

import { Router } from 'express';

import crearProfesor from '../controllers/profesores/crearProfesor.js';
import listarProfesores from '../controllers/profesores/listarProfesores.js';
import obtenerProfesor from '../controllers/profesores/obtenerProfesor.js';
import actualizarProfesor from '../controllers/profesores/actualizarProfesor.js';
import eliminarProfesor from '../controllers/profesores/eliminarProfesor.js';

import { uploadFotoProfesor } from '../middlewares/uploadFotoProfesor.js';

const router = Router();

router.get('/', listarProfesores);
router.get('/:id', obtenerProfesor);
router.post('/', uploadFotoProfesor.single('foto'), crearProfesor);
router.put('/:id', uploadFotoProfesor.single('foto'), actualizarProfesor);
router.delete('/:id', eliminarProfesor);

export default router;