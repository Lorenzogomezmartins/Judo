import { Router } from 'express';
import patrocinadorRoutes from './patrocinador.routes.js';
import profesorRoutes from './profesor.routes.js';
import clubRoutes from './club.routes.js';
import AdminRoutes from './Admin.routes.js';
const router = Router();


// Ruta raíz de la API 
router.get('/', (req, res) => {
  res.json({
    mensaje: 'API FMJ funcionando ',
  });
});

// Patrocinadores
router.use('/patrocinadores', patrocinadorRoutes);
router.use('/profesores', profesorRoutes);
router.use('/clubes', clubRoutes);
router.use('/Administradores', AdminRoutes);



export default router;
