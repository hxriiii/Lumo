# Adaptive Learning Coach — Full Project Specification

## 1. Project Overview

**Adaptive Learning Coach** is an AI-powered personalized learning platform that continuously evaluates a student's performance and dynamically decides what the student should do next.

The student:

1. Creates a profile.
2. Selects 1–3 subjects.
3. Selects a topic within a subject.
4. Starts an **Easy** MCQ exam for that topic.
5. Receives an evaluated result with correct answers and explanations.
6. Has the result stored in the learner profile.
7. Takes another exam on the **same topic**, with difficulty dynamically selected based on performance.
8. Can continue from Easy → Medium → Hard or move back to reinforcement when performance drops.
9. Can be referred to a mentor when repeated attempts and reinforcement do not improve performance.
10. Can use an AI chatbot for personalized topic explanations and questions.

The core AI decision is:

> **REINFORCE / ADVANCE / MENTOR**

The system uses **Grok LLM** for adaptive reasoning and the AI learning chatbot.

---

# 2. Main Student Flow

```text
                    STUDENT
                       |
                       v
               Create Profile
                       |
                       v
              Select 1–3 Subjects
                       |
                       v
             Select a Subject
                       |
                       v
              Select a Topic
                       |
                       v
             Start Easy Exam
                       |
                       v
                  MCQ Test
                       |
                       v
                  Submit
                       |
                       v
              Evaluate Result
                       |
                       +-------------------+
                       |                   |
                       v                   v
                Show Correct         Store Result
                  Answers                 |
                       |                   v
                       |            Update Progress
                       |                   |
                       +---------+---------+
                                 |
                                 v
                           Grok AI Agent
                                 |
                  +--------------+--------------+
                  |              |              |
                  v              v              v
              REINFORCE       ADVANCE        MENTOR
                  |              |              |
                  v              v              v
             Same Level       Higher Level   Mentor Check-in
             / Practice        Same Topic
```

---

# 3. Student Profile

During registration, the student selects up to three subjects.

Example:

```text
Select your subjects:

[x] Physics
[x] Computer Science
[x] Mathematics
[ ] Chemistry
```

The selected subjects become available on the student's dashboard.

Each subject maintains independent progress.

Example:

```text
Student: Alex

Physics              68%
Computer Science     84%
Mathematics          57%
```

---

# 4. Subject → Topic → Exam Flow

The student should not immediately start a general subject exam.

The hierarchy is:

```text
Subject
   |
   +-- Topic 1
   |      |
   |      +-- Easy Exam
   |      +-- Medium Exam
   |      +-- Hard Exam
   |
   +-- Topic 2
   |      |
   |      +-- Easy Exam
   |      +-- Medium Exam
   |      +-- Hard Exam
   |
   +-- Topic 3
          |
          +-- Easy Exam
          +-- Medium Exam
          +-- Hard Exam
```

Example:

```text
Physics
   |
   +-- Mechanics
   |
   +-- Thermodynamics
   |
   +-- Electromagnetism
```

Student selects:

```text
Physics
    ↓
Electromagnetism
    ↓
Easy Exam
```

---

# 5. Difficulty Progression

The important feature is that **difficulty changes dynamically based on performance**.

Initial exam:

```text
Topic: Electromagnetism
Difficulty: EASY
Questions: 10
```

Suppose:

```text
Score = 90%
```

The next exam can become:

```text
Topic: Electromagnetism
Difficulty: MEDIUM
```

If the student performs well again:

```text
90% → 92%
```

Then:

```text
MEDIUM → HARD
```

If performance drops:

```text
92% → 55%
```

The system can return to:

```text
HARD → MEDIUM
```

or assign reinforcement.

---

# 6. Adaptive Learning Loop

```text
                 START
                   |
                   v
              EASY EXAM
                   |
                   v
              Evaluate
                   |
                   v
              Calculate
              Performance
                   |
                   v
              Grok Agent
                   |
       +-----------+-----------+
       |           |           |
       v           v           v
   REINFORCE    ADVANCE      MENTOR
       |           |           |
       v           v           v
 Same difficulty  Increase    Human support
 + targeted       difficulty
 practice         same topic
       |           |
       +-----+-----+
             |
             v
        Next Exam
             |
             v
        Re-evaluate
             |
             +-------> Continue loop
```

