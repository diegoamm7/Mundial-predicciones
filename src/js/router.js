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

// Contador para descartar renders viejas si vino una nueva en el medio.
// Evita race conditions cuando tocás varias pestañas seguidas.
let currentRenderId = 0;

export async function render(name, params = {}) {
  const myId = ++currentRenderId;
  const view = views.get(name);
  if (!view) {
    appEl.innerHTML = `<div class="empty"><div class="ic">🚧</div><div>Pantalla "${name}" no encontrada</div></div>`;
    return;
  }

  // Loading state inmediato (asegura feedback visual)
  appEl.innerHTML = `<div class="loading-screen"><div class="spinner"></div></div>`;
  state.ui.currentView = name;
  updateNavHighlight(name);

  try {
    // Timeout de 8 segundos por si una query se cuelga indefinidamente
    const html = await Promise.race([
      view(params),
      new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout: la pantalla tardó demasiado en cargar')), 8000))
    ]);

    // Si en el medio iniciaron otra render, abandonar esta
    if (myId !== currentRenderId) return;

    appEl.innerHTML = html;
    if (typeof view.afterMount === 'function') view.afterMount(params);
    appEl.scrollTop = 0;
    window.scrollTo(0, 0);
  } catch (err) {
    if (myId !== currentRenderId) return; // ya estamos en otra pantalla, ignorar
    console.error('[render]', name, err);
    appEl.innerHTML = `
      <div class="empty">
        <div class="ic">⚠️</div>
        <div>Algo salió mal cargando ${name}</div>
        <div style="font-size: 11px; color: var(--text-mut); margin-top: 8px;">${err.message || ''}</div>
        <div style="margin-top: 20px;">
          <button class="btn btn-sm" onclick="navigate('${name}')" style="max-width: 200px;">Reintentar</button>
          <button class="btn btn-ghost btn-sm" onclick="navigate('home')" style="max-width: 200px; margin-top: 8px;">Ir a inicio</button>
        </div>
      </div>
    `;
  }
}

function updateNavHighlight(name) {
  bottomNavEl.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.nav === name);
  });
}

// Helper para los botones onclick en HTML
window.navigate = (name, params) => render(name, params);
