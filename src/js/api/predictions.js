// ============================================================
// PREDICTIONS API
// ============================================================

import { supabase } from '../supabase.js';

/** Mi predicción para un partido */
export async function getMyPrediction(matchId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)
    .eq('match_id', matchId)
    .maybeSingle();
  return data;
}

/** Crear o actualizar predicción */
export async function upsertPrediction({ matchId, predHome, predAway }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('predictions')
    .upsert(
      { user_id: user.id, match_id: matchId, pred_home: predHome, pred_away: predAway, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,match_id' }
    )
    .select()
    .single();
  if (error) {
    // Trigger del DB rechaza si pasó el T-15
    if (error.message.includes('15 minutos')) {
      throw new Error('Ya pasó el plazo (15 min antes del partido)');
    }
    throw error;
  }
  return data;
}

/** Mis predicciones de un set de partidos (para resaltar en la lista) */
export async function getMyPredictionsForMatches(matchIds) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !matchIds.length) return new Map();
  const { data } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)
    .in('match_id', matchIds);
  const map = new Map();
  for (const p of data || []) map.set(p.match_id, p);
  return map;
}

/** Predicciones de amigos del mismo grupo para un partido (solo se ven si ya arrancó) */
export async function getFriendsPredictions(matchId) {
  // RLS en DB controla quién puede ver qué; el server además bloquea hasta kickoff
  // (en este MVP la lógica de bloqueo es client-side; el lock real va en una RPC).
  const { data, error } = await supabase
    .from('predictions')
    .select('*, user:users(id, username, display_name, avatar_url)')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}
