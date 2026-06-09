// VIEW: Splash — pantalla de bienvenida pre-login
export default function splash() {
  return `
    <div class="splash">
      <div class="splash-title">
        <div class="title-pre">PREDICCIONES</div>
        <div class="title-main">MUNDIAL</div>
        <div class="title-year">
          <span class="year-line"></span>
          <span class="year-text">2 0 2 6</span>
          <span class="year-line"></span>
        </div>
        <div class="title-stripes">
          <span style="background: var(--blue)"></span>
          <span style="background: var(--white)"></span>
          <span style="background: var(--accent)"></span>
          <span style="background: var(--red)"></span>
        </div>
      </div>
      <p class="splash-tag">El que más le pega, gana.<br/>Jugá con tus amigos en grupos privados.</p>
      <div style="width: 100%; max-width: 280px; display: flex; flex-direction: column; gap: 10px;">
        <button class="btn" onclick="navigate('login')">Iniciar sesión</button>
        <button class="btn btn-ghost" onclick="navigate('register')">Crear cuenta</button>
        <a onclick="navigate('info')" style="text-align: center; margin-top: 10px; font-size: 13px; color: var(--text-dim);">
          ℹ️ Cómo funciona
        </a>
      </div>
    </div>
  `;
}
