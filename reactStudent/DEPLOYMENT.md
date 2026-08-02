# Deploying the Student Registration System

This app is now two pieces: a Spring Boot API (`backend/`) backed by MySQL, and a
React frontend (`student-registration-system/`) that talks to it over `fetch`.
Both need to go online, and the browser-based signup/login steps below have to
be done by you — an AI agent can't complete OAuth flows in a browser.

## 1. Backend + MySQL on Railway

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

## 2. Frontend on Vercel

1. Go to https://vercel.com and sign in with GitHub.
2. **Add New → Project** → import `nevoatias1029/28-29-03`.
3. Set **Root Directory** to `reactStudent/student-registration-system`.
   Vercel auto-detects Create React App (build command `npm run build`,
   output `build`).
4. Under **Environment Variables**, add:
   - `REACT_APP_API_URL` = `https://<your-railway-backend-domain>/api`
5. Deploy. You'll get a URL like `https://your-project.vercel.app`.

## 3. Close the loop

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

## Local development (already set up on this machine)

- MySQL 8.4 runs as a plain background process (not a Windows service, since
  installing a service needs admin rights this session didn't have) on port
  `3307`, database `student_registration`, app user `app_user`. To restart it
  after a reboot:
  ```
  "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.4\my.ini" --standalone --console
  ```
- Backend: `cd reactStudent/backend && $env:DB_PASSWORD="<see below>"; ./mvnw spring-boot:run`
- Frontend: `cd reactStudent/student-registration-system && npm start`
- The local `app_user` MySQL password is not committed to git. It was
  generated once during setup — if you need it again, connect as root
  (password `RootLocal84!Dev`, also not committed) and reset it, or just
  recreate the user.
