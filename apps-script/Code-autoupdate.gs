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

// ═══════════════ Nano Banana 🍌: genera la foto de un plato ═══════════════
// Creá una API key gratis en https://aistudio.google.com/apikey y pegala acá.
const GEMINI_API_KEY = '';

// Toma la key del código o, si está vacía, de las Propiedades del script
// (Configuración del proyecto → Propiedades de la secuencia → GEMINI_API_KEY).
function geminiKey_() {
  if (GEMINI_API_KEY) return GEMINI_API_KEY;
  var p = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  return p || '';
}

// Diagnóstico: ejecutá esta función desde el editor (▶) para ver si la key anda.
function probarGemini() {
  var k = geminiKey_();
  if (!k) { Logger.log('❌ No hay API key. Pegala en GEMINI_API_KEY o en Propiedades del script.'); return; }
  Logger.log('Key detectada (empieza con ' + k.substring(0, 6) + '…). Probando…');
  var res = UrlFetchApp.fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + k,
    { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({ contents: [{ parts: [{ text: 'Decí solo: OK' }] }] }) }
  );
  Logger.log('Respuesta HTTP ' + res.getResponseCode() + ': ' + res.getContentText().substring(0, 300));
}

function generarFoto(prompt) {
  var key = geminiKey_();
  if (!key) throw new Error('Falta la GEMINI_API_KEY: creala gratis en aistudio.google.com/apikey y pegala en Código.gs (o en Propiedades del script). Después publicá NUEVA VERSIÓN.');
  const res = UrlFetchApp.fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=' + key,
    {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  );
  const data = JSON.parse(res.getContentText());
  if (res.getResponseCode() !== 200) {
    throw new Error((data.error && data.error.message) || 'Error de Gemini (' + res.getResponseCode() + ')');
  }
  const parts = data.candidates[0].content.parts;
  for (var i = 0; i < parts.length; i++) {
    if (parts[i].inlineData) {
      return 'data:' + parts[i].inlineData.mimeType + ';base64,' + parts[i].inlineData.data;
    }
  }
  throw new Error('Gemini no devolvió imagen, probá de nuevo');
}

// Sugiere un reemplazo para un ingrediente que falta (23).
function sugerirSustituto(plato, ingrediente) {
  var key = geminiKey_();
  if (!key) throw new Error('Falta la GEMINI_API_KEY.');
  var res = UrlFetchApp.fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + key,
    { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({ contents: [{ parts: [{ text: 'Estoy cocinando ' + plato + ' y no tengo ' + ingrediente + '. En 2 o 3 líneas, en español rioplatense: ¿con qué lo reemplazo usando cosas comunes de una casa argentina, o cómo sigo sin eso?' }] }] }) }
  );
  var data = JSON.parse(res.getContentText());
  if (res.getResponseCode() !== 200) throw new Error((data.error && data.error.message) || 'Error de Gemini');
  return data.candidates[0].content.parts[0].text;
}

// Genera la receta de un plato escrito a mano (devuelve JSON como texto).
function generarReceta(nombre, tipo) {
  var key = geminiKey_();
  if (!key) throw new Error('Falta la GEMINI_API_KEY para buscar recetas.');
  var prompt = 'Sos un cocinero argentino. Para el plato "' + nombre + '" (' + (tipo === 'vianda' ? 'vianda para el colegio' : 'cena familiar') + '), ' +
    'devolvé SOLO un JSON válido, sin texto extra, con estas claves: ' +
    '"lados" (acompañamiento sugerido, string corto), ' +
    '"ing" (ingredientes separados por coma, en minúscula, para lista de compras), ' +
    '"receta" (preparación paso a paso numerada 1) 2) 3)... en un solo string), ' +
    '"keto" (ajuste keto/low-carb en un string corto), ' +
    '"nut" (array de 4 enteros: calorías, proteínas g, carbohidratos g, grasas g por porción). ' +
    'Todo en español rioplatense.';
  var res = UrlFetchApp.fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + key,
    { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      }) }
  );
  var data = JSON.parse(res.getContentText());
  if (res.getResponseCode() !== 200) {
    throw new Error((data.error && data.error.message) || 'Error de Gemini (' + res.getResponseCode() + ')');
  }
  return data.candidates[0].content.parts[0].text;
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

