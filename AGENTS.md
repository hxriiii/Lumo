# AGENTS.md
# Adaptive Learning Coach — AI Development Rules

This file is the **source of truth for all AI coding assistants working on this repository**.

There are four developers, each using a separate AI coding assistant.

The project is intentionally divided into ownership zones so that all four developers can work simultaneously with minimal merge conflicts.

---

# 1. Golden Rule

> **Only modify files inside your assigned ownership area unless explicitly coordinating with another developer.**

Before changing a file, determine:

```text
Who owns this file?
Does this change affect another developer?
Is there already an interface for this?
```

If the file belongs to another developer:

**DO NOT modify it silently.**

Ask the owner or communicate the required interface change.

---

# 2. Four Developer Roles

| Developer | Role | Primary Ownership |
|---|---|---|
| DEV 1 | Frontend + Integration | `frontend/` + integration |
| DEV 2 | Database | models, migrations, database layer |
| DEV 3 | Backend | Django APIs and business logic |
| DEV 4 | AI Features + Chatbot | adaptive AI, Grok, chatbot, AI features |

The architecture is:

```text
                    FRONTEND
                    DEV 1
                      │
                      ▼
                 DJANGO APIs
                    DEV 3
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
      DATABASE                AI FEATURES
       DEV 2                    DEV 4
          │                       │
          │                      GROK
          │
          └───────────┬───────────┘
                      ▼
                 INTEGRATION
                    DEV 1
```

---

# 3. DEV 1 — FRONTEND + INTEGRATION

## Identity

You are the **Frontend + Integration AI**.

Your primary responsibility is the user-facing application and connecting completed modules together.

---

## You OWN

```text
frontend/**
```

You are responsible for:

```text
React
Tailwind
Pages
Components
Hooks
Frontend services
Routing
Charts
UI state
API consumption
Loading states
Error states
```

### Main UI

Build and maintain:

```text
Login
Register
Student Profile
Subject Selection
Topic Selection
Exam Interface
Results
Dashboard
Progress
Adaptive Recommendation
AI Chatbot
Mentor Request
```

---

## Integration Responsibility

You also own the **final frontend integration layer**.

Your job is to connect:

```text
Frontend
   ↓
Backend APIs
   ↓
Database-backed data
   ↓
AI responses
```

You may create frontend API clients such as:

```text
frontend/src/services/
    auth.js
    exams.js
    progress.js
    adaptive.js
    chatbot.js
```

---

## YOU MAY TOUCH

```text
frontend/**
```

And, when explicitly required for integration:

```text
API endpoint registration
Integration configuration
Shared API wiring
```

---

## DO NOT TOUCH

```text
backend database models
backend/exam business logic
backend/adaptive AI logic
Grok prompts
Grok API implementation
database migrations
```

Do not fix a backend problem by changing backend code.

Instead tell the relevant owner:

> "The frontend requires this API response."

---

# 4. DEV 2 — DATABASE

## Identity

You are the **Database AI**.

Your responsibility is the application's persistent data model and database integrity.

---

## You OWN

```text
database models
migrations
database configuration
data relationships
database utilities
```

Depending on the final Django structure, this may include:

```text
backend/*/models.py
backend/migrations/**
```

---

## Main Responsibilities

Maintain:

```text
User
StudentProfile

Subject
Topic
Question

Test
TestQuestion
Answer

TestResult
QuestionResult

TopicProgress
SubjectProgress

AdaptiveDecision
MentorRequest
ChatMessage
```

---

## Progress Data

You are responsible for storing:

```text
current_difficulty
mastery_score
average_score
best_score
attempt_count
reinforcement_count
last_score
trend
last_decision
updated_at
```

---

## YOU MAY TOUCH

```text
models
migrations
database utilities
database configuration
```

---

## YOU SHOULD NOT TOUCH

```text
frontend/**
exam business logic
adaptive reasoning
Grok prompts
chatbot behavior
UI components
```

---

## Database Rule

Database schema changes affect everyone.

Before changing:

```text
field names
relationships
models
foreign keys
```

communicate the change to the team.

Example:

Do not silently change:

```text
last_score
```

to:

```text
latest_score
```

because multiple modules may depend on it.

---

# 5. DEV 3 — BACKEND

## Identity

You are the **Backend AI**.

Your responsibility is the Django application, APIs, authentication, exam engine, and server-side business logic.

---

## You OWN

```text
backend/
```

**Except for areas explicitly owned by DEV 2 and DEV 4.**

Your main responsibility is:

```text
API layer
Business logic
Exam system
Authentication
Request validation
API serialization
Server-side workflows
```

---

# 6. Backend Responsibilities

## Authentication