---

# 7. Recommended Difficulty Rules

The final decision should use both deterministic metrics and Grok reasoning.

A basic baseline can be:

| Performance | Suggested Action |
|---|---|
| 0–49% | Reinforce |
| 50–69% | Same difficulty / reinforcement |
| 70–84% | Continue same level or prepare to advance |
| 85–100% | Advance |

However, **do not use score alone**.

Also consider:

- Previous scores
- Score trend
- Number of attempts
- Topic mastery
- Time taken
- Number of repeated mistakes
- Previous reinforcement attempts
- Certification/mastery requirement

Example:

```text
Student A:
55% → 65% → 75% → 84%

Student B:
84% → 75% → 65% → 55%
```

Both currently have approximately similar performance, but their learning trends are completely different.

Grok should receive this history.

---

# 8. Three Adaptive Decisions

## 8.1 REINFORCE

Use when the learner has not demonstrated mastery.

Example:

```text
Topic: Electromagnetism

Scores:
52%
55%
58%

Current score: 58%
Attempts: 3
```

Decision:

```text
REINFORCE
```

Reason:

> The learner is improving but has not yet reached the mastery threshold. Additional practice on the weak concepts is recommended.

Action:

```text
Assign targeted practice questions
Keep difficulty at EASY/MEDIUM
Focus on weak concepts
Then provide another assessment
```

---

## 8.2 ADVANCE

Use when the learner consistently performs well.

Example:

```text
Scores:
86%
90%
94%

Current difficulty: MEDIUM
```

Decision:

```text
ADVANCE
```

Action:

```text
MEDIUM → HARD
```

The important point is:

> **Advance on the same topic first.**

The student should not immediately jump to another topic.

Example:

```text
Electromagnetism
      |
      +-- Easy     ✓ Mastered
      |
      +-- Medium   ✓ Mastered
      |
      +-- Hard     ← Next
```

Only after sufficient mastery at the current topic can the platform recommend the next topic.

---

## 8.3 MENTOR

Use when the learner repeatedly struggles despite intervention.

Example:

```text
Scores:
42%
45%
39%
44%

Attempts: 4

Reinforcement attempts: 2
```

Decision:

```text
MENTOR
```

Reason:

> The learner continues to perform below the mastery threshold despite repeated attempts and reinforcement. Personalized human support is recommended.

Action:

```text
Create mentor request
Notify mentor
Show mentor recommendation to student
```

---

# 9. MCQ Test

Each exam contains MCQs.

Example:

```text
Question 4 / 10

Which law states the relationship between
voltage, current and resistance?

A. Newton's Law
B. Ohm's Law
C. Faraday's Law
D. Coulomb's Law
```

Question data:

```json
{
  "question": "Which law states the relationship between voltage, current and resistance?",
  "options": [
    "Newton's Law",
    "Ohm's Law",
    "Faraday's Law",
    "Coulomb's Law"
  ],
  "correct_answer": "Ohm's Law",
  "subject": "Physics",
  "topic": "Electricity",
  "difficulty": "easy",
  "explanation": "Ohm's Law describes the relationship V = IR."
}
```

---

# 10. Result Page

After submission:

```text
Physics — Electricity

Score: 8 / 10
Accuracy: 80%

Correct: 8
Incorrect: 2
```

For every question:

```text
Question 4

Your Answer:
C. Faraday's Law

Correct Answer:
B. Ohm's Law

Explanation:
Ohm's Law describes the relationship between
voltage, current and resistance.
```

The result is then stored in the database.

---

# 11. Learner Progress

The dashboard should show progress for every subject and topic.

Example:

```text
PHYSICS

Mechanics
████████████████░░░░ 80%

Thermodynamics
██████████████░░░░░░ 70%

Electromagnetism
██████████░░░░░░░░░░ 50%
```

Topic-level history:

