-- ============================================================================
-- SEED DATA — equipos, jugadores estrella y algunos partidos de muestra
-- Correr DESPUÉS de schema.sql
-- ============================================================================

-- ============================================================================
-- TEAMS
-- ============================================================================
INSERT INTO public.teams (code, name, flag, confed, odds_to_win) VALUES
  ('ARG','Argentina','🇦🇷','CONMEBOL',5.0),
  ('BRA','Brasil','🇧🇷','CONMEBOL',5.5),
  ('FRA','Francia','🇫🇷','UEFA',6.0),
  ('ESP','España','🇪🇸','UEFA',7.0),
  ('ENG','Inglaterra','🏴󠁧󠁢󠁥󠁮󠁧󠁿','UEFA',7.5),
  ('GER','Alemania','🇩🇪','UEFA',10.0),
  ('POR','Portugal','🇵🇹','UEFA',12.0),
  ('NED','Países Bajos','🇳🇱','UEFA',15.0),
  ('ITA','Italia','🇮🇹','UEFA',18.0),
  ('URU','Uruguay','🇺🇾','CONMEBOL',25.0),
  ('BEL','Bélgica','🇧🇪','UEFA',25.0),
  ('CRO','Croacia','🇭🇷','UEFA',30.0),
  ('MEX','México','🇲🇽','CONCACAF',35.0),
  ('USA','Estados Unidos','🇺🇸','CONCACAF',40.0),
  ('CAN','Canadá','🇨🇦','CONCACAF',60.0),
  ('JPN','Japón','🇯🇵','AFC',45.0),
  ('KOR','Corea del Sur','🇰🇷','AFC',60.0),
  ('COL','Colombia','🇨🇴','CONMEBOL',20.0),
  ('NOR','Noruega','🇳🇴','UEFA',50.0)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- PLAYERS estrella (para el picker de goleador/asistencias)
-- ============================================================================
INSERT INTO public.players (name, team_code, flag, position, is_star) VALUES
  ('Lionel Messi','ARG','🇦🇷','DEL',TRUE),
  ('Kylian Mbappé','FRA','🇫🇷','DEL',TRUE),
  ('Erling Haaland','NOR','🇳🇴','DEL',TRUE),
  ('Vinicius Jr.','BRA','🇧🇷','DEL',TRUE),
  ('Jude Bellingham','ENG','🏴󠁧󠁢󠁥󠁮󠁧󠁿','MED',TRUE),
  ('Lamine Yamal','ESP','🇪🇸','DEL',TRUE),
  ('Harry Kane','ENG','🏴󠁧󠁢󠁥󠁮󠁧󠁿','DEL',TRUE),
  ('Florian Wirtz','GER','🇩🇪','MED',TRUE),
  ('Rodrygo','BRA','🇧🇷','DEL',TRUE),
  ('Pedri','ESP','🇪🇸','MED',TRUE),
  ('Bukayo Saka','ENG','🏴󠁧󠁢󠁥󠁮󠁧󠁿','DEL',TRUE),
  ('Julián Álvarez','ARG','🇦🇷','DEL',TRUE),
  ('Lautaro Martínez','ARG','🇦🇷','DEL',TRUE),
  ('Vitinha','POR','🇵🇹','MED',TRUE),
  ('Phil Foden','ENG','🏴󠁧󠁢󠁥󠁮󠁧󠁿','MED',TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- MATCHES — algunos de muestra (ajustá fechas reales del Mundial 2026)
-- ============================================================================
-- IMPORTANTE: estas fechas son ejemplo. Reemplazar con el fixture real cuando
-- FIFA lo publique (junio 2026).
INSERT INTO public.matches (home_code, home_name, home_flag, away_code, away_name, away_flag, stage, starts_at) VALUES
  ('MEX','México','🇲🇽','CAN','Canadá','🇨🇦','Grupo A', NOW() + INTERVAL '7 days'),
  ('ARG','Argentina','🇦🇷','MEX','México','🇲🇽','Grupo D', NOW() + INTERVAL '8 days' + INTERVAL '3 hours'),
  ('BRA','Brasil','🇧🇷','ESP','España','🇪🇸','Grupo C', NOW() + INTERVAL '9 days'),
  ('FRA','Francia','🇫🇷','ITA','Italia','🇮🇹','Grupo F', NOW() + INTERVAL '10 days'),
  ('ENG','Inglaterra','🏴󠁧󠁢󠁥󠁮󠁧󠁿','POR','Portugal','🇵🇹','Grupo G', NOW() + INTERVAL '11 days'),
  ('GER','Alemania','🇩🇪','JPN','Japón','🇯🇵','Grupo E', NOW() + INTERVAL '12 days'),
  ('NED','Países Bajos','🇳🇱','URU','Uruguay','🇺🇾','Grupo H', NOW() + INTERVAL '13 days'),
  ('COL','Colombia','🇨🇴','BRA','Brasil','🇧🇷','Grupo C', NOW() + INTERVAL '14 days'),
  ('USA','Estados Unidos','🇺🇸','CAN','Canadá','🇨🇦','Grupo A', NOW() + INTERVAL '15 days'),
  ('ARG','Argentina','🇦🇷','BRA','Brasil','🇧🇷','Cuartos', NOW() + INTERVAL '30 days');