// ═══ Bot bidireccional (37): respondé /hoy /manana /semana /lista en Telegram ═══
// Después de pegar el token: ejecutá una vez configurarWebhookTelegram() ▶.
function configurarWebhookTelegram() {
  const url = ScriptApp.getService().getUrl();
  const res = UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/setWebhook?url=' + encodeURIComponent(url));
  Logger.log(res.getContentText());
}

function textoDia_(st, i, titulo) {
  const cena = nombreDe_(st, st.week.cenas[i]);
  const via = nombreDe_(st, st.week.viandas[i]);
  if (!cena && !via) return titulo + ': todavía no hay nada cargado 😅';
  let t = '🍽️ *' + titulo + '*';
  if (cena) t += '\n🌙 Cena: *' + cena + '*';
  if (via) t += '\n🧺 Vianda: *' + via + '*';
  const obs = st.week.obs[i];
  if (obs) t += '\n📝 ' + obs;
  return t;
}

function textoSemana_(st) {
  let t = '🍽️ *Semana del ' + st.week.monday + '*';
  for (let i = 0; i < 5; i++) {
    const cena = nombreDe_(st, st.week.cenas[i]) || '—';
    const via = nombreDe_(st, st.week.viandas[i]) || '—';
    t += '\n\n*' + DIAS_[i] + '*\n🌙 ' + cena + '\n🧺 ' + via;
  }
  return t;
}

function textoLista_(st) {
  const items = {};
  [].concat(st.week.cenas, st.week.viandas).forEach(function (e) {
    if (!e || !e.id) return;
    const d = st.recetario.find(function (x) { return x.id === e.id; });
    if (!d || !d.ing) return;
    d.ing.split(',').forEach(function (raw) {
      const it = raw.trim().toLowerCase();
      if (it && (st.despensa || []).indexOf(it) < 0) items[it] = (items[it] || 0) + 1;
    });
  });
  const keys = Object.keys(items).sort();
  if (!keys.length) return '🛒 Todavía no hay lista — armen el menú primero.';
  return '🛒 *Lista de compras*\n' + keys.map(function (k) { return '• ' + k + (items[k] > 1 ? ' (×' + items[k] + ')' : ''); }).join('\n');
}

function doPost(e) {
  try {
    const up = JSON.parse(e.postData.contents);
    const msg = up.message;
    if (!msg || !msg.text) return ContentService.createTextOutput('ok');
    // solo respondemos en el chat de la familia
    if (String(msg.chat.id) !== String(TELEGRAM_CHAT_ID)) return ContentService.createTextOutput('ok');
    const st = leerEstado_();
    const txt = msg.text.toLowerCase();
    let resp = null;
    const dow = new Date().getDay();
    if (/\/?hoy/.test(txt)) resp = (dow >= 1 && dow <= 5) ? textoDia_(st, dow - 1, 'Hoy ' + DIAS_[dow - 1]) : '🌞 ¡Es finde! Miren la app para ver si hay plan.';
    else if (/\/?ma[nñ]ana/.test(txt)) { const m2 = (dow + 1) % 7; resp = (m2 >= 1 && m2 <= 5) ? textoDia_(st, m2 - 1, 'Mañana ' + DIAS_[m2 - 1]) : '🌞 Mañana es finde, ¡a disfrutar!'; }
    else if (/\/?semana/.test(txt)) resp = textoSemana_(st);
    else if (/\/?lista|compra/.test(txt)) resp = textoLista_(st);
    else if (/hola|start/.test(txt)) resp = '👋 ¡Hola! Soy MenuFam. Escribime:\n/hoy — la cena de hoy\n/manana — la de mañana\n/semana — todo el menú\n/lista — las compras';
    if (resp) {
      UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage', {
        method: 'post',
        payload: { chat_id: String(msg.chat.id), text: resp, parse_mode: 'Markdown' }
      });
    }
  } catch (err) { /* nunca romper el webhook */ }
  return ContentService.createTextOutput('ok');
}

// ═══ Resumen dominical (38): Activadores → resumenSemanal → semanal → domingo 19-20 h ═══
function resumenSemanal() {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;
  const st = leerEstado_();
  if (!st) return;
  const msg = '🗓️ *¡Arranca la semana!*\n\n' + textoSemana_(st) + '\n\n' + textoLista_(st);
  UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage', {
    method: 'post',
    payload: { chat_id: TELEGRAM_CHAT_ID, text: msg, parse_mode: 'Markdown' }
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
