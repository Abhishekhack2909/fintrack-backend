# Finance Data Processing and Access Control Backend

A backend system for a finance dashboard that manages financial records with role-based access control. This project demonstrates backend architecture, API design, data modeling, business logic implementation, and access control mechanisms.

## 📋 Assignment Overview

This backend system is designed to serve a finance dashboard where different users interact with financial records based on their assigned roles. The system supports storage and management of financial entries, user roles, permissions, and summary-level analytics.

## 🎯 Objective

This project evaluates backend development skills through:
- API design and implementation
- Data modeling and database schema design
- Business logic and access control
- Clean, maintainable, and logically organized code
- Proper error handling and validation

## 🛠️ Technology Choices

### Backend Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript (for type safety and better developer experience)
- **Database**: SQLite with better-sqlite3 (lightweight, serverless, perfect for development)
- **Authentication**: JWT (jsonwebtoken) for stateless authentication
- **Password Security**: bcryptjs for secure password hashing
- **Validation**: Zod for runtime type validation
- **Rate Limiting**: express-rate-limit for API protection
- **Environment Management**: dotenv

### Why These Choices?

**TypeScript**: Provides compile-time type checking, better IDE support, and reduces runtime errors.

**SQLite**: Serverless database that requires no setup, perfect for development and small to medium applications. Easy to deploy and backup.

**JWT**: Stateless authentication that scales well and works great for REST APIs.

**Zod**: Runtime validation that integrates seamlessly with TypeScript, providing both compile-time and runtime type safety.

## 🏗️ Architecture & Design

### Project Structure
```
finance-backend/
├── src/
│   ├── config/          # Database configuration and initialization
│   ├── middleware/      # Authentication, authorization, error handling
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic layer
│   ├── utils/           # Helper functions and validators
│   ├── types/           # TypeScript type definitions
│   ├── scripts/         # Database seeding and utilities
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Application entry point
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # Documentation
```

### Design Principles

**Separation of Concerns**: Routes handle HTTP, services contain business logic, and database operations are isolated.

**Layered Architecture**: Clear separation between routes → services → database layers.

**Middleware Pattern**: Authentication, authorization, and error handling implemented as reusable middleware.

**Type Safety**: TypeScript interfaces and Zod schemas ensure data integrity throughout the application.

## ✨ Core Features Implemented


### 1. User and Role Management ✅

**Implementation**: Complete user management system with role-based access control.

**Supported Operations**:
- Create and manage users
- Assign roles to users (Admin, Analyst, Viewer)
- Manage user status (active/inactive)
- Restrict actions based on roles

**Role Definitions**:
- **Viewer** (Rank 1): Can only view financial records and their own profile
- **Analyst** (Rank 2): Can view, create, and update records; access dashboard analytics
- **Admin** (Rank 3): Full system access including user management and record deletion

**Access Control Logic**:
- Implemented using `requireRole(minRole)` middleware factory
- Role hierarchy enforced: Admin > Analyst > Viewer
- Admin self-protection: Cannot change own role, deactivate, or delete own account

### 2. Financial Records Management ✅

**Implementation**: Complete CRUD operations for financial data with filtering and pagination.

**Record Structure**:
```typescript
{
  id: string (UUID)
  user_id: string
  amount: number (positive only)
  type: 'income' | 'expense'
  category: string
  date: string (YYYY-MM-DD)
  notes: string | null
  deleted_at: string | null (soft delete)
  created_at: string (ISO timestamp)
  updated_at: string (ISO timestamp)
}
```

**Supported Operations**:
- Create new financial records
- View records with filtering (by type, category, date range)
- Update existing records
- Soft delete records (admin only)
- Pagination support (default 20, max 100 per page)

**Filtering Capabilities**:
- Filter by type (income/expense)
- Filter by category (partial match)
- Filter by date range (from/to)
- Pagination with page and limit parameters

### 3. Dashboard Summary APIs ✅

**Implementation**: Aggregated data endpoints for dashboard visualization.