```text
Electromagnetism

Attempt 1     Easy      52%
Attempt 2     Easy      61%
Attempt 3     Easy      74%
Attempt 4     Medium    86%
Attempt 5     Medium    91%
```

Current status:

```text
MEDIUM → READY TO ADVANCE
```

---

# 12. Dashboard

```text
+------------------------------------------------------+
|              ADAPTIVE LEARNING COACH                 |
+------------------------------------------------------+
| Welcome, Alex                                        |
|                                                      |
| Overall Progress: 72%                                |
|                                                      |
| Subjects                                             |
|                                                      |
| Physics                 68%                          |
| Computer Science        84%                          |
| Mathematics             57%                          |
|                                                      |
+------------------------------------------------------+
| Physics                                               |
|                                                      |
| Topics                                               |
|                                                      |
| Mechanics               82%                          |
| Thermodynamics          71%                          |
| Electromagnetism        48%                          |
|                                                      |
| Current Recommendation                               |
|                                                      |
| REINFORCE                                            |
|                                                      |
| You need more practice with Electromagnetism.       |
|                                                      |
| [Start Practice]        [Ask AI Coach]               |
+------------------------------------------------------+
```

---

# 13. Grok AI Agent

Grok is used as the adaptive reasoning layer.

The backend sends a structured learner profile to Grok.

Example:

```json
{
  "student": {
    "id": 101,
    "name": "Alex"
  },
  "subject": "Physics",
  "topic": "Electromagnetism",
  "current_difficulty": "medium",

  "current_result": {
    "score": 72,
    "correct": 7,
    "wrong": 3,
    "time_taken_seconds": 420
  },

  "previous_results": [
    {"difficulty": "easy", "score": 52},
    {"difficulty": "easy", "score": 61},
    {"difficulty": "easy", "score": 68}
  ],

  "topic_mastery": 68,
  "reinforcement_attempts": 1,
  "certification_threshold": 80
}
```

Grok returns structured output.

```json
{
  "decision": "REINFORCE",
  "next_difficulty": "easy",
  "reason": "The learner has improved but has not yet reached the 80% mastery threshold.",
  "weak_areas": [
    "Faraday's Law",
    "Magnetic Flux"
  ],
  "recommended_action": "Assign targeted reinforcement questions.",
  "confidence": 0.91
}
```

---

# 14. Why Grok Should Not Control the Entire System

Use a **hybrid architecture**.

The backend calculates objective metrics:

```text
Score
Average
Trend
Attempts
Mastery
Difficulty
```

Then Grok interprets those metrics.

```text
Database
   |
   v
Progress Engine
   |
   +--> objective metrics
   |
   v
Grok Agent
   |
   +--> reasoning
   +--> recommendation
   +--> weak areas
   |
   v
Decision Validator
   |
   v
Final Decision
```

This makes the system more reliable and easier to explain to judges.

---

# 15. AI Chatbot

The second AI feature is the **AI Learning Coach chatbot**.

The chatbot knows the student's current context.

Example:

```text
Student:
I don't understand Faraday's Law.
```

Backend sends:

```json
{
  "subject": "Physics",
  "topic": "Electromagnetism",
  "mastery": 48,
  "weak_topics": [
    "Faraday's Law",
    "Magnetic Flux"
  ]
}
```

Grok can then provide a personalized explanation.

The chatbot can also answer:

```text
"Why did I get Q4 wrong?"

"Explain this topic simply."

"Give me 5 practice questions."

"Give me a hint, not the answer."

"Why am I being asked to reinforce?"

"What should I study next?"
```

---

# 16. AI Architecture

Use two AI capabilities:

```text
                         AI LAYER
                            |
             +--------------+--------------+
             |                             |
             v                             v
      ADAPTIVE AGENT                  AI TUTOR
             |                             |
             v                             v
       Analyze results              Answer questions
             |                             |
             v                             v
    Reinforce/Advance/Mentor        Personalized help
```

### Adaptive Agent

Answers:

> **What should the student do next?**

### AI Tutor

Answers:

> **How can I help the student understand the topic?**

---

# 17. Complete System Architecture

