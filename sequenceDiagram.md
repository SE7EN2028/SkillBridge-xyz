# Sequence Diagram — SkillBridge

This document describes the end-to-end sequence of interactions between actors and system components for all major flows in SkillBridge.

---

## System Components

| Component | Description |
|---|---|
| **iOS App** | SwiftUI client — all user interactions originate here |
| **Nginx** | Reverse proxy — routes requests to Express API |
| **Auth Middleware** | JWT verification layer on every protected route |
| **Controller** | HTTP handler — parses request, calls service, returns response |
| **Service** | Business logic layer — validates rules, orchestrates operations |
| **Repository** | Data access layer — all database queries live here |
| **PostgreSQL** | Primary relational database |
| **Cloudinary** | External file storage for certificates and photos |
| **Keychain** | iOS secure storage for JWT tokens |

---

## Flow 1 — User Registration

```mermaid
sequenceDiagram
    actor User as User (Guest)
    participant App as iOS App
    participant Nginx as Nginx
    participant AC as AuthController
    participant AS as AuthService
    participant AR as AuthRepository
    participant DB as PostgreSQL
    participant KC as Keychain

    User->>App: Fill name, email, password, role
    App->>App: Validate form fields locally
    App->>Nginx: POST /api/auth/register
    Nginx->>AC: Forward request

    AC->>AS: register(name, email, password, role)
    AS->>AR: findByEmail(email)
    AR->>DB: SELECT * FROM users WHERE email = ?
    DB-->>AR: null (no existing user)
    AR-->>AS: null

    AS->>AS: hashPassword(password) using bcrypt
    AS->>AR: createUser(name, email, hash, role)
    AR->>DB: INSERT INTO users (...)
    DB-->>AR: new User record
    AR-->>AS: User

    AS->>AS: generateAccessToken(userId, role)
    AS->>AS: generateRefreshToken(userId)
    AS->>AR: saveRefreshToken(userId, token, expiresAt)
    AR->>DB: INSERT INTO refresh_tokens (...)
    DB-->>AR: RefreshToken record
    AR-->>AS: RefreshToken

    AS-->>AC: { accessToken, refreshToken, user }
    AC-->>Nginx: 201 Created + tokens + user
    Nginx-->>App: Response

    App->>KC: Store accessToken securely
    App->>KC: Store refreshToken securely
    App->>App: Navigate to Dashboard
    App-->>User: Show Dashboard
```

---

## Flow 2 — User Login

```mermaid
sequenceDiagram
    actor User
    participant App as iOS App
    participant Nginx as Nginx
    participant AC as AuthController
    participant AS as AuthService
    participant AR as AuthRepository
    participant DB as PostgreSQL
    participant KC as Keychain

    User->>App: Enter email + password
    App->>Nginx: POST /api/auth/login
    Nginx->>AC: Forward request

    AC->>AS: login(email, password)
    AS->>AR: findByEmail(email)
    AR->>DB: SELECT * FROM users WHERE email = ?
    DB-->>AR: User record
    AR-->>AS: User

    AS->>AS: comparePassword(input, hash) bcrypt
    alt Password incorrect
        AS-->>AC: throw UnauthorizedError
        AC-->>App: 401 Unauthorized
        App-->>User: Show error message
    else Account suspended
        AS-->>AC: throw ForbiddenError
        AC-->>App: 403 Forbidden
        App-->>User: Account suspended message
    else Password correct + active
        AS->>AS: generateAccessToken(userId, role)
        AS->>AS: generateRefreshToken(userId)
        AS->>AR: saveRefreshToken(userId, token, expiresAt)
        AR->>DB: INSERT INTO refresh_tokens (...)
        DB-->>AR: saved
        AS-->>AC: { accessToken, refreshToken, user }
        AC-->>App: 200 OK + tokens + user
        App->>KC: Store accessToken
        App->>KC: Store refreshToken
        App-->>User: Navigate to Dashboard
    end
```

