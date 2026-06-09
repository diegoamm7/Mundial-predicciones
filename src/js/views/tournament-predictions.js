// VIEW: Predicciones globales del torneo (campeón, sub, goleador, asistencias)
import { getMyTournamentPicks, saveTournamentPicks, getTopTeams, getStarPlayers } from '../api/tournament.js';
import { render } from '../router.js';
import { esc, toast } from '../utils/dom.js';

let picks = null;
let teams = [];
let players = [];
let pickerOpen = null; // { type: 'team'|'player', slot: 'champion'|... }

export default async function tournamentPredictions() {
  if (!picks) {
    [picks, teams, players] = await Promise.all([
      getMyTournamentPicks(),
      getTopTeams(),
      getStarPlayers()
    ]);
  }

  const champ = teams.find(t => t.code === picks.champion_code);
  const runner = teams.find(t => t.code === picks.runner_up_code);
  const third = teams.find(t => t.code === picks.third_place_code);
  const scorer = players.find(p => p.name === picks.top_scorer);
  const assister = players.find(p => p.name === picks.top_assists);

  return `
    <div class="topbar">
      <button class="icon-btn" onclick="navigate('home')">←</button>
      <div class="text-center" style="flex: 1;">
        <h1 style="font-size: 18px;">🌍 Predicciones del Torneo</h1>
        <div class="sub">Apostá fuerte por el campeón</div>
      </div>
      <div style="width: 38px;"></div>
    </div>

    <div class="card card-accent text-center">
      <div style="color: var(--accent-2); font-weight: 700; font-size: 13px;">⏰ Se bloquean al kick-off del partido inaugural</div>
      <div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">Después no se pueden cambiar</div>
    </div>

    <div class="section-title">🏅 El podio</div>
    ${pickRow('🏆 Campeón del Mundial', 15, champ, 'champion', 'team')}
    ${pickRow('🥈 Subcampeón', 8, runner, 'runner_up_code', 'team', 'runnerUp')}
    ${pickRow('🥉 Tercer puesto (opcional)', 5, third, 'third_place_code', 'team', 'third')}

    <div class="section-title">⚽ Galardones individuales</div>
    ${pickRow('⚽ Goleador del torneo', 10, scorer, 'top_scorer', 'player', 'topScorer')}
    ${pickRow('🎯 Más asistencias', 8, assister, 'top_assists', 'player', 'topAssists')}

    <div class="card" style="background: linear-gradient(135deg, rgba(251,191,36,0.10), rgba(220,38,38,0.06));">
      <div style="font-size: 12px; color: var(--text-dim); font-weight: 600;">💰 PUNTOS MÁXIMOS POSIBLES</div>
      <div style="font-size: 30px; font-weight: 900; color: var(--gold); margin-top: 4px;">+46 pts</div>
      <div style="font-size: 11px; color: var(--text-mut); margin-top: 4px;">Si acertás todo. Buena suerte 🍀</div>
    </div>

    <div style="margin: 14px 16px;">
      <button class="btn" onclick="saveAllPicks()">💾 Guardar predicciones</button>
    </div>

    ${renderPicker()}
    <div style="height: 20px;"></div>
  `;
}

function pickRow(title, pts, value, dbKey, type, slotName) {
  const slot = slotName || dbKey;
  const empty = !value;
  return `
    <div class="card" style="cursor: pointer; ${empty ? 'border-style: dashed;' : ''}" onclick="openPicker('${type}', '${slot}')">
      <div class="row" style="margin-bottom: 8px;">
        <span style="font-size: 13px; color: var(--text-dim); font-weight: 600;">${title}</span>
        <span style="background: linear-gradient(135deg, var(--gold), #f59e0b); color: white; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px;">+${pts} pts</span>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        ${empty ? `<div style="color: var(--text-mut); font-style: italic; padding: 8px 0;">Tocá para elegir</div>` : `
          <span style="font-size: 32px;">${value.flag}</span>
          <div style="flex: 1;">
            <div style="font-size: 16px; font-weight: 700;">${esc(value.name)}</div>
            ${value.odds_to_win ? `<div style="font-size: 11px; color: var(--text-mut);">Cuota ${value.odds_to_win}</div>` : ''}
            ${value.position ? `<div style="font-size: 11px; color: var(--text-mut);">${value.position} · ${value.team_code}</div>` : ''}
          </div>
          <span style="color: var(--text-mut); font-size: 18px;">›</span>
        `}
      </div>
    </div>
  `;
}

