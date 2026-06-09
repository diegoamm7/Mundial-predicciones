// ============================================================
// AUTH — registro, login, sesión
// ============================================================
// Usamos un "email sintético" derivado del username + PIN como password,
// porque Supabase Auth requiere email+password pero el usuario solo quiere
// usuario + PIN. El email es <username>@predicciones.app (no se usa para
// nada real, solo como identificador interno).

import { supabase } from './supabase.js';
import { setSession, setUser } from './state.js';
import { getUserByUsername, createUserProfile, getMyProfile } from './api/users.js';
import { toast } from './utils/dom.js';

const FAKE_DOMAIN = '@predicciones.app';

export function usernameToEmail(username) {
  return username.toLowerCase().replace(/[^a-z0-9_]/g, '') + FAKE_DOMAIN;
}

export async function register({ username, pin, displayName, countryCode, timezone }) {
  username = username.toLowerCase().trim();
  if (!/^[a-z0-9_]{3,20}$/.test(username)) throw new Error('Usuario inválido (3-20 chars, letras/números/_)');
  if (!/^\d{4}$/.test(pin)) throw new Error('PIN debe ser 4 dígitos');
  if (!displayName) throw new Error('Nombre requerido');

  // Verificar que el username esté libre
  const existing = await getUserByUsername(username);
  if (existing) throw new Error('Ese usuario ya está en uso');

  const email = usernameToEmail(username);
  // Padding del PIN para que cumpla con el mínimo de Supabase (6 chars)
  const password = 'pin_' + pin;

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  // Crear el perfil en public.users
  await createUserProfile({
    id: data.user.id,
    username,
    display_name: displayName,
    country_code: countryCode || 'AR',
    timezone: timezone || 'America/Argentina/Buenos_Aires'
  });

  // Reload de la sesión para que traiga el perfil
  await refreshSession();
  return data.user;
}

export async function login({ username, pin }) {
  username = username.toLowerCase().trim();
  if (!username || !pin) throw new Error('Completá usuario y PIN');

  const email = usernameToEmail(username);
  const password = 'pin_' + pin;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.includes('Invalid login')) throw new Error('Usuario o PIN incorrectos');
    throw error;
  }
  await refreshSession();
  return data.user;
}

export async function logout() {
  await supabase.auth.signOut();
  setUser(null);
  setSession(null);
}

export async function refreshSession() {
  const { data } = await supabase.auth.getSession();
  setSession(data.session);
  if (data.session) {
    const profile = await getMyProfile();
    setUser(profile);
  } else {
    setUser(null);
  }
  return data.session;
}

// Listener: cuando Supabase actualiza el token (autoRefresh) o el usuario hace logout en otro tab
supabase.auth.onAuthStateChange(async (event, session) => {
  setSession(session);
  if (session) {
    const profile = await getMyProfile().catch(() => null);
    setUser(profile);
  } else {
    setUser(null);
  }
});
