-- ============================================================================
-- 🎯 MODO PRUEBA — Cargar resultados ficticios para validar el cálculo de puntos
-- ============================================================================
-- Cuando carguen un resultado, el trigger `on_match_result_loaded` se dispara
-- y automáticamente:
--   1. Calcula los puntos de cada predicción (3 / 2 / 1 / 0)
--   2. Actualiza los totales de cada usuario (total_pts, exact_hits, total_hits)
--   3. Marca el partido como 'finished'
--
-- Cómo usar:
-- 1. Primero, hacé que vos (y un par de amigos si querés) predigan los amistosos
-- 2. Esperá a que cualquier predicción esté guardada (refrescá el Home)
-- 3. Volvé acá y cargá un resultado para uno de los partidos
-- 4. Mirá el ranking del grupo → los puntos aparecen al instante
-- ============================================================================

-- Ejemplo 1: cargar resultado ARG vs HND (2-0 ganó Argentina)
-- Reemplazá el WHERE con el id del partido que quieras cerrar.
UPDATE public.matches
   SET result_home = 2, result_away = 0
 WHERE home_code = 'ARG' AND away_code = 'HND'
   AND result_home IS NULL;

-- Ejemplo 2: BRA 1 - MEX 1 (empate)
UPDATE public.matches
   SET result_home = 1, result_away = 1
 WHERE home_code = 'BRA' AND away_code = 'MEX'
   AND result_home IS NULL;

-- Ejemplo 3: FRA 3 - NED 2
UPDATE public.matches
   SET result_home = 3, result_away = 2
 WHERE home_code = 'FRA' AND away_code = 'NED'
   AND result_home IS NULL;

-- ============================================================================
-- VER QUÉ PASÓ — queries útiles para verificar el cálculo
-- ============================================================================

-- 1. Predicciones del partido ARG-HND con sus puntos calculados
SELECT u.username, u.display_name,
       p.pred_home || '-' || p.pred_away AS prediccion,
       m.result_home || '-' || m.result_away AS resultado_real,
       p.points,
       CASE p.points
         WHEN 3 THEN '🎯 Exacto!'
         WHEN 2 THEN '👍 Casi (ganador + diferencia)'
         WHEN 1 THEN '✓ Solo ganador'
         WHEN 0 THEN '✗ Errado'
       END AS resultado
FROM public.predictions p
JOIN public.matches m ON m.id = p.match_id
JOIN public.users u    ON u.id = p.user_id
WHERE m.home_code = 'ARG' AND m.away_code = 'HND'
ORDER BY p.points DESC;

-- 2. Ranking global actualizado
SELECT username, display_name, total_pts, exact_hits, total_hits, streak
FROM public.users
ORDER BY total_pts DESC;

-- ============================================================================
-- 🔁 RESETEAR un partido (volver a "scheduled" sin resultado)
-- Útil si querés volver a probar después de cargar el resultado mal
-- ============================================================================
-- UPDATE public.matches
--    SET result_home = NULL, result_away = NULL, status = 'scheduled'
--  WHERE id = <ID_DEL_PARTIDO>;
--
-- IMPORTANTE: si reseteás un partido, los puntos calculados quedan en las
-- predicciones. Para limpiar todo:
-- UPDATE public.predictions SET points = NULL WHERE match_id = <ID>;
-- Y los totales del user:
-- UPDATE public.users u SET
--   total_pts  = COALESCE((SELECT SUM(points) FROM predictions WHERE user_id = u.id AND points IS NOT NULL), 0),
--   exact_hits = COALESCE((SELECT COUNT(*) FROM predictions WHERE user_id = u.id AND points = 3), 0),
--   total_hits = COALESCE((SELECT COUNT(*) FROM predictions WHERE user_id = u.id AND points > 0), 0);
