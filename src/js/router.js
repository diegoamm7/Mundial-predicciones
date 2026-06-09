// ============================================================
// ROUTER — SPA router minimalista
// ============================================================
// - Cada view se registra con register(name, renderFn)
// - render(name, params) monta la view en #app
// - bottom nav highlight automático según view actual

import { state } from './state.js';

const views = new Map();
let appEl = null;
let bottomNavEl = null;

const NAV_ITEMS = [
  { name: 'home', label: 'Inicio', icon: '🏠' },
  { name: 'matches', label: 'Predecir', icon: '⚽' },
  { name: 'world-cup', label: 'Mundial', icon: '🏆' },
  { name: 'groups', label: 'Amigos', icon: '👥' },
  { name: 'profile', label: 'Perfil', icon: '👤' }
];

export function register(name, renderFn) {
  views.set(name, renderFn);
}

export function init() {
  appEl = document.getElementById('app');
  bottomNavEl = document.getElementById('bottom-nav');
  setupBottomNav();
}

function setupBottomNav() {
  bottomNavEl.innerHTML = NAV_ITEMS.map(item => `
    <button class="nav-item" data-nav="${item.name}">
      <span class="ic">${item.icon}</span>
      <span>${item.label}</span>
    </button>
  `).join('');
  bottomNavEl.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => render(btn.dataset.nav));
  });
}

export function showBottomNav(show = true) {
  bottomNavEl.hidden = !show;
  bottomNavEl.style.display = show ? 'flex' : 'none'; // fallback por si el browser ignora [hidden]
  document.body.classList.toggle('has-nav', show);
}

export async function render(name, params = {}) {
  const view = views.get(name);
  if (!view) {
    appEl.innerHTML = `<div class="empty"><div class="ic">🚧</div><div>Pantalla "${name}" no encontrada</div></div>`;
    return;
  }

  // Loading state mientras la view se hidrata (si la fn es async)
  appEl.innerHTML = `<div class="loading-screen"><div class="spinner"></div></div>`;

  try {
    const html = await view(params);
    appEl.innerHTML = html;
    state.ui.currentView = name;
    updateNavHighlight(name);
    if (typeof view.afterMount === 'function') view.afterMount(params);
    appEl.scrollTop = 0;
    window.scrollTo(0, 0);
  } catch (err) {
    console.error('Render error', name, err);
    appEl.innerHTML = `<div class="empty"><div class="ic">⚠️</div><div>Algo salió mal: ${err.message}</div></div>`;
  }
}

function updateNavHighlight(name) {
  bottomNavEl.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.nav === name);
  });
}

// Helper para los botones onclick en HTML
window.navigate = (name, params) => render(name, params);
