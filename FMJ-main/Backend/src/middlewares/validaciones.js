import Usuario from "../models/usuario.js";
import Club from "../models/club.js";
import Patrocinador from "../models/Patrocinador.js";
import Profesor from "../models/profesor.js";
import Torneo from "../models/torneos.js";
import Administrador from "../models/admin.js";

// --- HELPERs ---
const isEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const isPhone = (tel) => /^[0-9]{7,15}$/.test(tel); // solo números, 7-15 dígitos
const isDNI = (dni) => /^[0-9]{6,10}$/.test(dni); // solo números, 6-10 dígitos
const isURL = (url) => /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}([\/\w.-]*)*\/?$/.test(url);
const isDate = (d) => !isNaN(Date.parse(d));

// =======================
// VALIDACIONES USUARIO
// =======================
export const validarUsuario = (req, res, next) => {
  const { nombre, apellido, dni, email, telefono, sexo, clasificacion } = req.body;

  if (!nombre || typeof nombre !== 'string') return res.status(400).json({ error: "Nombre inválido" });
  if (!apellido || typeof apellido !== 'string') return res.status(400).json({ error: "Apellido inválido" });
  if (!dni || !isDNI(dni)) return res.status(400).json({ error: "DNI inválido" });
  if (!email || !isEmail(email)) return res.status(400).json({ error: "Email inválido" });
  if (!telefono || !isPhone(telefono)) return res.status(400).json({ error: "Teléfono inválido" });
  if (!['masculino','femenino','otro'].includes(sexo)) return res.status(400).json({ error: "Sexo inválido" });
  if (!['senior','cadete','junior','infantil-b'].includes(clasificacion)) return res.status(400).json({ error: "Clasificación inválida" });

  next();
};

// =======================
// VALIDACIONES CLUB
// =======================
export const validarClub = (req, res, next) => {
  const { nombre, logo, telefono, direccion, sitioWeb } = req.body;

  if (!nombre || typeof nombre !== 'string') return res.status(400).json({ error: "Nombre inválido" });
  if (logo && !isURL(logo)) return res.status(400).json({ error: "Logo inválido" });
  if (telefono && !isPhone(telefono)) return res.status(400).json({ error: "Teléfono inválido" });
  if (sitioWeb && !isURL(sitioWeb)) return res.status(400).json({ error: "Sitio web inválido" });

  next();
};

// =======================
// VALIDACIONES PATROCINADOR
// =======================
export const validarPatrocinador = (req, res, next) => {
  const { nombre, logo, contacto, sitioWeb } = req.body;

  if (!nombre || typeof nombre !== 'string') return res.status(400).json({ error: "Nombre inválido" });
  if (logo && !isURL(logo)) return res.status(400).json({ error: "Logo inválido" });
  if (contacto && typeof contacto !== 'string') return res.status(400).json({ error: "Contacto inválido" });
  if (sitioWeb && !isURL(sitioWeb)) return res.status(400).json({ error: "Sitio web inválido" });

  next();
};

// =======================
// VALIDACIONES PROFESOR
// =======================
export const validarProfesor = (req, res, next) => {
  const { nombre, apellido, foto, descripcion } = req.body;

  if (!nombre || typeof nombre !== 'string') return res.status(400).json({ error: "Nombre inválido" });
  if (!apellido || typeof apellido !== 'string') return res.status(400).json({ error: "Apellido inválido" });
  if (foto && !isURL(foto)) return res.status(400).json({ error: "Foto inválida" });
  if (descripcion && typeof descripcion !== 'string') return res.status(400).json({ error: "Descripción inválida" });

  next();
};

// =======================
// VALIDACIONES TORNEO
// =======================
export const validarTorneo = (req, res, next) => {
  const { nombre, fotos, direccion, fecha, colorCalendario, reglas } = req.body;

  if (!nombre || typeof nombre !== 'string') return res.status(400).json({ error: "Nombre inválido" });
  if (fotos && (!Array.isArray(fotos) || fotos.some(f => !isURL(f)))) return res.status(400).json({ error: "Fotos inválidas" });
  if (direccion && typeof direccion !== 'string') return res.status(400).json({ error: "Dirección inválida" });
  if (!fecha || !isDate(fecha)) return res.status(400).json({ error: "Fecha inválida" });
  if (colorCalendario && typeof colorCalendario !== 'string') return res.status(400).json({ error: "Color inválido" });
  if (reglas && typeof reglas !== 'string') return res.status(400).json({ error: "Reglas inválidas" });

  next();
};

// =======================
// VALIDACIONES ADMINISTRADOR
// =======================
export const validarAdministrador = (req, res, next) => {
  const { nombre, apellido, email, password, rol } = req.body;

  if (!nombre || typeof nombre !== 'string') return res.status(400).json({ error: "Nombre inválido" });
  if (!apellido || typeof apellido !== 'string') return res.status(400).json({ error: "Apellido inválido" });
  if (!email || !isEmail(email)) return res.status(400).json({ error: "Email inválido" });
  if (!password || typeof password !== 'string' || password.length < 6) return res.status(400).json({ error: "Contraseña inválida (mín 6 caracteres)" });
  if (!['admin','superadmin'].includes(rol)) return res.status(400).json({ error: "Rol inválido" });

  next();
};