```text
                         STUDENT
                            |
                            v
                  +-------------------+
                  |    React Frontend |
                  +-------------------+
                            |
             +--------------+---------------+
             |              |               |
             v              v               v
          Profile       Dashboard        Chatbot
             |              |               |
             +--------------+---------------+
                            |
                         REST API
                            |
                            v
                +------------------------+
                | Django REST Framework  |
                +------------------------+
                            |
       +--------------------+---------------------+
       |                    |                     |
       v                    v                     v
+--------------+    +---------------+    +---------------+
| Auth Service |    | Exam Engine   |    | Progress      |
|              |    |               |    | Engine        |
| JWT          |    | MCQs          |    |               |
| Profiles     |    | Evaluation    |    | Scores        |
+--------------+    | Difficulty    |    | Trends        |
                    +-------+-------+    | Mastery       |
                            |            +-------+-------+
                            |                    |
                            +----------+---------+
                                       |
                                       v
                              +------------------+
                              |  Adaptive Agent  |
                              |                  |
                              |  Grok LLM        |
                              +--------+---------+
                                       |
                         +-------------+-------------+
                         |             |             |
                         v             v             v
                    REINFORCE      ADVANCE       MENTOR
                         |             |             |
                         v             v             v
                    Practice       Higher       Mentor
                    Questions      Difficulty   Request
                         |
                         v
                  +----------------+
                  | PostgreSQL DB  |
                  +----------------+
```

---

# 18. Technology Stack

## Frontend

### React.js

Use React for:

- Registration
- Student profile
- Subject selection
- Topic selection
- Dashboard
- MCQ interface
- Result page
- Progress charts
- AI chatbot

### Tailwind CSS

For rapid UI development.

### Recharts

For:

- Score history
- Progress graphs
- Subject comparison
- Topic mastery

---

## Backend

### Django

Use Django for:

- User management
- Database models
- Business logic
- Admin panel

### Django REST Framework

Use DRF to expose APIs to React.

Example APIs:

```text
POST /api/auth/register/
POST /api/auth/login/

GET  /api/subjects/
GET  /api/subjects/{id}/topics/

GET  /api/topics/{id}/questions/

POST /api/tests/start/
POST /api/tests/{id}/submit/

GET  /api/results/{id}/
GET  /api/progress/

POST /api/adaptive/analyze/
POST /api/chat/
POST /api/mentor/request/
```

---

# 19. Database

Use:

## PostgreSQL

Main tables:

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

Relationships:

```text
Student
   |
   +---- StudentSubject ---- Subject
                                  |
                                  +---- Topic
                                         |
                                         +---- Question
```

And:

```text
Student
   |
   +---- Test
   |       |
   |       +---- TestResult
   |               |
   |               +---- QuestionResult
   |
   +---- TopicProgress
   |
   +---- AdaptiveDecision
   |
   +---- MentorRequest
```

---

# 20. Important Database Model

### TopicProgress

```text
student_id
topic_id
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

Example:

```text
student_id: 101
topic: Electromagnetism

current_difficulty: medium
mastery_score: 82
average_score: 78
best_score: 91

attempt_count: 5
reinforcement_count: 1

last_score: 86
trend: improving

last_decision: advance
```

---

# 21. Exam Difficulty System

Questions should have difficulty metadata.

```text
Question
   |
   +-- Subject
   +-- Topic
   +-- Difficulty
   +-- Question
   +-- Options
   +-- Correct Answer
   +-- Explanation
```

Difficulty:

```text
easy
medium
hard
```

The exam generator selects questions according to the adaptive agent's recommended difficulty.

Example:

```text
Agent says:

next_difficulty = "medium"

              ↓

Exam Engine

Get 10 questions
WHERE topic = Electromagnetism
AND difficulty = medium
```

---

# 22. Adaptive Decision Sequence

A student's first exam for a topic always starts at Easy.

```text
New Topic
    |
    v
EASY
    |
    v
