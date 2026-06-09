// ============================================================
// DATE UTILS — formato local, countdowns, deadlines
// ============================================================

const DAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

/** "Jue 11 Jun · 21:00" en hora local del usuario */
export function formatMatchDate(isoString) {
  const d = new Date(isoString);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "21:00" (solo hora) */
export function formatTime(isoString) {
  const d = new Date(isoString);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "Hoy", "Mañana", o "Jue 11 Jun" */
export function formatDayHeader(isoString) {
  const d = new Date(isoString);
  const today = new Date();
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
  if (sameDay(d, today)) return 'Hoy';
  if (sameDay(d, tomorrow)) return 'Mañana';
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function pad(n) { return n.toString().padStart(2, '0'); }
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

/** Devuelve minutos hasta el kickoff. Negativo si ya empezó. */
export function minutesUntil(isoString) {
  const ms = new Date(isoString).getTime() - Date.now();
  return Math.round(ms / 60000);
}

/** "5 min" / "2h" / "3d" para mostrar en chips */
export function humanizeDuration(minutes) {
  if (minutes < 0) return 'cerrado';
  if (minutes < 60) return minutes + ' min';
  if (minutes < 1440) return Math.floor(minutes/60) + 'h';
  return Math.floor(minutes/1440) + 'd';
}

/** El partido se puede predecir? (cierra T-15 antes del kickoff) */
export function isPredictionOpen(isoString) {
  return minutesUntil(isoString) > 15;
}

/** Estado del partido para mostrar UI */
export function matchStatus(isoString, finished = false) {
  if (finished) return 'finished';
  const mins = minutesUntil(isoString);
  if (mins < 0 && mins > -120) return 'live';
  if (mins < 0) return 'closed';
  if (mins <= 15) return 'locked';
  return 'open';
}

/** Agrupa partidos por día */
export function groupByDay(matches) {
  const byDay = new Map();
  for (const m of matches) {
    const key = formatDayHeader(m.starts_at);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(m);
  }
  return Array.from(byDay.entries()).map(([day, list]) => ({ day, matches: list }));
}
