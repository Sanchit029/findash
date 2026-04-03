# FinDash - Project Documentation

A complete walkthrough of the project — how it works, why I built it this way, and assumptions I made.

---

## Overview

FinDash is a finance dashboard backend where different users (viewer, analyst, admin) interact with financial records based on their role. Built with the MERN stack.

The backend handles user management, financial record CRUD, role-based access, and dashboard analytics. The frontend is a React app that consumes these APIs.

---

## How It's Structured

```
backend/
├── config/db.js          → MongoDB connection
├── models/               → Mongoose schemas (User, Record)
├── middleware/            → Auth, role check, validation
├── controllers/          → Business logic for each feature
├── routes/               → API route definitions
├── seeds/seed.js         → Populates test data
└── server.js             → Express entry point

frontend/src/
├── context/AuthContext    → Login state management
├── components/           → Navbar, ProtectedRoute
├── pages/                → Dashboard, Records, Users, Login
└── styles/               → CSS
```

I used a basic MVC pattern — models handle data, controllers handle logic, routes map URLs. Kept it simple and didn't add a service layer since the business logic isn't complex enough to need one.

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Logged in | Get current user |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (?role=, ?isActive=, ?page=, ?limit=) |
| GET | `/api/users/:id` | Get one user |
| PATCH | `/api/users/:id` | Update role/status |
| DELETE | `/api/users/:id` | Deactivate user |

### Records
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/records` | Admin | Create record |
| GET | `/api/records` | Analyst, Admin | List with filters (?type=, ?category=, ?search=, ?startDate=, ?endDate=, ?page=, ?limit=, ?sortBy=, ?order=) |
| GET | `/api/records/:id` | Analyst, Admin | Get one record |
| PUT | `/api/records/:id` | Admin | Update record |
| DELETE | `/api/records/:id` | Admin | Soft delete |

### Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard/summary` | All roles | Income, expense, balance totals |
| GET | `/api/dashboard/category-summary` | All roles | Category-wise breakdown |
| GET | `/api/dashboard/monthly-trends` | All roles | Monthly trends (?year=) |
| GET | `/api/dashboard/recent-records` | All roles | Last 5 records |

---

## Role-Based Access

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View Dashboard | Yes | Yes | Yes |
| View Records | No | Yes | Yes |
| Create/Edit/Delete Records | No | No | Yes |
| Manage Users | No | No | Yes |

This is enforced via a `roleCheck` middleware factory. The idea is simple — instead of writing separate `isAdmin`, `isAnalyst` functions, I wrote one that takes the allowed roles as arguments:

```js
roleCheck("admin")            // only admins
roleCheck("analyst", "admin") // both
```

Each route chains middleware in order: authenticate → roleCheck → validate → controller. If any step fails, the request stops there.

---

## Database Design

### User
- name, email (unique), password (bcrypt hashed), role, isActive
- `pre("save")` hook hashes password automatically
- `toJSON()` strips password from API responses

### Record
- amount, type (income/expense), category (from predefined list), date, notes, createdBy (ref to User), isDeleted
- Indexes on `date`, `type + category`, `createdBy`, and `isDeleted + date` for query performance
- `pre(/^find/)` hook automatically excludes soft-deleted records

### Why soft delete?
It's a finance app. I didn't want data to be permanently lost. Setting `isDeleted: true` means records can be recovered, and it keeps audit trails intact. The query middleware handles the filtering automatically so controllers don't need to worry about it.

---

## Validation & Errors

Input validation happens at two levels:
1. **Route level** — express-validator checks fields before the controller runs
2. **Schema level** — Mongoose rejects invalid data even if route validation is bypassed

I split record validation into `createValidation` (fields required) and `updateValidation` (fields optional) because you should be able to update just the amount without resending the whole record.

Error responses use consistent status codes:
- 400 → bad input
- 401 → not logged in
- 403 → wrong role
- 404 → not found
- 500 → server error

The global error handler in `server.js` catches CastError (invalid MongoDB IDs), ValidationError, and duplicate key errors so they return clean responses instead of crashing.

---

## Dashboard Analytics

The summary endpoints use MongoDB aggregation pipelines instead of fetching all records and looping through them in JS. This is more efficient since the database handles the math and only returns the final numbers.

For example, the summary endpoint groups all records and calculates income/expense totals in a single query using `$cond` inside `$group`. The monthly trends endpoint uses `$year` and `$month` operators to group by time period.

---

## Design Decisions & Trade-offs

**Why MongoDB over PostgreSQL?**
The records are self-contained documents with no complex joins needed. MongoDB's aggregation pipeline also fits the dashboard requirements well. That said, PostgreSQL would be better in production for ACID compliance — I chose MongoDB because it let me move faster for this scope.

**Why JWT over sessions?**
JWT is stateless and works well when frontend and backend are separate apps. I know localStorage isn't the safest place for tokens (XSS risk) — in production I'd use httpOnly cookies instead. Token expiry is set to 7 days which is too long for a real app, but fine for a demo.

**Why Context API over Redux?**
The only global state is the logged-in user. React Context handles that without adding another dependency. Each page manages its own data fetching independently.

**Why not a service layer?**
Controllers talk directly to Mongoose models. The logic isn't complex enough to justify an extra layer — it would just be pass-through functions at this point. I'd add one if the business logic grew (like if record creation needed to trigger notifications).

---

## Assumptions

1. Registration is open and users can pick their own role (in production, only admins would assign roles)
2. All amounts are in INR
3. Categories are predefined — users pick from a fixed list
4. JWT expires in 7 days (would be shorter with refresh tokens in production)
5. MongoDB runs locally — update MONGO_URI in .env for Atlas
6. No rate limiting or email verification (mentioned as optional in the assignment)

---

## What I'd Improve With More Time

- Rate limiting on login to prevent brute force
- Refresh tokens for better auth security
- Tests with Jest + Supertest
- Structured logging with Winston instead of console.error
- Docker Compose for one-command setup
- CSV export for analysts
