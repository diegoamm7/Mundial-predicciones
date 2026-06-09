// ============================================================
// SVG ASSETS — ilustraciones inline (trofeo + balón)
// Todas originales, libres de copyright.
// ============================================================

export function svgTrophy(size = 100) {
  return `
  <svg width="${size}" height="${size * 1.4}" viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g-gold-${size}" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stop-color="#FFE57F"/>
        <stop offset="35%" stop-color="#FFB300"/>
        <stop offset="70%" stop-color="#D69E2E"/>
        <stop offset="100%" stop-color="#8B6914"/>
      </linearGradient>
      <linearGradient id="g-dark-${size}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#D69E2E"/>
        <stop offset="100%" stop-color="#5A3D0A"/>
      </linearGradient>
      <radialGradient id="g-globe-${size}" cx="35%" cy="30%">
        <stop offset="0%" stop-color="#FFE57F"/>
        <stop offset="60%" stop-color="#FFB300"/>
        <stop offset="100%" stop-color="#8B6914"/>
      </radialGradient>
      <linearGradient id="g-mal-${size}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#047857"/>
        <stop offset="50%" stop-color="#10b981"/>
        <stop offset="100%" stop-color="#065f46"/>
      </linearGradient>
    </defs>
    <circle cx="50" cy="22" r="13" fill="url(#g-globe-${size})" stroke="#5A3D0A" stroke-width="0.8"/>
    <ellipse cx="50" cy="22" rx="6.5" ry="13" fill="none" stroke="#5A3D0A" stroke-width="0.7" opacity="0.7"/>
    <ellipse cx="50" cy="22" rx="13" ry="4.5" fill="none" stroke="#5A3D0A" stroke-width="0.6" opacity="0.5"/>
    <ellipse cx="45" cy="17" rx="3" ry="5.5" fill="white" opacity="0.55"/>
    <path d="M 44 35 L 56 35 L 54 40 L 46 40 Z" fill="url(#g-dark-${size})"/>
    <path d="M 42 40 C 36 44, 30 52, 30 64 C 30 78, 33 90, 40 100 L 60 100 C 67 90, 70 78, 70 64 C 70 52, 64 44, 58 40 Z" fill="url(#g-gold-${size})" stroke="#5A3D0A" stroke-width="0.8"/>
    <path d="M 50 42 Q 46 65 50 98 Q 54 65 50 42" fill="#8B6914" opacity="0.45"/>
    <path d="M 40 45 Q 35 65 40 92" stroke="white" stroke-width="2.5" fill="none" opacity="0.4"/>
    <ellipse cx="50" cy="101" rx="13" ry="2.5" fill="url(#g-dark-${size})"/>
    <rect x="32" y="103" width="36" height="3" fill="url(#g-mal-${size})"/>
    <rect x="32" y="107" width="36" height="5" fill="url(#g-mal-${size})"/>
    <rect x="30" y="113" width="40" height="12" fill="url(#g-dark-${size})" rx="1.5"/>
    <rect x="36" y="116" width="28" height="6" fill="#2A1E04" rx="1"/>
    <text x="50" y="120.4" text-anchor="middle" fill="#FFE57F" font-size="3.6" font-weight="bold" font-family="sans-serif">CHAMPIONS</text>
    <rect x="25" y="125" width="50" height="7" fill="#5A3D0A" rx="2"/>
  </svg>`;
}

export function svgBall(size = 60) {
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="b-${size}" cx="35%" cy="30%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="70%" stop-color="#f1f5f9"/>
        <stop offset="95%" stop-color="#cbd5e1"/>
        <stop offset="100%" stop-color="#64748b"/>
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill="url(#b-${size})" stroke="#0f172a" stroke-width="1.8"/>
    <polygon points="50,30 63.5,40 58.5,55.5 41.5,55.5 36.5,40" fill="#0f172a"/>
    <polygon points="50,7 36.5,16 36.5,29.5 50,30 63.5,29.5 63.5,16" fill="#0f172a"/>
    <polygon points="88,38 75,32 63.5,40 65,55 78,58 88,50" fill="#0f172a"/>
    <polygon points="12,38 25,32 36.5,40 35,55 22,58 12,50" fill="#0f172a"/>
    <polygon points="74,82 65,67 58.5,55.5 50,72 60,86 74,84" fill="#0f172a"/>
    <polygon points="26,82 35,67 41.5,55.5 50,72 40,86 26,84" fill="#0f172a"/>
    <ellipse cx="30" cy="28" rx="10" ry="4.5" fill="white" opacity="0.75" transform="rotate(-30 30 28)"/>
  </svg>`;
}
