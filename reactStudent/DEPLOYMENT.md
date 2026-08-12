# Running the Student Registration System

This app is three pieces: a Spring Boot API (`backend/`) backed by MySQL, and a
React frontend (`student-registration-system/`) served by nginx that talks to
the API over `fetch`.

## Option A: Everything local via Docker Compose (current setup)

The simplest way to run the whole stack — no cloud accounts needed. From
`reactStudent/`:

```
docker compose up --build -d
```

This builds and starts three containers:
- `mysql` — MySQL 8.4, data persisted in the `mysql_data` Docker volume, only
  reachable from the other containers (not exposed to the host)
- `backend` — Spring Boot API, published at `http://localhost:8080`
- `frontend` — the React app built for production and served by nginx, published
  at `http://localhost:3000`

All ports are bound to `127.0.0.1` only, so nothing is reachable from outside
this machine (matches "local only, not public internet").

Useful commands:
- `docker compose ps` — see container status
- `docker compose logs -f backend` (or `mysql`/`frontend`) — tail logs
- `docker compose down` — stop everything (keeps the `mysql_data` volume, so
  data survives a restart)
- `docker compose down -v` — stop and wipe the database too (next `up` reseeds
  from scratch)
- `docker compose up --build -d` — rebuild after code changes and restart

Open http://localhost:3000 in a browser once containers report `Healthy`/`Up`.

Note: `student-registration-system/Dockerfile` uses `npm install` (not
`npm ci`) because the committed `package-lock.json` doesn't match exactly what
`npm ci` expects when built on Linux inside the container (a platform-specific
transitive dependency issue) — worth revisiting with `npm install` +
recommitting the lock file locally if this bothers you later, but it's not
blocking anything.

## Option B: Public internet deployment (Railway + Vercel)

This was attempted but paused because configuring Railway's per-service Root
Directory setting was proving finicky through the dashboard. The Dockerfile,
`railway.json`, and steps below are still valid if you want to pick this back
up later — just make sure the Root Directory field (Settings → Source, not
"Watch Paths") is actually set to `reactStudent/backend` before deploying.

### 1. Backend + MySQL on Railway

1. Go to https://railway.app and sign in with GitHub.
2. **New Project → Deploy from GitHub repo** → select `nevoatias1029/28-29-03`.
3. When asked for the root directory / service settings, set **Root Directory**
   to `reactStudent/backend`. Railway will detect the `Dockerfile` there
   (confirmed by `railway.json` in that folder) and build it.
4. In the same project, click **+ New → Database → Add MySQL**. Railway
   provisions a MySQL instance and exposes connection variables
   (`MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`).
5. Open the backend service → **Variables** tab and add:
   - `DB_URL` = `jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`
   - `DB_USERNAME` = `${{MySQL.MYSQLUSER}}`
   - `DB_PASSWORD` = `${{MySQL.MYSQLPASSWORD}}`
   - `CORS_ORIGINS` = the Vercel frontend URL from step 2 below (comma-separated
     if you need more than one, e.g. also `http://localhost:3000` for local dev)
   (Railway lets you reference another service's variables with the
   `${{ServiceName.VAR}}` syntax shown above — pick the exact names shown in
   your MySQL service's Variables tab if they differ.)
6. Deploy. Once it's live, open **Settings → Networking → Generate Domain** to
   get a public URL, e.g. `https://backend-production-xxxx.up.railway.app`.
   Confirm it works: `curl https://<that-url>/api/courses` should return the
   12-course JSON list (the `DataSeeder` runs automatically on first boot
   against the empty Railway MySQL database).

### 2. Frontend on Vercel

1. Go to https://vercel.com and sign in with GitHub.
2. **Add New → Project** → import `nevoatias1029/28-29-03`.
3. Set **Root Directory** to `reactStudent/student-registration-system`.
   Vercel auto-detects Create React App (build command `npm run build`,
   output `build`).
4. Under **Environment Variables**, add:
   - `REACT_APP_API_URL` = `https://<your-railway-backend-domain>/api`
5. Deploy. You'll get a URL like `https://your-project.vercel.app`.

### 3. Close the loop

Once both URLs exist:

1. Go back to Railway → backend service → Variables → set `CORS_ORIGINS` to
   include the real Vercel URL (not just `http://localhost:3000`).
2. In the repo, update:
   - `reactStudent/student-registration-system/.env.production` →
     `REACT_APP_API_URL=https://<your-railway-backend-domain>/api`
   - `reactStudent/student-registration-system/public/index.html` → add the
     Railway backend origin to the `connect-src` directive in the CSP
     `<meta>` tag, e.g. `connect-src 'self' http://localhost:8080
     https://<your-railway-backend-domain>;`
3. Commit and push — Vercel redeploys automatically on push to `main`.
4. Open the Vercel URL, confirm students/courses load and enroll/unenroll/add/
   delete all work against the live backend.

