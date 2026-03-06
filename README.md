# 🏦 Zeno Bank — Banking Ledger

A production-grade full-stack banking ledger built with **Next.js**, **PostgreSQL**, and **Drizzle ORM**. Implements real double-entry bookkeeping principles with atomic transactions, idempotency, and a full audit trail — complete with a **Neobrutalist frontend UI**.

---

## ✨ Features

### Backend

- 🔐 **JWT Authentication** — Register, login, email verification via Gmail OAuth2
- 🏦 **Account Management** — Create accounts with automatic ₹10,000 seed balance
- 💸 **Money Transfers** — Atomic transfers between accounts with balance validation
- 📒 **Double-Entry Ledger** — Every transaction creates a DEBIT + CREDIT ledger entry
- 🔑 **Idempotency Keys** — Duplicate requests safely return the original transaction
- 💰 **Real-time Balance** — Calculated live from ledger entries (not stored)
- 📧 **Email Notifications** — Transaction alerts via Nodemailer
- 🏛️ **System Account** — Seed account that bootstraps every new user's balance

### Frontend

- 🎨 **Neobrutalist UI** — Bold borders, punchy shadows, vibrant color palette
- 📊 **Dashboard** — Live balance card + full transaction history with credit/debit color coding
- 💸 **Transfer Page** — Send money with real-time success/error feedback
- 🔒 **Auth Pages** — Login and Register with form validation and loading states
- 🔗 **Client API Layer** — Centralized `api.ts` helper talking to all backend routes

---

## 🛠️ Tech Stack

| Layer     | Technology                 |
| --------- | -------------------------- |
| Framework | Next.js (App Router)       |
| Database  | PostgreSQL                 |
| ORM       | Drizzle ORM                |
| Auth      | JWT + bcrypt               |
| Email     | Nodemailer + Gmail OAuth2  |
| Styling   | Tailwind CSS (Neobrutalism)|
| Language  | TypeScript                 |

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/     # POST — user registration + email verification
│   │   │   ├── login/        # POST — JWT login
│   │   │   └── logout/       # POST — logout
│   │   ├── accounts/
│   │   │   ├── route.ts      # POST — create account | GET — list accounts
│   │   │   └── [id]/
│   │   │       ├── route.ts  # GET — account by ID
│   │   │       └── balance/  # GET — live balance from ledger
│   │   └── transactions/
│   │       └── route.ts      # POST — transfer | GET — transaction history
│   ├── dashboard/            # Dashboard page (balance + transactions)
│   ├── login/                # Login page
│   ├── register/             # Register page
│   ├── transfer/             # Transfer page
│   └── lib/
│       ├── api.ts            # Client-side API helper functions
│       ├── db/
│       │   ├── schema/       # Drizzle schema definitions
│       │   └── queries/      # Reusable DB queries (getBalance)
│       └── utils/
│           ├── jwt.ts        # JWT sign/verify helpers
│           ├── api-handler.ts  # Centralized error handling
│           └── mailer.ts     # Email utility
├── errors/
│   └── error.ts              # Typed error classes
├── scripts/
│   └── seed.ts               # System account seeder
└── proxy.ts                  # Auth middleware (injects x-user-id header)
```

---

## 🗄️ Database Schema

### `users` — Identity

| Column       | Type    | Notes               |
| ------------ | ------- | ------------------- |
| id           | UUID    | Primary key         |
| name         | varchar |                     |
| email        | varchar | Unique              |
| passwordHash | varchar | bcrypt              |
| isActive     | boolean | Email verified flag |

### `accounts` — Bank Accounts

| Column   | Type    | Notes                     |
| -------- | ------- | ------------------------- |
| id       | UUID    | Primary key               |
| userId   | UUID    | FK → users                |
| status   | enum    | pending / active / closed |
| currency | varchar | Default: INR              |

### `transactions` — Transfer Records

| Column         | Type          | Notes                                   |
| -------------- | ------------- | --------------------------------------- |
| id             | UUID          | Primary key                             |
| fromAccountId  | UUID          | FK → accounts                           |
| toAccountId    | UUID          | FK → accounts                           |
| amount         | numeric(20,2) | Precise decimal                         |
| status         | enum          | pending / completed / failed / reversed |
| idempotencyKey | varchar       | **Unique** — prevents duplicates        |

### `ledger` — Append-Only Audit Log

| Column        | Type          | Notes                  |
| ------------- | ------------- | ---------------------- |
| id            | UUID          | Primary key            |
| transactionId | UUID          | FK → transactions      |
| accountId     | UUID          | FK → accounts          |
| amount        | numeric(20,2) |                        |
| status        | enum          | **credit** / **debit** |

---

## 🔄 Transfer Flow

```
POST /api/transactions
        │
        ├── 1. Validate request body
        ├── 2. Check idempotency key (return early if duplicate)
        ├── 3. Verify both accounts exist
        ├── 4. Verify both accounts are active
        ├── 5. Calculate sender balance from ledger
        ├── 6. Check sufficient funds
        │
        └── db.transaction() ← atomic block
              ├── 7. Insert transaction (PENDING)
              ├── 8. Insert DEBIT ledger entry (sender)
              ├── 9. Insert CREDIT ledger entry (receiver)
              └── 10. Update transaction → COMPLETED
```

If any step fails → automatic ROLLBACK. Money never disappears.

---

## 💰 Balance Calculation

Balance is never stored — it's computed from ledger entries on every request:

```sql
SELECT
  SUM(CASE WHEN status = 'credit' THEN amount ELSE 0 END) -
  SUM(CASE WHEN status = 'debit'  THEN amount ELSE 0 END) AS balance
FROM ledger
WHERE account_id = ?
```

---

## 🔐 Authentication Flow

```
Client (Cookie: JWT httpOnly)
        │
        ▼
proxy.ts (Next.js Middleware)
  ├── Unpack cookie
  ├── Decode & verify JWT
  └── Inject x-user-id header
        │
        ▼
API Routes (App Router)
  └── Read x-user-id to authorize queries
        │
        ▼
Drizzle ORM → PostgreSQL
```

---

## 🚀 Getting Started

### 1. Clone and install

```bash
git clone https://github.com/yashraj639/Banking-Ledger
cd banking-ledger
npm install
```

### 2. Set up environment variables

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
EMAIL_USER=your_gmail
CLIENT_ID=...
CLIENT_SECRET=...
REFRESH_TOKEN=...
SYSTEM_ACCOUNT_ID=<from seed script>
```

### 3. Run migrations

```bash
npx drizzle-kit push
```

### 4. Seed the system account

```bash
npm run seed
```

Copy the printed `SYSTEM_ACCOUNT_ID` into your `.env`.

### 5. Start development server

```bash
npm run dev
```

---

## 📡 API Reference

| Method | Endpoint                    | Description                           |
| ------ | --------------------------- | ------------------------------------- |
| POST   | `/api/auth/register`        | Register new user                     |
| POST   | `/api/auth/login`           | Login + get JWT                       |
| POST   | `/api/auth/logout`          | Logout + remove JWT                   |
| POST   | `/api/accounts`             | Create account (auto-credits ₹10,000) |
| GET    | `/api/accounts`             | List user's accounts                  |
| GET    | `/api/accounts/:id`         | Get account by ID                     |
| GET    | `/api/accounts/:id/balance` | Get live balance                      |
| POST   | `/api/transactions`         | Transfer money                        |
| GET    | `/api/transactions`         | Transaction history                   |

---

