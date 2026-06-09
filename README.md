# Mundial-predicciones
para predecir los resultados del mundial.

[README.md](https://github.com/user-attachments/files/28772061/README.md)
# 🏆 Predicciones Mundial 2026

PWA de predicciones del Mundial 2026 con tus amigos. Vanilla JS + Supabase + Vercel. Cero dependencias, cero build step.

---

## ✨ Features incluidas en este MVP

- 🔐 **Auth** sin email — registro con usuario + PIN de 4 dígitos + país
- 🎯 **Predicciones por partido** con score picker (+/-) y predicciones rápidas
- 🔒 **Anti-trampa**: las predicciones de tus amigos están ocultas hasta que arranque el partido (validado en DB con RLS + trigger)
- 🌍 **Predicciones globales del torneo**: campeón (+15 pts), subcampeón (+8), tercer puesto (+5), goleador (+10), asistencias (+8) — hasta **+46 pts** de bonus
- 👥 **Grupos privados** con ranking + código de invitación de 6 caracteres + invitar por usuario
- 🏆 **Hub del Mundial**: tablas de grupos, bracket eliminatorio, calendario completo
- 📸 **Avatares con foto de perfil** (Supabase Storage) + fallback con iniciales coloridas
- 💬 **Reacciones (8 emojis) y comentarios cortos** sobre predicciones reveladas
- 🎨 **3 temas**: ☀️ claro · ❄️ hielo · 🌙 oscuro — sincronizado entre todas las pantallas
- 🔔 **Notificaciones push** (recordatorio T-30 min) — listo el service worker, falta el cron
- 🏅 **Badges/logros** desbloqueables en perfil
- 📱 **PWA real** — se instala en Android y iOS como app, funciona offline (assets)
- 🧮 **Sistema de puntos**: 3 (marcador exacto) / 2 (ganador + dif) / 1 (solo ganador) / 0 (errar)

---

## 📁 Estructura

```
mundial-predicciones/
├── index.html                  Shell de la SPA
├── manifest.json               Config PWA (íconos, theme color)
├── service-worker.js           Offline cache + push notifications
├── vercel.json                 Config del deploy + rewrites
├── package.json                Sin deps de runtime (vanilla)
├── .env.example                Plantilla de configuración
│
├── src/
│   ├── css/
│   │   ├── themes.css          Variables CSS por tema (light/ice/dark)
│   │   ├── base.css            Reset, tipografía, body
│   │   ├── components.css      Cards, buttons, inputs, pills, badges
│   │   └── layout.css          Topbar, bottom-nav, splash
│   │
│   └── js/
│       ├── main.js             Entry point — registra views y bootea
│       ├── router.js           SPA router minimalista + bottom-nav
│       ├── state.js            Store global (pub/sub)
│       ├── supabase.js         ⚠️ Configurá URL y anon key acá
│       ├── auth.js             Registro, login, sesión
│       │
│       ├── utils/
│       │   ├── avatar.js       Render de avatares (foto o iniciales)
│       │   ├── theme.js        Toggle de los 3 temas
│       │   ├── date.js         Format, countdowns, agrupado por día
│       │   ├── dom.js          toast(), esc() para XSS, $()
│       │   └── svg.js          Trofeo y balón inline (originales)
│       │
│       ├── api/                Capa de acceso a datos (una clase por tabla)
│       │   ├── users.js
│       │   ├── matches.js
│       │   ├── predictions.js
│       │   ├── groups.js
│       │   ├── tournament.js
│       │   └── reactions.js
│       │
│       └── views/              Una pantalla por archivo
│           ├── splash.js
│           ├── login.js
│           ├── register.js
│           ├── home.js
│           ├── matches.js
│           ├── predict.js
│           ├── world-cup.js
│           ├── groups.js
│           ├── group-detail.js
│           ├── create-group.js
│           ├── profile.js
│           ├── tournament-predictions.js
│           ├── friends-picks.js
│           ├── notifications.js
│           └── match-detail.js
│
└── db/
    ├── schema.sql              Tablas, triggers, RLS, vistas
    └── seed_data.sql           Equipos, jugadores y partidos de muestra
```

---

## 🚀 Setup paso a paso

### 1) Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → "New project"
2. Elegir nombre y password de la DB (anotalo)
3. Esperar 2 min a que termine de provisionar

### 2) Correr el schema

1. Sidebar → **SQL Editor** → "New query"
2. Pegar el contenido de `db/schema.sql` → Run
3. Repetir con `db/seed_data.sql` (carga equipos, jugadores y 10 partidos de prueba)

### 3) Habilitar la creación de usuarios sin verificación de email

1. Sidebar → **Authentication** → **Providers** → **Email**
2. Desactivar "Confirm email"
3. Guardar

### 4) Configurar las credenciales en el código

1. Sidebar → **Settings** → **API**
2. Copiar **Project URL** y **anon public key**
3. Editar `src/js/supabase.js` y reemplazar los placeholders:
   ```js
   const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOi...';
   ```

> ℹ️ La `anon key` es pública por diseño. La seguridad real la hace RLS en la DB.

### 5) Probar localmente

```bash
npx serve -p 3000 .
```

Abrir http://localhost:3000 y registrarte.

### 6) Deploy a Vercel

```bash
# Una vez:
npm i -g vercel

# Después cada vez que querés deployar:
vercel --prod
```

O conectarlo a GitHub: cada push a `main` deploya automáticamente.

### 7) (Opcional) Probarlo en el celular

- **Android**: abrí la URL de Vercel en Chrome → menú → "Agregar a pantalla de inicio"
- **iOS**: abrí en Safari → compartir → "Agregar a inicio"

Te queda como app nativa, full-screen, con su ícono.

---

## 🧪 Probar el flujo end-to-end

1. Registrarte con usuario `diegom` y PIN `1234`
2. Volver al **SQL Editor** y agregar un partido próximo:
   ```sql
   INSERT INTO matches (home_code, home_name, home_flag, away_code, away_name, away_flag, stage, starts_at)
   VALUES ('ARG','Argentina','🇦🇷','BRA','Brasil','🇧🇷','Grupo D', NOW() + INTERVAL '1 hour');
   ```
3. Refrescar la app → debería aparecer en "Próximos partidos"
4. Predecir 2-1 → guardar
5. Crear un grupo, copiar el código
6. (Opcional) Registrar otra cuenta en una pestaña incógnito y unirte con el código → ya tenés ranking

---

## 🔮 Próximos pasos (roadmap)

Estos están planificados pero no implementados todavía:

- **Edge Functions** para los recordatorios push (cron T-30 min antes del partido)
- **Carga de resultados** desde un panel admin o desde una API pública (api-football.com tiene un free tier)
- **Cálculo automático de puntos** del torneo (campeón/sub/etc) cuando termina la final
- **Standings de grupos del Mundial** calculados desde los resultados de partidos
- **Bracket dinámico** que se vaya completando con clasificados
- **Comodín** (1 vez por fase, duplica los puntos de una predicción)
- **Mini-torneos 1v1** dentro de los grupos

---

## 🐛 Troubleshooting

**"⚠️ Configurá tu Supabase..."** en consola → Editaste `src/js/supabase.js`? Tiene que tener tu URL y anon key reales.

**Error al registrar usuario** → Asegurate de haber desactivado "Confirm email" en Auth → Providers.

**No veo los partidos del seed** → Las fechas en `seed_data.sql` son relativas a NOW(). Si pasaron muchos días sin abrir la app, los partidos quedaron "en el pasado". Reseteá con:
```sql
UPDATE matches SET starts_at = starts_at + INTERVAL '60 days' WHERE result_home IS NULL;
```

**Las predicciones de amigos no se ven después del kickoff** → Verificá que el partido tenga `status != 'scheduled'` o que `starts_at <= NOW()`. La policy RLS exige cualquiera de esas condiciones.

---

## 📄 Licencia

Para uso privado. Todas las ilustraciones (trofeo, balón) son originales y libres de copyright.