---

## Flow 3 — JWT Token Refresh

```mermaid
sequenceDiagram
    participant App as iOS App
    participant KC as Keychain
    participant Nginx as Nginx
    participant AC as AuthController
    participant AS as AuthService
    participant AR as AuthRepository
    participant DB as PostgreSQL

    App->>App: API call returns 401 (token expired)
    App->>KC: Read stored refreshToken
    App->>Nginx: POST /api/auth/refresh {refreshToken}
    Nginx->>AC: Forward request

    AC->>AS: refreshAccessToken(refreshToken)
    AS->>AR: findRefreshToken(token)
    AR->>DB: SELECT * FROM refresh_tokens WHERE token = ?
    DB-->>AR: RefreshToken record

    alt Token not found or revoked
        AS-->>AC: throw UnauthorizedError
        AC-->>App: 401 Unauthorized
        App->>KC: Clear all stored tokens
        App->>App: Redirect to Login
    else Token expired
        AS-->>AC: throw UnauthorizedError
        AC-->>App: 401 Unauthorized
        App->>KC: Clear all stored tokens
        App->>App: Redirect to Login
    else Token valid
        AS->>AS: verifyRefreshToken(token)
        AS->>AS: generateNewAccessToken(userId, role)
        AS->>AS: generateNewRefreshToken(userId)
        AS->>AR: revokeOldToken(oldToken)
        AR->>DB: UPDATE refresh_tokens SET is_revoked = true
        AS->>AR: saveRefreshToken(userId, newToken, expiresAt)
        AR->>DB: INSERT INTO refresh_tokens (...)
        AS-->>AC: { newAccessToken, newRefreshToken }
        AC-->>App: 200 OK + new tokens
        App->>KC: Replace stored tokens
        App->>App: Retry original API call
    end
```

---

## Flow 4 — Worker Creates Profile and Adds Skill

```mermaid
sequenceDiagram
    actor Worker
    participant App as iOS App
    participant KC as Keychain
    participant Nginx as Nginx
    participant AM as AuthMiddleware
    participant WC as WorkerController
    participant WS as WorkerService
    participant WR as WorkerRepository
    participant CL as Cloudinary
    participant DB as PostgreSQL

    Worker->>App: Fill profile (bio, city, hourly rate)
    App->>KC: Read accessToken
    App->>Nginx: POST /api/workers/profile {Bearer token}
    Nginx->>AM: Verify JWT

    AM->>AM: verifyAccessToken(token)
    AM->>AM: Check role == WORKER
    AM-->>WC: req.user = { userId, role }

    WC->>WS: createProfile(userId, profileData)
    WS->>WR: findByUserId(userId)
    WR->>DB: SELECT * FROM workers WHERE user_id = ?
    DB-->>WR: null

    WS->>WR: createWorker(userId, profileData)
    WR->>DB: INSERT INTO workers (...)
    DB-->>WR: Worker record
    WR-->>WS: Worker
    WS-->>WC: Worker
    WC-->>App: 201 Created + worker profile
    App-->>Worker: Profile created — now add skills

    Worker->>App: Fill skill name, years exp, upload certificate
    App->>CL: Upload certificate file directly
    CL-->>App: certificate_url

    App->>Nginx: POST /api/workers/skills {Bearer token, skillData, certificate_url}
    Nginx->>AM: Verify JWT
    AM-->>WC: req.user attached

    WC->>WS: addSkill(workerId, skillData)
    WS->>WR: findSkill(workerId, skillName)
    WR->>DB: SELECT * FROM skills WHERE worker_id = ? AND skill_name = ?
    DB-->>WR: null (not duplicate)

    WS->>WR: createSkill(workerId, skillData)
    WR->>DB: INSERT INTO skills (...)
    DB-->>WR: Skill record
    WR-->>WS: Skill
    WS-->>WC: Skill
    WC-->>App: 201 Created + skill
    App-->>Worker: Skill added — pending admin verification
```

