// VIEW: Detalle de un partido (post-partido o pre-kickoff)
import { getMatch } from '../api/matches.js';
import { getMyPrediction } from '../api/predictions.js';
import { formatMatchDate, matchStatus } from '../utils/date.js';
import { esc } from '../utils/dom.js';

export default async function matchDetail({ matchId }) {
  if (!matchId) return '<div class="empty">Falta matchId</div>';
  const match = await getMatch(matchId);
  const myPred = await getMyPrediction(matchId);
  const status = matchStatus(match.starts_at, match.status === 'finished');
  const finished = status === 'finished';

  return `
    <div class="topbar">
      <button class="icon-btn" onclick="history.back()">←</button>
      <div class="text-center" style="flex: 1;">
        <h1 style="font-size: 17px;">${esc(match.home_name)} vs ${esc(match.away_name)}</h1>
        <div class="sub">${esc(match.stage)} · ${formatMatchDate(match.starts_at)}</div>
      </div>
      <div style="width: 38px;"></div>
    </div>

    <div class="card card-accent">
      <div class="match-teams">
        <div class="team"><div class="flag">${match.home_flag}</div><div class="team-name">${esc(match.home_name)}</div></div>
        <div class="vs" style="font-size: 28px; color: var(--accent-2); font-weight: 800;">
          ${finished ? `${match.result_home} - ${match.result_away}` : 'vs'}
        </div>
        <div class="team"><div class="flag">${match.away_flag}</div><div class="team-name">${esc(match.away_name)}</div></div>
      </div>
    </div>

    ${myPred ? `
      <div class="card">
        <div class="card-title">🎯 Tu predicción</div>
        <div class="row">
          <span style="font-size: 16px; font-weight: 700;">${myPred.pred_home} - ${myPred.pred_away}</span>
          ${finished ? `
            <span class="pill ${myPred.points >= 3 ? '' : myPred.points >= 1 ? 'warn' : 'red'}">
              ${myPred.points === 3 ? '🎯 ¡Exacto! +3 pts'
                : myPred.points === 2 ? '👍 Casi +2 pts'
                : myPred.points === 1 ? '✓ Ganador +1 pt'
                : '✗ Erraste 0 pts'}
            </span>
          ` : `<span class="pill">guardada</span>`}
        </div>
      </div>
    ` : `
      <div class="card text-center muted">
        Sin predicción para este partido
      </div>
    `}

    ${finished ? `
      <div class="card text-center">
        <button class="btn btn-ghost btn-sm" onclick="navigate('friends-picks', { matchId: ${matchId} })">
          👀 Ver qué predijeron tus amigos
        </button>
      </div>
    ` : `
      <div class="card text-center">
        <button class="btn btn-ghost btn-sm" onclick="navigate('predict', { matchId: ${matchId} })">
          ${myPred ? 'Editar predicción' : 'Hacer predicción'}
        </button>
      </div>
    `}

    <div style="height: 20px;"></div>
  `;
}
