// ============================================================
// THEME — toggle entre los 3 modos (dark · ice · light)
// ============================================================

const THEMES = ['dark', 'ice', 'light'];
const LABELS = { dark: 'Oscuro', ice: 'Hielo', light: 'Claro' };
const STORAGE_KEY = 'theme';

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

export function setTheme(theme) {
  if (!THEMES.includes(theme)) theme = 'light';
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
  updateActiveButtons(theme);
}

export function cycleTheme() {
  const idx = THEMES.indexOf(getTheme());
  setTheme(THEMES[(idx + 1) % THEMES.length]);
}

export function initTheme() {
  let theme = 'light'; // default = lo que prefiere Diego
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES.includes(saved)) theme = saved;
  } catch (e) {}
  setTheme(theme);
}

function updateActiveButtons(theme) {
  document.querySelectorAll('.theme-opt-mini').forEach(b => {
    b.classList.toggle('active', b.dataset.t === theme);
  });
}

// HTML reutilizable del toggle inline (3 botones)
export function themeToggleHTML() {
  const current = getTheme();
  return `
    <div class="theme-toggle-inline" title="Cambiar tema">
      ${THEMES.map(t => `
        <button class="theme-opt-mini ${t === current ? 'active' : ''}"
                data-t="${t}"
                onclick="setTheme('${t}')">
          ${t === 'dark' ? '🌙' : t === 'ice' ? '❄️' : '☀️'}
        </button>
      `).join('')}
    </div>
  `;
}

// Exponer en window para los onclick inline
window.setTheme = setTheme;
window.cycleTheme = cycleTheme;
