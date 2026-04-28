import { Router } from 'express';
import patrocinadorRoutes from './patrocinador.routes.js';
import profesorRoutes from './profesor.routes.js';
import clubRoutes from './club.routes.js';
import AdminRoutes from './Admin.routes.js';
import usuarioRoutes from './usuario.routes.js';
import TorneosRoutes from './torneo.routes.js';
import inscripcionRoutes from './inscripcion.routes.js';
import { authMiddleware, adminOnly } from '../middlewares/authMiddleware.js';

const router = Router();

// Ruta raíz de la API
router.get('/', (req, res) => {
  res.json({
    mensaje: 'API FMJ funcionando',
  });
});

// Rutas
router.use('/patrocinadores', patrocinadorRoutes);
router.use('/profesores', profesorRoutes);
router.use('/clubes', clubRoutes);
router.use('/Administradores', AdminRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/torneos', TorneosRoutes);
router.use('/inscripciones', inscripcionRoutes);

// Ruta de prueba protegida
router.get('/admin/verificar', authMiddleware, adminOnly, (req, res) => {
  res.status(200).json({
    mensaje: 'Acceso autorizado',
    user: req.user,
  });
});

console.log('✅ Rutas montadas: /patrocinadores');
console.log('✅ Rutas montadas: /profesores');
console.log('✅ Rutas montadas: /clubes');
console.log('✅ Rutas montadas: /Administradores');
console.log('✅ Rutas montadas: /usuarios');
console.log('✅ Rutas montadas: /torneos');
console.log('✅ Rutas montadas: /inscripciones');

export default router;