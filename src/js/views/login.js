// VIEW: Login
import { login } from '../auth.js';
import { render } from '../router.js';
import { toast } from '../utils/dom.js';

export default function loginView() {
  setTimeout(bindForm, 0);
  return `
    <div class="topbar">
      <div><h1>Ingresar</h1><div class="sub">Bienvenido de vuelta</div></div>
    </div>
    <form id="loginForm">
      <div class="input-group">
        <label>Usuario</label>
        <input class="input" name="username" placeholder="diegom" autocomplete="username" required />
      </div>
      <div class="input-group">
        <label>PIN (4 dígitos)</label>
        <input class="input" name="pin" type="password" inputmode="numeric" maxlength="4" pattern="\\d{4}" required />
      </div>
      <div style="margin: 14px 16px 0;">
        <button class="btn" type="submit" id="loginBtn">Entrar</button>
        <button class="btn btn-ghost" type="button" style="margin-top: 10px;" onclick="navigate('register')">
          Crear cuenta nueva
        </button>
      </div>
    </form>
  `;
}

function bindForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const btn = document.getElementById('loginBtn');
    btn.disabled = true;
    btn.textContent = 'Entrando...';
    try {
      await login({
        username: fd.get('username'),
        pin: fd.get('pin')
      });
      toast('¡Bienvenido!', 'success');
      render('home');
    } catch (err) {
      toast(err.message || 'Error al ingresar', 'error');
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });
}
