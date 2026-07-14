# Society Maintenance Tracker

A platform for apartment societies to manage maintenance complaints end-to-end: residents raise complaints with photos, admins triage and resolve them through a tracked status workflow, and everyone stays informed through a notice board and email notifications.

## Quick Links

- **Live URL:** [https://society-maintenance-tracker-vert.vercel.app/login](https://society-maintenance-tracker-vert.vercel.app/login)

### Test Credentials
You can easily log in and test the deployed application using these seeded admin account:

- **Admin Account**: `admin@greenparksociety.com` | Password: `Admin@2026`

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (hosted on Render) |
| ORM | Prisma |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Photo Storage | Cloudinary |
| Email | Twilio SendGrid (Nodemailer) |
| Auth | JWT, bcrypt |
| Validation | Zod |
| Hosting | Backend + DB on Render, Frontend on Vercel |

## Features

- Role-based auth (Resident / Admin) with JWT
- Residents raise complaints with category, description, and up to 5 photos
- **Automated Emergency Routing**: The system analyzes complaint descriptions for critical keywords (e.g., "fire", "emergency") and automatically escalates them to **High Priority**.
- Full status history on every complaint (Open → In Progress → Resolved), each change timestamped with an actor and optional note
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
| POST | `/chatbot` | Resident or Admin | Role-aware assistant. Residents get complaint support with a `create_complaint` tool

## Database Schema

See `backend/prisma/schema.prisma` for the full source of truth. Key design points:

- **`complaint_history`** is an append-only log of every status change (`old_status`, `new_status`, `changed_by`, `note`, `created_at`) — a complaint's current status is denormalized onto the `complaints` row for fast filtering, but the history table is the audit trail of record.
- **`complaint_media`** is normalized into its own table (rather than a single `photo_url` column) to support multiple photos per complaint.
- **`notifications`** acts as the persistence layer for the real-time Server-Sent Events engine, ensuring users never lose a notification even if they refresh the page.
- **`settings`** is a generic key-value table, currently used for the admin-configurable overdue threshold, extensible to future settings without new migrations.
- Overdue status is **never stored** — it's computed at query time from `created_at` and the current threshold, so it's always accurate even if the threshold changes.

## Deployment

- **Backend + Database**: Render (Web Service + free PostgreSQL)
- **Frontend**: Vercel


## Known Simplifications

- Email delivery is configured using Twilio SendGrid instead of a personal Gmail account, making the system production-ready and avoiding rate limits.
- Overdue detection is computed per-request rather than cached, which is fine at this scale but would warrant a materialized view or scheduled job at much higher complaint volumes.
- The AI assistant is an experimental bonus feature layered on top of the core spec. Tool-call outputs (e.g. complaint creation) should be validated through the same rules as the standard API before reaching the database — recommended as a follow-up hardening step.