**Summary Endpoint** (`GET /api/dashboard/summary`):
Returns comprehensive financial overview:
```json
{
  "totalIncome": 27741.69,
  "totalExpenses": 4654.49,
  "netBalance": 23087.20,
  "recordCount": 28,
  "categoryTotals": {
    "income": [
      { "category": "Salary", "total": 15000, "count": 3 }
    ],
    "expense": [
      { "category": "Rent", "total": 3600, "count": 3 }
    ]
  },
  "monthlyTrends": [
    { "month": "2026-04", "income": 7500, "expense": 1200, "net": 6300 }
  ],
  "recentActivity": [/* last 10 records */]
}
```

**Weekly Trends Endpoint** (`GET /api/dashboard/weekly`):
Returns last 12 weeks of financial data for trend analysis.

**Access Control**: Dashboard endpoints require Analyst or Admin role.

### 4. Access Control Logic ✅

**Implementation**: Multi-layered access control system.

**Authentication Middleware** (`authenticate.ts`):
- Extracts and verifies JWT tokens from Authorization header
- Attaches user information to request object
- Returns 401 for missing or invalid tokens

**Authorization Middleware** (`authorize.ts`):
- `requireRole(minRole)` factory function
- Compares user role rank against required minimum
- Returns 403 for insufficient permissions

**Role-Based Restrictions**:
| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View Records | ✅ | ✅ | ✅ |
| Create Records | ❌ | ✅ | ✅ |
| Update Records | ❌ | ✅ | ✅ |
| Delete Records | ❌ | ❌ | ✅ |
| View Dashboard | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |

### 5. Validation and Error Handling ✅

**Input Validation** (using Zod):
- Email format validation
- Password minimum length (6 characters)
- Amount must be positive
- Date format validation (YYYY-MM-DD)
- Enum validation for types and roles

**Error Response Format**:
```json
{
  "error": "Error message"
}
```

**Validation Error Format**:
```json
{
  "error": "Validation failed.",
  "details": [
    { "field": "amount", "message": "Amount must be positive" }
  ]
}
```

**HTTP Status Codes**:
- 200: Success
- 201: Created
- 204: No Content (successful deletion)
- 400: Bad Request (validation errors)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (duplicate email)
- 500: Internal Server Error

**Error Handling Strategy**:
- Global error handler middleware
- Zod validation errors → 400 with field details
- Custom AppError class for business logic errors
- Development mode shows detailed error messages
- Production mode hides sensitive error details

### 6. Data Persistence ✅

**Database Choice**: SQLite with better-sqlite3

**Why SQLite?**
- Zero configuration required
- Serverless (no separate database process)
- Single file database (easy backup and deployment)
- ACID compliant
- Perfect for development and small to medium applications
- Production-ready for read-heavy workloads

**Database Schema**:

**users table**:
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'analyst', 'viewer')),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

**financial_records table**:
```sql
CREATE TABLE financial_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL CHECK(amount > 0),
  type TEXT CHECK(type IN ('income', 'expense')),
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Indexes**:
- `idx_records_user_id` on user_id
- `idx_records_type` on type
- `idx_records_date` on date
- `idx_records_deleted_at` on deleted_at

**Data Integrity**:
- Foreign key constraints
- Check constraints for enums and positive amounts
- Unique constraint on email
- Soft delete implementation (deleted_at field)

## 🚀 Setup Instructions


### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation Steps

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
```bash
cp .env.example .env
```

The `.env` file contains:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=finance_dashboard_secret_key_change_in_production
JWT_EXPIRES_IN=7d
DB_PATH=./finance.db
```

3. **Initialize database with seed data**:
```bash
npm run seed
```

This creates:
- 3 test users (admin, analyst, viewer)
- ~20-30 sample financial records across 4 months
- Realistic categories and amounts

4. **Start the development server**:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## 🔐 Test Credentials

After running the seed script, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Analyst | analyst@example.com | analyst123 |
| Viewer | viewer@example.com | viewer123 |

## 📡 API Documentation


### Base URL
```
http://localhost:3000
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints Overview

#### Health Check
- `GET /health` - Check server status (No auth required)
- `GET /` - API information and documentation (No auth required)

#### Authentication
- `POST /api/auth/login` - Login and receive JWT token

#### User Management
- `GET /api/users` - List all users (Admin only)
- `GET /api/users/me` - Get own profile (Any authenticated user)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `PATCH /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

