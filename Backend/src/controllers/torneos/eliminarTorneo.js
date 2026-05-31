import Torneo from '../../models/Torneo.js';
import { eliminarEventoCalendario } from '../../config/google.js';

const eliminarTorneo = async (req, res) => {
  try {
    const torneo = await Torneo.findByIdAndDelete(req.params.id);

    if (!torneo) {
      return res.status(404).json({ mensaje: 'Torneo no encontrado' });
    }

    try {
      await eliminarEventoCalendario(torneo.googleCalendarEventId);
    } catch (errorGoogle) {
      console.error(
        'Torneo eliminado, pero falló Google Calendar:',
        errorGoogle.message
      );
    }

    res.json({ mensaje: 'Torneo eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default eliminarTorneo;