function renderPicker() {
  if (!pickerOpen) return '';
  const { type, slot } = pickerOpen;
  const titles = { champion: '🏆 Campeón', runnerUp: '🥈 Subcampeón', third: '🥉 Tercer puesto', topScorer: '⚽ Goleador', topAssists: '🎯 Más asistencias' };
  const list = type === 'team' ? teams : players;
  const currentValue = type === 'team'
    ? (slot === 'champion' ? picks.champion_code : slot === 'runnerUp' ? picks.runner_up_code : picks.third_place_code)
    : (slot === 'topScorer' ? picks.top_scorer : picks.top_assists);

  return `
    <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; display: flex; align-items: flex-end;" onclick="closePicker(event)">
      <div style="width: 100%; max-width: 480px; margin: 0 auto; background: var(--bg); border-top: 1px solid var(--border); border-radius: 20px 20px 0 0; max-height: 70vh; display: flex; flex-direction: column;" onclick="event.stopPropagation()">
        <div style="padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border);">
          <h3>${titles[slot] || ''}</h3>
          <button class="icon-btn" onclick="closePicker()">✕</button>
        </div>
        <div style="overflow-y: auto; flex: 1; padding: 6px 0 16px;">
          ${list.map(item => {
            const key = type === 'team' ? item.code : item.name;
            const sel = currentValue === key;
            const meta = type === 'team' ? `Cuota ${item.odds_to_win || '-'}` : `${item.position} · ${item.team_code}`;
            return `
              <div style="display: flex; align-items: center; gap: 12px; padding: 12px 18px; cursor: pointer; border-bottom: 1px solid var(--border); ${sel ? 'background: linear-gradient(90deg, rgba(0,168,107,0.16), transparent); border-left: 3px solid var(--accent);' : ''}"
                   onclick="setPick('${type}', '${slot}', '${esc(key)}')">
                <span style="font-size: 26px;">${item.flag}</span>
                <span style="flex: 1; font-weight: 600; font-size: 14px;">${esc(item.name)}</span>
                <span style="color: var(--text-mut); font-size: 11px;">${meta}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

window.openPicker = (type, slot) => { pickerOpen = { type, slot }; render('tournament-predictions'); };
window.closePicker = (e) => {
  if (e && e.target.closest('[onclick*="event.stopPropagation"]')) return;
  pickerOpen = null;
  render('tournament-predictions');
};
window.setPick = (type, slot, value) => {
  if (type === 'team') {
    if (slot === 'champion') picks.champion_code = value;
    else if (slot === 'runnerUp') picks.runner_up_code = value;
    else if (slot === 'third') picks.third_place_code = value;
  } else {
    if (slot === 'topScorer') picks.top_scorer = value;
    else if (slot === 'topAssists') picks.top_assists = value;
  }
  pickerOpen = null;
  render('tournament-predictions');
};
window.saveAllPicks = async () => {
  try {
    await saveTournamentPicks({
      champion_code: picks.champion_code,
      runner_up_code: picks.runner_up_code,
      third_place_code: picks.third_place_code,
      top_scorer: picks.top_scorer,
      top_assists: picks.top_assists
    });
    toast('Predicciones globales guardadas ✓', 'success');
  } catch (err) {
    toast(err.message, 'error');
  }
};
