import Torneo from '../../models/Torneo.js';
import Usuario from '../../models/Usuario.js';

const desinscribirseTorneo = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { torneoId } = req.body;

    const usuario = await Usuario.findById(usuarioId);
    const torneo = await Torneo.findById(torneoId);

    if (!torneo || !usuario) {
      return res.status(404).json({ mensaje: 'Torneo o usuario no encontrado' });
    }

    torneo.participantes = torneo.participantes.filter(
      p => p.email !== usuario.email
    );

    await torneo.save();

    res.json({ mensaje: 'Te desinscribiste del torneo' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default desinscribirseTorneo;