---

## Flow 5 — Employer Searches and Views Workers

```mermaid
sequenceDiagram
    actor Employer
    participant App as iOS App
    participant Nginx as Nginx
    participant WC as WorkerController
    participant WS as WorkerService
    participant WR as WorkerRepository
    participant DB as PostgreSQL

    Employer->>App: Enter skill="electrician", city="Pune"
    App->>Nginx: GET /api/workers?skill=electrician&city=Pune&minRating=4&page=1
    Nginx->>WC: Forward request (no auth required)

    WC->>WS: searchWorkers(filters, pagination)
    WS->>WR: findWorkers(skill, city, minRating, page, limit)
    WR->>DB: SELECT w.*, u.name FROM workers w JOIN users u ON w.user_id = u.id JOIN skills s ON s.worker_id = w.id WHERE s.skill_name ILIKE ? AND w.city = ? AND w.avg_rating >= ? AND w.is_available = true ORDER BY w.avg_rating DESC LIMIT ? OFFSET ?
    DB-->>WR: Worker rows
    WR-->>WS: Worker[]
    WS-->>WC: { workers, total, page, totalPages }
    WC-->>App: 200 OK + paginated worker list
    App-->>Employer: Show worker cards with ratings

    Employer->>App: Tap on a specific worker
    App->>Nginx: GET /api/workers/:workerId
    Nginx->>WC: Forward request

    WC->>WS: getWorkerById(workerId)
    WS->>WR: findByIdWithSkillsAndReviews(workerId)
    WR->>DB: SELECT worker + skills + recent reviews
    DB-->>WR: Full worker data
    WR-->>WS: Worker with relations
    WS-->>WC: WorkerProfile
    WC-->>App: 200 OK + full profile
    App-->>Employer: Show worker detail page
```

---

## Flow 6 — Employer Posts a Job

```mermaid
sequenceDiagram
    actor Employer
    participant App as iOS App
    participant KC as Keychain
    participant Nginx as Nginx
    participant AM as AuthMiddleware
    participant RM as RoleMiddleware
    participant JC as JobController
    participant JS as JobService
    participant JR as JobRepository
    participant DB as PostgreSQL

    Employer->>App: Fill job title, skill, city, budget, description
    App->>KC: Read accessToken
    App->>Nginx: POST /api/jobs {Bearer token + jobData}
    Nginx->>AM: Verify JWT
    AM->>AM: verifyAccessToken(token)
    AM-->>RM: req.user attached
    RM->>RM: Check role == EMPLOYER
    RM-->>JC: Authorized

    JC->>JS: createJob(employerId, jobData)
    JS->>JS: validateJobData(jobData)
    JS->>JR: createJob(employerId, jobData)
    JR->>DB: INSERT INTO jobs (employer_id, title, skill_required, city, budget, status='OPEN')
    DB-->>JR: Job record
    JR-->>JS: Job
    JS-->>JC: Job
    JC-->>App: 201 Created + job
    App-->>Employer: Job posted successfully
```

---

## Flow 7 — Worker Applies to a Job

