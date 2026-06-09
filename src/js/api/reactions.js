// ============================================================
// REACTIONS & COMMENTS — sobre predicciones de amigos (post-kickoff)
// ============================================================

import { supabase } from '../supabase.js';

export async function getReactionsForPredictions(predictionIds) {
  if (!predictionIds.length) return new Map();
  const { data } = await supabase
    .from('prediction_reactions')
    .select('prediction_id, emoji, user_id')
    .in('prediction_id', predictionIds);
  // Agrupar { predId → { emoji → count } }
  const map = new Map();
  for (const r of data || []) {
    if (!map.has(r.prediction_id)) map.set(r.prediction_id, {});
    const counts = map.get(r.prediction_id);
    counts[r.emoji] = (counts[r.emoji] || 0) + 1;
  }
  return map;
}

export async function toggleReaction(predictionId, emoji) {
  const { data: { user } } = await supabase.auth.getUser();
  // Si ya reaccioné con este emoji, lo quito (toggle)
  const { data: existing } = await supabase
    .from('prediction_reactions')
    .select('id')
    .eq('prediction_id', predictionId)
    .eq('user_id', user.id)
    .eq('emoji', emoji)
    .maybeSingle();

  if (existing) {
    await supabase.from('prediction_reactions').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('prediction_reactions').insert({
      prediction_id: predictionId,
      user_id: user.id,
      emoji
    });
    return true;
  }
}

export async function getCommentsForPredictions(predictionIds) {
  if (!predictionIds.length) return new Map();
  const { data } = await supabase
    .from('prediction_comments')
    .select('prediction_id, text, created_at, user:users(username, display_name, avatar_url)')
    .in('prediction_id', predictionIds)
    .order('created_at', { ascending: true });
  const map = new Map();
  for (const c of data || []) {
    if (!map.has(c.prediction_id)) map.set(c.prediction_id, []);
    map.get(c.prediction_id).push(c);
  }
  return map;
}

export async function addComment(predictionId, text) {
  const { data: { user } } = await supabase.auth.getUser();
  const trimmed = (text || '').trim().slice(0, 80);
  if (!trimmed) throw new Error('Comentario vacío');
  const { data, error } = await supabase
    .from('prediction_comments')
    .insert({ prediction_id: predictionId, user_id: user.id, text: trimmed })
    .select('*, user:users(username, display_name, avatar_url)')
    .single();
  if (error) throw error;
  return data;
}
