# FounderMind — API Documentation

FounderMind backend REST API endpoints reference.

---

## Base URL
```
https://your-deployed-backend-url.com/api
```

---

## 1. Authentication Endpoints

### Register User
- **Endpoint**: `POST /auth/register`
- **Request Body**:
  ```json
  {
    "name": "Alex Founder",
    "email": "alex@startup.io",
    "password": "securepassword123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "uuid-v4",
      "name": "Alex Founder",
      "email": "alex@startup.io"
    }
  }
  ```

### Login User
- **Endpoint**: `POST /auth/login`
- **Request Body**:
  ```json
  {
    "email": "alex@startup.io",
    "password": "securepassword123"
  }
  ```
- **Response**: Same as Register.

---

## 2. AI Chat & Routing Endpoints

### Process AI Chat Query
- **Endpoint**: `POST /chat`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "conversationId": "conv-uuid-v4",
    "message": "Draft our VC intro email."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "userMessage": { "id": "...", "role": "user", "content": "..." },
      "assistantMessage": { "id": "...", "role": "assistant", "content": "..." },
      "meta": {
        "model": "gpt-4o",
        "tokens": { "prompt": 450, "completion": 250, "total": 700 },
        "latencyMs": 1420
      }
    }
  }
  ```

---

## 3. Persistent Memory Endpoints

### Retrieve Memory Context
- **Endpoint**: `GET /memory`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      { "fact": "Current ARR is $1.2M", "score": 0.95 },
      { "fact": "eco-friendly packaging", "score": 0.88 }
    ],
    "count": 2
  }
  ```

### Manually Store a Memory Fact
- **Endpoint**: `POST /memory`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "content": "Our main competitor is EcoBox."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Memory stored successfully. Hindsight is extracting facts."
  }
  ```

### Get AI Deductions (Memory Reflection)
- **Endpoint**: `GET /memory/reflect?q=What+are+the+main+goals%3F`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "insight": "Founder is focused on scaling ARR past $1.2M and pitching Sequoia Capital next week.",
      "query": "What are the main goals?"
    }
  }
  ```

---

## 4. AI Analytics Endpoints

### Retrieve Dashboard Metrics
- **Endpoint**: `GET /analytics/dashboard`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "summary": {
        "requestsToday": 4,
        "averageLatencyMs": 1250,
        "totalTokensToday": 3420,
        "estimatedCostToday": 0.000214
      },
      "modelDistribution": {
        "gpt-4o-mini": 3,
        "gpt-4o": 1
      },
      "recentActivity": [
        {
          "id": "...",
          "query_text": "Draft pitch intro...",
          "model_used": "gpt-4o",
          "routing_reason": "Strategy Intent matched",
          "total_tokens": 700,
          "estimated_cost": 0.000125,
          "latency_ms": 1420,
          "created_at": "2026-06-27T17:00:00.000Z"
        }
      ]
    }
  }
  ```

---

## 5. Task Endpoints

### List Tasks
- **Endpoint**: `GET /tasks`
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `status` (todo/completed), `priority` (high/medium/low)
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "task-uuid-v4",
        "title": "Prepare board metrics spreadsheet",
        "priority": "high",
        "status": "todo",
        "due_date": null
      }
    ],
    "count": 1
  }
  ```
