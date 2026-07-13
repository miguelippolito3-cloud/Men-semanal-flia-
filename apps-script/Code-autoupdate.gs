/**
 * MenuFam — backend en Google Apps Script (variante auto-actualizable).
 * Sirve la app directamente desde GitHub: cada mejora pusheada al repo
 * aparece sola, sin tocar este proyecto. Los datos compartidos de la
 * familia viven en menufam-data.json en el Drive del dueño del script.
 */

const APP_URL = 'https://raw.githubusercontent.com/miguelippolito3-cloud/Men-semanal-flia-/claude/weekly-family-menu-app-jw7odl/index.html';
const FILE_NAME = 'menufam-data.json';
// ID de la carpeta o unidad compartida donde viven los datos.
// Vacío = raíz de Mi unidad del dueño del script.
// Para usar una unidad compartida: pegá acá el ID que aparece en la URL
// (drive.google.com/drive/folders/ESTE_ID) y mové menufam-data.json adentro.
const DATA_FOLDER_ID = '';

function doGet() {
  let html;
  try {
    html = UrlFetchApp.fetch(APP_URL).getContentText();
  } catch (e) {
    html = '<meta charset="utf-8"><body style="font-family:sans-serif;text-align:center;padding:40px">' +
      '<h2>🍽️ MenuFam</h2><p>No pude descargar la app. Probá recargar en un ratito.</p></body>';
  }
  return HtmlService.createHtmlOutput(html)
    .setTitle('MenuFam — Menú Semanal')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

function getFolder_() {
  return DATA_FOLDER_ID
    ? DriveApp.getFolderById(DATA_FOLDER_ID)
    : DriveApp.getRootFolder();
}

function getFile_() {
  const folder = getFolder_();
  const files = folder.getFilesByName(FILE_NAME);
  return files.hasNext()
    ? files.next()
    : folder.createFile(FILE_NAME, '', 'application/json');
}

/** Devuelve el estado compartido (JSON como string) o vacío si no existe. */
function loadState() {
  return getFile_().getBlob().getDataAsString();
}

/** Guarda el estado compartido. Último en escribir gana. */
function saveState(json) {
  if (typeof json !== 'string' || !json || json.length > 8 * 1024 * 1024) {
    throw new Error('Estado inválido');
  }
  JSON.parse(json); // valida que sea JSON de verdad antes de pisar el archivo
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getFile_().setContent(json);
  } finally {
    lock.releaseLock();
  }
  return true;
}

/** Email del usuario logueado (puede venir vacío para cuentas personales). */
function getUserEmail() {
  return Session.getActiveUser().getEmail() || '';
}