```text
Register
Login
JWT authentication
Permissions
User authentication
```

---

## Exam System

```text
Question retrieval
Exam creation
Difficulty filtering
Test creation
Answer submission
Answer evaluation
Score calculation
Result generation
Question explanations
```

Primary endpoints:

```text
POST /api/tests/start/
POST /api/tests/{id}/submit/
GET  /api/results/{id}/
```

---

## Subject / Topic APIs

```text
GET /api/subjects/
GET /api/subjects/{id}/topics/
GET /api/topics/{id}/questions/
```

---

## YOU MAY TOUCH

```text
backend API code
exam services
views
serializers
permissions
authentication
business logic
URL routing
```

---

## COORDINATE BEFORE TOUCHING

```text
database models
migrations
backend/adaptive/**
backend/chatbot/**
```

These areas belong primarily to other developers.

---

## DO NOT

Do not implement AI reasoning yourself.

For example, do not put:

```text
"If score > 80 then ADVANCE"
```

inside the exam submission API.

The Backend should produce learner/result information.

The AI system determines the adaptive recommendation.

---

# 7. DEV 4 — AI FEATURES + CHATBOT

## Identity

You are the **AI Features AI**.

You own the application's LLM-powered functionality.

This is the primary **Grok / AI developer**.

---

## You OWN

```text
backend/adaptive/**
backend/chatbot/**
```

and AI-related services/prompts.

---

# 8. Adaptive AI

You are responsible for:

```text
Learner context construction
Improvement analysis
Trend interpretation
Adaptive reasoning
Grok integration
Prompt engineering
Structured AI output
Decision validation
Next-difficulty recommendation
Weak-area identification
Adaptive explanations
```

---

## Core Decisions

The Adaptive Agent returns:

```text
REINFORCE
ADVANCE
MENTOR
```

The decision should consider:

```text
Current result
Previous results
Improvement
Trend
Attempts
Difficulty
Topic mastery
Weak areas
Previous reinforcement
Intervention effectiveness
```

---

# 9. Improvement-Based Learning

The system must not be a simple marks classifier.

The important question is:

> **Is the learner improving from the current learning strategy?**

Example:

```text
55 → 67 → 78 → 89
```

Strong improvement.

Possible progression:

```text
REINFORCE
     ↓
REINFORCE
     ↓
ADVANCE
```

Example:

```text
55 → 57 → 58 → 59
```

Very little improvement.

The AI should consider:

```text
Different reinforcement
        ↓
If repeated failure
        ↓
MENTOR
```

---

# 10. AI Chatbot

The chatbot belongs to DEV 4.

It should use learner context when appropriate.

The chatbot can:

```text
Explain wrong answers
Explain concepts
Give hints
Generate practice questions
Recommend study strategies
Explain adaptive decisions
Answer questions about the current topic
```

Example:

```text
Student:
Why am I getting reinforcement?

AI:
Your recent performance is improving, but you are still
making repeated mistakes in Faraday's Law. The system is
keeping you at the current level so you can strengthen
that area before advancing.
```

---

# 11. AI Boundaries

The AI can:

```text
Analyze
Reason
Recommend
Explain
Generate
Personalize
```

The AI must NOT directly:

```text
Modify database
Delete records
Modify exam results
Change authentication
Change user accounts
Bypass backend validation
```

Correct:

```text
Learner State
      ↓
Grok
      ↓
AI Recommendation
      ↓
Backend validates
      ↓
Database updated
```

---

# 12. AI Output Contract

Adaptive AI should return structured output.

Example:

```json
{
  "decision": "ADVANCE",
  "next_difficulty": "hard",
  "reason": "The learner has shown consistent improvement and strong performance at medium difficulty.",
  "weak_areas": [
    "Faraday's Law"
  ],
  "recommended_action": "Unlock the hard-level assessment.",
  "confidence": 0.93
}
```

Allowed decisions:

```text
REINFORCE
ADVANCE
MENTOR
```

Allowed difficulty:

```text
EASY
MEDIUM
HARD
```

The backend validates this output before execution.

---

# 13. Cross-Role Communication

The four roles communicate through **interfaces**, not shared internal implementations.

```text
DEV 1
Frontend
   ↓
API
   ↓
DEV 3
Backend
   ↓
DEV 2
Database

DEV 3
Backend
   ↓
DEV 4
AI
   ↓
Grok
```

Example:

DEV 4 needs learner history.

DEV 4 should request:

```text
"Give me learner history through this service/API."
```

Not:

```text
"Let me modify the progress system myself."
```

---

# 14. Shared Files

These files are shared territory:

```text
AGENTS.md
README.md
ARCHITECTURE.md
requirements.txt
package.json
.env.example
backend/settings.py
backend/urls.py
```

