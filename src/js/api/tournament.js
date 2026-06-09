// ============================================================
// TOURNAMENT API — predicciones globales (campeón, goleador, etc.)
// ============================================================

import { supabase } from '../supabase.js';

export async function getMyTournamentPicks() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('tournament_predictions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  return data || {
    user_id: user.id,
    champion_code: null,
    runner_up_code: null,
    third_place_code: null,
    top_scorer: null,
    top_assists: null
  };
}

export async function saveTournamentPicks(picks) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('tournament_predictions')
    .upsert({ ...picks, user_id: user.id, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Top equipos según ranking del torneo (para el picker) */
export async function getTopTeams() {
  // Si tenés una tabla `teams`, traerla. Si no, hardcoded los favoritos.
  const { data } = await supabase
    .from('teams')
    .select('*')
    .order('odds_to_win', { ascending: true })
    .limit(20);
  return data || FAVORITES_FALLBACK;
}

/** Lista de jugadores estrella para el picker de goleador/asistencias */
export async function getStarPlayers() {
  const { data } = await supabase
    .from('players')
    .select('*')
    .eq('is_star', true)
    .order('name', { ascending: true });
  return data || STAR_PLAYERS_FALLBACK;
}

// Fallbacks si la DB todavía no está seedada
const FAVORITES_FALLBACK = [
  { code: 'ARG', flag: '🇦🇷', name: 'Argentina', odds_to_win: 5.0 },
  { code: 'BRA', flag: '🇧🇷', name: 'Brasil', odds_to_win: 5.5 },
  { code: 'FRA', flag: '🇫🇷', name: 'Francia', odds_to_win: 6.0 },
  { code: 'ESP', flag: '🇪🇸', name: 'España', odds_to_win: 7.0 },
  { code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'Inglaterra', odds_to_win: 7.5 },
  { code: 'GER', flag: '🇩🇪', name: 'Alemania', odds_to_win: 10.0 },
  { code: 'POR', flag: '🇵🇹', name: 'Portugal', odds_to_win: 12.0 },
  { code: 'NED', flag: '🇳🇱', name: 'Países Bajos', odds_to_win: 15.0 },
  { code: 'ITA', flag: '🇮🇹', name: 'Italia', odds_to_win: 18.0 },
  { code: 'URU', flag: '🇺🇾', name: 'Uruguay', odds_to_win: 25.0 },
  { code: 'BEL', flag: '🇧🇪', name: 'Bélgica', odds_to_win: 25.0 },
  { code: 'CRO', flag: '🇭🇷', name: 'Croacia', odds_to_win: 30.0 }
];

const STAR_PLAYERS_FALLBACK = [
  { name: 'Lionel Messi', team_code: 'ARG', flag: '🇦🇷', position: 'DEL' },
  { name: 'Kylian Mbappé', team_code: 'FRA', flag: '🇫🇷', position: 'DEL' },
  { name: 'Erling Haaland', team_code: 'NOR', flag: '🇳🇴', position: 'DEL' },
  { name: 'Vinicius Jr.', team_code: 'BRA', flag: '🇧🇷', position: 'DEL' },
  { name: 'Jude Bellingham', team_code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', position: 'MED' },
  { name: 'Lamine Yamal', team_code: 'ESP', flag: '🇪🇸', position: 'DEL' },
  { name: 'Harry Kane', team_code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', position: 'DEL' },
  { name: 'Florian Wirtz', team_code: 'GER', flag: '🇩🇪', position: 'MED' },
  { name: 'Rodrygo', team_code: 'BRA', flag: '🇧🇷', position: 'DEL' },
  { name: 'Pedri', team_code: 'ESP', flag: '🇪🇸', position: 'MED' },
  { name: 'Bukayo Saka', team_code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', position: 'DEL' },
  { name: 'Julian Alvarez', team_code: 'ARG', flag: '🇦🇷', position: 'DEL' }
];
