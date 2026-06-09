// VIEW: Predicciones reveladas de amigos (post-kickoff) con reacciones + comentarios
import { getMatch } from '../api/matches.js';
import { getFriendsPredictions } from '../api/predictions.js';
import { getReactionsForPredictions, toggleReaction, getCommentsForPredictions, addComment } from '../api/reactions.js';
import { state } from '../state.js';
import { render } from '../router.js';
import { avatarHTML } from '../utils/avatar.js';
import { minutesUntil } from '../utils/date.js';
import { esc, toast } from '../utils/dom.js';

const QUICK_REACTIONS = ['🔥','🎯','👀','😂','🤔','💀','🤡','😱'];

let activeComment = null;

export default async function friendsPicks({ matchId }) {
  if (!matchId) return '<div class="empty">Falta matchId</div>';
  const match = await getMatch(matchId);
  const started = minutesUntil(match.starts_at) <= 0;
  if (!started) {
    return `
      <div class="topbar">
        <button class="icon-btn" onclick="navigate('matches')">←</button>
        <div class="text-center" style="flex: 1;"><h1 style="font-size: 17px;">Predicciones</h1></div>
        <div style="width: 38px;"></div>
      </div>
      <div class="empty">
        <div class="ic">🔒</div>
        <div>Las predicciones se revelan cuando arranque el partido</div>
        <div style="margin-top: 14px;">
          <button class="btn btn-ghost btn-sm" onclick="navigate('predict', { matchId: ${matchId} })">Ver mi predicción</button>
        </div>
      </div>
    `;
  }

  const all = await getFriendsPredictions(matchId);
  const ids = all.map(p => p.id);
  const [reactionsMap, commentsMap] = await Promise.all([
    getReactionsForPredictions(ids),
    getCommentsForPredictions(ids)
  ]);
  const mine = all.find(p => p.user.id === state.user?.id);
  const others = all.filter(p => p.user.id !== state.user?.id);

  return `
    <div class="topbar">
      <button class="icon-btn" onclick="navigate('matches')">←</button>
      <div class="text-center" style="flex: 1;">
        <h1 style="font-size: 17px;">¿Qué predijo cada uno?</h1>
        <div class="sub">${match.home_flag} ${match.home_code} vs ${match.away_code} ${match.away_flag}</div>
      </div>
      <div style="width: 38px;"></div>
    </div>

    <div class="card card-accent text-center">
      <div style="font-weight: 700; font-size: 14px;">🔓 Predicciones reveladas</div>
      <div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">Reaccioná y comentá 🎤</div>
    </div>

    ${mine ? renderPick(mine, reactionsMap.get(mine.id), commentsMap.get(mine.id), true) : ''}
    ${others.map(p => renderPick(p, reactionsMap.get(p.id), commentsMap.get(p.id), false)).join('')}

    <div style="height: 20px;"></div>
  `;
}

function renderPick(p, reactions = {}, comments = [], mine = false) {
  const winner = p.pred_home > p.pred_away ? 'home' : p.pred_home < p.pred_away ? 'away' : 'draw';
  const borderColor = winner === 'home' ? 'var(--accent)' : winner === 'away' ? 'var(--red)' : 'var(--gold)';
  return `
    <div class="card" style="border-left: 3px solid ${borderColor}; ${mine ? 'background: linear-gradient(90deg, rgba(0,168,107,0.10), var(--card));' : ''}">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${avatarHTML(p.user.display_name, 40, p.user.avatar_url)}
        <div style="flex: 1;">
          <div style="font-weight: 700; font-size: 14px;">${esc(p.user.display_name)}${mine ? ' (vos)' : ''}</div>
          <div style="font-size: 11px; color: var(--text-dim);">${winner === 'home' ? 'gana local' : winner === 'away' ? 'gana visitante' : 'empate'}</div>
        </div>
        <div style="background: var(--card-2); border-radius: 8px; padding: 6px 12px; font-weight: 800; font-size: 15px;">
          ${p.pred_home}-${p.pred_away}
        </div>
      </div>

      <div style="display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap;">
        ${Object.entries(reactions || {}).map(([emoji, count]) => `
          <span style="background: var(--card-2); border: 1px solid var(--border); border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 600; cursor: pointer;"
                onclick="onToggleReaction(${p.id}, '${emoji}')">${emoji} ${count}</span>
        `).join('')}
        <button style="background: transparent; border: 1px dashed var(--border); color: var(--text-mut); border-radius: 999px; padding: 4px 10px; font-size: 12px; cursor: pointer;"
                onclick="showReactionBar(${p.id})">+</button>
      </div>

      <div id="rb-${p.id}" style="display: none; gap: 4px; margin-top: 8px; padding: 6px; background: var(--card-2); border-radius: 10px; flex-wrap: wrap;">
        ${QUICK_REACTIONS.map(e => `
          <button style="background: transparent; border: none; font-size: 18px; cursor: pointer; padding: 4px 6px; border-radius: 6px;"
                  onclick="onToggleReaction(${p.id}, '${e}'); hideReactionBar(${p.id})">${e}</button>
        `).join('')}
      </div>

      ${comments && comments.length ? `
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border);">
          ${comments.map(c => `
            <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; font-size: 12px;">
              ${avatarHTML(c.user.display_name, 20, c.user.avatar_url)}
              <div><b>${esc(c.user.display_name)}:</b> <span style="color: var(--text-dim);">${esc(c.text)}</span></div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${activeComment === p.id ? `
        <div style="display: flex; gap: 6px; margin-top: 8px;">
          <input id="ci-${p.id}" placeholder="Decile algo..." maxlength="80"
                 style="flex: 1; background: var(--card-2); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; color: var(--text); font-size: 12px;" autofocus />
          <button onclick="onSubmitComment(${p.id})"
                  style="background: var(--accent); color: white; border: none; border-radius: 8px; padding: 0 14px; font-size: 12px; font-weight: 700; cursor: pointer;">Enviar</button>
        </div>
      ` : `
        <div style="margin-top: 8px;">
          <button style="background: transparent; border: 1px dashed var(--border); color: var(--text-mut); border-radius: 999px; padding: 4px 10px; font-size: 12px; cursor: pointer;"
                  onclick="openCommentBox(${p.id})">💬 Comentar</button>
        </div>
      `}
    </div>
  `;
}

window.onToggleReaction = async (predId, emoji) => {
  try {
    await toggleReaction(predId, emoji);
    render('friends-picks', { matchId: parseInt(new URL(location.href).hash.replace('#match-', '')) || null });
    // Mejor: forzar re-render con matchId actual
  } catch (err) { toast(err.message, 'error'); }
};
window.showReactionBar = (predId) => {
  const el = document.getElementById('rb-' + predId);
  if (el) el.style.display = 'flex';
};
window.hideReactionBar = (predId) => {
  const el = document.getElementById('rb-' + predId);
  if (el) el.style.display = 'none';
};
window.openCommentBox = (predId) => {
  activeComment = predId;
  render('friends-picks', { matchId: currentMatchId() });
};
window.onSubmitComment = async (predId) => {
  const input = document.getElementById('ci-' + predId);
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  try {
    await addComment(predId, text);
    activeComment = null;
    render('friends-picks', { matchId: currentMatchId() });
  } catch (err) { toast(err.message, 'error'); }
};

// Helper para volver al estado actual con el matchId correcto
function currentMatchId() {
  return state.ui.lastMatchId || null;
}
