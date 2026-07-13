/**
 * MenuFam — backend en Google Apps Script.
 * Sirve la app y guarda el estado compartido de la familia en un JSON
 * en el Drive del dueño del script. Sin costos: incluido en Workspace.
 */

const FILE_NAME = 'menufam-data.json';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('MenuFam — Menú Semanal')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

function getFile_() {
  const files = DriveApp.getFilesByName(FILE_NAME);
  return files.hasNext()
    ? files.next()
    : DriveApp.createFile(FILE_NAME, '', 'application/json');
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