#### Financial Records
- `GET /api/records` - List records with filters (Viewer+)
- `GET /api/records/:id` - Get record by ID (Viewer+)
- `POST /api/records` - Create new record (Analyst+)
- `PATCH /api/records/:id` - Update record (Analyst+)
- `DELETE /api/records/:id` - Soft delete record (Admin only)

#### Dashboard Analytics
- `GET /api/dashboard/summary` - Get financial summary (Analyst+)
- `GET /api/dashboard/weekly` - Get weekly trends (Analyst+)

### Detailed API Examples

#### 1. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "status": "active",
    "created_at": "2026-04-02T10:00:00.000Z",
    "updated_at": "2026-04-02T10:00:00.000Z"
  }
}
```

#### 2. Create Financial Record
```bash
POST /api/records
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1500.50,
  "type": "income",
  "category": "Freelance",
  "date": "2026-04-01",
  "notes": "Web development project"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid-here",
  "user_id": "user-uuid",
  "amount": 1500.5,
  "type": "income",
  "category": "Freelance",
  "date": "2026-04-01",
  "notes": "Web development project",
  "deleted_at": null,
  "created_at": "2026-04-02T10:00:00.000Z",
  "updated_at": "2026-04-02T10:00:00.000Z"
}
```

#### 3. Get Records with Filters
```bash
GET /api/records?type=expense&from=2026-01-01&to=2026-04-30&page=1&limit=20
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "amount": 1200,
      "type": "expense",
      "category": "Rent",
      "date": "2026-04-01",
      "notes": null,
      "created_at": "2026-04-02T10:00:00.000Z",
      "updated_at": "2026-04-02T10:00:00.000Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

#### 4. Get Dashboard Summary
```bash
GET /api/dashboard/summary?from=2026-01-01&to=2026-04-30
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "totalIncome": 27741.69,
  "totalExpenses": 4654.49,
  "netBalance": 23087.20,
  "recordCount": 28,
  "categoryTotals": {
    "income": [
      { "category": "Salary", "total": 15000, "count": 3 },
      { "category": "Freelance", "total": 5000, "count": 5 }
    ],
    "expense": [
      { "category": "Rent", "total": 3600, "count": 3 },
      { "category": "Groceries", "total": 800, "count": 8 }
    ]
  },
  "monthlyTrends": [
    { "month": "2026-04", "income": 7500, "expense": 1200, "net": 6300 },
    { "month": "2026-03", "income": 8000, "expense": 1500, "net": 6500 }
  ],
  "recentActivity": [/* last 10 records */]
}
```

#### 5. Create User (Admin Only)
```bash
POST /api/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "analyst"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid-here",
  "name": "New User",
  "email": "newuser@example.com",
  "role": "analyst",
  "status": "active",
  "created_at": "2026-04-02T10:00:00.000Z",
  "updated_at": "2026-04-02T10:00:00.000Z"
}
```

### Query Parameters for Records

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| type | string | Filter by income/expense | `?type=income` |
| category | string | Partial match on category | `?category=Rent` |
| from | string | Start date (YYYY-MM-DD) | `?from=2026-01-01` |
| to | string | End date (YYYY-MM-DD) | `?to=2026-12-31` |
| page | number | Page number (default: 1) | `?page=2` |
| limit | number | Items per page (default: 20, max: 100) | `?limit=50` |

### Error Responses

**Validation Error** (400):
```json
{
  "error": "Validation failed.",
  "details": [
    {
      "field": "amount",
      "message": "Amount must be positive"
    }
  ]
}
```

**Unauthorized** (401):
```json
{
  "error": "Authentication required"
}
```

**Forbidden** (403):
```json
{
  "error": "Insufficient permissions"
}
```

**Not Found** (404):
```json
{
  "error": "Record not found"
}
```

## 🧪 Testing the API

### Option 1: Using Postman (Recommended)

**Import the Postman Collection**:
1. Open Postman
2. Click "Import" button
3. Select `Finance_Backend.postman_collection.json` from the project root
4. The collection includes all endpoints organized by category

