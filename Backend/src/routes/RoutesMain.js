import { Router } from 'express';
import patrocinadorRoutes from './patrocinador.routes.js';
import profesorRoutes from './profesor.routes.js';
import clubRoutes from './club.routes.js';
import AdminRoutes from './Admin.routes.js';
import usuarioRoutes from './usuario.routes.js';
const router = Router();


// Ruta raíz de la API 
router.get('/', (req, res) => {
  res.json({
    mensaje: 'API FMJ funcionando ',
  });
});

router.use('/patrocinadores', patrocinadorRoutes);
router.use('/profesores', profesorRoutes);
router.use('/clubes', clubRoutes);
router.use('/Administradores', AdminRoutes);
router.use('/usuarios', usuarioRoutes);

console.log("✅ Rutas montadas: /usuarios");
console.log("✅ Rutas montadas: /clubes");
console.log("✅ Rutas montadas: /profesores");

export default router;
