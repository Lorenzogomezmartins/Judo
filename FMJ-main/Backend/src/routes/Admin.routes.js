// src/routes/auth.routes.js
import { Router } from 'express';
import loginAdmin from '../controllers/Administradores/loginAdmin.js';

const router = Router();

router.post('/login', loginAdmin);

export default router;