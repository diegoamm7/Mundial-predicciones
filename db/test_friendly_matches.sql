-- ============================================================================
-- 🧪 MODO PRUEBA — Amistosos pre-Mundial para validar el sistema
-- ============================================================================
-- Estos partidos son ficticios (o simulan amistosos pre-Mundial).
-- Las fechas son relativas a NOW() así siempre quedan "próximos".
--
-- Cómo usar:
-- 1. Pegá este script entero en el SQL Editor de Supabase y ejecutá
-- 2. Refrescá la app → vas a ver los partidos en "Próximos"
-- 3. Predecí algunos con tu cuenta
-- 4. Cuando quieras "jugar el partido", abrí test_load_results.sql
--    y cargá resultados para ver cómo se distribuyen los puntos
-- ============================================================================

-- Limpiar amistosos anteriores (opcional — si querés empezar de cero)
DELETE FROM public.matches WHERE stage LIKE 'Amistoso%';

INSERT INTO public.matches (home_code, home_name, home_flag, away_code, away_name, away_flag, stage, starts_at) VALUES
  -- Partido que arranca en 30 min (para probar el countdown T-15)
  ('ARG','Argentina','🇦🇷','HND','Honduras','🇭🇳','Amistoso pre-Mundial', NOW() + INTERVAL '30 minutes'),

  -- Partidos en las próximas horas (para predecir con tiempo)
  ('BRA','Brasil','🇧🇷','MEX','México','🇲🇽','Amistoso pre-Mundial', NOW() + INTERVAL '2 hours'),
  ('FRA','Francia','🇫🇷','NED','Países Bajos','🇳🇱','Amistoso pre-Mundial', NOW() + INTERVAL '4 hours'),
  ('ESP','España','🇪🇸','POR','Portugal','🇵🇹','Amistoso pre-Mundial', NOW() + INTERVAL '6 hours'),

  -- Partidos mañana (para que vos y tus amigos predigan tranquilos)
  ('ENG','Inglaterra','🏴󠁧󠁢󠁥󠁮󠁧󠁿','GER','Alemania','🇩🇪','Amistoso pre-Mundial', NOW() + INTERVAL '1 day'),
  ('URU','Uruguay','🇺🇾','COL','Colombia','🇨🇴','Amistoso pre-Mundial', NOW() + INTERVAL '1 day' + INTERVAL '3 hours'),
  ('ITA','Italia','🇮🇹','BEL','Bélgica','🇧🇪','Amistoso pre-Mundial', NOW() + INTERVAL '1 day' + INTERVAL '6 hours'),

  -- Pasado mañana
  ('JPN','Japón','🇯🇵','KOR','Corea del Sur','🇰🇷','Amistoso pre-Mundial', NOW() + INTERVAL '2 days'),
  ('CRO','Croacia','🇭🇷','NOR','Noruega','🇳🇴','Amistoso pre-Mundial', NOW() + INTERVAL '2 days' + INTERVAL '4 hours'),
  ('CAN','Canadá','🇨🇦','USA','Estados Unidos','🇺🇸','Amistoso pre-Mundial', NOW() + INTERVAL '2 days' + INTERVAL '8 hours');

SELECT id, home_code, away_code, stage, starts_at,
       (starts_at - NOW()) AS tiempo_restante
FROM public.matches
WHERE stage = 'Amistoso pre-Mundial'
ORDER BY starts_at;
