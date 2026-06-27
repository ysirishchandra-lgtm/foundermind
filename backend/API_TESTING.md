# FounderMind API — Testing Guide

## Base URL
```
http://localhost:5000/api
```

---

## ⭐ AI Chat (Milestone 4)

### Send a Message to the AI
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"conversationId": "YOUR_CONVERSATION_ID", "message": "Draft a brief investor update highlighting our 24% MoM user growth."}'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "userMessage": { "id": "...", "role": "user", "content": "Draft a brief..." },
    "assistantMessage": { "id": "...", "role": "assistant", "content": "Here is a draft..." },
    "meta": {
      "model": "gpt-4o-mini",
      "tokens": { "prompt": 210, "completion": 180, "total": 390 },
      "latencyMs": 1240,
      "finishReason": "stop"
    }
  }
}
```

---

## Auth

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Alex Founder", "email": "alex@startup.io", "password": "password123"}'
```

### Login (save the returned token)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alex@startup.io", "password": "password123"}'
```

### Get Current User (protected)
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Conversations

### Create
```bash
curl -X POST http://localhost:5000/api/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "Q3 Fundraising Strategy"}'
```

### List (paginated)
```bash
curl "http://localhost:5000/api/conversations?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get one
```bash
curl http://localhost:5000/api/conversations/CONVERSATION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Rename
```bash
curl -X PATCH http://localhost:5000/api/conversations/CONVERSATION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "Series A Planning"}'
```

### Archive
```bash
curl -X PATCH http://localhost:5000/api/conversations/CONVERSATION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"status": "archived"}'
```

### Delete
```bash
curl -X DELETE http://localhost:5000/api/conversations/CONVERSATION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Messages

### Send a Message (also triggers AI response)
```bash
curl -X POST http://localhost:5000/api/messages/CONVERSATION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"content": "Draft an investor update email highlighting our 24% MoM growth."}'
```

### List Messages (paginated)
```bash
curl "http://localhost:5000/api/messages/CONVERSATION_ID?page=1&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Tasks

### Create
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "Finalize Series A Deck", "priority": "high", "status": "in_progress"}'
```

### List (with filters)
```bash
# All tasks
curl "http://localhost:5000/api/tasks" -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by status
curl "http://localhost:5000/api/tasks?status=todo" -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by priority
curl "http://localhost:5000/api/tasks?priority=high" -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update
```bash
curl -X PATCH http://localhost:5000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"status": "completed"}'
```

### Delete
```bash
curl -X DELETE http://localhost:5000/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ⭐ Hindsight Persistent Memory (Milestone 5)

### List Stored Memories (Recalled Facts)
```bash
curl http://localhost:5000/api/memory \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Manually Add a Fact to Memory
```bash
curl -X POST http://localhost:5000/api/memory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"content": "Our target ARR for Q4 is $2.5M."}'
```

### Get AI Deductions / Reflections
```bash
curl "http://localhost:5000/api/memory/reflect?q=What+are+the+main+goals?" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Health Check
```bash
curl http://localhost:5000/api/health
```

---

## Response Shape
All API responses follow a consistent format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Paginated list:**
```json
{
  "success": true,
  "data": [ ... ],
  "count": 42,
  "page": 1,
  "limit": 10
}
```

**Error:**
```json
{
  "error": "Error message here"
}
```
