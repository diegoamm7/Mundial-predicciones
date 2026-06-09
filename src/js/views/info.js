// VIEW: Info / Cómo funciona — reglas, puntos, instrucciones
export default function info() {
  return `
    <div class="topbar">
      <button class="icon-btn" onclick="history.back()">←</button>
      <div class="text-center" style="flex: 1;">
        <h1 style="font-size: 18px;">ℹ️ Cómo funciona</h1>
        <div class="sub">Reglas y sistema de puntos</div>
      </div>
      <div style="width: 38px;"></div>
    </div>

    <div class="section-title">⚽ Predicciones por partido</div>
    <div class="card">
      <p style="font-size: 13px; line-height: 1.6; color: var(--text-dim); margin-bottom: 12px;">
        Antes de cada partido elegís el marcador (ej. 2-1) usando los <b>+ y −</b> o tocando los chips de marcadores rápidos. Tu predicción se puede editar hasta <b>15 minutos antes del kick-off</b>.
      </p>
      <div style="font-size: 11px; color: var(--text-mut); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 8px;">Sistema de puntos</div>
      ${pointRow('3 pts', 'Marcador exacto', 'Predijiste 2-1 y salió 2-1', 'var(--accent)')}
      ${pointRow('2 pts', 'Ganador + diferencia de goles', 'Predijiste 3-2, salió 2-1 (ambos ganan locales por 1)', 'var(--accent)')}
      ${pointRow('1 pt', 'Solo acertaste quién gana', 'Predijiste 2-0, salió 3-1 (acertaste al ganador, no la diferencia)', 'var(--accent)')}
      ${pointRow('0 pts', 'Erraste el resultado', 'Predijiste local pero ganó visitante (o viceversa)', 'var(--red)')}
    </div>

    <div class="section-title">🌍 Predicciones del torneo</div>
    <div class="card">
      <p style="font-size: 13px; line-height: 1.6; color: var(--text-dim); margin-bottom: 12px;">
        Antes del partido inaugural elegís de una vez tus pronósticos globales: <b>quién gana</b>, <b>quién pierde la final</b>, <b>quién es el goleador</b> y <b>quién hace más asistencias</b>. Estos se cierran al kick-off del primer partido y no se pueden cambiar.
      </p>
      ${pointRow('15 pts', '🏆 Campeón del Mundial', 'La predicción más valiosa', 'var(--gold)')}
      ${pointRow('10 pts', '⚽ Goleador (Bota de Oro)', 'El que más goles hizo en el torneo', 'var(--gold)')}
      ${pointRow('8 pts', '🥈 Subcampeón', 'El equipo que pierde la final', 'var(--gold)')}
      ${pointRow('8 pts', '🎯 Más asistencias', 'El asistidor más prolífico', 'var(--gold)')}
      ${pointRow('5 pts', '🥉 Tercer puesto', 'Predicción opcional', 'var(--gold)')}
      <div style="margin-top: 10px; padding: 10px; background: linear-gradient(135deg, rgba(251,191,36,0.10), rgba(220,38,38,0.06)); border-radius: 10px; font-size: 12px; text-align: center;">
        💰 <b style="color: var(--gold);">+46 puntos máximos</b> si acertás todo
      </div>
    </div>

    <div class="section-title">🔒 Anti-trampa</div>
    <div class="card">
      <p style="font-size: 13px; line-height: 1.6; color: var(--text-dim);">
        Hasta que arranque el partido <b>nadie ve qué predijeron los demás</b>. Solo ves <b>quién ya predijo</b> y quién falta. Apenas suena el silbato inicial, se revelan todas las predicciones de tu grupo y pueden empezar las reacciones y comentarios. Esto evita que la gente copie.
      </p>
    </div>

    <div class="section-title">👥 Grupos privados</div>
    <div class="card">
      <p style="font-size: 13px; line-height: 1.6; color: var(--text-dim); margin-bottom: 10px;">
        Podés crear cuantos grupos quieras (la familia, los amigos, la oficina). Cada grupo tiene un <b>código de 6 caracteres</b> que compartís por WhatsApp para que se sumen. Cada grupo lleva su propio ranking.
      </p>
      <ul style="font-size: 13px; color: var(--text-dim); padding-left: 20px; line-height: 1.8;">
        <li>El que crea el grupo es el <b>líder</b> y puede invitar por usuario</li>
        <li>Cualquiera puede entrar con el código</li>
        <li>Salís cuando quieras (perdés tu posición en ese grupo)</li>
      </ul>
    </div>

    <div class="section-title">💬 Reacciones y comentarios</div>
    <div class="card">
      <p style="font-size: 13px; line-height: 1.6; color: var(--text-dim); margin-bottom: 10px;">
        Cuando arranca el partido y se revelan las predicciones, podés:
      </p>
      <ul style="font-size: 13px; color: var(--text-dim); padding-left: 20px; line-height: 1.8;">
        <li>Reaccionar con emojis (🔥 🎯 👀 😂 🤔 💀 🤡 😱)</li>
        <li>Dejar comentarios cortos (max 80 caracteres)</li>
        <li>Ver al instante quién acertó y quién erró feo</li>
      </ul>
    </div>

    <div class="section-title">🏅 Logros</div>
    <div class="card">
      <p style="font-size: 13px; line-height: 1.6; color: var(--text-dim);">
        Se desbloquean automáticamente al cumplir requisitos: 5 marcadores exactos, racha de 4 aciertos seguidos, llegar al #1 de un grupo, acertar el campeón, acertar el goleador, 10 marcadores exactos.
      </p>
    </div>

    <div class="section-title">🎨 Tema visual</div>
    <div class="card">
      <p style="font-size: 13px; line-height: 1.6; color: var(--text-dim);">
        Podés alternar entre <b>☀️ claro</b> (default), <b>❄️ hielo</b> (gris con los colores del Mundial resaltando) y <b>🌙 oscuro</b>. Lo cambiás desde el Home (arriba a la derecha) o desde tu Perfil → Preferencias. Queda guardado entre sesiones.
      </p>
    </div>

    <div class="section-title">📅 Calendario y bracket</div>
    <div class="card">
      <p style="font-size: 13px; line-height: 1.6; color: var(--text-dim);">
        En la pestaña 🏆 Mundial encontrás los <b>12 grupos del torneo</b> con tabla de posiciones, el <b>bracket eliminatorio</b> (que se va completando solo después de la fase de grupos) y el <b>calendario completo</b> de partidos.
      </p>
    </div>

    <div class="section-title">🔔 Recordatorios</div>
    <div class="card">
      <p style="font-size: 13px; line-height: 1.6; color: var(--text-dim);">
        Si instalás la app y permitís notificaciones, te llega un push <b>30 minutos antes</b> de cada partido para que no te lo pierdas.
      </p>
      <p style="font-size: 11px; color: var(--text-mut); margin-top: 8px;">
        En iOS las notificaciones requieren que primero hayas agregado la app a tu pantalla de inicio (Compartir → "Agregar a inicio").
      </p>
    </div>

    <div class="section-title">📲 ¿Cómo se instala?</div>
    <div class="card">
      <p style="font-size: 13px; line-height: 1.6; color: var(--text-dim); margin-bottom: 8px;">
        <b>Android (Chrome):</b> menú ⋮ → "Agregar a pantalla de inicio"
      </p>
      <p style="font-size: 13px; line-height: 1.6; color: var(--text-dim);">
        <b>iPhone (Safari):</b> botón compartir 􀈂 → "Agregar a inicio"
      </p>
      <p style="font-size: 12px; color: var(--text-mut); margin-top: 8px;">
        Queda como ícono en tu home igual que cualquier app. No ocupa lugar como una nativa.
      </p>
    </div>

    <div style="margin: 18px 16px;">
      <button class="btn" onclick="navigate('home')">¡Vamos a jugar!</button>
    </div>

    <div style="height: 20px;"></div>
  `;
}

function pointRow(pts, title, example, color) {
  return `
    <div style="display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border);">
      <span style="background: ${color}; color: white; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 6px; flex-shrink: 0; min-width: 50px; text-align: center;">${pts}</span>
      <div style="flex: 1;">
        <div style="font-size: 13px; font-weight: 600;">${title}</div>
        <div style="font-size: 11px; color: var(--text-mut); margin-top: 2px;">${example}</div>
      </div>
    </div>
  `;
}
