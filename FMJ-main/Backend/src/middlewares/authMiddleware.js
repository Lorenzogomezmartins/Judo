// src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'No autorizado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // id y rol
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o vencido' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.rol !== 'admin' && req.user.rol !== 'superadmin') {
    return res.status(403).json({ mensaje: 'Acceso denegado' });
  }
  next();
};