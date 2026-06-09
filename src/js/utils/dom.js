// ============================================================
// DOM HELPERS — toast, escape, query helpers
// ============================================================

let toastTimer = null;

/** Mostrar un toast (default 2.5s) */
export function toast(message, type = 'info', duration = 2500) {
  const el = document.getElementById('toast');
  if (!el) { alert(message); return; }
  el.textContent = message;
  el.className = 'toast show ' + (type === 'error' ? 'error' : type === 'success' ? 'success' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

/** Escapar HTML para evitar XSS al inyectar texto user-generated */
export function esc(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Atajo: document.getElementById */
export const $ = (id) => document.getElementById(id);
export const $$ = (sel) => document.querySelectorAll(sel);