Evaluate
    |
    +---- Score < mastery ----> REINFORCE
    |
    +---- Score >= mastery ---> MEDIUM
                                |
                                v
                             Evaluate
                                |
                                +--> REINFORCE
                                |
                                +--> HARD
                                      |
                                      v
                                   Evaluate
                                      |
                                      v
                              Topic Mastered
```

But if repeated reinforcement fails:

```text
EASY
 ↓
REINFORCE
 ↓
EASY
 ↓
REINFORCE
 ↓
EASY
 ↓
Still failing
 ↓
MENTOR
```

---

# 23. Adaptive Decision Example

### Attempt 1

```text
Topic: Mechanics
Difficulty: Easy
Score: 55%
```

Grok:

```text
REINFORCE
```

---

### Attempt 2

```text
Difficulty: Easy
Score: 72%
```

Grok:

```text
CONTINUE / REINFORCE
```

---

### Attempt 3

```text
Difficulty: Easy
Score: 89%
```

Grok:

```text
ADVANCE
Next difficulty: Medium
```

---

### Attempt 4

```text
Difficulty: Medium
Score: 91%
```

Grok:

```text
ADVANCE
Next difficulty: Hard
```

---

### Attempt 5

```text
Difficulty: Hard
Score: 48%
```

Grok:

```text
REINFORCE
Next difficulty: Medium
```

This demonstrates true adaptation.

---

# 24. Mentor Trigger

A mentor should not be triggered simply because one test score is low.

Better condition:

```text
Repeated low performance
+
Multiple attempts
+
Reinforcement already attempted
+
Little/no improvement
=
MENTOR
```

Example:

```text
Attempt 1 → 44%
Attempt 2 → 41%
Attempt 3 → 45%

Reinforcement → completed

Attempt 4 → 43%
```

Then:

```text
MENTOR
```

---

# 25. Security

Use:

- JWT authentication
- Password hashing
- Django permissions
- Input validation
- API authentication
- Environment variables for Grok API key

Never put the Grok API key in React.

Correct:

```text
React
  ↓
Django
  ↓
Grok API
```

Incorrect:

```text
React
  ↓
Grok API directly
```

---

# 26. Recommended Project Structure

```text
adaptive-learning-coach/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── backend/
│   ├── manage.py
│   │
│   ├── accounts/
│   ├── subjects/
│   ├── exams/
│   ├── progress/
│   ├── adaptive/
│   ├── chatbot/
│   └── mentor/
│
├── requirements.txt
└── README.md
```

---

# 27. AI Agent Backend Flow

```text
POST /api/tests/{id}/submit/
             |
             v
       Evaluate answers
             |
             v
       Save TestResult
             |
             v
       Update TopicProgress
             |
             v
      Get previous attempts
             |
             v
       Build learner context
             |
             v
          Grok API
             |
             v
      Validate AI response
             |
             v
       Save AdaptiveDecision
             |
             v
        Return result
```

---

# 28. Grok Output Contract

Force Grok to return JSON rather than unrestricted text.

```json
{
  "decision": "reinforce",
  "next_difficulty": "easy",
  "reason": "The learner is below the mastery threshold.",
  "weak_areas": [
    "Faraday's Law",
    "Magnetic Flux"
  ],
  "recommended_action": "Assign targeted practice.",
  "confidence": 0.91
}
```

Allowed values:

```text
decision:
- reinforce
- advance
- mentor

next_difficulty:
- easy
- medium
- hard
```

The backend validates these values before storing them.

---

# 29. Certification Support

If the platform has a certification requirement:

```text
Certification mastery requirement = 80%
```

The adaptive system should consider it.

Example:

```text
Topic mastery = 73%
Course completion = 90%

Student has completed the lessons,
but mastery is below the certification threshold.

Decision:
REINFORCE
```

This directly addresses the original business problem.

---

# 30. Final User Experience

The complete experience should feel like:

```text
                 MY LEARNING
                      |
        +-------------+-------------+
        |             |             |
     Physics         CS         Mathematics
        |
        v
   Select Topic
        |
        v
  Electromagnetism
        |
        v
    Easy Exam
        |
        v
      Result
        |
        v
   AI Analysis
        |
   +----+----+----+
   |         |    |
   v         v    v
