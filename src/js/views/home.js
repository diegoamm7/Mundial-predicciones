// VIEW: Home
import { state } from '../state.js';
import { getNextOpenMatch, getTodayMatches } from '../api/matches.js';
import { getMyGroups } from '../api/groups.js';
import { formatMatchDate, minutesUntil, humanizeDuration, formatTime, matchStatus } from '../utils/date.js';
import { esc } from '../utils/dom.js';
import { themeToggleHTML } from '../utils/theme.js';

export default async function home() {
  const me = state.user;
  if (!me) return '<div class="empty">Cargando...</div>';

  const [nextMatch, today, groups] = await Promise.all([
    getNextOpenMatch().catch(() => null),
    getTodayMatches().catch(() => []),
    getMyGroups().catch(() => [])
  ]);

  return `
    <div class="topbar">
      <div>
        <h1>Hola, ${esc(me.display_name)} ${countryFlag(me.country_code)}</h1>
        <div class="sub">Llevás <b style="color: var(--accent-2)">${me.total_pts || 0} pts</b> · racha de ${me.streak || 0} 🔥</div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        ${themeToggleHTML()}
        <button class="icon-btn" onclick="navigate('notifications')">🔔</button>
      </div>
    </div>

    ${nextMatch ? renderNextMatch(nextMatch) : ''}

    <div class="section-title row" style="display: flex; justify-content: space-between; margin-right: 20px;">
      <span>⚽ Partidos de hoy</span>
      <a onclick="navigate('world-cup', { tab: 'calendar' })" style="font-size: 11px; text-transform: none; letter-spacing: 0;">Ver calendario →</a>
    </div>
    ${today.length ? today.map(renderMiniMatch).join('') : `<div class="card text-center muted">No hay partidos hoy</div>`}

    <div class="section-title">🌍 Predicciones del torneo</div>
    <div class="card card-accent" onclick="navigate('tournament-predictions')" style="cursor: pointer;">
      <div style="font-weight: 700; font-size: 15px; margin-bottom: 4px;">¿Quién levanta la Copa?</div>
      <div style="font-size: 12px; color: var(--text-dim); line-height: 1.4;">
        Campeón, goleador, asistencias y más. Hasta <b>+46 puntos</b> en juego.
      </div>
    </div>

    <div class="section-title">👥 Mis grupos</div>
    ${groups.length ? groups.slice(0, 3).map(renderGroupRow).join('') : `
      <div class="card text-center">
        <div style="margin-bottom: 10px;">Todavía no estás en ningún grupo</div>
        <button class="btn btn-ghost btn-sm" onclick="navigate('groups')">Crear o unirme</button>
      </div>
    `}

    <div class="section-title">Cómo se puntúa</div>
    <div class="card">
      ${legend()}
      <div style="text-align: center; margin-top: 12px;">
        <a onclick="navigate('info')" style="font-size: 12px; font-weight: 600;">Ver reglas completas →</a>
      </div>
    </div>
    <div style="height: 20px;"></div>
  `;
}

function renderNextMatch(m) {
  const mins = minutesUntil(m.starts_at);
  const urgent = mins < 60;
  return `
    <div class="card card-accent" onclick="navigate('predict', { matchId: ${m.id} })" style="cursor: pointer;">
      <div class="card-title">⏰ Próximo partido — predecí ya</div>
      <div class="match-teams">
        <div class="team"><div class="flag">${m.home_flag}</div><div class="team-name">${esc(m.home_name)}</div></div>
        <div class="vs">VS</div>
        <div class="team"><div class="flag">${m.away_flag}</div><div class="team-name">${esc(m.away_name)}</div></div>
      </div>
      <div class="match-foot">
        <span>${formatMatchDate(m.starts_at)} · ${esc(m.stage)}</span>
        <span class="countdown ${urgent ? 'urgent' : ''}">⚡ Cierra en ${humanizeDuration(mins - 15)}</span>
      </div>
    </div>
  `;
}

function renderMiniMatch(m) {
  const status = matchStatus(m.starts_at, m.status === 'finished');
  const time = status === 'live' ? '🔴 LIVE' : formatTime(m.starts_at);
  return `
    <div class="card" style="display: grid; grid-template-columns: 50px 1fr auto; align-items: center; gap: 8px; padding: 10px 14px; cursor: pointer;"
         onclick="navigate('${status === 'open' ? 'predict' : 'match-detail'}', { matchId: ${m.id} })">
      <div style="font-size: 12px; font-weight: 700; color: var(--accent-2);">${time}</div>
      <div style="display: flex; align-items: center; gap: 6px; font-size: 13px;">
        <span style="font-size: 18px;">${m.home_flag}</span>
        <b>${m.home_code}</b>
        <span style="color: var(--text-mut);">vs</span>
        <b>${m.away_code}</b>
        <span style="font-size: 18px;">${m.away_flag}</span>
      </div>
      <span class="pill ${status === 'open' ? 'warn' : 'red'}" style="font-size: 10px;">
        ${status === 'open' ? 'predecí' : status === 'live' ? '🔒' : '✓'}
      </span>
    </div>
  `;
}

function renderGroupRow(g) {
  return `
    <div class="card" onclick="navigate('group-detail', { groupId: ${g.id} })" style="cursor: pointer;">
      <div class="row">
        <div>
          <div style="font-weight: 700; font-size: 15px;">${esc(g.emoji || '⚽')} ${esc(g.name)}</div>
          <div style="font-size: 12px; color: var(--text-dim); margin-top: 2px;">Tu pos: cargando...</div>
        </div>
        <span style="color: var(--text-mut); font-size: 18px;">›</span>
      </div>
    </div>
  `;
}

function legend() {
  return `
    <div style="font-size: 11px; color: var(--text-mut); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 6px;">Por partido</div>
    <div style="font-size: 13px; color: var(--text-dim); padding: 4px 0;"><b style="background: var(--accent); color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px;">3 pts</b> Marcador exacto</div>
    <div style="font-size: 13px; color: var(--text-dim); padding: 4px 0;"><b style="background: var(--accent); color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px;">2 pts</b> Ganador + diferencia de goles</div>
    <div style="font-size: 13px; color: var(--text-dim); padding: 4px 0;"><b style="background: var(--accent); color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px;">1 pt</b> Solo ganador/empate</div>
    <div style="height: 8px;"></div>
    <div style="font-size: 11px; color: var(--text-mut); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 6px;">Del torneo</div>
    <div style="font-size: 13px; color: var(--text-dim); padding: 4px 0;"><b style="background: var(--gold); color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px;">15</b> Campeón 🏆</div>
    <div style="font-size: 13px; color: var(--text-dim); padding: 4px 0;"><b style="background: var(--gold); color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px;">10</b> Goleador ⚽</div>
    <div style="font-size: 13px; color: var(--text-dim); padding: 4px 0;"><b style="background: var(--gold); color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px;">8</b> Subcampeón 🥈 + asistencias 🎯</div>
    <div style="font-size: 13px; color: var(--text-dim); padding: 4px 0;"><b style="background: var(--gold); color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px;">5</b> Tercer puesto 🥉</div>
  `;
}

const FLAGS = { AR:'🇦🇷', MX:'🇲🇽', CO:'🇨🇴', BR:'🇧🇷', CL:'🇨🇱', UY:'🇺🇾', PE:'🇵🇪', ES:'🇪🇸', US:'🇺🇸' };
function countryFlag(code) { return FLAGS[code] || '🌎'; }
