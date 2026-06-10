// ============================================================
// GROUPS API — grupos privados de amigos
// ============================================================

import { supabase } from '../supabase.js';

export async function getMyGroups() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  // Query simple: primero traemos los group_ids del usuario, después los grupos
  // (evita joins complejos con FK names que podían colgarse).
  const { data: memberships, error: err1 } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id);
  if (err1) throw err1;
  if (!memberships || memberships.length === 0) return [];
  const groupIds = memberships.map(m => m.group_id);
  const { data: groups, error: err2 } = await supabase
    .from('groups')
    .select('*')
    .in('id', groupIds);
  if (err2) throw err2;
  return groups || [];
}

export async function getGroupRanking(groupId) {
  const { data, error } = await supabase
    .from('group_rankings')
    .select('*')
    .eq('group_id', groupId)
    .order('total_pts', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createGroup({ name, emoji = '⚽', isPrivate = true }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: group, error } = await supabase
    .from('groups')
    .insert({ name, emoji, is_private: isPrivate, owner_id: user.id })
    .select()
    .single();
  if (error) throw error;
  // Auto-join al creador
  await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id });
  return group;
}

export async function joinGroupByCode(inviteCode) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: group } = await supabase
    .from('groups')
    .select('id, name')
    .eq('invite_code', inviteCode.toLowerCase().trim())
    .maybeSingle();
  if (!group) throw new Error('Código de invitación inválido');
  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: group.id, user_id: user.id });
  if (error && !error.message.includes('duplicate')) throw error;
  return group;
}

export async function inviteUserToGroup(groupId, username) {
  const { data: target } = await supabase
    .from('users')
    .select('id')
    .eq('username', username.toLowerCase())
    .maybeSingle();
  if (!target) throw new Error('Usuario no encontrado');
  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: target.id });
  if (error && !error.message.includes('duplicate')) throw error;
  return true;
}

export async function leaveGroup(groupId) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', user.id);
  if (error) throw error;
}