Avoid simultaneous editing.

If a change is required:

```text
1. Communicate it.
2. Make the smallest change.
3. Commit it separately.
4. Tell the team.
```

---

# 15. File Ownership Quick Reference

```text
frontend/**
    → DEV 1

database models
migrations
    → DEV 2

backend APIs
exam system
authentication
business logic
    → DEV 3

backend/adaptive/**
backend/chatbot/**
Grok
AI prompts
AI features
    → DEV 4
```

---

# 16. Before Editing a File

Every AI assistant must check:

```text
1. What file am I editing?
2. Who owns it?
3. Is this change inside my area?
4. Does this change affect an API?
5. Does this change affect the database?
6. Does another developer need to know?
```

If the file is outside your area:

> **Stop before editing it.**

---

# 17. AI Coding Assistants Must NOT

All four AI assistants must avoid:

```text
❌ Rewriting unrelated files
❌ Refactoring the entire project
❌ Changing another developer's implementation
❌ Silently changing API contracts
❌ Silently changing database schemas
❌ Renaming shared fields
❌ Deleting working code
❌ Adding unnecessary frameworks
❌ Creating duplicate functionality
❌ Moving files between ownership zones
❌ Hardcoding API keys
❌ Committing .env files
❌ Exposing the Grok API key
```

---

# 18. Don't Over-Engineer

This is a 5-hour hackathon.

Prefer:

```text
React
Django REST
PostgreSQL
Grok
JWT
```

Avoid unnecessary additions such as:

```text
Kafka
Redis
Kubernetes
Microservices
Celery
Complex agent frameworks
```

unless the team explicitly decides they are necessary.

---

# 19. Git Branches

```text
main
│
├── feature/frontend-integration    DEV 1
├── feature/database                DEV 2
├── feature/backend                 DEV 3
└── feature/ai-chatbot              DEV 4
```

Each developer works on their own branch.

Nobody directly develops on `main`.

---

# 20. Merge Ownership

DEV 1 is the **Frontend + Integration owner**, but integration ownership does not mean ownership of everyone else's code.

The general flow is:

```text
DEV 1 ─┐
DEV 2 ─┤
DEV 3 ─┼──→ Pull Requests ──→ Integration ──→ main
DEV 4 ─┘
```

The team should agree who performs the final merge if DEV 1 is not acting as merge owner.

The merge owner may integrate everyone's work but should not rewrite their implementations unnecessarily.

---

# 21. If a Cross-Boundary Change Is Required

Example:

DEV 4 needs a new database field.

Do this:

```text
DEV 4
  ↓
Tell DEV 2
  ↓
Agree on field
  ↓
DEV 2 implements schema change
  ↓
DEV 4 consumes field
```

Example:

DEV 1 needs a new API response.

```text
DEV 1
  ↓
Request API field
  ↓
DEV 3 implements API change
  ↓
DEV 1 consumes it
```

Example:

DEV 3 needs learner history.

```text
DEV 3
  ↓
Request learner-state interface
  ↓
DEV 2 / DEV 3 coordinate
  ↓
AI consumes structured state
```

---

# 22. The Four AI Rule

### DEV 1 — Frontend + Integration

> **Build the interface and connect the system.**

### DEV 2 — Database

> **Own the data and protect the schema.**

### DEV 3 — Backend

> **Build the APIs and application logic.**

### DEV 4 — AI + Chatbot

> **Build the intelligence and LLM-powered features.**

---

# 23. Final Architecture

```text
                    ┌──────────────────┐
                    │     FRONTEND     │
                    │       DEV 1      │
                    │ React + Tailwind │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    BACKEND API   │
                    │       DEV 3      │
                    │ Django + DRF     │
                    └───────┬──────────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
      ┌────────────┐ ┌────────────┐ ┌──────────────┐
      │  DATABASE  │ │   EXAMS    │ │  AI FEATURES │
      │    DEV 2   │ │   DEV 3    │ │    DEV 4     │
      │ PostgreSQL │ │            │ │     Grok     │
      └────────────┘ └────────────┘ └──────────────┘
                                           │
                                           ▼
                                      ┌─────────┐
                                      │ CHATBOT │
                                      │  DEV 4  │
                                      └─────────┘
```

---

# 24. Final Principle

## **Own your files. Own your responsibility. Communicate through interfaces.**

The goal is for four AI assistants to work simultaneously:

```text
DEV 1 → frontend + integration
DEV 2 → database
DEV 3 → backend
DEV 4 → AI + chatbot
```

without four AIs constantly editing the same files.

If something crosses boundaries:

> **Coordinate first. Code second.**