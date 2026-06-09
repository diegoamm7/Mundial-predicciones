// VIEW: Mundial — hub con 3 tabs (Grupos del torneo / Bracket / Calendario)
import { svgTrophy } from '../utils/svg.js';
import { getAllMatches } from '../api/matches.js';
import { formatDayHeader, formatTime, groupByDay, matchStatus } from '../utils/date.js';
import { esc } from '../utils/dom.js';

let activeTab = 'groups';

export default async function worldCup({ tab } = {}) {
  if (tab) activeTab = tab;
  let content = '';
  if (activeTab === 'groups') content = await renderGroups();
  else if (activeTab === 'bracket') content = renderBracket();
  else content = await renderCalendar();

  return `
    <div class="topbar">
      <div class="header-icon">
        ${svgTrophy(40)}
        <div><h1>Mundial 2026</h1><div class="sub">USA · México · Canadá</div></div>
      </div>
      <button class="icon-btn" onclick="navigate('notifications')">🔔</button>
    </div>
    <div class="tabs">
      <button class="tab ${activeTab === 'groups' ? 'active' : ''}" onclick="setWcTab('groups')">Grupos</button>
      <button class="tab ${activeTab === 'bracket' ? 'active' : ''}" onclick="setWcTab('bracket')">Bracket</button>
      <button class="tab ${activeTab === 'calendar' ? 'active' : ''}" onclick="setWcTab('calendar')">Calendario</button>
    </div>
    ${content}
    <div style="height: 20px;"></div>
  `;
}

async function renderGroups() {
  // TODO: traer standings reales de una vista o función Supabase.
  // Por ahora mostramos un placeholder informativo.
  return `
    <div class="card">
      <div class="card-title">📊 Tablas de posiciones</div>
      <div style="font-size: 12px; color: var(--text-dim); line-height: 1.5;">
        Las tablas se calculan automáticamente a partir de los resultados cargados en la DB.
        En cuanto empiece el torneo aparecen los 12 grupos (A-L) con PJ/G/E/P/DG/Pts.
      </div>
    </div>
    <div class="card text-center muted">
      Sin partidos jugados todavía
    </div>
  `;
}

function renderBracket() {
  const stages = ['16avos', 'Octavos', 'Cuartos', 'Semifinal', 'Final'];
  return stages.map(stage => `
    <div style="margin: 0 16px 18px;">
      ${stage === 'Final' ? `<div class="text-center" style="margin: 8px 0 12px;">${svgTrophy(90)}</div>` : ''}
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3>${stage}</h3>
        <span style="font-size: 10px; color: var(--text-dim); background: var(--card-2); padding: 3px 8px; border-radius: 999px;">
          ${stage === 'Final' ? '1 partido' : stage === 'Semifinal' ? '2' : stage === 'Cuartos' ? '4' : stage === 'Octavos' ? '8' : '16'} partidos
        </span>
      </div>
      <div class="card text-center muted">A definir tras la fase de grupos</div>
    </div>
  `).join('');
}

async function renderCalendar() {
  const all = await getAllMatches();
  if (!all.length) return `<div class="empty"><div class="ic">📅</div>El calendario se carga cuando se publica el fixture</div>`;
  const days = groupByDay(all);
  return days.map(d => `
    <div style="display: flex; justify-content: space-between; align-items: center; margin: 16px 20px 8px;">
      <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${d.day}</div>
      <div style="font-size: 11px; color: var(--text-dim);">${d.matches.length} ${d.matches.length === 1 ? 'partido' : 'partidos'}</div>
    </div>
    ${d.matches.map(m => `
      <div class="card" style="display: grid; grid-template-columns: 50px 1fr auto; align-items: center; gap: 8px; padding: 10px 14px; margin: 0 16px 6px; cursor: pointer;"
           onclick="navigate('${matchStatus(m.starts_at, m.status === 'finished') === 'finished' ? 'match-detail' : 'predict'}', { matchId: ${m.id} })">
        <div style="font-size: 12px; font-weight: 700; color: var(--accent-2);">${formatTime(m.starts_at)}</div>
        <div style="display: flex; align-items: center; gap: 6px; font-size: 13px;">
          <span style="font-size: 18px;">${m.home_flag}</span>
          <b>${m.home_code}</b>
          <span style="color: var(--text-mut);">vs</span>
          <b>${m.away_code}</b>
          <span style="font-size: 18px;">${m.away_flag}</span>
        </div>
        <span style="font-size: 10px; color: var(--text-dim); background: var(--card-2); padding: 2px 6px; border-radius: 6px;">${esc(m.stage)}</span>
      </div>
    `).join('')}
  `).join('');
}

window.setWcTab = (tab) => {
  activeTab = tab;
  import('../router.js').then(r => r.render('world-cup'));
};
