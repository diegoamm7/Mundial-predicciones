// VIEW: Lista de grupos del usuario
import { getMyGroups, joinGroupByCode } from '../api/groups.js';
import { render } from '../router.js';
import { esc, toast } from '../utils/dom.js';

export default async function groupsView() {
  const groups = await getMyGroups();
  return `
    <div class="topbar">
      <div><h1>Mis grupos</h1><div class="sub">${groups.length} grupos activos</div></div>
      <button class="icon-btn" onclick="navigate('create-group')">+</button>
    </div>

    ${groups.length === 0 ? `
      <div class="empty">
        <div class="ic">👥</div>
        <div>Todavía no estás en ningún grupo</div>
        <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 10px; max-width: 240px; margin-left: auto; margin-right: auto;">
          <button class="btn btn-sm" onclick="navigate('create-group')">Crear un grupo</button>
          <button class="btn btn-ghost btn-sm" onclick="promptJoinByCode()">Unirme con código</button>
        </div>
      </div>
    ` : groups.map(g => `
      <div class="card" onclick="navigate('group-detail', { groupId: ${g.id} })" style="cursor: pointer;">
        <div class="row">
          <div>
            <div style="font-size: 16px; font-weight: 700;">${esc(g.emoji || '⚽')} ${esc(g.name)}</div>
            <div style="font-size: 12px; color: var(--text-dim); margin-top: 2px;">
              Código: <b style="font-family: monospace;">${esc(g.invite_code)}</b>
            </div>
          </div>
          <span style="color: var(--text-mut); font-size: 18px;">›</span>
        </div>
      </div>
    `).join('')}

    ${groups.length > 0 ? `
      <button class="btn btn-ghost" style="margin: 14px 16px; width: calc(100% - 32px);" onclick="navigate('create-group')">
        + Crear nuevo grupo
      </button>
      <button class="btn btn-ghost" style="margin: 0 16px; width: calc(100% - 32px);" onclick="promptJoinByCode()">
        Unirme con código
      </button>
    ` : ''}

    <div style="height: 20px;"></div>
  `;
}

window.promptJoinByCode = async () => {
  const code = prompt('Ingresá el código de 6 caracteres del grupo:');
  if (!code) return;
  try {
    const group = await joinGroupByCode(code);
    toast(`¡Te uniste a ${group.name}!`, 'success');
    render('groups');
  } catch (err) {
    toast(err.message, 'error');
  }
};
