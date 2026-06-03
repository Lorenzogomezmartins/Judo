import Torneo from "../../models/Torneo.js";
import { listarEventosCalendario } from "../../config/google.js";

function generarSlug(nombre = "") {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\d{4}/g, "")
    .replace(/\bfmj\b/g, "")
    .replace(/\btorneo\b/g, "")
    .replace(/\bcopa\b/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function detectarTipoEvento(nombre = "") {
  const texto = nombre.toLowerCase();

  if (texto.includes("curso")) {
    return "curso";
  }

  if (texto.includes("capacitacion") || texto.includes("capacitación")) {
    return "capacitacion";
  }

  if (texto.includes("torneo") || texto.includes("copa")) {
    return "torneo";
  }

  return "evento";
}

export async function sincronizarGoogleCalendar(req, res) {
  try {
    const { secret } = req.query;

    if (secret !== process.env.CRON_SECRET) {
      return res.status(401).json({
        mensaje: "No autorizado",
      });
    }

    const eventos = await listarEventosCalendario();

    let creados = 0;
    let actualizados = 0;

    for (const evento of eventos) {
      if (!evento.id || !evento.summary) continue;

      const fechaEvento = evento.start?.date || evento.start?.dateTime;
      if (!fechaEvento) continue;

      const torneoExistente = await Torneo.findOne({
        googleCalendarEventId: evento.id,
      });

      const data = {
        nombre: evento.summary,
        tipo: detectarTipoEvento(evento.summary),
        fecha: new Date(fechaEvento),
        direccion: evento.location || "",
        descripcion: evento.description || "",
        googleCalendarEventId: evento.id,
        activo: true,
      };

      if (torneoExistente) {
        await Torneo.findByIdAndUpdate(torneoExistente._id, data, {
          new: true,
          runValidators: true,
        });

        actualizados++;
      } else {
        const slugBase = generarSlug(evento.summary) || `evento-${evento.id}`;
        let slugFinal = slugBase;
        let contador = 1;

        while (await Torneo.findOne({ slug: slugFinal })) {
          contador++;
          slugFinal = `${slugBase}-${contador}`;
        }

        await Torneo.create({
          ...data,
          slug: slugFinal,
          categorias: [],
          fotos: [],
        });

        creados++;
      }
    }

    return res.json({
      mensaje: "Sincronización desde Google Calendar finalizada",
      creados,
      actualizados,
      totalEventosGoogle: eventos.length,
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error sincronizando desde Google Calendar",
      error: error.message,
    });
  }
}