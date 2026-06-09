// ============================================================
// MATCHES API
// ============================================================

import { supabase } from '../supabase.js';

/** Próximos partidos (status = scheduled, ordenados por kickoff) */
export async function getUpcomingMatches(limit = 20) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'scheduled')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

/** Partidos pasados (con resultado) */
export async function getPastMatches(limit = 20) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'finished')
    .order('starts_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

/** Partidos del día */
export async function getTodayMatches() {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date();   end.setHours(23, 59, 59, 999);
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .gte('starts_at', start.toISOString())
    .lte('starts_at', end.toISOString())
    .order('starts_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getMatch(id) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/** Todos los partidos del Mundial (para calendario) */
export async function getAllMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('starts_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

/** Próximo partido sin predicción del usuario actual */
export async function getNextOpenMatch() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  // Trae próximos partidos y filtra los que no tengo predicción
  const upcoming = await getUpcomingMatches(10);
  if (!upcoming.length) return null;
  const { data: myPreds } = await supabase
    .from('predictions')
    .select('match_id')
    .eq('user_id', user.id);
  const predicted = new Set((myPreds || []).map(p => p.match_id));
  return upcoming.find(m => !predicted.has(m.id)) || upcoming[0];
}