```mermaid
sequenceDiagram
    actor Worker
    participant App as iOS App
    participant KC as Keychain
    participant Nginx as Nginx
    participant AM as AuthMiddleware
    participant AC as ApplicationController
    participant AppS as ApplicationService
    participant AppR as ApplicationRepository
    participant JR as JobRepository
    participant DB as PostgreSQL

    Worker->>App: Browse job listings, tap Apply
    App->>KC: Read accessToken
    App->>Nginx: POST /api/jobs/:jobId/apply {Bearer token, coverNote}
    Nginx->>AM: Verify JWT
    AM-->>AC: req.user attached

    AC->>AppS: applyToJob(workerId, jobId, coverNote)

    AppS->>JR: findJobById(jobId)
    JR->>DB: SELECT * FROM jobs WHERE id = ?
    DB-->>JR: Job record
    JR-->>AppS: Job

    alt Job not OPEN
        AppS-->>AC: throw BadRequestError("Job is not open")
        AC-->>App: 400 Bad Request
        App-->>Worker: Job no longer available
    else Job is OPEN
        AppS->>AppR: findExistingApplication(jobId, workerId)
        AppR->>DB: SELECT * FROM applications WHERE job_id = ? AND worker_id = ?
        DB-->>AppR: null

        alt Already applied
            AppS-->>AC: throw ConflictError
            AC-->>App: 409 Conflict
            App-->>Worker: Already applied to this job
        else First application
            AppS->>AppR: createApplication(jobId, workerId, coverNote)
            AppR->>DB: INSERT INTO applications (job_id, worker_id, status='PENDING', cover_note)
            DB-->>AppR: Application record
            AppR-->>AppS: Application
            AppS-->>AC: Application
            AC-->>App: 201 Created + application
            App-->>Worker: Application submitted — awaiting response
        end
    end
```

---

## Flow 8 — Employer Accepts Application and Completes Job

```mermaid
sequenceDiagram
    actor Employer
    participant App as iOS App
    participant KC as Keychain
    participant Nginx as Nginx
    participant AM as AuthMiddleware
    participant AC as ApplicationController
    participant AppS as ApplicationService
    participant AppR as ApplicationRepository
    participant JR as JobRepository
    participant DB as PostgreSQL

    Employer->>App: View pending applications for a job
    App->>Nginx: GET /api/jobs/:jobId/applications {Bearer token}
    Nginx->>AM: Verify JWT
    AM-->>AC: req.user attached
    AC->>AppS: getApplicationsForJob(jobId, employerId)
    AppS->>AppR: findByJobId(jobId)
    AppR->>DB: SELECT * FROM applications WHERE job_id = ?
    DB-->>AppR: Application[]
    AppR-->>AppS: Application[]
    AppS-->>AC: Application[]
    AC-->>App: 200 OK + application list
    App-->>Employer: Show applicants

    Employer->>App: Tap Accept on chosen worker
    App->>Nginx: PUT /api/applications/:applicationId/status {status: ACCEPTED}
    Nginx->>AM: Verify JWT
    AM-->>AC: req.user attached

    AC->>AppS: updateApplicationStatus(applicationId, ACCEPTED, employerId)
    AppS->>AppR: findApplicationById(applicationId)
    AppR->>DB: SELECT * FROM applications WHERE id = ?
    DB-->>AppR: Application
    AppR-->>AppS: Application

    AppS->>AppS: Verify employer owns this job
    AppS->>AppR: updateStatus(applicationId, ACCEPTED)
    AppR->>DB: UPDATE applications SET status = 'ACCEPTED' WHERE id = ?
    DB-->>AppR: updated

    AppS->>JR: updateJobStatus(jobId, IN_PROGRESS)
    JR->>DB: UPDATE jobs SET status = 'IN_PROGRESS' WHERE id = ?
    DB-->>JR: updated

    AppS->>AppR: rejectOtherApplications(jobId, applicationId)
    AppR->>DB: UPDATE applications SET status = 'REJECTED' WHERE job_id = ? AND id != ?
    DB-->>AppR: updated

    AppS-->>AC: Updated Application
    AC-->>App: 200 OK
    App-->>Employer: Worker hired — job in progress

    Note over Employer,DB: --- Job execution happens offline ---

    Employer->>App: Tap Mark as Completed
    App->>Nginx: PUT /api/applications/:applicationId/status {status: COMPLETED}
    Nginx->>AM: Verify JWT
    AM-->>AC: req.user attached

    AC->>AppS: updateApplicationStatus(applicationId, COMPLETED, employerId)
    AppS->>AppR: updateStatus(applicationId, COMPLETED)
    AppR->>DB: UPDATE applications SET status = 'COMPLETED' WHERE id = ?
    DB-->>AppR: updated

    AppS->>JR: updateJobStatus(jobId, CLOSED)
    JR->>DB: UPDATE jobs SET status = 'CLOSED', closed_at = now() WHERE id = ?
    DB-->>JR: updated

    AppS-->>AC: Updated Application
    AC-->>App: 200 OK
    App-->>Employer: Job completed — you can now leave a review
```

