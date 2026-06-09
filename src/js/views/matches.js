// VIEW: Lista de partidos (próximos + pasados con toggle)
import { getUpcomingMatches, getPastMatches } from '../api/matches.js';
import { getMyPredictionsForMatches } from '../api/predictions.js';
import { formatMatchDate, minutesUntil, humanizeDuration, matchStatus } from '../utils/date.js';
import { esc } from '../utils/dom.js';

let activeTab = 'upcoming';

export default async function matchesView() {
  const fetchFn = activeTab === 'upcoming' ? getUpcomingMatches : getPastMatches;
  const matches = await fetchFn(30);
  const preds = await getMyPredictionsForMatches(matches.map(m => m.id));

  return `
    <div class="topbar">
      <div><h1>Partidos</h1><div class="sub">Mundial 2026</div></div>
    </div>
    <div class="tabs">
      <button class="tab ${activeTab === 'upcoming' ? 'active' : ''}" onclick="setMatchesTab('upcoming')">Próximos</button>
      <button class="tab ${activeTab === 'past' ? 'active' : ''}" onclick="setMatchesTab('past')">Pasados</button>
    </div>
    ${matches.length === 0 ? `
      <div class="empty"><div class="ic">⚽</div>Todavía no hay partidos ${activeTab === 'past' ? 'jugados' : 'cargados'}</div>
    ` : matches.map(m => renderMatch(m, preds.get(m.id))).join('')}
    <div style="height: 20px;"></div>
  `;
}

function renderMatch(m, myPred) {
  const status = matchStatus(m.starts_at, m.status === 'finished');
  const mins = minutesUntil(m.starts_at);
  const isPast = status === 'finished';

  return `
    <div class="match" onclick="navigate('${isPast ? 'match-detail' : 'predict'}', { matchId: ${m.id} })">
      <div class="match-head">
        <span>${esc(m.stage)} · ${formatMatchDate(m.starts_at)}</span>
        ${isPast
          ? `<span class="pill ${myPred && myPred.points >= 3 ? '' : myPred && myPred.points >= 1 ? 'warn' : 'red'}">${myPred ? '+' + (myPred.points || 0) + ' pts' : 'sin predicción'}</span>`
          : myPred
            ? `<span class="pill">✓ ${myPred.pred_home}-${myPred.pred_away}</span>`
            : `<span class="pill ${mins < 60 ? 'warn' : ''}">${mins < 60 ? '⚡' : '⏰'} ${humanizeDuration(mins - 15)}</span>`
        }
      </div>
      <div class="match-teams">
        <div class="team"><div class="flag">${m.home_flag}</div><div class="team-name">${esc(m.home_name)}</div></div>
        ${isPast
          ? `<div class="vs" style="color: var(--accent-2); font-weight: 800;">${m.result_home}-${m.result_away}</div>`
          : `<div class="vs">VS</div>`}
        <div class="team"><div class="flag">${m.away_flag}</div><div class="team-name">${esc(m.away_name)}</div></div>
      </div>
      <div class="match-foot">
        <span>${myPred ? 'Tu predicción: ' + myPred.pred_home + '-' + myPred.pred_away : 'Sin predicción todavía'}</span>
        <span style="color: var(--accent-2); font-weight: 600;">${isPast ? 'Ver detalle →' : 'Predecir →'}</span>
      </div>
    </div>
  `;
}

window.setMatchesTab = (tab) => {
  activeTab = tab;
  import('../router.js').then(r => r.render('matches'));
};
