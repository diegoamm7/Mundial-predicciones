// ============================================================
// SUPABASE CLIENT — singleton del cliente Supabase para toda la app
// ============================================================
// Para configurarlo:
// 1. Crear proyecto en https://supabase.com
// 2. Settings → API → copiar URL y anon key
// 3. Editar las constantes de abajo (la anon key es pública por diseño,
//    la seguridad real la hace RLS en la DB).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI';

if (SUPABASE_URL.includes('TU-PROYECTO')) {
  console.warn('⚠️ Configurá tu Supabase en src/js/supabase.js antes de seguir');
}

// Storage de sesión: usamos sessionStorage en vez de localStorage para que
// la sesión muera cuando se cierra el navegador (al reabrir pide login).
// Esto evita estados raros con cache viejo persistido.
const sessionStorageAdapter = {
  getItem: (key) => sessionStorage.getItem(key),
  setItem: (key, value) => sessionStorage.setItem(key, value),
  removeItem: (key) => sessionStorage.removeItem(key)
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,           // dentro de la sesión del navegador, sí
    storage: sessionStorageAdapter, // pero se borra al cerrar el navegador
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

export const SUPABASE_CONFIG = { url: SUPABASE_URL, key: SUPABASE_ANON_KEY };
