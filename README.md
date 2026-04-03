# FinDash - Finance Dashboard

Full-stack MERN app for managing financial records with role-based access control.

Built with Node.js, Express, MongoDB, React (Vite), and Recharts.

## Setup

### Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas)

### Install & Run

```bash
# Backend
cd backend
npm install
npm run seed    # creates test data
npm run dev     # starts on port 5001

# Frontend (separate terminal)
cd frontend
npm install
npm run dev     # starts on port 3000
```

### Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Analyst | analyst@example.com | analyst123 |
| Viewer | viewer@example.com | viewer123 |

## What It Does

- **Auth** — JWT login/register with bcrypt password hashing
- **3 Roles** — Viewer (dashboard only), Analyst (+ records), Admin (full access)
- **Records CRUD** — Create, read, update, soft-delete financial records
- **Dashboard** — Summary cards, bar/pie/line charts using MongoDB aggregation
- **Filtering** — By type, category, date range, and text search
- **Pagination** — On both records and users list
- **Validation** — express-validator on inputs, global error handler for edge cases

## Project Structure

```
backend/
├── config/db.js        # MongoDB connection
├── models/             # User, Record schemas
├── middleware/          # auth, roleCheck, validate
├── controllers/        # business logic
├── routes/             # API endpoints
├── seeds/seed.js       # test data generator
└── server.js           # entry point

frontend/src/
├── context/            # auth state (Context API)
├── components/         # Navbar, ProtectedRoute
├── pages/              # Dashboard, Records, Users, Login
└── styles/             # CSS
```

## Docs

See [DOCUMENTATION.md](./DOCUMENTATION.md) for API reference, design decisions, assumptions, and trade-offs.

## Environment Variables

Copy `backend/.env.example` to `backend/.env` (already done with defaults):

```
PORT=5001
MONGO_URI=mongodb://localhost:27017/finance-dashboard
JWT_SECRET=my-super-secret-key-change-in-production
```
