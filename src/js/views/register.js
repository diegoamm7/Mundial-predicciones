// VIEW: Register
import { register } from '../auth.js';
import { render } from '../router.js';
import { toast } from '../utils/dom.js';

const COUNTRIES = [
  { code: 'AR', flag: '🇦🇷', name: 'Argentina', tz: 'America/Argentina/Buenos_Aires' },
  { code: 'MX', flag: '🇲🇽', name: 'México', tz: 'America/Mexico_City' },
  { code: 'CO', flag: '🇨🇴', name: 'Colombia', tz: 'America/Bogota' },
  { code: 'BR', flag: '🇧🇷', name: 'Brasil', tz: 'America/Sao_Paulo' },
  { code: 'CL', flag: '🇨🇱', name: 'Chile', tz: 'America/Santiago' },
  { code: 'UY', flag: '🇺🇾', name: 'Uruguay', tz: 'America/Montevideo' },
  { code: 'PE', flag: '🇵🇪', name: 'Perú', tz: 'America/Lima' },
  { code: 'ES', flag: '🇪🇸', name: 'España', tz: 'Europe/Madrid' },
  { code: 'US', flag: '🇺🇸', name: 'Estados Unidos', tz: 'America/New_York' }
];

export default function registerView() {
  setTimeout(bindForm, 0);
  return `
    <div class="topbar">
      <div><h1>Crear cuenta</h1><div class="sub">30 segundos, sin email</div></div>
    </div>
    <form id="regForm">
      <div class="input-group">
        <label>Tu nombre (lo ven tus amigos)</label>
        <input class="input" name="displayName" placeholder="Diego" required />
      </div>
      <div class="input-group">
        <label>Usuario (único, sin espacios)</label>
        <input class="input" name="username" placeholder="diegom" autocomplete="username" required />
      </div>
      <div class="input-group">
        <label>PIN de 4 dígitos</label>
        <input class="input" name="pin" type="password" inputmode="numeric" maxlength="4" pattern="\\d{4}" required />
      </div>
      <div class="input-group">
        <label>País 🌎</label>
        <select class="input" name="countryCode">
          ${COUNTRIES.map(c => `<option value="${c.code}|${c.tz}">${c.flag} ${c.name}</option>`).join('')}
        </select>
        <div style="font-size: 11px; color: var(--text-mut); margin-top: 6px;">
          Para mostrarte los horarios de partidos en tu hora local
        </div>
      </div>
      <div style="margin: 4px 16px 0;">
        <button class="btn" type="submit" id="regBtn">Crear cuenta</button>
        <div style="text-align: center; margin-top: 14px;">
          <span style="color: var(--text-dim); font-size: 13px;">¿Ya tenés cuenta? </span>
          <a onclick="navigate('login')" style="font-weight: 600; font-size: 13px;">Iniciar sesión</a>
        </div>
      </div>
    </form>
  `;
}

function bindForm() {
  const form = document.getElementById('regForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const [countryCode, timezone] = (fd.get('countryCode') || 'AR|America/Argentina/Buenos_Aires').split('|');
    const btn = document.getElementById('regBtn');
    btn.disabled = true;
    btn.textContent = 'Creando...';
    try {
      await register({
        username: fd.get('username'),
        pin: fd.get('pin'),
        displayName: fd.get('displayName'),
        countryCode,
        timezone
      });
      toast('¡Bienvenido al Mundial!', 'success');
      render('home');
    } catch (err) {
      toast(err.message || 'Error al crear cuenta', 'error');
      btn.disabled = false;
      btn.textContent = 'Crear cuenta';
    }
  });
}
