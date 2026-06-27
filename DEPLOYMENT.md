# FounderMind — Deployment Guide

This guide details the procedure for deploying FounderMind in production environments.

---

## 1. Production Environment Variables Checklist

Ensure these variables are correctly configured in your hosting dashboards:

### Backend (Render / Railway)
| Variable Name | Type | Example Value / Notes |
| :--- | :--- | :--- |
| `PORT` | Number | `5000` (or dynamic port assigned by host) |
| `JWT_SECRET` | String | A secure 32+ character random string |
| `SUPABASE_URL` | String | Production database URL from Supabase dashboard |
| `SUPABASE_SERVICE_KEY` | String | Service role key (permits bypassing RLS in API) |
| `OPENAI_API_KEY` | String | Production OpenAI API key |
| `OPENAI_MODEL` | String | `gpt-4o-mini` (fallback model default) |
| `HINDSIGHT_BASE_URL` | String | `https://api.hindsight.vectorize.io` |
| `HINDSIGHT_API_KEY` | String | Hindsight Cloud credentials |
| `FRONTEND_URL` | String | Your production frontend URL (e.g. `https://foundermind.vercel.app`) – used for CORS allowlist |

### Frontend (Vercel)
| Variable Name | Type | Example Value / Notes |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | String | `https://your-backend.railway.app/api` (backend URL) |

---

## 2. Step-by-Step Deployment Steps

### Database Setup (Supabase)
1. Register a Supabase organization and create a new project.
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open the file [init_schema.sql](file:///C:/Users/user/.gemini/antigravity-ide/scratch/foundermind/backend/init_schema.sql).
4. Copy the SQL commands, paste them into the Supabase editor, and click **Run**.
5. Verify that the tables (`users`, `conversations`, `messages`, `tasks`, and `ai_analytics`) have been created.

### Backend Setup (Railway or Render)
1. Connect your GitHub repository to Render or Railway.
2. Choose **Web Service** (Render) or **New Service** (Railway).
3. Set the **Root Directory** to `backend`.
4. Configure the Build Command: `npm install`
5. Configure the Start Command: `npm start`
6. Add the environment variables from the checklist above.
7. Click **Deploy**. Note down the generated URL (e.g. `https://foundermind-api.railway.app`).

### Frontend Setup (Vercel)
1. Go to Vercel and import your GitHub repository.
2. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Under Environment Variables, add:
   - `VITE_API_BASE_URL` pointing to `https://foundermind-api.railway.app/api` (use your deployed backend URL).
4. Click **Deploy**.

---

## 3. Pre-flight Checklist
- [ ] Database tables created in Supabase.
- [ ] Backend is running and health check endpoint `/api/health` returns `{"status":"ok"}`.
- [ ] Frontend config `vercel.json` rewrite routing is functional (refreshing pages does not trigger 404).
- [ ] Environment validation on backend startup passes cleanly.
- [ ] Local storage and cookies are cleared.
- [ ] Real E2E signup -> chat -> recall test passes successfully on production URLs.
