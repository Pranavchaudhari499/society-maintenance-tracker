<div align="center">

# 🏢 Society Maintenance Tracker

**AI-Assisted Maintenance Complaint Management Platform**
Built with Node.js, Express, React & PostgreSQL

An end-to-end platform where residents raise and track maintenance complaints with photo evidence, admins manage them through a full status-history workflow with priority and overdue detection, and everyone stays informed through a notice board and automated email notifications.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

[🌐 Live App](https://society-maintenance-tracker-vert.vercel.app/login) · [⚙️ API Base URL](#) · [📘 API Docs](#api-documentation) · [🎥 Demo Video](#)

</div>

---
### 🔑 Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@greenparksociety.com` | `Admin@2026` |
| Resident | `amit.kulkarni@example.com` | `resident123` |

> **Note:** Email notifications may land in the **Spam/Junk folder** rather than the inbox, since the sending domain isn't verified with custom DNS. This is expected — please check Spam when testing status-change or notice emails.

## Features

- Role-based auth (Resident / Admin) with JWT
- Residents raise complaints with category, description, and up to 5 photos
- **Automated Emergency Routing**: The system analyzes complaint descriptions for critical keywords (e.g., "fire", "emergency") and automatically escalates them to **High Priority**.
- Full status history on every complaint (Open → In Progress → Resolved), each change timestamped with an actor and optional note
- In-app notifications: users receive a persisted notification (read/unread) whenever their complaint status changes or an important notice is posted
- Complaints are locked once Resolved — no further edits
- Admin filtering by category, status, and date range
- Priority levels (Low / Medium / High), admin-settable
- Configurable overdue detection (admin-editable threshold, default 7 days) — computed dynamically at query time, never stored as a stale flag
- Notice board with pinned "important" notices
- Email notifications on complaint status change and on important notice posts
- Admin dashboard: totals by status, by category, and overdue count
- **Modern UI/UX**: Fully responsive, mobile-first design featuring a stunning glassmorphic 3D floating navigation pill, smooth gradients, and interactive micro-animations.
- AI assistant chatbot (bonus, beyond spec) — dual-persona based on role: residents can describe an issue in natural language and the assistant can create a complaint on their behalf; admins can ask for live database metrics (counts by status/priority)
## Bonus Feature: AI Assistant

Beyond the core spec, the app includes an AI-powered chatbot (`POST /chatbot`) using Groq's `llama-3.1-8b-instant` for fast function-calling:

- **Resident view**: a support-style assistant that can answer questions and, when appropriate, create a complaint directly via a `create_complaint` tool call
- **Admin view**: a data-analyst-style assistant that can summarize live dashboard metrics on request

This is an experimental addition on top of the required feature set and is not part of the core evaluated scope. Requires a free API key from [console.groq.com](https://console.groq.com).

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Client — Vercel"]
        A["React + Vite + TypeScript<br/>Tailwind CSS"]
    end

    subgraph Server["Backend — Render"]
        B["Express + TypeScript API"]
        B1["JWT Auth Middleware"]
        B2["Zod Validation Layer"]
        B3["Prisma ORM"]
    end

    subgraph Data["Data Layer"]
        C[("PostgreSQL<br/>Render")]
    end

    subgraph External["External Services"]
        D["Cloudinary<br/>Photo Storage"]
        E["Email API<br/>Status & Notice Alerts"]
        F["Groq LLM<br/>AI Assistant (bonus)"]
    end

    A -- "HTTPS + JWT" --> B
    B --> B1 --> B2 --> B3
    B3 --> C
    B -- "Upload photos" --> D
    B -- "Send notifications" --> E
    B -- "Chatbot requests" --> F
```

## Project Structure

```
society-tracker/
├── backend/          # Express + TypeScript API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── config/
│   └── prisma/
│       ├── schema.prisma
│       └── seed.ts
└── frontend/         # React + Vite
    └── src/
        ├── pages/
        ├── components/
        ├── context/
        ├── api/
        └── assets/

```

## 🗄️ Database Schema

```mermaid
erDiagram
    USERS ||--o{ COMPLAINTS : raises
    USERS ||--o{ COMPLAINT_HISTORY : "acts on"
    USERS ||--o{ NOTICES : posts
    USERS ||--o{ NOTIFICATIONS : receives
    COMPLAINTS ||--o{ COMPLAINT_MEDIA : has
    COMPLAINTS ||--o{ COMPLAINT_HISTORY : has

    USERS {
        uuid id PK
        string name
        string email UK
        string passwordHash
        string phone
        string flatNo
        string wing
        enum role
        datetime createdAt
    }
    COMPLAINTS {
        uuid id PK
        uuid residentId FK
        enum category
        string description
        enum status
        enum priority
        datetime createdAt
        datetime updatedAt
    }
    COMPLAINT_MEDIA {
        uuid id PK
        uuid complaintId FK
        string url
        string type
        datetime uploadedAt
    }
    COMPLAINT_HISTORY {
        uuid id PK
        uuid complaintId FK
        enum oldStatus
        enum newStatus
        uuid changedBy FK
        string note
        datetime createdAt
    }
    NOTICES {
        uuid id PK
        string title
        string body
        boolean isImportant
        uuid postedBy FK
        datetime createdAt
    }
    NOTIFICATIONS {
        uuid id PK
        uuid userId FK
        string title
        string message
        boolean isRead
        datetime createdAt
    }
    SETTINGS {
        uuid id PK
        string key UK
        string value
        datetime updatedAt
    }
```

## 📸 Screenshots

### Admin View

| Dashboard & Analytics | Complaint Management |
|---|---|
| ![Admin Dashboard](docs/screenshots/admin-dashboard.png) | ![Admin Complaints](docs/screenshots/admin-complaints.png) |

| Notice Management |
|---|
| ![Admin Notices](docs/screenshots/admin-notices.png) |

### Resident View

| Dashboard | My Complaints |
|---|---|
| ![Resident Dashboard](docs/screenshots/resident-dashboard.png) | ![Resident Complaints](docs/screenshots/resident-complaints.png) |

| Raise a Complaint | Complaint Status Timeline |
|---|---|
| ![Raise Complaint](docs/screenshots/resident-raise-complaint.png) | ![Complaint Status](docs/screenshots/resident-complaint-status.png) |

| AI Assistant Chatbot |
|---|
| ![Chatbot](docs/screenshots/resident-chatbot.png) |

## Setup Guide

### Prerequisites
- Node.js (LTS)
- A PostgreSQL database (e.g. a free [Render](https://render.com) Postgres instance)
- A [Cloudinary](https://cloudinary.com) account (free tier)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) generated (requires 2-Step Verification enabled)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd society-tracker

cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` in both `backend/` and `frontend/`, and fill in the values (see Environment Variables below).

### 3. Set up the database

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

### 4. Run the app locally

```bash
# terminal 1
cd backend
npm run dev

# terminal 2
cd frontend
npm run dev
```

Backend runs on `http://localhost:5000`, frontend on `http://localhost:5173`.

## Environment Variables

**`backend/.env`**
```
PORT=5000
DATABASE_URL="postgres://user:password@host:5432/dbname"

JWT_SECRET="a-long-random-string"
JWT_EXPIRES_IN="7d"

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

SENDGRID_API_KEY=
EMAIL_FROM=""

GROQ_API_KEY=""

DEFAULT_OVERDUE_THRESHOLD_DAYS=7
```

**`frontend/.env`**
```
VITE_API_URL=""
```

## Seed Data

Running `npx prisma db seed` creates:

- **Admin account**: `admin@greenparksociety.com` / `Admin@2026`
- **3 resident accounts** (all share the password `resident123`):
  - `amit.kulkarni@example.com` — Amit Kulkarni (Flat 101, Wing A)
  - `priya.deshmukh@example.com` — Priya Deshmukh (Flat 204, Wing B)
  - `rohan.patil@example.com` — Rohan Patil (Flat 305, Wing A)
- **6 complaints** spanning all three statuses and 6 of 7 categories, including:
  - One fully Resolved complaint (demonstrates the complete history lifecycle and the resolved-lock)
  - Two complaints backdated past the default 7-day overdue threshold — one Open, one In Progress — to demonstrate overdue detection out of the box
- **2 notices**, one marked important

> Note: admin accounts can only be created via this seed script — self-registration is restricted to the Resident role for security.

## API Documentation

All responses follow the shape `{ success: boolean, data?: ..., error?: { code, message } }`.

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new resident account |
| POST | `/auth/login` | Public | Log in, returns JWT |

### Complaints (Resident)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/complaints` | Resident | Create a complaint (multipart/form-data, `photos` field for up to 5 images) |
| GET | `/complaints/mine` | Resident | List own complaints with full history |
| GET | `/complaints/mine/:id` | Resident | Get one own complaint with history |

### Complaints (Admin)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin/complaints` | Admin | List all complaints. Query params: `category`, `status`, `from`, `to` (YYYY-MM-DD) |
| PATCH | `/admin/complaints/:id/status` | Admin | Update status (`OPEN`/`IN_PROGRESS`/`RESOLVED`), optional `note`. Blocked once Resolved |
| PATCH | `/admin/complaints/:id/priority` | Admin | Update priority (`LOW`/`MEDIUM`/`HIGH`). Blocked once Resolved |

### Settings (Admin)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin/settings/overdue-threshold` | Admin | Get current overdue threshold (days) |
| PATCH | `/admin/settings/overdue-threshold` | Admin | Update overdue threshold |

### Notices
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/notices` | Any authenticated user | List all notices, important ones pinned first |
| POST | `/notices` | Admin | Create a notice |
| PATCH | `/notices/:id` | Admin | Edit a notice |
| DELETE | `/notices/:id` | Admin | Delete a notice |

### Dashboard (Admin)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin/dashboard` | Admin | Totals by status, by category, and overdue count |

### Notifications
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/notifications` | Authenticated | Fetch current user's notifications |
| PATCH | `/notifications/:id/read` | Authenticated | Mark a specific notification as read |
| PATCH | `/notifications/read-all` | Authenticated | Mark all notifications as read |

### AI Assistant (Bonus)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/chatbot` | Resident or Admin | Role-aware assistant — residents get a `create_complaint` tool for logging issues via chat, admins get live dashboard metric summaries |


## Deployment

- **Backend + Database**: Render (Web Service + free PostgreSQL)
- **Frontend**: Vercel


## Known Simplifications

- Email is sent via SendGrid's HTTP API rather than SMTP, since Render's free tier blocks outbound SMTP connections — this was a deliberate architectural choice made after initially hitting that restriction.
- Email notifications may land in recipients' Spam folder rather than the inbox, since the sending domain isn't verified with custom DNS (would require owning and configuring a domain, out of scope here). Delivery itself is confirmed working — this is purely an inbox-placement issue common to any unverified sender.
- SendGrid's current free plan is a 60-day trial rather than a permanent free tier; this is sufficient for development and evaluation but would need a paid plan or a permanent-free alternative (e.g. Resend, Brevo) for long-term production use.
- Overdue detection is computed per-request rather than cached, which is fine at this scale but would warrant a materialized view or scheduled job at much higher complaint volumes.
- The AI assistant is an experimental bonus feature layered on top of the core spec. Tool-call outputs (e.g. complaint creation) should be validated through the same rules as the standard API before reaching the database — recommended as a follow-up hardening step.