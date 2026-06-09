// VIEW: Crear un grupo
import { createGroup } from '../api/groups.js';
import { render } from '../router.js';
import { toast } from '../utils/dom.js';

const EMOJIS = ['⚽','🏆','🍻','💼','❤️','🔥','🎯','💪','🐐','👑'];

export default function createGroupView() {
  setTimeout(bindForm, 0);
  return `
    <div class="topbar">
      <button class="icon-btn" onclick="navigate('groups')">←</button>
      <div class="text-center" style="flex: 1;"><h1 style="font-size: 18px;">Nuevo grupo</h1></div>
      <div style="width: 38px;"></div>
    </div>

    <form id="newGroupForm">
      <div class="input-group">
        <label>Nombre del grupo</label>
        <input class="input" name="name" placeholder="Ej: Los pibes, La familia..." required maxlength="40" />
      </div>

      <div class="input-group">
        <label>Emoji (opcional)</label>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${EMOJIS.map((e, i) => `
            <label style="cursor: pointer;">
              <input type="radio" name="emoji" value="${e}" ${i === 0 ? 'checked' : ''} style="display: none;" />
              <span class="score-btn" style="width: 44px; height: 44px; font-size: 22px; display: inline-flex; align-items: center; justify-content: center;">${e}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <div style="margin: 14px 16px;">
        <button class="btn" type="submit" id="createBtn">Crear grupo</button>
      </div>
    </form>

    <div style="height: 20px;"></div>
  `;
}

function bindForm() {
  const form = document.getElementById('newGroupForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const btn = document.getElementById('createBtn');
    btn.disabled = true;
    btn.textContent = 'Creando...';
    try {
      const group = await createGroup({
        name: fd.get('name'),
        emoji: fd.get('emoji') || '⚽'
      });
      toast('¡Grupo creado!', 'success');
      render('group-detail', { groupId: group.id });
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Crear grupo';
    }
  });
}
