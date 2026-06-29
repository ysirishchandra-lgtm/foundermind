# FounderMind — AI Chief of Staff for Startup Founders

> **The AI-powered command center that replaces your fractured startup stack.** FounderMind is a full-stack SaaS platform that gives founders a persistent, personalized AI assistant with memory, task management, document storage, meeting scheduling, and real-time streaming chat.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-foundermind.vercel.app-00bcd4?style=for-the-badge&logo=vercel)](https://foundermind.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Chat (Streaming)** | Real-time SSE streaming chat with GPT-4o-mini / Ollama fallback |
| 🧠 **Persistent Memory** | Hindsight AI extracts & stores founder facts across sessions |
| 📋 **Task Manager** | Full CRUD task board with priority, due dates, and status filters |
| 📅 **Meetings** | Schedule, edit, and track meetings with join links |
| 📄 **Documents** | Create, store, and manage startup documents |
| 📊 **AI Analytics** | CascadeFlow model routing logs, latency, token costs |
| ⚙️ **Settings** | Profile updates and secure password change |
| 🔐 **Authentication** | JWT-based auth with bcrypt password hashing (cost 12) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                 │
│  Landing → Login/Signup → Dashboard (Chat, Tasks, Memory, ...)  │
│  Lazy-loaded routes · Code-split chunks · SSE streaming client  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / REST + SSE
┌──────────────────────────▼──────────────────────────────────────┐
│               BACKEND (Express.js → Vercel Serverless)          │
│  JWT Auth · Rate Limiting · Helmet Security · Zod Validation    │
│  ┌──────────────┐  ┌────────────────┐  ┌─────────────────────┐  │
│  │ Chat Service │  │ Hindsight (AI  │  │ CascadeFlow Router  │  │
│  │ (OpenAI SSE) │  │ Memory Cloud)  │  │ (Model Selection)   │  │
│  └──────────────┘  └────────────────┘  └─────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Supabase JS Client
┌──────────────────────────▼──────────────────────────────────────┐
│                    DATABASE (Supabase / PostgreSQL)              │
│    users · conversations · messages · tasks · memory            │
│    documents · meetings · cascadeflow_analytics                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄 Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | `gen_random_uuid()` |
| name | TEXT | Display name |
| email | TEXT (unique) | Normalized to lowercase |
| password_hash | TEXT | bcrypt (cost 12) |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto |

### `conversations`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | CASCADE DELETE |
| title | TEXT | |
| status | TEXT | `active` \| `archived` |
| created_at / updated_at | TIMESTAMPTZ | |

### `messages`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| conversation_id | UUID (FK) | CASCADE DELETE |
| user_id | UUID (FK) | |
| role | TEXT | `user` \| `assistant` |
| content | TEXT | |
| token_count | INTEGER | |
| model_used | TEXT | |
| created_at | TIMESTAMPTZ | |

### `tasks`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| title | TEXT | |
| description | TEXT | |
| priority | TEXT | `low` \| `medium` \| `high` |
| status | TEXT | `todo` \| `in_progress` \| `completed` |
| due_date | TIMESTAMPTZ | |
| created_at / updated_at | TIMESTAMPTZ | |

### `documents`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| name | TEXT | Document title |
| type | TEXT | Category tag |
| size | TEXT | Computed from content length |
| content | TEXT | Document body |
| created_at / updated_at | TIMESTAMPTZ | |

### `meetings`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| title | TEXT | |
| date | TEXT | Display date string |
| time | TEXT | Display time string |
| attendees | INTEGER | |
| join_link | TEXT | Optional video call URL |
| created_at / updated_at | TIMESTAMPTZ | |

---

## 🔌 API Reference

All protected endpoints require: `Authorization: Bearer <JWT>`

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| PATCH | `/api/auth/profile` | ✅ | Update display name |
| POST | `/api/auth/change-password` | ✅ | Change password |

### Conversations
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/conversations` | ✅ | List conversations |
| POST | `/api/conversations` | ✅ | Create conversation |
| DELETE | `/api/conversations/:id` | ✅ | Delete conversation |

### Chat (AI)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/chat` | ✅ | Non-streaming AI response |
| POST | `/api/chat/stream` | ✅ | **SSE streaming** AI response |

### Tasks
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/tasks` | ✅ | List tasks (filter by status/priority) |
| POST | `/api/tasks` | ✅ | Create task |
| PATCH | `/api/tasks/:id` | ✅ | Update task |
| DELETE | `/api/tasks/:id` | ✅ | Delete task |

### Memory
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/memory` | ✅ | Recall stored facts |
| POST | `/api/memory` | ✅ | Store new fact via Hindsight |
| GET | `/api/memory/reflect` | ✅ | AI strategic synthesis |

### Documents
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/documents` | ✅ | List documents |
| POST | `/api/documents` | ✅ | Create document |
| PATCH | `/api/documents/:id` | ✅ | Update document |
| DELETE | `/api/documents/:id` | ✅ | Delete document |

### Meetings
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/meetings` | ✅ | List meetings |
| POST | `/api/meetings` | ✅ | Schedule meeting |
| PATCH | `/api/meetings/:id` | ✅ | Update meeting |
| DELETE | `/api/meetings/:id` | ✅ | Cancel meeting |

### Analytics
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics/dashboard` | ✅ | Summary, model distribution, logs |

### Health
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | ❌ | Status, version, timestamp |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js ≥ 18
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key
- (Optional) [Ollama](https://ollama.ai) for local model inference

### 1. Clone the Repository

```bash
git clone https://github.com/ysirishchandra-lgtm/foundermind.git
cd foundermind
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure Environment Variables

Create `backend/.env`:

```env
# Supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# AI
OPENAI_API_KEY=sk-your-openai-key
# OPENAI_MODEL=gpt-4o-mini   # optional override

# Hindsight Memory (Vectorize.io)
HINDSIGHT_API_KEY=your-hindsight-key
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io

# Rate Limiting (optional)
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_CHAT_MAX=60

NODE_ENV=development
```

Create `.env.local` (root, for Vite dev server proxy):

```env
VITE_API_URL=/api
```

### 5. Run the Application

Terminal 1 — Frontend (Vite dev server with API proxy):
```bash
npm run dev
```

Terminal 2 — Backend (Express server):
```bash
cd backend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🌐 Vercel Deployment

### 1. Push to GitHub

```bash
git add .
git commit -m "deploy: production-ready SaaS"
git push origin main
```

### 2. Link Vercel Project (first time)

```bash
npx vercel link
```

### 3. Set Environment Variables in Vercel

```bash
npx vercel env add SUPABASE_URL production
npx vercel env add SUPABASE_SERVICE_KEY production
npx vercel env add JWT_SECRET production
npx vercel env add OPENAI_API_KEY production
npx vercel env add HINDSIGHT_API_KEY production
npx vercel env add HINDSIGHT_BASE_URL production
```

### 4. Deploy

```bash
npx vercel --prod --yes
```

### Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "npm run build && cd backend && npm install --legacy-peer-deps",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/index.js" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

The backend is served as a **single Vercel Serverless Function** at `/api/index.js`.

---

## 🔐 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | ✅ | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | ✅ | Supabase service-role key (bypasses RLS) |
| `JWT_SECRET` | ✅ | Secret for signing/verifying JWTs |
| `OPENAI_API_KEY` | ✅ (prod) | OpenAI API key (omit to use local Ollama) |
| `OPENAI_MODEL` | ❌ | Override default model (default: `gpt-4o-mini`) |
| `HINDSIGHT_API_KEY` | ✅ | Vectorize.io Hindsight API key |
| `HINDSIGHT_BASE_URL` | ✅ | Hindsight base URL |
| `OLLAMA_BASE_URL` | ❌ | Local Ollama URL (default: `http://127.0.0.1:11434/v1`) |
| `RATE_LIMIT_AUTH_MAX` | ❌ | Auth rate limit (default: 5/min) |
| `RATE_LIMIT_CHAT_MAX` | ❌ | Chat rate limit (default: 60/min) |
| `NODE_ENV` | ❌ | `development` or `production` |

---

## 🛡 Security

- **Passwords**: bcrypt with cost factor 12
- **Tokens**: JWT HS256, 7-day expiry
- **Headers**: `helmet` middleware (X-Frame-Options, HSTS, XSS-Protection, etc.)
- **CORS**: Allowlist-only (production + localhost)
- **Rate Limiting**: 5 auth req/min, 60 chat req/min per IP/user
- **Input Validation**: Zod schemas on all endpoints with max-length constraints
- **Body Size Limit**: 1 MB max payload
- **SQL Injection**: Protected via Supabase parameterized queries (never raw SQL)
- **XSS**: React escapes all rendered content by default

> ⚠️ **Rotate these keys** if they were ever exposed in version control:
> - `SUPABASE_SERVICE_KEY`
> - `JWT_SECRET`
> - `HINDSIGHT_API_KEY`
> - `OPENAI_API_KEY`

---

## 📦 Tech Stack

### Frontend
- **React 19** + **Vite 8** (ES modules, HMR)
- **React Router v7** (client-side routing)
- **Lucide React** (icon library)
- **Custom CSS** (glassmorphism design system)
- **Lazy loading** + **Suspense** (per-route code splitting)

### Backend
- **Express.js v5** (Node.js HTTP server)
- **Zod v4** (schema validation)
- **bcryptjs** (password hashing)
- **jsonwebtoken** (JWT auth)
- **helmet** (security headers)
- **express-rate-limit** (DDoS protection)
- **morgan** (HTTP request logging)

### Infrastructure
- **Vercel** (frontend CDN + serverless backend)
- **Supabase** (PostgreSQL database + JS client)
- **Hindsight / Vectorize.io** (vector memory)
- **CascadeFlow** (AI model routing)
- **OpenAI** (GPT-4o-mini / GPT-4o)

---

## 🗺 Roadmap (v2)

- [ ] Real-time collaboration (Socket.io / Supabase Realtime)
- [ ] Google Calendar / Zoom API integration for meetings
- [ ] Document export (PDF / DOCX download)
- [ ] AI-powered task auto-generation from chat
- [ ] Stripe subscription billing
- [ ] Multi-workspace / team support
- [ ] Mobile app (React Native / Expo)
- [ ] Custom domain + white-label option

---

## 📄 License

MIT © 2026 FounderMind

---

*Built for founders, by founders.* 🚀
