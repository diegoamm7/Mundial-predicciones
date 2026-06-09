// VIEW: Bandeja de notificaciones
import { supabase } from '../supabase.js';
import { state } from '../state.js';
import { esc } from '../utils/dom.js';

export default async function notificationsView() {
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', state.user?.id)
    .order('created_at', { ascending: false })
    .limit(30);

  const notifs = data || [];

  return `
    <div class="topbar">
      <button class="icon-btn" onclick="navigate('home')">←</button>
      <div class="text-center" style="flex: 1;"><h1 style="font-size: 18px;">Notificaciones</h1></div>
      <div style="width: 38px;"></div>
    </div>

    ${notifs.length === 0 ? `
      <div class="empty">
        <div class="ic">🔔</div>
        <div>No tenés notificaciones todavía</div>
      </div>
    ` : notifs.map(n => `
      <div class="card" style="display: flex; gap: 12px; align-items: flex-start; ${!n.read_at ? 'border-color: var(--accent);' : ''}">
        <div style="font-size: 24px;">${iconFor(n.type)}</div>
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 14px;">${esc(n.title)}</div>
          ${n.body ? `<div style="color: var(--text-dim); font-size: 13px; margin-top: 4px;">${esc(n.body)}</div>` : ''}
          <div style="color: var(--text-mut); font-size: 11px; margin-top: 6px;">${timeAgo(n.created_at)}</div>
        </div>
      </div>
    `).join('')}

    <div style="height: 20px;"></div>
  `;
}

function iconFor(type) {
  return { reminder: '⏰', result: '🎯', group_invite: '➕', rank_change: '🏆' }[type] || '🔔';
}

function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60000);
  if (min < 60) return `hace ${min} min`;
  if (min < 1440) return `hace ${Math.floor(min/60)}h`;
  return `hace ${Math.floor(min/1440)}d`;
}
