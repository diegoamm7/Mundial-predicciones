// ============================================================
// USERS API — queries a public.users
// ============================================================

import { supabase } from '../supabase.js';

export async function getMyProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getUserByUsername(username) {
  const { data } = await supabase
    .from('users')
    .select('id, username, display_name')
    .eq('username', username)
    .maybeSingle();
  return data;
}

export async function createUserProfile(profile) {
  const { error } = await supabase.from('users').insert(profile);
  if (error) throw error;
}

export async function updateMyProfile(patch) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('users')
    .update(patch)
    .eq('id', user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadAvatar(file) {
  const { data: { user } } = await supabase.auth.getUser();
  const ext = file.name.split('.').pop();
  const path = `${user.id}/avatar.${ext}`;
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, cacheControl: '3600' });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
  // Anti-cache: agregar timestamp
  const url = publicUrl + '?t=' + Date.now();
  await updateMyProfile({ avatar_url: url });
  return url;
}

export async function searchUsers(query) {
  const { data } = await supabase
    .from('users')
    .select('id, username, display_name, avatar_url, country_code')
    .ilike('username', `%${query.toLowerCase()}%`)
    .limit(10);
  return data || [];
}
