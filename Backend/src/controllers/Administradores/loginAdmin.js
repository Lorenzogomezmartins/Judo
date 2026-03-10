// src/controllers/Administradores/loginAdmin.js
import Administrador from '../../models/admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const admin = await Administrador.findOne({ email });
    if (!admin) {
      return res.status(404).json({ mensaje: 'Administrador no encontrado' });
    }

    // Comparar password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    // Crear token JWT
    const token = jwt.sign(
      { id: admin._id, rol: admin.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      admin: {
        id: admin._id,
        nombre: admin.nombre,
        apellido: admin.apellido,
        email: admin.email,
        rol: admin.rol,
      },
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default loginAdmin;
