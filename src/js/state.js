// ============================================================
// STATE — store global reactivo simple (pub/sub)
// ============================================================
// Pattern: estado plano + setters que disparan listeners.
// No usamos librería para mantener cero dependencias.

const listeners = new Set();

export const state = {
  user: null,                // perfil de public.users del usuario actual
  session: null,             // sesión de Supabase (token, etc.)
  ui: {
    currentView: 'splash',
    bottomNav: false         // mostrar/ocultar barra inferior
  }
};

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach(fn => fn(state));
}

export function setUser(user) {
  state.user = user;
  listeners.forEach(fn => fn(state));
}

export function setSession(session) {
  state.session = session;
  listeners.forEach(fn => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
