-- ============================================================================
-- 🏆 PREDICCIONES MUNDIAL — Schema Supabase completo
-- Pegar este archivo entero en el SQL Editor de Supabase y ejecutar.
-- ============================================================================

-- ============================================================================
-- USERS (perfil público)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE NOT NULL CHECK (length(username) >= 3 AND username ~ '^[a-z0-9_]+$'),
  display_name TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  timezone     TEXT NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
  avatar_url   TEXT,
  push_token   TEXT,
  total_pts    INT NOT NULL DEFAULT 0,
  exact_hits   INT NOT NULL DEFAULT 0,
  total_hits   INT NOT NULL DEFAULT 0,
  streak       INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_total_pts ON public.users(total_pts DESC);

-- ============================================================================
-- TEAMS (catálogo de selecciones)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.teams (
  code         CHAR(3) PRIMARY KEY,
  name         TEXT NOT NULL,
  flag         TEXT NOT NULL,
  confed       TEXT,
  group_letter CHAR(1),
  odds_to_win  DECIMAL(6,2),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PLAYERS (jugadores estrella para predicciones de goleador/asistencias)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.players (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT UNIQUE NOT NULL,
  team_code    CHAR(3) REFERENCES public.teams(code),
  flag         TEXT,
  position     TEXT,
  is_star      BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- MATCHES (fixture)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id            BIGSERIAL PRIMARY KEY,
  home_code     CHAR(3) NOT NULL,
  home_name     TEXT NOT NULL,
  home_flag     TEXT NOT NULL,
  away_code     CHAR(3) NOT NULL,
  away_name     TEXT NOT NULL,
  away_flag     TEXT NOT NULL,
  stage         TEXT NOT NULL,
  starts_at     TIMESTAMPTZ NOT NULL,
  result_home   INT,
  result_away   INT,
  status        TEXT NOT NULL DEFAULT 'scheduled'
                CHECK (status IN ('scheduled', 'closed', 'finished')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_matches_starts_at ON public.matches(starts_at);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);

-- ============================================================================
-- PREDICTIONS (predicciones por partido)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.predictions (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  match_id    BIGINT NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  pred_home   INT NOT NULL CHECK (pred_home >= 0 AND pred_home <= 15),
  pred_away   INT NOT NULL CHECK (pred_away >= 0 AND pred_away <= 15),
  points      INT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, match_id)
);
CREATE INDEX IF NOT EXISTS idx_predictions_match ON public.predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user ON public.predictions(user_id);

-- ============================================================================
-- TOURNAMENT_PREDICTIONS (campeón, sub, goleador, asistencias)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tournament_predictions (
  user_id          UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  champion_code    CHAR(3) REFERENCES public.teams(code),
  runner_up_code   CHAR(3) REFERENCES public.teams(code),
  third_place_code CHAR(3) REFERENCES public.teams(code),
  top_scorer       TEXT,
  top_assists      TEXT,
  points_earned    INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GROUPS (grupos privados de amigos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.groups (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  emoji       TEXT DEFAULT '⚽',
  invite_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text), 1, 6),
  is_private  BOOLEAN NOT NULL DEFAULT TRUE,
  owner_id    UUID NOT NULL REFERENCES public.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON public.groups(invite_code);

CREATE TABLE IF NOT EXISTS public.group_members (
  group_id  BIGINT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);

-- ============================================================================
-- REACTIONS y COMMENTS (sobre predicciones reveladas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.prediction_reactions (
  id            BIGSERIAL PRIMARY KEY,
  prediction_id BIGINT NOT NULL REFERENCES public.predictions(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  emoji         TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (prediction_id, user_id, emoji)
);
CREATE INDEX IF NOT EXISTS idx_reactions_prediction ON public.prediction_reactions(prediction_id);

CREATE TABLE IF NOT EXISTS public.prediction_comments (
  id            BIGSERIAL PRIMARY KEY,
  prediction_id BIGINT NOT NULL REFERENCES public.predictions(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  text          TEXT NOT NULL CHECK (length(text) <= 80),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comments_prediction ON public.prediction_comments(prediction_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  payload    JSONB,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);

-- ============================================================================
-- FUNCIÓN: calcular puntos (3 / 2 / 1 / 0)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calculate_prediction_points(
  pred_h INT, pred_a INT, real_h INT, real_a INT
) RETURNS INT AS $$
DECLARE
  pred_diff INT := pred_h - pred_a;
  real_diff INT := real_h - real_a;
  pred_winner TEXT;
  real_winner TEXT;
BEGIN
  IF pred_h = real_h AND pred_a = real_a THEN RETURN 3; END IF;
  pred_winner := CASE WHEN pred_diff > 0 THEN 'H' WHEN pred_diff < 0 THEN 'A' ELSE 'D' END;
  real_winner := CASE WHEN real_diff > 0 THEN 'H' WHEN real_diff < 0 THEN 'A' ELSE 'D' END;
  IF pred_winner <> real_winner THEN RETURN 0; END IF;
  IF pred_diff = real_diff THEN RETURN 2; END IF;
  RETURN 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- TRIGGER: cuando se carga el resultado, calcular puntos y actualizar totales
-- ============================================================================
CREATE OR REPLACE FUNCTION public.on_match_result_loaded()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.result_home IS NOT NULL AND NEW.result_away IS NOT NULL
     AND (OLD.result_home IS NULL OR OLD.result_away IS NULL) THEN

    UPDATE public.predictions p
       SET points = public.calculate_prediction_points(
                      p.pred_home, p.pred_away, NEW.result_home, NEW.result_away)
     WHERE p.match_id = NEW.id;

    UPDATE public.users u
       SET total_pts  = COALESCE((SELECT SUM(points) FROM public.predictions
                                  WHERE user_id = u.id AND points IS NOT NULL), 0),
           exact_hits = COALESCE((SELECT COUNT(*) FROM public.predictions
                                  WHERE user_id = u.id AND points = 3), 0),
           total_hits = COALESCE((SELECT COUNT(*) FROM public.predictions
                                  WHERE user_id = u.id AND points > 0), 0)
     WHERE u.id IN (SELECT user_id FROM public.predictions WHERE match_id = NEW.id);

    NEW.status := 'finished';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_match_result_loaded ON public.matches;
CREATE TRIGGER trg_match_result_loaded
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.on_match_result_loaded();

-- ============================================================================
-- TRIGGER: bloquear predicciones a menos de 15 min del partido
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_prediction_deadline()
RETURNS TRIGGER AS $$
DECLARE
  match_starts TIMESTAMPTZ;
BEGIN
  SELECT starts_at INTO match_starts FROM public.matches WHERE id = NEW.match_id;
  IF NOW() > match_starts - INTERVAL '15 minutes' THEN
    RAISE EXCEPTION 'No podés hacer predicciones a menos de 15 minutos del partido';
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_prediction_deadline ON public.predictions;
CREATE TRIGGER trg_check_prediction_deadline
  BEFORE INSERT OR UPDATE ON public.predictions
  FOR EACH ROW EXECUTE FUNCTION public.check_prediction_deadline();

-- ============================================================================
-- VISTA: ranking por grupo
-- ============================================================================
CREATE OR REPLACE VIEW public.group_rankings AS
SELECT gm.group_id, u.id AS user_id, u.username, u.display_name, u.avatar_url,
       u.total_pts, u.exact_hits, u.total_hits, u.streak
FROM public.group_members gm
JOIN public.users u ON u.id = gm.user_id;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.users                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_predictions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_reactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_comments     ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE POLICY "users read all" ON public.users FOR SELECT USING (TRUE);
CREATE POLICY "users insert own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users update own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- PREDICTIONS — propias siempre; las de otros solo si están en mi grupo Y el partido ya empezó
CREATE POLICY "predictions own all" ON public.predictions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "predictions read after kickoff" ON public.predictions FOR SELECT USING (
  user_id IN (
    SELECT gm2.user_id FROM public.group_members gm1
    JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid()
  )
  AND match_id IN (SELECT id FROM public.matches WHERE starts_at <= NOW())
);

-- TOURNAMENT_PREDICTIONS
CREATE POLICY "tp own all" ON public.tournament_predictions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "tp read groupmates" ON public.tournament_predictions FOR SELECT USING (
  user_id IN (
    SELECT gm2.user_id FROM public.group_members gm1
    JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid()
  )
);

-- GROUPS
CREATE POLICY "groups read if member" ON public.groups FOR SELECT USING (
  id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
);
CREATE POLICY "groups insert own" ON public.groups FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "groups update owner" ON public.groups FOR UPDATE USING (auth.uid() = owner_id);

-- GROUP_MEMBERS
CREATE POLICY "members read if in group" ON public.group_members FOR SELECT USING (
  group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
);
CREATE POLICY "members can join" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "members can leave" ON public.group_members FOR DELETE USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE POLICY "notif own" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- REACTIONS y COMMENTS — solo sobre predicciones que ya puedo ver
CREATE POLICY "reactions all" ON public.prediction_reactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "reactions read" ON public.prediction_reactions FOR SELECT USING (TRUE);

CREATE POLICY "comments insert own" ON public.prediction_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments read" ON public.prediction_comments FOR SELECT USING (TRUE);
CREATE POLICY "comments delete own" ON public.prediction_comments FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STORAGE BUCKET para avatares
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', TRUE)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "avatars upload own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars update own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars read public" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');