**How to Use**:
1. Start the server: `npm run dev`
2. In Postman, go to "Authentication" folder
3. Run "Login as Admin" - this automatically saves the token
4. Now you can test any endpoint - tokens are auto-populated
5. Try different roles (Admin, Analyst, Viewer) to test access control

**Collection Features**:
- ✅ All 15+ endpoints included
- ✅ Organized by category (Auth, Users, Records, Dashboard)
- ✅ Auto-saves tokens after login
- ✅ Pre-configured request bodies
- ✅ Test access control scenarios
- ✅ Variables for easy configuration

### Option 2: Using cURL

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```


**Get Records**:
```bash
curl http://localhost:3000/api/records \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Option 3: Using Thunder Client (VS Code Extension)

1. Install Thunder Client extension in VS Code
2. Import `Finance_Backend.postman_collection.json`
3. Test endpoints directly in VS Code

### Option 4: Using Browser (Limited)

For GET endpoints without auth:
- Health: http://localhost:3000/health
- API Info: http://localhost:3000/

## � What to Submit

### Required Files (Already Included)

1. ✅ **Source Code** - Complete `src/` directory
2. ✅ **Configuration Files**:
   - `package.json` - Dependencies and scripts
   - `tsconfig.json` - TypeScript configuration
   - `.env.example` - Environment template
   - `.gitignore` - Excludes unnecessary files

3. ✅ **Documentation**:
   - `README.md` - Complete API documentation
   - `REQUIREMENTS_CHECKLIST.md` - Requirements verification
   - `SUBMISSION_SUMMARY.md` - Submission overview

4. ✅ **Database**:
   - `src/config/database.ts` - Schema definition
   - `src/scripts/seed.ts` - Sample data script

5. ✅ **Testing**:
   - `Finance_Backend.postman_collection.json` - Postman collection

### Files to Exclude (Already in .gitignore)

- ❌ `node_modules/` - Dependencies (will be installed)
- ❌ `.env` - Environment variables (use .env.example)
- ❌ `*.db` files - Database files (will be created)
- ❌ `dist/` - Build output
- ❌ Test scripts (optional)

## 🚀 How to Submit

### Step 1: Prepare Your Repository

```bash
# Make sure everything is committed
git status

# If using Git, create a repository
git init
git add .
git commit -m "Finance Backend - Complete Implementation"
```

### Step 2: Upload to GitHub (Recommended)

```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/finance-backend.git
git branch -M main
git push -u origin main
```

### Step 3: Submission Checklist

Before submitting, verify:

- [ ] Server runs successfully with `npm run dev`
- [ ] Seed script works with `npm run seed`
- [ ] All test credentials work
- [ ] Postman collection imports successfully
- [ ] README.md is complete and clear
- [ ] .env.example is included (not .env)
- [ ] .gitignore excludes unnecessary files
- [ ] No node_modules or database files committed

### Step 4: Submit

Provide the following in your submission:

1. **GitHub Repository URL** (or zip file if required)
2. **README.md** - Already comprehensive
3. **Setup Instructions** - Already in README
4. **Test Credentials** - Already documented
5. **Postman Collection** - Included in repository

### Example Submission Text

```
Finance Data Processing and Access Control Backend

Repository: https://github.com/yourusername/finance-backend
Live Demo: (if deployed, otherwise mention "Local development only")

Setup Instructions:
1. npm install
2. npm run seed
3. npm run dev

Test Credentials:
- Admin: admin@example.com / admin123
- Analyst: analyst@example.com / analyst123
- Viewer: viewer@example.com / viewer123

Postman Collection: Finance_Backend.postman_collection.json (included in repo)

All requirements implemented with additional enhancements including JWT auth,
rate limiting, comprehensive validation, and complete documentation.
```

## 🧪 How to Test Your Submission

### Before Submitting - Self Test

1. **Fresh Install Test**:
```bash
# Delete node_modules and database
rm -rf node_modules finance.db*
npm install
npm run seed
npm run dev
```

2. **Test All Roles**:
   - Import Postman collection
   - Login as each role (Admin, Analyst, Viewer)
   - Test permissions for each role
   - Verify access control works

