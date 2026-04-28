import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
  ],
});

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