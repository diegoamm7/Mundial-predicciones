// ============================================================
// AVATAR — render de avatares con foto o iniciales coloridas
// ============================================================

const COLORS = ['#dc2626','#2563eb','#00a86b','#f59e0b','#a855f7','#ec4899','#f97316','#06b6d4','#84cc16','#ef4444'];

export function avatarColor(name) {
  let hash = 0;
  const s = (name || '?').toString();
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

/**
 * Renderea el HTML de un avatar.
 * @param {string} name - nombre del usuario (para iniciales y color)
 * @param {number} size - en px
 * @param {string|null} photoUrl - URL de la foto (o null para usar iniciales)
 */
export function avatarHTML(name, size = 38, photoUrl = null) {
  const initial = (name || '?').charAt(0).toUpperCase();
  if (photoUrl) {
    return `<div class="avatar" style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:url('${photoUrl}') center/cover;
      border:2px solid var(--card-2);
      flex-shrink:0;
    "></div>`;
  }
  const bg = avatarColor(name);
  const fontSize = Math.round(size * 0.42);
  return `<div class="avatar" style="
    width:${size}px;height:${size}px;
    border-radius:50%;
    background:${bg};
    display:flex;align-items:center;justify-content:center;
    color:white;font-weight:800;font-size:${fontSize}px;
    flex-shrink:0;font-family:inherit;
  ">${initial}</div>`;
}
