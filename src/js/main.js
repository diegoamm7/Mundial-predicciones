// ============================================================
// MAIN — entry point. Bootea la app.
// ============================================================

import * as router from './router.js';
import { refreshSession } from './auth.js';
import { state, subscribe } from './state.js';
import { initTheme } from './utils/theme.js';

// Registrar todas las views
import splash from './views/splash.js';
import login from './views/login.js';
import register from './views/register.js';
import home from './views/home.js';
import matches from './views/matches.js';
import predict from './views/predict.js';
import worldCup from './views/world-cup.js';
import groups from './views/groups.js';
import groupDetail from './views/group-detail.js';
import createGroup from './views/create-group.js';
import profile from './views/profile.js';
import tournamentPredictions from './views/tournament-predictions.js';
import friendsPicks from './views/friends-picks.js';
import notifications from './views/notifications.js';
import matchDetail from './views/match-detail.js';
import info from './views/info.js';

router.register('splash', splash);
router.register('login', login);
router.register('register', register);
router.register('home', home);
router.register('matches', matches);
router.register('predict', predict);
router.register('world-cup', worldCup);
router.register('groups', groups);
router.register('group-detail', groupDetail);
router.register('create-group', createGroup);
router.register('profile', profile);
router.register('tournament-predictions', tournamentPredictions);
router.register('friends-picks', friendsPicks);
router.register('notifications', notifications);
router.register('match-detail', matchDetail);
router.register('info', info);

async function boot() {
  initTheme();
  router.init();

  // Reaccionar a cambios de auth: si hay sesión mostrar bottom-nav y home; si no, splash
  subscribe((s) => {
    const isAuthed = !!s.session;
    router.showBottomNav(isAuthed);
  });

  const session = await refreshSession();

  if (session && state.user) {
    router.render('home');
  } else {
    router.render('splash');
  }
}

boot();