3. **Test Validation**:
   - Try creating record with negative amount (should fail)
   - Try invalid date format (should fail)
   - Try invalid email (should fail)

4. **Test Core Features**:
   - Create a financial record
   - Update a record
   - Filter records by date/type
   - View dashboard summary
   - Create a new user (as admin)

### Verification Commands

```bash
# Check server is running
curl http://localhost:3000/health

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Verify database has data
# (Database should have 3 users and 20+ records after seeding)
```

## 📝 Final Checklist

Before submission, ensure:

### Code Quality
- [x] All TypeScript files compile without errors
- [x] No console.log statements in production code
- [x] Consistent code formatting
- [x] Meaningful variable and function names
- [x] Comments where necessary

### Functionality
- [x] All 6 core requirements implemented
- [x] 10+ optional enhancements added
- [x] All endpoints working correctly
- [x] Role-based access control enforced
- [x] Validation working properly
- [x] Error handling comprehensive

### Documentation
- [x] README.md complete with examples
- [x] API endpoints documented
- [x] Setup instructions clear
- [x] Test credentials provided
- [x] Assumptions documented
- [x] Design decisions explained

### Testing
- [x] Postman collection included
- [x] All endpoints tested
- [x] Access control verified
- [x] Validation tested
- [x] Error scenarios tested

### Repository
- [x] .gitignore properly configured
- [x] No sensitive data committed
- [x] No unnecessary files included
- [x] Clean commit history
- [x] Professional README

## 🎯 Quick Start for Evaluators

For anyone evaluating this project:

```bash
# 1. Clone and install
git clone <repository-url>
cd finance-backend
npm install

# 2. Seed database
npm run seed

# 3. Start server
npm run dev

# 4. Import Postman collection
# Open Postman → Import → Finance_Backend.postman_collection.json

# 5. Test
# Run "Login as Admin" in Postman
# Try any endpoint - tokens are auto-populated
```

**Server will be running at**: http://localhost:3000

**Test Credentials**:
- Admin: admin@example.com / admin123
- Analyst: analyst@example.com / analyst123
- Viewer: viewer@example.com / viewer123

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting (200 req/15min general, 20 req/15min auth)
- Role-based access control
- Input validation with Zod
- Protection against user enumeration attacks
- Soft delete for records
- Admin self-protection (cannot change own role, deactivate, or delete own account)

## Error Handling

All errors return JSON format:

```json
{
  "error": "Error message here"
}
```

Validation errors include details:

```json
{
  "error": "Validation failed.",
  "details": [
    {
      "field": "amount",
      "message": "Amount must be positive"
    }
  ]
}
```

## Assumptions

1. All IDs use UUIDs for better security and distribution
2. Timestamps stored as ISO 8601 strings for consistency
3. Soft delete for financial records (audit trail)
4. Hard delete for users (admin action)
5. Records are associated with the user who created them
6. Date format is YYYY-MM-DD for financial records
7. Amount is stored as REAL (floating point) with positive constraint
8. Password minimum length is 6 characters
9. JWT tokens expire after 7 days by default
10. Pagination defaults to 20 items per page, max 100

## Development

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## License

ISC

## 📊 Business Logic Highlights

### Access Control Matrix

| Feature | Viewer | Analyst | Admin |
|---------|--------|---------|-------|
| View own profile | ✅ | ✅ | ✅ |
| View records | ✅ | ✅ | ✅ |
| Create records | ❌ | ✅ | ✅ |
| Update records | ❌ | ✅ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| View dashboard | ❌ | ✅ | ✅ |
| List all users | ❌ | ❌ | ✅ |
| Create users | ❌ | ❌ | ✅ |
| Update users | ❌ | ❌ | ✅ |
| Delete users | ❌ | ❌ | ✅ |

### Key Business Rules

1. **User Management**:
   - Email must be unique
   - Password minimum 6 characters
   - Admin cannot modify own role
   - Admin cannot deactivate own account
   - Admin cannot delete own account
   - Inactive users cannot login

2. **Financial Records**:
   - Amount must be positive
   - Date must be in YYYY-MM-DD format
   - Records are soft-deleted (deleted_at timestamp)
   - Deleted records are hidden from all queries
   - Each record is associated with the creating user

