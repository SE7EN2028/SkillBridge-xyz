# SkillBridge

Production-ready full-stack platform for **SkillBridge** — a verified marketplace connecting blue-collar / gig workers with employers and households across India.

**Three apps in this monorepo:**

| App | Path | Stack |
|---|---|---|
| Backend API | `/src` | Node.js 20 + TypeScript + Express + Prisma (PostgreSQL) |
| Web frontend | `/web` | Vite + React 18 + TypeScript + Tailwind + Framer Motion + React Query |
| iOS app | `/ios` | SwiftUI (iOS 16+), async/await, MVVM, Keychain, animated dark UI |

Backend architecture: layered **Controller → Service → Repository** with full SOLID separation, JWT auth (access + refresh rotation), role-based access control (Worker / Employer / Admin), Cloudinary uploads, structured logging, rate limiting, helmet, CORS, compression, graceful shutdown, Jest unit + integration + E2E test suites, GitHub Actions CI/CD, Docker, PM2 + Nginx for AWS EC2.

Web frontend: animated mesh-gradient design, sticky glass nav, page transitions, list-item stagger, shimmer skeletons, React Query for server-state, automatic JWT refresh, role-aware routes (Worker / Employer / Admin dashboards).

iOS app: SwiftUI app shell with animated background, spring transitions, custom inputs, role picker, Keychain-backed refresh tokens, MVVM ViewModels.

See `web/` for the web app, `ios/README.md` for the iOS build instructions.

