// ═══════════════════════════════════════════════════════════════════════════
// TIMELAB ATELIER — Apps Script backend
// ═══════════════════════════════════════════════════════════════════════════
// Pega todo este archivo en script.google.com vinculado a tu Google Sheet.
// Luego: Deploy → New deployment → Type: Web app → Execute as: Me → Who has
// access: Anyone. Copia la URL resultante a los ajustes del CRM.
//
// ANTES DE DESPLEGAR:
//   1. Cambia TOKEN por una cadena aleatoria larga (es tu "contraseña")
//   2. Asegúrate de tener una carpeta en Drive llamada TIMELAB-Fotos (o cámbiala)
//   3. Ejecuta la función `setup()` una vez desde el editor antes del deploy
// ═══════════════════════════════════════════════════════════════════════════

const TOKEN = "CAMBIA_ESTO_POR_UN_TOKEN_LARGO_Y_ALEATORIO_abc123xyz";
const PHOTOS_FOLDER_NAME = "TIMELAB-Fotos";

const SHEETS = {
  watches: "watches",
  opportunities: "opportunities",
  price_comps: "price_comps",
  expenses: "expenses",
  customer_notes: "customer_notes",
  settings: "settings",
};

// ─── Setup: run once from the editor before first deploy ───────────────────
function setup() {
  const ss = SpreadsheetApp.getActive();
  // Create sheets if missing
  Object.values(SHEETS).forEach(name => {
    if (!ss.getSheetByName(name)) ss.insertSheet(name);
  });
  // Create Drive folder if missing
  const folders = DriveApp.getFoldersByName(PHOTOS_FOLDER_NAME);
  if (!folders.hasNext()) DriveApp.createFolder(PHOTOS_FOLDER_NAME);
  Logger.log("Setup complete. Deploy as Web App now.");
}

// ─── Main entrypoint ────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.token !== TOKEN) {
      return json({ error: "invalid_token" });
    }
    switch (body.action) {
      case "ping":         return json({ ok: true, ts: new Date().toISOString() });
      case "pull":         return json({ state: pullAll() });
      case "push":         return json(pushAll(body.payload));
      case "upload_photo": return json(uploadPhoto(body.watchId, body.photoId, body.dataUrl));
      case "delete_photo": return json(deletePhoto(body.watchId, body.photoId));
      default:             return json({ error: "unknown_action" });
    }
  } catch (err) {
    return json({ error: String(err) });
  }
}

function doGet(e) {
  // Browser-friendly: lets you verify the script is deployed by visiting the URL
  return HtmlService.createHtmlOutput(
    "<h2>TIMELAB Atelier — Apps Script endpoint</h2>" +
    "<p>POST only. Use the CRM to interact with this endpoint.</p>"
  );
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── PULL: read all state from sheets ──────────────────────────────────────
function pullAll() {
  return {
    watches:        readSheet(SHEETS.watches),
    opportunities:  readSheet(SHEETS.opportunities),
    price_comps:    readSheet(SHEETS.price_comps),
    expenses:       readSheet(SHEETS.expenses),
    customer_notes: readSheet(SHEETS.customer_notes),
    settings:       readSettings(),
  };
}

function readSheet(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) return [];
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1)
    .filter(row => row.some(cell => cell !== ""))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        let v = row[i];
        // Parse JSON blobs transparently
        if (typeof v === "string" && (v.startsWith("[") || v.startsWith("{"))) {
          try { v = JSON.parse(v); } catch {}
        }
        obj[h] = v === "" ? undefined : v;
      });
      return obj;
    });
}

function readSettings() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEETS.settings);
  if (!sh) return {};
  const values = sh.getDataRange().getValues();
  const result = {};
  values.forEach(row => {
    if (row[0]) {
      let v = row[1];
      if (typeof v === "string" && (v.startsWith("[") || v.startsWith("{"))) {
        try { v = JSON.parse(v); } catch {}
      }
      result[row[0]] = v;
    }
  });
  return result;
}

// ─── PUSH: overwrite sheets with payload ───────────────────────────────────
function pushAll(payload) {
  writeSheet(SHEETS.watches,        payload.watches || []);
  writeSheet(SHEETS.opportunities,  payload.opportunities || []);
  writeSheet(SHEETS.price_comps,    payload.price_comps || []);
  writeSheet(SHEETS.expenses,       payload.expenses || []);
  writeSheet(SHEETS.customer_notes, payload.customer_notes || []);
  writeSettings(payload.settings || {});
  return { ok: true, ts: new Date().toISOString() };
}

function writeSheet(name, rows) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  sh.clear();
  if (rows.length === 0) return;
  // Collect all unique keys across rows, preserving first-seen order
  const headers = [];
  const seen = new Set();
  rows.forEach(r => Object.keys(r).forEach(k => { if (!seen.has(k)) { seen.add(k); headers.push(k); } }));
  const matrix = [headers, ...rows.map(r => headers.map(h => {
    const v = r[h];
    if (v === undefined || v === null) return "";
    if (typeof v === "object") return JSON.stringify(v);
    return v;
  }))];
  sh.getRange(1, 1, matrix.length, headers.length).setValues(matrix);
  sh.setFrozenRows(1);
}

function writeSettings(settings) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEETS.settings);
  if (!sh) sh = ss.insertSheet(SHEETS.settings);
  sh.clear();
  const rows = Object.entries(settings).map(([k, v]) => [
    k,
    typeof v === "object" ? JSON.stringify(v) : v,
  ]);
  if (rows.length > 0) sh.getRange(1, 1, rows.length, 2).setValues(rows);
}

// ─── PHOTO STORAGE in Drive ────────────────────────────────────────────────
function getOrCreateFolder(name, parent) {
  const folders = (parent || DriveApp).getFoldersByName(name);
  return folders.hasNext() ? folders.next() : (parent || DriveApp).createFolder(name);
}

function uploadPhoto(watchId, photoId, dataUrl) {
  // dataUrl is "data:image/jpeg;base64,..."
  const m = String(dataUrl).match(/^data:(image\/\w+);base64,(.+)$/);
  if (!m) return { error: "invalid_data_url" };
  const mime = m[1];
  const base64 = m[2];
  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, mime, `${photoId}.${mime.split("/")[1]}`);

  const root = getOrCreateFolder(PHOTOS_FOLDER_NAME);
  const watchFolder = getOrCreateFolder(watchId, root);

  // Delete any previous file with same photoId
  const existing = watchFolder.getFilesByName(blob.getName());
  while (existing.hasNext()) existing.next().setTrashed(true);

  const file = watchFolder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  // Use the thumbnail URL pattern that renders directly in <img>
  const url = `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w1000`;
  return { ok: true, url: url, id: file.getId() };
}

function deletePhoto(watchId, photoId) {
  const root = getOrCreateFolder(PHOTOS_FOLDER_NAME);
  const watchFolder = getOrCreateFolder(watchId, root);
  const files = watchFolder.getFiles();
  let deleted = 0;
  while (files.hasNext()) {
    const f = files.next();
    if (f.getName().startsWith(photoId + ".")) {
      f.setTrashed(true);
      deleted++;
    }
  }
  return { ok: true, deleted };
}