REINFORCE ADVANCE MENTOR
   |         |
   v         v
Practice   Medium
   |       Exam
   +----+----+
        |
        v
   Continue Learning
```

---

# 31. Hackathon MVP

Do not try to build every possible feature.

Build these first:

### Phase 1 — Core Platform

- Student registration/login
- Student profile
- Select 1–3 subjects
- Subject → topic selection
- MCQ question database
- Easy/Medium/Hard exams
- Automatic evaluation
- Correct answer + explanation

### Phase 2 — Adaptive System

- Store every attempt
- Score history
- Topic mastery
- Difficulty progression
- Grok adaptive agent
- REINFORCE / ADVANCE / MENTOR

### Phase 3 — AI Tutor

- Grok chatbot
- Topic-specific explanations
- Explain incorrect answers
- Generate practice questions
- Personalized study guidance

### Phase 4 — Mentor

- Mentor request
- Student's performance summary
- Reason for referral
- Mentor dashboard

---

# 32. Strongest Demo Scenario

For the hackathon, demonstrate one topic completely.

```text
Student
 ↓
Physics
 ↓
Electromagnetism
 ↓
Easy Exam
 ↓
55%
 ↓
REINFORCE
 ↓
Practice
 ↓
Easy Exam
 ↓
78%
 ↓
Continue
 ↓
Easy Exam
 ↓
91%
 ↓
ADVANCE
 ↓
Medium Exam
 ↓
88%
 ↓
ADVANCE
 ↓
Hard Exam
```

Then show a second scenario:

```text
Another student
 ↓
Physics
 ↓
Electromagnetism
 ↓
Easy Exam
 ↓
42%
 ↓
REINFORCE
 ↓
42%
 ↓
REINFORCE
 ↓
39%
 ↓
MENTOR
```

This clearly proves that your system is not just an exam platform. It is an **adaptive learning agent**.

---

# 33. Final Architecture Summary

```text
                    ┌───────────────────┐
                    │      STUDENT      │
                    └─────────┬─────────┘
                              │
                              v
                    ┌───────────────────┐
                    │    REACT APP      │
                    │                   │
                    │ Profile           │
                    │ Dashboard         │
                    │ Subject           │
                    │ Topic             │
                    │ Exam              │
                    │ Results           │
                    │ AI Chat           │
                    └─────────┬─────────┘
                              │
                         REST / JWT
                              │
                              v
                    ┌───────────────────┐
                    │ Django REST API   │
                    └─────────┬─────────┘
                              │
          +-------------------+-------------------+
          |                   |                   |
          v                   v                   v
     Exam Engine        Progress Engine      AI Chatbot
          |                   |                   |
          v                   v                   |
       MCQs              Score History            |
       Evaluation        Topic Mastery            |
       Difficulty        Trend                    |
          |                   |                   |
          +---------+---------+                   |
                    |                             |
                    v                             v
             ┌────────────────┐             ┌───────────┐
             │ Adaptive Agent │             │ Grok LLM  │
             │                │             │           │
             │ Learner data   │             │ AI Tutor  │
             │ + history      │             └───────────┘
             └───────┬────────┘
                     |
          +----------+----------+
          |          |          |
          v          v          v
      REINFORCE   ADVANCE     MENTOR
          |          |          |
          v          v          v
      Practice    Increase    Mentor
      Questions   Difficulty  Request
                     |
                     v
               PostgreSQL
```

## Final Tech Stack

```text
Frontend       → React.js + Tailwind CSS
Backend        → Django + Django REST Framework
Database       → PostgreSQL
AI             → Grok API
Authentication → JWT
Charts         → Recharts
API Client     → Axios
Version Control→ Git + GitHub
Deployment     → Vercel + Render/Railway
```

**Core differentiator:** the system doesn't simply recommend content based on one score. It maintains a **topic-level learning history**, evaluates the current result against previous attempts, dynamically changes **Easy → Medium → Hard** on the same topic, falls back to reinforcement when performance drops, and escalates to a **mentor when repeated intervention fails**.
