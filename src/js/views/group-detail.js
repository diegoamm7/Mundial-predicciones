// VIEW: Detalle de un grupo (ranking + acciones)
import { getGroupRanking, inviteUserToGroup, leaveGroup } from '../api/groups.js';
import { supabase } from '../supabase.js';
import { state } from '../state.js';
import { render } from '../router.js';
import { avatarHTML } from '../utils/avatar.js';
import { esc, toast } from '../utils/dom.js';

export default async function groupDetail({ groupId }) {
  if (!groupId) return '<div class="empty">Falta groupId</div>';

  const [{ data: group }, ranking] = await Promise.all([
    supabase.from('groups').select('*').eq('id', groupId).single(),
    getGroupRanking(groupId)
  ]);

  if (!group) return '<div class="empty">Grupo no encontrado</div>';

  const myPos = ranking.findIndex(r => r.user_id === state.user?.id) + 1;
  const myPts = ranking.find(r => r.user_id === state.user?.id)?.total_pts || 0;
  const leader = ranking[0];

  return `
    <div class="topbar">
      <button class="icon-btn" onclick="navigate('groups')">←</button>
      <div class="text-center" style="flex: 1;">
        <h1 style="font-size: 18px;">${esc(group.emoji)} ${esc(group.name)}</h1>
        <div class="sub">${ranking.length} miembros · código: ${esc(group.invite_code)}</div>
      </div>
      <button class="icon-btn" onclick="leaveGroupConfirm(${group.id})" title="Salir">⋮</button>
    </div>

    ${myPos > 0 ? `
      <div class="card card-accent">
        <div class="row">
          <div>
            <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase;">Tu posición</div>
            <div style="font-size: 24px; font-weight: 800; color: var(--accent-2); margin-top: 4px;">
              ${myPos === 1 ? '🥇' : myPos === 2 ? '🥈' : myPos === 3 ? '🥉' : ''} #${myPos} · ${myPts} pts
            </div>
          </div>
          ${leader && leader.user_id !== state.user?.id ? `
            <div class="text-center">
              <div style="font-size: 11px; color: var(--text-dim);">Líder</div>
              <div style="font-size: 14px; font-weight: 700; color: var(--gold); margin-top: 4px;">${esc(leader.display_name)}</div>
            </div>
          ` : ''}
        </div>
      </div>
    ` : ''}

    <div class="section-title">Ranking</div>
    ${ranking.length === 0 ? '<div class="card text-center muted">Sin miembros todavía</div>' : ranking.map((r, i) => {
      const me = r.user_id === state.user?.id;
      const pos = i + 1;
      return `
        <div class="rank-row ${me ? 'me' : ''}">
          <div class="rank-pos ${pos === 1 ? 'gold' : pos === 2 ? 'silver' : pos === 3 ? 'bronze' : ''}">
            ${pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : pos}
          </div>
          ${avatarHTML(r.display_name, 38, r.avatar_url)}
          <div style="flex: 1;">
            <div class="rank-name">${esc(r.display_name)}${me ? ' (vos)' : ''}</div>
            <div class="rank-meta">${r.total_hits || 0} aciertos · ${r.exact_hits || 0} exactos</div>
          </div>
          <div class="rank-pts">${r.total_pts || 0}</div>
        </div>
      `;
    }).join('')}

    <div style="margin: 18px 16px;">
      <button class="btn btn-ghost" onclick="promptInvite(${group.id})">
        ➕ Invitar amigo por usuario
      </button>
    </div>

    <div class="card" style="text-align: center; font-size: 12px;">
      <div style="color: var(--text-dim); margin-bottom: 6px;">O comparten este código para unirse:</div>
      <div style="font-family: monospace; font-size: 24px; font-weight: 800; color: var(--accent); letter-spacing: 4px;">
        ${esc(group.invite_code)}
      </div>
    </div>

    <div style="height: 20px;"></div>
  `;
}

window.promptInvite = async (groupId) => {
  const username = prompt('Username del amigo a invitar:');
  if (!username) return;
  try {
    await inviteUserToGroup(groupId, username);
    toast(`@${username} agregado al grupo`, 'success');
    render('group-detail', { groupId });
  } catch (err) {
    toast(err.message, 'error');
  }
};

window.leaveGroupConfirm = async (groupId) => {
  if (!confirm('¿Salir del grupo? Tu posición se pierde.')) return;
  try {
    await leaveGroup(groupId);
    toast('Saliste del grupo', 'success');
    render('groups');
  } catch (err) {
    toast(err.message, 'error');
  }
};
