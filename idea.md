# SkillBridge — Project Idea

## Overview

SkillBridge is a full-stack, two-sided marketplace platform that connects **verified blue-collar and gig workers** with **employers and households** across India. Workers can create verified digital profiles, list their skills, and get hired. Employers can search, filter, and hire workers with confidence — backed by ratings, reviews, and verified credentials.

The platform addresses a critical gap: over **500 million workers** in India's unorganised sector (electricians, plumbers, carpenters, tailors, drivers, domestic helpers) have no digital identity, no verifiable work history, and no structured way to find consistent work. SkillBridge gives them one.

---

## Problem Statement

| Problem | Impact |
|---|---|
| Workers have no digital proof of skills | Employers cannot trust unverified strangers |
| No structured hiring channel exists | Workers depend entirely on word-of-mouth |
| Middlemen take 30–50% of worker earnings | Workers earn far less than their fair rate |
| No work history or reputation system | Good workers go unrecognised |
| No transparent pricing | Both sides operate without fair pay standards |

---

## Solution

SkillBridge provides:

- A **verified worker profile** — skills, experience, certifications, hourly rate, and a reputation score built from employer reviews
- A **searchable skill marketplace** — employers filter workers by skill, city, rating, availability, and price range
- A **structured hiring flow** — job post → application → hire request → acceptance → completion → review
- A **digital work history** — every completed job adds to the worker's verifiable track record
- An **admin verification layer** — platform admins verify credentials before a worker is marked "Verified"

---

## Scope

### In Scope (MVP)

- User registration and login with role selection (Worker / Employer / Admin)
- JWT-based authentication with refresh token rotation
- Worker profile creation — bio, city, skills, certifications, hourly rate
- Skill listing and management per worker
- Employer job posting with skill requirements and budget
- Worker search with filters (skill, city, min rating, max rate)
- Hire request flow — employer sends request, worker accepts or rejects
- Application status tracking (Pending → Accepted → Completed / Rejected)
- Post-job ratings and reviews (employer rates worker)
- Admin dashboard — verify workers, view platform stats, suspend accounts
- Role-based access control across all routes
- File uploads for skill certificates (via Cloudinary)
- GitHub Actions CI/CD pipeline
- Automated deployment to AWS EC2
- iOS native app (SwiftUI) consuming the REST API

### Out of Scope (Future Versions)

- In-app payment processing (Razorpay / Stripe integration)
- Real-time chat between worker and employer
- GPS-based location matching
- Android app
- Push notifications
- AI-based worker recommendations
- Subscription plans and premium listings
- Multi-language support (Hindi, Marathi)

---

## Key Features

### 1. Authentication & Roles
- Secure registration with email and password
- bcrypt password hashing, JWT access + refresh tokens
- Three roles: **Worker**, **Employer**, **Admin**
- Role-based middleware protecting every route

### 2. Worker Profiles
- Full profile: name, bio, city, photo, hourly rate, availability status
- Skills section: skill name, years of experience, certificate upload
- Verification badge once admin approves credentials
- Average rating calculated from all completed job reviews

### 3. Smart Search & Discovery
- Search workers by skill category (e.g. "electrician", "plumber")
- Filter by city, minimum rating, maximum hourly rate
- Paginated results sorted by rating (default) or rate
- Public profiles — no login needed to browse

### 4. Job & Hiring Flow
- Employers post jobs with title, required skill, city, budget, description
- Workers apply to open jobs OR employers send direct hire requests
- Application states: `PENDING` → `ACCEPTED` / `REJECTED` → `COMPLETED`
- Both worker and employer dashboards show live status

### 5. Reviews & Reputation
- Employers leave a rating (1–5 stars) and written review after job completion
- Worker's average rating updates automatically
- Reviews are public on worker profiles
- Only one review allowed per completed job

### 6. Admin Panel
- View all unverified workers pending approval
- Approve or reject worker verification requests
- Suspend or remove users violating platform policies
- View total users, jobs posted, and hires completed

---

## Target Users

| User | Who they are | What they need |
|---|---|---|
| Worker | Electrician, plumber, carpenter, tailor, driver, domestic helper | A verified digital identity, consistent job flow, fair pay |
| Employer | Households, small businesses, contractors | Trusted, vetted workers they can hire quickly |
| Admin | Platform operator | Tools to verify, moderate, and maintain trust |

---

## Tech Stack Summary

| Layer | Technology | Reason |
|---|---|---|
| Backend API | Node.js + Express | Fast, scalable REST API |
| Database | PostgreSQL + Prisma ORM | Relational data with strong integrity |
| Auth | JWT + bcrypt | Stateless, secure authentication |
| File Storage | Cloudinary | Certificate and photo uploads |
| iOS Frontend | Swift + SwiftUI | Native iOS performance |
| CI/CD | GitHub Actions | Automated test + deploy pipeline |
| Hosting | AWS EC2 + Nginx + PM2 | Production-grade backend deployment |
| Testing | Jest + Supertest + XCTest | Unit, integration, and UI tests |

---

## Architecture Summary

```
iOS App (SwiftUI)
      │
      │  HTTPS / JSON
      ▼
Nginx Reverse Proxy            ← AWS EC2
      │
      ▼
Express REST API
  ├── Controllers   (HTTP layer)
  ├── Services      (business logic)
  └── Repositories  (database layer)
      │
      ▼
PostgreSQL via Prisma ORM
```

The backend follows a clean **Controller → Service → Repository** layered architecture with OOP principles applied throughout:

- **Encapsulation** — each module owns its logic and exposes only a clean interface
- **Abstraction** — controllers never touch the database directly
- **Single Responsibility** — one file, one job
- **Repository Pattern** — data access is fully abstracted from business logic
- **Service Layer Pattern** — business rules live in services, not routes

---

## Why This Project Matters

SkillBridge is not a demo — it solves a real, large-scale problem. The Indian gig economy is worth over ₹455 billion and growing. Yet the workers who power it remain invisible, underpaid, and unverified. A platform that gives them a verified digital identity, connects them with fair employers, and builds their reputation over time has genuine social and economic impact.

This project demonstrates:

- Full-stack engineering with a decoupled API + native mobile client
- Production-quality backend with proper layering and design patterns
- Complete CI/CD pipeline with automated testing and cloud deployment
- Real-world system design decisions explained and justified

---

## Future Roadmap

| Phase | Feature |
|---|---|
| v2.0 | In-app payments with escrow (Razorpay) |
| v2.0 | Real-time chat (Socket.io) |
| v2.1 | Android app (React Native or Kotlin) |
| v2.1 | Push notifications (FCM) |
| v3.0 | AI-based worker recommendations |
| v3.0 | Vernacular language support (Hindi, Marathi, Tamil) |
| v3.0 | Worker income insurance and fintech products |