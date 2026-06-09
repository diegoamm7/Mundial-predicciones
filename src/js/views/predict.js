// VIEW: Predicción de un partido
import { getMatch } from '../api/matches.js';
import { getMyPrediction, upsertPrediction, getFriendsPredictions } from '../api/predictions.js';
import { render } from '../router.js';
import { formatMatchDate, minutesUntil, humanizeDuration, isPredictionOpen } from '../utils/date.js';
import { esc, toast } from '../utils/dom.js';
import { avatarHTML } from '../utils/avatar.js';
import { state } from '../state.js';

let currentMatch = null;
let myScore = { home: 1, away: 0 };

export default async function predictView({ matchId }) {
  if (!matchId) return '<div class="empty">Falta matchId</div>';
  currentMatch = await getMatch(matchId);
  const existing = await getMyPrediction(matchId);
  if (existing) myScore = { home: existing.pred_home, away: existing.pred_away };
  else myScore = { home: 1, away: 0 };

  const open = isPredictionOpen(currentMatch.starts_at);
  const mins = minutesUntil(currentMatch.starts_at);

  return `
    <div class="topbar">
      <div>
        <h1>Hacer predicción</h1>
        <div class="sub">${esc(currentMatch.stage)} · ${formatMatchDate(currentMatch.starts_at)}</div>
      </div>
      <button class="icon-btn" onclick="navigate('matches')">✕</button>
    </div>

    <div class="card card-accent text-center">
      ${open ? `
        <div style="color: var(--accent-2); font-weight: 700; font-size: 13px;">⏰ Cierra en ${humanizeDuration(mins - 15)}</div>
        <div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">
          No vas a poder cambiar tu predicción 15 minutos antes del partido
        </div>
      ` : `
        <div style="color: var(--red); font-weight: 700; font-size: 13px;">🔒 Predicciones cerradas</div>
        <div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">
          ${mins > 0 ? 'Faltan menos de 15 minutos para el partido.' : 'El partido ya arrancó.'}
        </div>
      `}
    </div>

    ${renderPicker(open)}
    ${renderQuickPicks(open)}

    <div style="margin: 14px 16px;">
      <button class="btn" id="savePredBtn" onclick="savePrediction()" ${open ? '' : 'disabled'}>
        💾 ${existing ? 'Actualizar predicción' : 'Guardar predicción'}
      </button>
    </div>

    ${renderFriendsBlock(currentMatch)}

    <div style="height: 20px;"></div>
  `;
}

function renderPicker(enabled) {
  return `
    <div class="score-pickers">
      <div class="score-box">
        <div class="score-flag">${currentMatch.home_flag}</div>
        <div class="score-name">${currentMatch.home_code}</div>
        <div class="score-num" id="sh">${myScore.home}</div>
        <div class="score-controls">
          <button class="score-btn" onclick="bumpScore('home', -1)" ${enabled ? '' : 'disabled'}>−</button>
          <button class="score-btn" onclick="bumpScore('home', 1)" ${enabled ? '' : 'disabled'}>+</button>
        </div>
      </div>
      <div class="score-vs">−</div>
      <div class="score-box">
        <div class="score-flag">${currentMatch.away_flag}</div>
        <div class="score-name">${currentMatch.away_code}</div>
        <div class="score-num" id="sa">${myScore.away}</div>
        <div class="score-controls">
          <button class="score-btn" onclick="bumpScore('away', -1)" ${enabled ? '' : 'disabled'}>−</button>
          <button class="score-btn" onclick="bumpScore('away', 1)" ${enabled ? '' : 'disabled'}>+</button>
        </div>
      </div>
    </div>
  `;
}

function renderQuickPicks(enabled) {
  const picks = [[1,0],[2,1],[2,0],[1,1],[0,0],[2,2],[0,1],[1,2],[0,2]];
  return `
    <div class="section-title">Predicción rápida</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin: 0 16px 16px;">
      ${picks.map(([h,a]) => `
        <button class="btn btn-ghost btn-sm" onclick="setQuick(${h},${a})" ${enabled ? '' : 'disabled'}>${h}-${a}</button>
      `).join('')}
    </div>
  `;
}

function renderFriendsBlock(match) {
  // Si el partido ya arrancó, mostrar enlace a la vista de revelados
  const started = minutesUntil(match.starts_at) <= 0;
  if (started) {
    return `
      <div class="card" style="background: linear-gradient(135deg, rgba(0,168,107,0.10), rgba(37,99,235,0.06));">
        <div style="font-weight: 700; margin-bottom: 8px;">🔓 Predicciones reveladas</div>
        <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 12px;">El partido arrancó. Mirá qué pusieron tus amigos y reaccioná.</div>
        <button class="btn btn-ghost btn-sm" onclick="navigate('friends-picks', { matchId: ${match.id} })">Ver predicciones →</button>
      </div>
    `;
  }
  return `
    <div class="card">
      <div class="card-title">👥 Tus amigos</div>
      <div style="font-size: 12px; color: var(--text-dim); text-align: center; padding: 14px 0;">
        🔒 Las predicciones de tus amigos se revelan <b>cuando arranque el partido</b>.<br/>
        Esto evita que se copien entre sí.
      </div>
    </div>
  `;
}

// === Funciones expuestas ===
window.bumpScore = (side, delta) => {
  myScore[side] = Math.max(0, Math.min(15, myScore[side] + delta));
  const el = document.getElementById('s' + side[0]);
  if (el) el.textContent = myScore[side];
};
window.setQuick = (h, a) => {
  myScore.home = h; myScore.away = a;
  const sh = document.getElementById('sh'); const sa = document.getElementById('sa');
  if (sh) sh.textContent = h; if (sa) sa.textContent = a;
};
window.savePrediction = async () => {
  const btn = document.getElementById('savePredBtn');
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = 'Guardando...';
  try {
    await upsertPrediction({
      matchId: currentMatch.id,
      predHome: myScore.home,
      predAway: myScore.away
    });
    toast(`¡Predicción guardada! ${myScore.home}-${myScore.away}`, 'success');
    render('matches');
  } catch (err) {
    toast(err.message || 'Error al guardar', 'error');
    btn.disabled = false;
    btn.textContent = '💾 Guardar predicción';
  }
};
