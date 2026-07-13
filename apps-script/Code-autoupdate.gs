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

// ═══════════════ Telegram: recordatorio de la cena de mañana ═══════════════
// 1) Hablale a @BotFather en Telegram → /newbot → copiá el TOKEN acá.
// 2) Agregá el bot al grupo familiar (o hablale directo), mandá un mensaje,
//    y abrí https://api.telegram.org/botTU_TOKEN/getUpdates → copiá el chat.id.
// 3) En Apps Script: Activadores (⏰) → Añadir → función recordatorioDiario →
//    Según tiempo → Diario → 19:00-20:00.
const TELEGRAM_TOKEN = '';
const TELEGRAM_CHAT_ID = '';

const DIAS_ = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

function leerEstado_() {
  try { return JSON.parse(loadState()).state; } catch (e) { return null; }
}

function nombreDe_(st, e) {
  if (!e) return null;
  if (e.custom) return e.custom;
  const d = st.recetario.find(function (x) { return x.id === e.id; });
  return d ? d.nombre : null;
}

function recordatorioDiario() {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;
  const st = leerEstado_();
  if (!st) return;
  // mañana: qué índice de la semana es (lun=0 ... vie=4)
  const m = new Date();
  m.setDate(m.getDate() + 1);
  const dow = m.getDay();
  if (dow === 0 || dow === 6) return; // finde: sin recordatorio
  const i = dow - 1;
  const cenaE = st.week.cenas[i];
  const viaE = st.week.viandas[i];
  const cena = nombreDe_(st, cenaE);
  const via = nombreDe_(st, viaE);
  if (!cena && !via) return;
  const d = cenaE && cenaE.id ? st.recetario.find(function (x) { return x.id === cenaE.id; }) : null;
  let msg = '🍽️ *Mañana ' + DIAS_[i] + ' en MenuFam*\n';
  if (cena) msg += '\n🌙 Cena: *' + cena + '*';
  if (d && d.lados) msg += '\n   🥗 ' + d.lados;
  if (via) msg += '\n🧺 Vianda del cole: *' + via + '*';
  if (d && ['carne', 'pollo', 'cerdo', 'pescado'].indexOf(d.prot) >= 0) {
    msg += '\n\n🧊 *¡Acordate de descongelar ' + (d.prot === 'pescado' ? 'el pescado' : d.prot === 'pollo' ? 'el pollo' : 'la carne') + ' esta noche!*';
  }
  const obs = st.week.obs[i];
  if (obs) msg += '\n📝 ' + obs;
  UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage', {
    method: 'post',
    payload: { chat_id: TELEGRAM_CHAT_ID, text: msg, parse_mode: 'Markdown' }
  });
}

/** Correlo a mano una vez para probar que el bot funciona. */
function probarTelegram() {
  UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage', {
    method: 'post',
    payload: { chat_id: TELEGRAM_CHAT_ID, text: '🍽️ ¡Hola! Soy MenuFam. Todas las noches les aviso la cena de mañana y si hay que descongelar 🧊' }
  });
}

// ═══════════════ Google Calendar: calendario propio "MenuFam" ═══════════════
function calendarioMenuFam_() {
  const cals = CalendarApp.getCalendarsByName('MenuFam');
  return cals.length ? cals[0] : CalendarApp.createCalendar('MenuFam', { color: CalendarApp.Color.ORANGE });
}

/** Crea/actualiza los eventos de la semana actual en el calendario MenuFam. */
function sincronizarCalendario() {
  const st = leerEstado_();
  if (!st) throw new Error('Sin datos');
  const cal = calendarioMenuFam_();
  const lunes = new Date(st.week.monday + 'T00:00:00');
  const fin = new Date(lunes); fin.setDate(fin.getDate() + 7);
  cal.getEvents(lunes, fin).forEach(function (ev) { ev.deleteEvent(); });
  let n = 0;
  for (let i = 0; i < 5; i++) {
    const cena = nombreDe_(st, st.week.cenas[i]);
    const via = nombreDe_(st, st.week.viandas[i]);
    if (!cena && !via) continue;
    const dia = new Date(lunes); dia.setDate(dia.getDate() + i);
    let titulo = '🍽 ' + (cena || '—');
    if (via) titulo += ' · 🧺 ' + via;
    let desc = '';
    const d = st.week.cenas[i] && st.week.cenas[i].id ? st.recetario.find(function (x) { return x.id === st.week.cenas[i].id; }) : null;
    if (d && d.lados) desc += 'Guarnición: ' + d.lados + '\n';
    if (st.week.obs[i]) desc += 'Vianda: ' + st.week.obs[i];
    cal.createAllDayEvent(titulo, dia, { description: desc });
    n++;
  }
  return '📅 ' + n + ' días cargados en el calendario MenuFam';
}