---

## Flow 9 — Employer Leaves a Review

```mermaid
sequenceDiagram
    actor Employer
    participant App as iOS App
    participant KC as Keychain
    participant Nginx as Nginx
    participant AM as AuthMiddleware
    participant RC as ReviewController
    participant RS as ReviewService
    participant RR as ReviewRepository
    participant WR as WorkerRepository
    participant DB as PostgreSQL

    Employer->>App: Submit rating (4 stars) + written comment
    App->>KC: Read accessToken
    App->>Nginx: POST /api/reviews {Bearer token, applicationId, rating, comment}
    Nginx->>AM: Verify JWT
    AM-->>RC: req.user attached

    RC->>RS: createReview(employerId, applicationId, rating, comment)

    RS->>RR: findApplicationById(applicationId)
    RR->>DB: SELECT * FROM applications WHERE id = ?
    DB-->>RR: Application (status=COMPLETED)
    RR-->>RS: Application

    alt Application not COMPLETED
        RS-->>RC: throw BadRequestError
        RC-->>App: 400 Bad Request
        App-->>Employer: Cannot review — job not completed
    else Review already exists
        RS->>RR: findReviewByApplicationId(applicationId)
        RR->>DB: SELECT * FROM reviews WHERE application_id = ?
        DB-->>RR: existing Review
        RS-->>RC: throw ConflictError
        RC-->>App: 409 Conflict
        App-->>Employer: Already reviewed this job
    else Valid — create review
        RS->>RR: createReview(applicationId, employerId, workerId, rating, comment)
        RR->>DB: INSERT INTO reviews (application_id, employer_id, worker_id, rating, comment)
        DB-->>RR: Review record
        RR-->>RS: Review

        RS->>WR: recalculateAvgRating(workerId)
        WR->>DB: SELECT AVG(rating), COUNT(*) FROM reviews WHERE worker_id = ?
        DB-->>WR: { avgRating: 4.2, count: 11 }
        WR->>DB: UPDATE workers SET avg_rating = 4.2, total_reviews = 11 WHERE id = ?
        DB-->>WR: updated

        RS-->>RC: Review
        RC-->>App: 201 Created + review
        App-->>Employer: Review submitted — thank you
    end
```

---

## Flow 10 — Admin Verifies a Worker

```mermaid
sequenceDiagram
    actor Admin
    participant App as iOS App
    participant KC as Keychain
    participant Nginx as Nginx
    participant AM as AuthMiddleware
    participant RM as RoleMiddleware
    participant AC as AdminController
    participant AS as AdminService
    participant AR as AdminRepository
    participant WR as WorkerRepository
    participant DB as PostgreSQL

    Admin->>App: Open admin panel — view unverified workers
    App->>KC: Read accessToken
    App->>Nginx: GET /api/admin/workers/unverified {Bearer token}
    Nginx->>AM: Verify JWT
    AM-->>RM: req.user attached
    RM->>RM: Check role == ADMIN
    RM-->>AC: Authorized

    AC->>AS: getUnverifiedWorkers()
    AS->>AR: findUnverifiedWorkers()
    AR->>DB: SELECT * FROM workers WHERE is_verified = false
    DB-->>AR: Worker[]
    AR-->>AS: Worker[]
    AS-->>AC: Worker[]
    AC-->>App: 200 OK + unverified workers list
    App-->>Admin: Show list with certificate links

    Admin->>App: Review certificate, tap Verify
    App->>Nginx: PUT /api/admin/workers/:workerId/verify {Bearer token}
    Nginx->>AM: Verify JWT
    AM-->>RM: req.user attached
    RM->>RM: Check role == ADMIN
    RM-->>AC: Authorized

    AC->>AS: verifyWorker(adminId, workerId)
    AS->>WR: findWorkerById(workerId)
    WR->>DB: SELECT * FROM workers WHERE id = ?
    DB-->>WR: Worker record
    WR-->>AS: Worker

    AS->>WR: setVerified(workerId, true)
    WR->>DB: UPDATE workers SET is_verified = true WHERE id = ?
    DB-->>WR: updated

    AS->>AR: logAdminAction(adminId, VERIFY_WORKER, workerId)
    AR->>DB: INSERT INTO admin_logs (admin_id, action, target_type, target_id)
    DB-->>AR: AdminLog record

    AS-->>AC: { success: true }
    AC-->>App: 200 OK
    App-->>Admin: Worker verified — badge now visible in search
```