---

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Layout](#project-layout)
5. [Prerequisites](#prerequisites)
6. [Required Keys / Env Vars](#required-keys--env-vars)
7. [Local Setup](#local-setup)
8. [API Reference](#api-reference)
9. [Testing](#testing)
10. [Lint / Typecheck / Build](#lint--typecheck--build)
11. [Deployment](#deployment)
    - [GitHub Secrets](#1-github-secrets)
    - [AWS EC2 Provision](#2-provision-aws-ec2)
    - [PostgreSQL on AWS RDS](#3-postgresql-on-aws-rds)
    - [Cloudinary](#4-cloudinary)
    - [Domain + DNS](#5-domain--dns-route-53--cloudflare)
    - [SSH bootstrap host](#6-bootstrap-the-host)
    - [First deploy](#7-first-deploy)
    - [Nginx + TLS](#8-nginx--tls)
    - [Auto deploy on push](#9-auto-deploy-via-github-actions)
12. [Production Checklist](#production-checklist)

---

## Features

- JWT auth with refresh token rotation + revocation (hashed in DB)
- Worker / Employer / Admin roles with route-level RBAC
- Worker profiles (bio, city, hourly rate, photo)
- Skills with optional certificate uploads (Cloudinary)
- Job posting + search (skill, city, status filters, paginated)
- Worker search (skill, city, min rating, max rate)
- Application lifecycle: PENDING → ACCEPTED → COMPLETED (state machine enforced) + REJECTED / CANCELLED
- Reviews (1–5 stars) with auto-recomputed worker rating
- Admin: verify workers, toggle user active status, platform stats
- Helmet + CORS + compression + rate limiting
- Structured JSON logs (winston)
- Graceful SIGTERM/SIGINT shutdown
- Health check endpoint (`/api/v1/health`)

## Architecture

```
HTTP Client (iOS / web / curl)
        │
        ▼
   Nginx (TLS)            ← AWS EC2 / VPS
        │
        ▼
  Express App (PM2 cluster)
   ├── Routes        — wire URL → controller
   ├── Middleware    — auth, role, validation, rate-limit, errors
   ├── Controllers   — HTTP layer (req/res only, no business logic)
   ├── Services      — business rules, transactions, state machines
   └── Repositories  — only Prisma touches DB; behind interfaces (DI)
        │
        ▼
   PostgreSQL (Prisma ORM)
```

SOLID applied:

- **S**: each module has one responsibility (controller → HTTP, service → rules, repo → DB).
- **O**: services depend on repository *interfaces* (`IUserRepository`, etc.) — extensible without modification.
- **L**: any `IUserRepository` impl substitutes the default.
- **I**: interfaces are narrow (per-aggregate), not god repos.
- **D**: services receive repos through constructor injection (default singletons for runtime, fakes for tests).

## Tech Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js 20 |
| Language | TypeScript 5 (strict) |
| Framework | Express 4 |
| ORM | Prisma 5 |
| DB | PostgreSQL 16 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | Joi |
| Uploads | multer + Cloudinary |
| Security | helmet, cors, express-rate-limit |
| Logging | winston + morgan |
| Tests | Jest + ts-jest + supertest |
| Lint | ESLint + Prettier |
| Process mgr | PM2 (cluster mode) |
| Reverse proxy | Nginx |
| CI/CD | GitHub Actions |
| Container | Docker (optional) |
| Deploy | AWS EC2 + RDS |

## Project Layout

```
src/
  app.ts                   — express app factory
  server.ts                — entrypoint (start + graceful shutdown)
  config/                  — env, db, cloudinary
  middleware/              — auth, role, validation, rate-limit, errors, upload
  routes/                  — auth, workers, jobs, applications, reviews, admin
  controllers/             — HTTP handlers (thin)
  services/                — business logic
  repositories/            — Prisma access (interfaces + impls)
  validators/              — Joi schemas
  utils/                   — appError, jwt, hash, logger, pagination, catchAsync
  types/                   — shared TS types / DTOs
prisma/schema.prisma       — data model
tests/
  unit/                    — service + util tests (no DB)
  integration/             — supertest against built app (services mocked)
  e2e/                     — full hire-flow e2e (services mocked)
  helpers/                 — testSetup, testDb
.github/workflows/         — ci.yml, deploy.yml
nginx/skillbridge.conf
ecosystem.config.cjs       — PM2 config
scripts/setup.sh           — host bootstrap
scripts/deploy.sh          — host deploy
Dockerfile, .dockerignore
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+ (local docker or RDS)
- Cloudinary account (free tier OK) — only required if uploads are exercised

## Required Keys / Env Vars

Copy `.env.example` → `.env` and fill in:

| Key | Required | Where to get | Notes |
|---|---|---|---|
| `DATABASE_URL` | yes | local Postgres / AWS RDS | `postgresql://user:pass@host:5432/dbname` |
| `JWT_ACCESS_SECRET` | yes | generate yourself | `openssl rand -base64 48` — keep secret |
| `JWT_REFRESH_SECRET` | yes | generate yourself | different from access secret |
| `JWT_ACCESS_EXPIRES_IN` | no | default `15m` | |
| `JWT_REFRESH_EXPIRES_IN` | no | default `7d` | |
| `BCRYPT_SALT_ROUNDS` | no | default `10` | use `4` only in tests |
| `CLOUDINARY_CLOUD_NAME` | for uploads | https://console.cloudinary.com/ → Dashboard | |
| `CLOUDINARY_API_KEY` | for uploads | same dashboard | |
| `CLOUDINARY_API_SECRET` | for uploads | same dashboard | server-side only — never ship to client |
| `PORT` | no | default `4000` | |
| `CORS_ORIGIN` | no | comma-separated origins or `*` | tighten in prod |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | no | defaults `900000` / `100` | |
| `LOG_LEVEL` | no | `debug` / `info` / `warn` / `error` | |
| `NODE_ENV` | no | `development` / `production` / `test` | |

For deployment, the GitHub Actions workflow also expects these **GitHub Secrets**:

- `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, optional `EC2_PORT`

## Local Setup

```bash
git clone <repo>
cd SkillBridge-xyz
cp .env.example .env
# edit .env (DATABASE_URL, JWT_*, optional Cloudinary)

npm install
npx prisma generate
npx prisma migrate dev   # creates tables in your local DB

npm run dev              # tsx watch
# → http://localhost:4000/api/v1/health
```

## API Reference

Base path: `/api/v1`

### Auth (`/auth`)

| Method | Path | Body | Auth |
|---|---|---|---|
| POST | `/register` | `{ name, email, password, role: WORKER\|EMPLOYER }` | none |
| POST | `/login` | `{ email, password }` | none |
| POST | `/refresh` | `{ refreshToken }` | none |
| POST | `/logout` | `{ refreshToken }` | none |

### Workers (`/workers`)

| Method | Path | Body / Query | Auth |
|---|---|---|---|
| GET | `/` | `?skill=&city=&minRating=&maxRate=&isVerified=&page=&limit=` | public |
| GET | `/me` | — | WORKER |
| GET | `/:id` | — | public |
| POST | `/` | `{ city, hourlyRate, bio? }` | WORKER |
| PATCH | `/me` | `{ city?, bio?, hourlyRate?, isAvailable? }` | WORKER |
| POST | `/me/skills` | `{ skillName, yearsExp }` + multipart `certificate` | WORKER |
| DELETE | `/me/skills/:skillId` | — | WORKER |
| POST | `/me/photo` | multipart `photo` | WORKER |

### Jobs (`/jobs`)

| Method | Path | Body / Query | Auth |
|---|---|---|---|
| GET | `/` | `?skill=&city=&status=&employerId=&page=&limit=` | public |
| GET | `/:id` | — | public |
| POST | `/` | `{ title, description?, skillRequired, city, budget }` | EMPLOYER |
| PATCH | `/:id/status` | `{ status }` | EMPLOYER (owner) |
| DELETE | `/:id` | — | EMPLOYER (owner) |
| POST | `/:jobId/applications` | `{ coverNote? }` | WORKER |
| GET | `/:jobId/applications` | — | EMPLOYER (owner) |

### Applications (`/applications`)

| Method | Path | Body | Auth |
|---|---|---|---|
| GET | `/me` | — | WORKER |
| PATCH | `/:id/status` | `{ status: ACCEPTED\|REJECTED\|COMPLETED }` | EMPLOYER (owner) |
| POST | `/:id/cancel` | — | WORKER (owner, only if PENDING) |

### Reviews (`/reviews`)

| Method | Path | Body | Auth |
|---|---|---|---|
| POST | `/` | `{ applicationId, rating, comment? }` | EMPLOYER (owner of completed job) |
| GET | `/worker/:workerId` | — | public |

### Admin (`/admin`)

| Method | Path | Body | Auth |
|---|---|---|---|
| GET | `/workers/unverified` | — | ADMIN |
| PATCH | `/workers/:workerId/verify` | `{ verified: boolean }` | ADMIN |
| PATCH | `/users/:userId/active` | `{ isActive: boolean }` | ADMIN |
| GET | `/stats` | — | ADMIN |

All success responses: `{ "status": "success", "data": ... }` (paginated also include `meta`).
All errors: `{ "status": "error", "message": "...", "errors"?: { field: msg } }` with appropriate HTTP code (400/401/403/404/409/422/500).

## Testing

```bash
npm test                  # all suites
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:coverage
```

- **Unit** — services / utils with in-memory fake repos, no DB.
- **Integration** — supertest against the express app, services mocked at module boundary; verifies routing, auth, RBAC, validation, error-handler.
- **E2E** — full hire flow (register → profile → post job → apply → accept → complete → review).

## Lint / Typecheck / Build

```bash
npm run lint
npm run typecheck
npm run build             # → dist/
npm start                 # runs dist/server.js
```

## Deployment

End-to-end deploy onto AWS EC2 with PostgreSQL on RDS, fronted by Nginx + TLS, managed by PM2, auto-deployed on push to `main` via GitHub Actions.

### 1. GitHub Secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | What |
|---|---|
| `EC2_HOST` | Public IP or DNS of your EC2 instance |
| `EC2_USER` | usually `ubuntu` |
| `EC2_SSH_KEY` | private key contents (the matching `.pem` you downloaded) |
| `EC2_PORT` | optional, default `22` |

### 2. Provision AWS EC2

1. Sign in: https://console.aws.amazon.com/
2. Top-right region selector → pick e.g. `ap-south-1` (Mumbai).
3. Search bar → **EC2** → **Launch instance**.
4. **Name**: `skillbridge-prod`.
5. **AMI**: *Ubuntu Server 22.04 LTS (x86_64)*.
6. **Instance type**: `t3.small` (1 vCPU / 2 GB) for MVP.
7. **Key pair**: *Create new key pair* → RSA → `.pem` → **Download**. Save it; you'll paste it into `EC2_SSH_KEY`.
8. **Network settings → Edit**:
   - VPC: default
   - Subnet: any AZ
   - Auto-assign public IP: **Enable**
   - Security group: *Create*. Add inbound rules:
     - SSH (22) — Source: *My IP*
     - HTTP (80) — Source: *Anywhere*
     - HTTPS (443) — Source: *Anywhere*
9. **Storage**: 20 GB gp3.
10. **Launch instance**.
11. Wait until **Instance state = Running**. Copy the **Public IPv4 address** → this is `EC2_HOST`.

### 3. PostgreSQL on AWS RDS

1. Console → **RDS** → **Create database**.
2. **Standard create** → Engine = **PostgreSQL** → version 16.x.
3. **Templates**: *Free tier* (or *Production*).
4. **DB instance identifier**: `skillbridge-db`.
5. **Master username**: `skillbridge`. **Master password**: generate, **save it**.
6. **Instance class**: `db.t4g.micro`. Storage: 20 GB gp3.
7. **Connectivity**:
   - VPC: same as EC2.
   - Public access: **No** (preferred). Or **Yes** if you want to connect from your laptop.
   - VPC security group: *Create new* — call it `skillbridge-db-sg`.
8. **Additional configuration → Initial database name**: `skillbridge`.
9. **Create database**. Wait ~5 min for status = *Available*.
10. Click the DB → **Connectivity & security** → copy **Endpoint** (e.g. `skillbridge-db.xxx.ap-south-1.rds.amazonaws.com`).
11. Open the DB security group `skillbridge-db-sg` → **Inbound rules → Edit** → **Add rule** → *PostgreSQL (5432)* → Source = the **EC2 instance security group** (so only EC2 can connect). Save.

`DATABASE_URL` becomes: `postgresql://skillbridge:<PASSWORD>@<RDS_ENDPOINT>:5432/skillbridge`.

### 4. Cloudinary

1. Sign up / log in: https://console.cloudinary.com/
2. **Dashboard** → top section shows **Cloud name**, **API Key**, **API Secret**.
3. Copy these into `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
4. (Optional) **Settings → Security → Restricted media types** → upload restrictions if you want to harden.

### 5. Domain + DNS (Route 53 / Cloudflare)

1. Buy domain (Route 53 → **Registered domains → Register domain**, or any registrar).
2. **Route 53 → Hosted zones** → click your zone → **Create record**:
   - Record name: `api`
   - Type: **A**
   - Value: EC2 public IP
   - TTL: 300
3. Wait a couple of minutes for DNS propagation: `dig api.yourdomain.com`.

### 6. Bootstrap the host

From your laptop:

```bash
chmod 600 ~/Downloads/skillbridge-prod.pem
ssh -i ~/Downloads/skillbridge-prod.pem ubuntu@<EC2_HOST>
```

On the host:

```bash
sudo apt update
git clone https://github.com/<your-org>/SkillBridge-xyz.git /opt/skillbridge
cd /opt/skillbridge
bash scripts/setup.sh
```

`scripts/setup.sh` installs Node 20, PM2, Nginx, ufw, opens ports 22/80/443.

### 7. First deploy

Still on the host:

```bash
cd /opt/skillbridge
cp .env.example .env
nano .env     # fill DATABASE_URL (RDS), JWT_*, CLOUDINARY_*, NODE_ENV=production, CORS_ORIGIN=https://yourapp.com
bash scripts/deploy.sh
pm2 status    # should show 'skillbridge' online (cluster)
pm2 startup   # follow the printed sudo command to persist on reboot
pm2 save
curl -s http://127.0.0.1:4000/api/v1/health
```

### 8. Nginx + TLS

```bash
sudo cp /opt/skillbridge/nginx/skillbridge.conf /etc/nginx/sites-available/skillbridge
sudo sed -i 's/api.skillbridge.example.com/api.yourdomain.com/g' /etc/nginx/sites-available/skillbridge
sudo ln -sf /etc/nginx/sites-available/skillbridge /etc/nginx/sites-enabled/skillbridge
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

TLS (Let's Encrypt):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
sudo systemctl reload nginx
```

Verify: `curl -s https://api.yourdomain.com/api/v1/health`.

### 9. Auto deploy via GitHub Actions

Once the host is bootstrapped and the GitHub Secrets are set, every push to `main` runs `.github/workflows/deploy.yml` → SSH → `git pull` → install / migrate / build / `pm2 reload`.

## Production Checklist

- [ ] `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are 32+ random bytes, **different** from each other
- [ ] `CORS_ORIGIN` set to your real frontend origin(s), not `*`
- [ ] `RATE_LIMIT_MAX` tuned for traffic
- [ ] RDS in same VPC as EC2, public access **off**
- [ ] RDS automated backups + minor version upgrades enabled
- [ ] EC2 security group SSH locked to your IP only
- [ ] Cloudinary API secret never exposed to client apps
- [ ] PM2 startup persisted (`pm2 startup` + `pm2 save`)
- [ ] Logs rotated (e.g. `pm2 install pm2-logrotate`)
- [ ] Monitoring / alerts (CloudWatch, Datadog, Sentry — your choice)
- [ ] DB migrations run via `prisma migrate deploy` (not `migrate dev`) on prod

---

## License

MIT.
