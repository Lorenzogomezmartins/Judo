import Torneo from '../../models/Torneo.js';
import Usuario from '../../models/Usuario.js';

const inscribirseTorneo = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { torneoId, equipo } = req.body;

    if (!equipo) {
      return res.status(400).json({ mensaje: 'El equipo es obligatorio' });
    }

    const torneo = await Torneo.findById(torneoId);
    const usuario = await Usuario.findById(usuarioId);

    if (!torneo || !usuario) {
      return res.status(404).json({ mensaje: 'Torneo o usuario no encontrado' });
    }

    // evitar duplicado por email
    const yaInscripto = torneo.participantes.some(
      p => p.email === usuario.email
    );

    if (yaInscripto) {
      return res.status(400).json({ mensaje: 'Ya estás inscripto' });
    }

    torneo.participantes.push({
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono,
      equipo
      // fechaInscripcion automática
    });

    await torneo.save();

    res.json({ mensaje: 'Inscripción exitosa' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default inscribirseTorneo;