---

## Flow 11 — Logout

```mermaid
sequenceDiagram
    actor User
    participant App as iOS App
    participant KC as Keychain
    participant Nginx as Nginx
    participant AM as AuthMiddleware
    participant AC as AuthController
    participant AS as AuthService
    participant AR as AuthRepository
    participant DB as PostgreSQL

    User->>App: Tap Logout
    App->>KC: Read refreshToken
    App->>Nginx: POST /api/auth/logout {Bearer accessToken, refreshToken}
    Nginx->>AM: Verify JWT
    AM-->>AC: req.user attached

    AC->>AS: logout(userId, refreshToken)
    AS->>AR: revokeRefreshToken(refreshToken)
    AR->>DB: UPDATE refresh_tokens SET is_revoked = true WHERE token = ?
    DB-->>AR: updated
    AR-->>AS: done
    AS-->>AC: success

    AC-->>App: 200 OK
    App->>KC: Delete accessToken
    App->>KC: Delete refreshToken
    App->>App: Navigate to Login screen
    App-->>User: Logged out
```

---

## Flow Summary Table

| Flow | Actors | Key Components | Auth Required |
|---|---|---|---|
| 1. Register | Guest | AuthController → AuthService → AuthRepository | No |
| 2. Login | Any user | AuthController → AuthService → AuthRepository | No |
| 3. Token Refresh | System | AuthController → AuthService → AuthRepository | Refresh token |
| 4. Create Worker Profile + Add Skill | Worker | WorkerController → WorkerService → WorkerRepository → Cloudinary | Yes (Worker) |
| 5. Search Workers | Guest, Employer | WorkerController → WorkerService → WorkerRepository | No |
| 6. Post a Job | Employer | JobController → JobService → JobRepository | Yes (Employer) |
| 7. Apply to Job | Worker | ApplicationController → ApplicationService → ApplicationRepository | Yes (Worker) |
| 8. Accept Application + Complete Job | Employer | ApplicationController → ApplicationService → ApplicationRepository + JobRepository | Yes (Employer) |
| 9. Leave Review | Employer | ReviewController → ReviewService → ReviewRepository → WorkerRepository | Yes (Employer) |
| 10. Admin Verify Worker | Admin | AdminController → AdminService → AdminRepository + WorkerRepository | Yes (Admin) |
| 11. Logout | Any user | AuthController → AuthService → AuthRepository → Keychain | Yes |

---

## Error Handling Pattern

All flows follow a consistent error response pattern handled by the global `errorHandler` middleware:

```
Controller calls Service
    │
    ├── Service throws AppError (custom class)
    │       ├── UnauthorizedError  → 401
    │       ├── ForbiddenError     → 403
    │       ├── NotFoundError      → 404
    │       ├── ConflictError      → 409
    │       ├── BadRequestError    → 400
    │       └── ValidationError    → 422
    │
    └── errorHandler middleware catches and formats:
            {
              "status": "error",
              "code": 404,
              "message": "Worker not found"
            }
```

Every alternate flow shown in the diagrams above maps to one of these error types — giving the iOS app consistent, predictable error codes to display appropriate UI messages.