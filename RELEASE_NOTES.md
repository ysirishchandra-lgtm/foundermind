# FounderMind — Release Notes (v1.0.0-release)

We are proud to announce the release of **FounderMind v1.0.0-release**, a fully functional AI Chief of Staff platform built for startup founders and early-stage CEOs. FounderMind integrates long-term context memory (using Hindsight Cloud) with intelligent runtime routing (using CascadeFlow) to optimize cost, quality, and latency.

---

## What's New in v1.0.0-release

### 🔐 Authentication & Session Security
- **Secure JWT Flow**: Real email registration and login powered by bcrypt password hashing and token encryption.
- **Auto-Logout on Token Expiration**: Unified fetch client intercepts HTTP 401 statuses, automatically wiping localStorage sessions and routing users to `/login?expired=true` with a clear user notice.
- **Protected Routes**: Navigation router guards ensure dashboard segments are inaccessible without a valid token.

### 🧠 Hindsight Persistent Memory
- **Isolated User Memory Banks**: Automatically assigns a unique memory bank (`foundermind-{userId}`) per founder on Hindsight Cloud.
- **Context Recalls**: Semantically retrieves key business facts (ARR, user acquisition channels, investor details) matching the query before executing any LLM task.
- **Context Retention**: Asynchronously summarizes conversations and posts new facts to Hindsight so subsequent sessions automatically inherit prior context without user prompting.
- **Manual Memory Manager**: Lets users add custom business context cards dynamically or clear them.

### ⚡ CascadeFlow Speculative Routing
- **Pattern Routing rules**: Configured in [cascadeflow.config.json](file:///C:/Users/user/.gemini/antigravity-ide/scratch/foundermind/backend/src/config/cascadeflow.config.json).
  - Simple Greetings (`hi`, `hello`, `hey`) -> lightweight `gpt-4o-mini` (low token cost).
  - Business Strategy (`pitch`, `funding`, `ARR`, `Sequoia`) -> flagship `gpt-4o` (high reasoning capability).
  - Deep Conversations (history length &ge; 8) -> `gpt-4o`.
  - Default -> `gpt-4o-mini`.
- **Automatic Fallback Recovery**: If a primary LLM service experiences a rate limit or service outage, the orchestration block catches the error and retries the request using the defined fallback model.
- **AI Spend Diagnostics**: Database tracking of model names, input/output tokens, cost estimations, and response latency.

### 📊 Clean Slate UX & Live Dashboards
- **AI Analytics Dashboard**: High-fidelity metrics rendering cost today ($), requests count, model distribution percentages, and list tables for recent queries.
- **Task Management CRUD**: Full list, create, edit, toggle check, and search capabilities.
- **Overview Panels**: Real-time summary widget syncing Priorities, Chat history, Memory details, and AI Spend graphs.
- **Clean Slate Onboarding**: Displays beautiful SVG placeholders and CTA buttons if the database is blank, ensuring a professional, clean user workspace.

---

## Technical Specifications
- **Frontend**: React 19, Vite, Lucide icons, Vanilla CSS.
- **Backend**: Node.js, Express, Supabase client, OpenAI SDK.
- **SDK Integrations**: `@vectorize-io/hindsight-client`, `@cascadeflow/core`.
- **Lint status**: Clean (0 warnings, 0 errors).