3. **Authentication**:
   - JWT tokens expire after 7 days
   - Invalid credentials return generic error (prevents user enumeration)
   - Inactive users cannot obtain tokens

4. **Data Integrity**:
   - All IDs use UUIDs (crypto.randomUUID)
   - All timestamps use ISO 8601 format
   - Foreign key constraints enforced
   - Check constraints on enums and amounts

## 📝 Assumptions and Design Decisions

### Assumptions Made

1. **Single Currency**: All amounts are in the same currency (no currency field)
2. **User-Record Association**: Records are associated with the user who created them
3. **Soft Delete Only for Records**: Users are hard-deleted, records are soft-deleted
4. **Date Format**: Financial records use date-only format (YYYY-MM-DD), not datetime
5. **Category Flexibility**: Categories are free-text, not predefined enums
6. **Token Storage**: Client is responsible for storing and managing JWT tokens
7. **Single Active Session**: No session management; tokens are stateless
8. **Development Focus**: Optimized for development and demonstration, not production scale

### Design Decisions

1. **SQLite Choice**: 
   - **Why**: Zero configuration, serverless, perfect for development
   - **Tradeoff**: Limited concurrent writes (acceptable for this use case)
   - **Alternative**: Could use PostgreSQL/MySQL for production

2. **JWT over Sessions**:
   - **Why**: Stateless, scalable, works well with REST APIs
   - **Tradeoff**: Cannot revoke tokens before expiration
   - **Alternative**: Could implement token blacklist or use sessions

3. **Soft Delete for Records**:
   - **Why**: Maintains audit trail, allows data recovery
   - **Tradeoff**: Requires filtering in all queries
   - **Alternative**: Could use separate archive table

4. **Role Hierarchy**:
   - **Why**: Simple and clear permission model
   - **Tradeoff**: Less flexible than permission-based system
   - **Alternative**: Could implement granular permissions

5. **Zod for Validation**:
   - **Why**: Type-safe, integrates with TypeScript, runtime validation
   - **Tradeoff**: Adds bundle size
   - **Alternative**: Could use class-validator or joi

6. **Service Layer Pattern**:
   - **Why**: Separates business logic from HTTP layer
   - **Tradeoff**: More files and indirection
   - **Alternative**: Could put logic directly in routes (simpler but less maintainable)

## 🎁 Optional Enhancements Implemented

Beyond the core requirements, this project includes:

1. ✅ **JWT Authentication**: Full token-based auth system
2. ✅ **Rate Limiting**: Protection against abuse
3. ✅ **Pagination**: Efficient data retrieval
4. ✅ **Search/Filtering**: Multiple filter options for records
5. ✅ **Soft Delete**: Audit trail for deleted records
6. ✅ **Comprehensive Error Handling**: Detailed error responses
7. ✅ **API Documentation**: Complete README with examples
8. ✅ **Test Scripts**: Automated testing scripts included
9. ✅ **Seed Script**: Sample data for testing
10. ✅ **TypeScript**: Full type safety throughout

## 🤔 Tradeoffs and Limitations

### Current Limitations

1. **Concurrency**: SQLite has limited write concurrency
2. **Token Revocation**: Cannot revoke JWT tokens before expiration
3. **File Upload**: No support for file attachments
4. **Audit Log**: No comprehensive audit trail for all actions
5. **Email Verification**: No email verification for new users

### Potential Improvements

1. **Database**: Migrate to PostgreSQL for better concurrency
2. **Caching**: Add Redis for frequently accessed data
3. **Search**: Implement full-text search for records
4. **Export**: Add CSV/PDF export functionality
5. **Notifications**: Email notifications for important events

## 📖 Summary

This project demonstrates a complete backend system with:
- Clean architecture and separation of concerns
- RESTful API design with proper HTTP methods and status codes
- JWT-based authentication and role-based authorization
- Comprehensive validation and error handling
- Well-documented code and API endpoints
- Security best practices
- Test scripts for verification

---

**Note**: This is a demonstration project built for an internship assignment. It showcases backend development skills including API design, data modeling, business logic implementation, and access control mechanisms.
