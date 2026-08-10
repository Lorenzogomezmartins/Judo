import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/drive.readonly",

    // NUEVO: permiso para crear/editar/borrar eventos en Google Calendar
    "https://www.googleapis.com/auth/calendar",
  ],
});

// ===============================
// GOOGLE SHEETS
// ===============================

export async function obtenerFilasInscripciones() {
  const client = await auth.getClient();

  const sheets = google.sheets({
    version: "v4",
    auth: client,
  });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "A:Z",
  });

  return response.data.values || [];
}

// ===============================
// GOOGLE DRIVE
// ===============================

export async function descargarArchivoDrive(fileId) {
  const client = await auth.getClient();

  const drive = google.drive({
    version: "v3",
    auth: client,
  });

  const response = await drive.files.get(
    {
      fileId,
      alt: "media",
    },
    {
      responseType: "arraybuffer",
    }
  );

  return Buffer.from(response.data);
}

export function extraerDriveId(url = "") {
  if (!url) return null;

  const matchId = url.match(/id=([^&]+)/);
  if (matchId) return matchId[1];

  const matchFile = url.match(/\/d\/([^/]+)/);
  if (matchFile) return matchFile[1];

  return null;
}

// ===============================
// GOOGLE CALENDAR
// ===============================

function obtenerFechaGoogle(fecha) {
  return new Date(fecha).toISOString().split("T")[0];
}

function obtenerFechaFinGoogle(fecha) {
  const fechaFin = new Date(fecha);
  fechaFin.setDate(fechaFin.getDate() + 1);

  return fechaFin.toISOString().split("T")[0];
}

function obtenerDescripcionTorneo(torneo) {
  return `
Categorías: ${
    Array.isArray(torneo.categorias)
      ? torneo.categorias.join(", ")
      : torneo.categorias || "-"
  }

Reglas: ${torneo.reglas || "-"}

Dirección: ${torneo.direccion || "-"}
  `;
}

export async function crearEventoCalendario(torneo) {
  const client = await auth.getClient();

  const calendar = google.calendar({
    version: "v3",
    auth: client,
  });

  const response = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: {
      summary: torneo.nombre,
      location: torneo.direccion || "",
      description: obtenerDescripcionTorneo(torneo),
      start: {
        date: obtenerFechaGoogle(torneo.fecha),
      },
      end: {
        date: obtenerFechaFinGoogle(torneo.fecha),
      },

      // Verde en Google Calendar
      colorId: "10",
    },
  });

  return response.data;
}

export async function actualizarEventoCalendario(torneo) {
  if (!torneo.googleCalendarEventId) return null;

  const client = await auth.getClient();

  const calendar = google.calendar({
    version: "v3",
    auth: client,
  });

  const response = await calendar.events.update({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    eventId: torneo.googleCalendarEventId,
    requestBody: {
      summary: torneo.nombre,
      location: torneo.direccion || "",
      description: obtenerDescripcionTorneo(torneo),
      start: {
        date: obtenerFechaGoogle(torneo.fecha),
      },
      end: {
        date: obtenerFechaFinGoogle(torneo.fecha),
      },

      // Verde en Google Calendar
      colorId: "10",
    },
  });

  return response.data;
}

export async function eliminarEventoCalendario(eventId) {
  if (!eventId) return;

  const client = await auth.getClient();

  const calendar = google.calendar({
    version: "v3",
    auth: client,
  });

  await calendar.events.delete({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    eventId,
  });
}
export async function listarEventosCalendario() {
  const client = await auth.getClient();

  const calendar = google.calendar({
    version: "v3",
    auth: client,
  });

  const response = await calendar.events.list({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 2500,
  });

  return response.data.items || [];
}