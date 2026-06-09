// VIEW: Perfil
import { state } from '../state.js';
import { logout } from '../auth.js';
import { uploadAvatar } from '../api/users.js';
import { getPastMatches } from '../api/matches.js';
import { getMyPredictionsForMatches } from '../api/predictions.js';
import { render } from '../router.js';
import { themeToggleHTML } from '../utils/theme.js';
import { esc, toast } from '../utils/dom.js';
import { avatarHTML } from '../utils/avatar.js';

const BADGES = [
  { ic: '🎯', name: 'Tirador exacto', desc: '5 marcadores exactos', check: (u) => (u.exact_hits || 0) >= 5 },
  { ic: '🔥', name: 'En llamas', desc: 'Racha de 4 aciertos', check: (u) => (u.streak || 0) >= 4 },
  { ic: '🥇', name: 'Cima del podio', desc: 'Llegar al #1 en algún grupo', check: () => false /* requiere query extra */ },
  { ic: '🏆', name: 'Profeta', desc: 'Acertar el campeón', check: () => false },
  { ic: '⚽', name: 'Cazador de goles', desc: 'Acertar el goleador', check: () => false },
  { ic: '💯', name: 'Cien por ciento', desc: '10 marcadores exactos', check: (u) => (u.exact_hits || 0) >= 10 }
];

export default async function profileView() {
  const me = state.user;
  if (!me) return '<div class="empty">Cargando perfil...</div>';

  const past = await getPastMatches(8);
  const preds = await getMyPredictionsForMatches(past.map(m => m.id));

  return `
    <div class="topbar">
      <div><h1>Mi perfil</h1><div class="sub">@${esc(me.username)}</div></div>
      <button class="icon-btn" onclick="logoutConfirm()">⚙️</button>
    </div>

    <div class="text-center" style="padding: 8px 0;">
      <div style="position: relative; width: 88px; height: 88px; margin: 8px auto; cursor: pointer;"
           onclick="document.getElementById('photoInput').click()" title="Cambiar foto">
        ${avatarHTML(me.display_name, 88, me.avatar_url)}
        <span style="position: absolute; bottom: -2px; right: -2px; background: var(--accent); color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 3px solid var(--bg);">📷</span>
      </div>
      <input type="file" id="photoInput" accept="image/*" style="display: none;" onchange="handlePhotoUpload(event)" />
      <h2 style="font-size: 20px; font-weight: 700;">${esc(me.display_name)}</h2>
      <div style="color: var(--text-dim); font-size: 13px; margin-top: 4px;">@${esc(me.username)} · ${esc(me.country_code)}</div>
      <div style="font-size: 11px; color: var(--text-mut); margin-top: 6px;">Tocá la foto para cambiarla</div>
    </div>

    <div class="stat-grid">
      <div class="stat"><div class="v">${me.total_pts || 0}</div><div class="l">Puntos totales</div></div>
      <div class="stat"><div class="v">${me.streak || 0} 🔥</div><div class="l">Racha actual</div></div>
      <div class="stat"><div class="v">${me.total_hits || 0}</div><div class="l">Aciertos</div></div>
      <div class="stat"><div class="v">${me.exact_hits || 0}</div><div class="l">Marcadores exactos</div></div>
    </div>

    <div class="section-title row" style="display: flex; justify-content: space-between; margin-right: 20px;">
      <span>🏅 Mis logros</span>
      <span style="font-size: 11px; color: var(--text-mut); text-transform: none; letter-spacing: 0; font-weight: 600;">
        ${BADGES.filter(b => b.check(me)).length}/${BADGES.length}
      </span>
    </div>
    <div class="badge-grid">
      ${BADGES.map(b => `
        <div class="badge ${b.check(me) ? 'got' : ''}" title="${b.desc}">
          <div class="b-ic">${b.ic}</div>
          <div class="b-name">${b.name}</div>
          <div class="b-desc">${b.desc}</div>
        </div>
      `).join('')}
    </div>

    <div class="section-title">Preferencias</div>
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <div>
          <div style="font-weight: 600; font-size: 14px;">🎨 Tema visual</div>
          <div style="font-size: 12px; color: var(--text-dim); margin-top: 2px;">Elegí cómo se ve la app</div>
        </div>
      </div>
      ${themeToggleHTML()}
    </div>

    <div class="card" onclick="navigate('info')" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
      <div>
        <div style="font-weight: 600; font-size: 14px;">ℹ️ Cómo funciona</div>
        <div style="font-size: 12px; color: var(--text-dim); margin-top: 2px;">Reglas, puntos y todo lo demás</div>
      </div>
      <div style="color: var(--text-mut); font-size: 18px;">›</div>
    </div>

    <div class="section-title">Historial</div>
    ${past.length === 0 ? '<div class="card text-center muted">Todavía no hay partidos jugados</div>' : past.slice(0, 5).map(m => {
      const p = preds.get(m.id);
      const pts = p ? p.points : null;
      return `
        <div class="card" onclick="navigate('match-detail', { matchId: ${m.id} })" style="cursor: pointer;">
          <div class="row">
            <div>
              <div style="font-size: 13px; font-weight: 600;">${m.home_flag} ${m.home_code} <b style="color: var(--accent-2);">${m.result_home}-${m.result_away}</b> ${m.away_code} ${m.away_flag}</div>
              <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">
                ${p ? `Predijiste: ${p.pred_home}-${p.pred_away}` : 'Sin predicción'}
              </div>
            </div>
            <span class="pill ${pts >= 3 ? '' : pts >= 1 ? 'warn' : 'red'}">${pts !== null ? '+' + pts : '—'}</span>
          </div>
        </div>
      `;
    }).join('')}

    <div style="margin: 16px;">
      <button class="btn btn-ghost" onclick="logoutConfirm()">Cerrar sesión</button>
    </div>
    <div style="height: 20px;"></div>
  `;
}

window.handlePhotoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { toast('La foto debe ser menor a 5MB', 'error'); return; }
  toast('Subiendo foto...');
  try {
    await uploadAvatar(file);
    // Refrescar el perfil completo
    const { getMyProfile } = await import('../api/users.js');
    const { setUser } = await import('../state.js');
    setUser(await getMyProfile());
    toast('Foto actualizada ✓', 'success');
    render('profile');
  } catch (err) {
    toast(err.message || 'Error al subir foto', 'error');
  }
};

window.logoutConfirm = async () => {
  if (!confirm('¿Cerrar sesión?')) return;
  await logout();
  render('splash');
};
