# 💰 Finance Dashboard API

> A modern RESTful API for financial record management with role-based access control.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=flat)](https://fintrack-backend-i555.onrender.com)

## 🌐 Live Demo

**API Base URL**: https://fintrack-backend-i555.onrender.com

Try it now:
- **Health Check**: https://fintrack-backend-i555.onrender.com/health
- **API Info**: https://fintrack-backend-i555.onrender.com/

> **Note**: Free tier may sleep after 15 min of inactivity. First request takes ~30s to wake up.

## ✨ Features

- 🔐 **JWT Authentication** - Secure token-based auth
- 👥 **Role-Based Access** - Admin, Analyst, Viewer roles
- 💸 **Financial Records** - CRUD with filtering & pagination
- � **Analytics Dashboard** - Income, expenses, trends
- ✅ **Input Validation** - Zod schemas for type safety
- 🛡️ **Security** - Rate limiting, bcrypt, SQL injection protection
- 📝 **TypeScript** - Full type safety

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Setup database with sample data
npm run seed

# Start development server
npm run dev
```

Server runs at `http://localhost:3000`

### Using Live API

No setup needed! Just use the live API:
```
https://fintrack-backend-i555.onrender.com
```

Import the Postman collection and start testing immediately.

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Analyst | analyst@example.com | analyst123 |
| Viewer | viewer@example.com | viewer123 |

## 📡 API Endpoints

### Authentication
```http
POST /api/auth/login
```

### Users (Admin only)
```http
GET    /api/users
GET    /api/users/me
POST   /api/users
PATCH  /api/users/:id
DELETE /api/users/:id
```

### Financial Records
```http
GET    /api/records          # Viewer+
POST   /api/records          # Analyst+
PATCH  /api/records/:id      # Analyst+
DELETE /api/records/:id      # Admin only
```

### Dashboard (Analyst+)
```http
GET /api/dashboard/summary
GET /api/dashboard/weekly
```

## 🧪 Testing

### Option 1: Test Live API (Easiest)

**Using Postman**:
1. Import `Finance_Backend.postman_collection.json`
2. Collection is pre-configured with live URL
3. Go to "Authentication" → "Login as Admin"
4. Click Send (token auto-saves)
5. Test any endpoint!

**Using Browser**:
- Health: https://fintrack-backend-i555.onrender.com/health
- API Info: https://fintrack-backend-i555.onrender.com/

### Option 2: Test Locally

Change Postman `baseUrl` variable to `http://localhost:3000` and run `npm run dev`

### cURL Example
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Create Record (use token from login)
curl -X POST http://localhost:3000/api/records \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":1500,"type":"income","category":"Salary","date":"2026-04-03"}'
```

## 🏗️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite (better-sqlite3)
- **Auth**: JWT + bcrypt
- **Validation**: Zod
- **Rate Limiting**: express-rate-limit

## 📁 Project Structure

```
src/
├── config/          # Database setup
├── middleware/      # Auth, authorization, errors
├── routes/          # API endpoints
├── services/        # Business logic
├── types/           # TypeScript definitions
└── utils/           # Helpers & validators
```

## 🔒 Security Features

- JWT authentication with 7-day expiration
- Password hashing with bcrypt (10 rounds)
- Rate limiting (200 req/15min general, 20 req/15min auth)
- Input validation with Zod
- SQL injection protection
- Role-based access control

## 🎯 Role Permissions

| Action | Viewer | Analyst | Admin |
|--------|:------:|:-------:|:-----:|
| View Records | ✅ | ✅ | ✅ |
| Create Records | ❌ | ✅ | ✅ |
| Update Records | ❌ | ✅ | ✅ |
| Delete Records | ❌ | ❌ | ✅ |
| Dashboard | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ✅ |

## 📊 Database Schema

### Users
- UUID primary key
- Email (unique), password (hashed)
- Role: admin | analyst | viewer
- Status: active | inactive

### Financial Records
- UUID primary key
- Amount (positive), type (income/expense)
- Category, date, notes
- Soft delete support

## 🛠️ Development

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📝 Environment Variables

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
DB_PATH=./finance.db
```

## 📄 License

ISC

---

<div align="center">
  <sub>Built with ❤️ using TypeScript and Express</sub>
</div>
