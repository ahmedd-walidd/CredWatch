# CredWatch

Privacy-preserving credential breach monitoring system that allows users to check if their email appears in known data breaches without storing plaintext emails.

## 🔒 Overview

CredWatch is a security-focused web application that helps users determine if their email addresses have been exposed in data breaches. The system prioritizes privacy by hashing emails before storage and lookup, ensuring that plaintext email addresses are never stored in the database.

### Key Features

- **Privacy-First Design**: Email addresses are hashed using SHA-256 before any database operations
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Breach Checking**: Real-time lookup of email exposure in known data breaches
- **Audit Logging**: Complete history of breach checks for authenticated users
- **Breach Ingestion**: Command-line tools for importing breach data from CSV/JSON files
- **Clean Architecture**: Separation of concerns with clear backend/frontend structure
- **Security Best Practices**: Rate limiting, input validation, helmet.js security headers, CORS

## 🏗️ Architecture

```
CredWatch/
├── backend/           # Node.js/Express API server
│   ├── src/
│   │   ├── config/    # Configuration (Supabase, logging)
│   │   ├── controllers/# Business logic (auth, breach checking)
│   │   ├── middleware/ # Auth, validation, error handling
│   │   ├── routes/    # API route definitions
│   │   ├── utils/     # Utility functions (crypto, etc.)
│   │   └── index.js   # Application entry point
│   ├── schema.sql     # Database schema for Supabase
│   └── package.json
├── frontend/          # React web application
│   ├── src/
│   │   ├── components/# React components (Auth, BreachChecker)
│   │   ├── services/  # API client
│   │   └── App.jsx    # Main application
│   └── package.json
├── scripts/           # Breach data ingestion scripts
│   ├── ingestBreach.js
│   └── sample-breach.csv
└── README.md
```

## 📊 Database Schema

The application uses Supabase (PostgreSQL) with the following tables:

- **users**: User accounts with hashed passwords
- **breaches**: Metadata about data breaches (name, date, description, data classes)
- **breach_records**: Hashed email addresses associated with breaches
- **breach_checks**: Audit log of user breach lookups

All email addresses are stored as SHA-256 hashes (64 hex characters) for privacy.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works fine)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/ahmedd-walidd/CredWatch.git
cd CredWatch
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Execute the schema from `backend/schema.sql`
4. Note your project URL and API keys from Settings → API

### 3. Configure Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
PORT=3000
NODE_ENV=development

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

JWT_SECRET=your_very_strong_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=24h

BCRYPT_ROUNDS=12
```

### 4. Configure Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

The backend will start on http://localhost:3000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will start on http://localhost:5173

## 📝 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Breach Endpoints

#### Check Email Exposure
```http
POST /api/breach/check
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "test@example.com"
}
```

Response (exposed):
```json
{
  "exposed": true,
  "breach_count": 2,
  "breaches": [
    {
      "name": "Example Breach",
      "breach_date": "2024-01-15",
      "description": "A data breach occurred...",
      "data_classes": ["email-addresses", "passwords"]
    }
  ],
  "checked_at": "2024-01-16T00:00:00.000Z"
}
```

Response (safe):
```json
{
  "exposed": false,
  "breach_count": 0,
  "breaches": [],
  "checked_at": "2024-01-16T00:00:00.000Z"
}
```

#### Get Check History
```http
GET /api/breach/history?limit=10
Authorization: Bearer {token}
```

#### Get Breach Statistics
```http
GET /api/breach/stats
```

## 🔧 Breach Data Ingestion

The ingestion script allows you to import breach data from CSV or JSON files.

### CSV Format
One email per line:
```
email1@example.com
email2@example.com
email3@example.com
```

### JSON Format
Array of email strings or objects:
```json
[
  "email1@example.com",
  "email2@example.com"
]
```

Or:
```json
[
  { "email": "email1@example.com" },
  { "email": "email2@example.com" }
]
```

### Usage

```bash
cd scripts
node ingestBreach.js \
  --name "Company Breach 2024" \
  --file sample-breach.csv \
  --date 2024-01-15 \
  --description "Description of the breach" \
  --data-classes "email-addresses,passwords,usernames"
```

Parameters:
- `--name`: Breach name (required)
- `--file`: Path to CSV/JSON file (required)
- `--date`: Breach date in YYYY-MM-DD format (optional)
- `--description`: Breach description (optional)
- `--data-classes`: Comma-separated list of compromised data types (optional, defaults to "email-addresses")

## 🔐 Security Features

1. **Email Hashing**: SHA-256 hashing ensures emails are never stored in plaintext
2. **Password Security**: bcrypt with configurable rounds (default: 12)
3. **JWT Authentication**: Stateless authentication with configurable expiration
4. **Rate Limiting**: Prevents abuse with configurable request limits
5. **Input Validation**: express-validator for all user inputs
6. **Security Headers**: helmet.js for common security headers
7. **CORS Configuration**: Restricted to configured frontend origin
8. **Audit Logging**: All breach checks are logged with timestamps
9. **Row Level Security**: Supabase RLS policies protect user data

## 🧪 Testing

### Test the Backend

1. Start the backend server
2. Register a new user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

3. Check for breaches (using token from registration):
```bash
curl -X POST http://localhost:3000/api/breach/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"email":"test@example.com"}'
```

### Test Breach Ingestion

```bash
cd scripts
node ingestBreach.js \
  --name "Test Breach" \
  --file sample-breach.csv \
  --date 2024-01-15
```

Then check if the emails in sample-breach.csv appear as breached.

## 📖 Usage Guide

1. **Register**: Create an account with your email and a strong password (min 8 chars, uppercase, lowercase, number)
2. **Login**: Sign in with your credentials
3. **Check Email**: Enter any email address to check if it appears in known breaches
4. **View Results**: See which breaches (if any) contain the email, along with breach details
5. **Check History**: View your past breach checks
6. **Statistics**: See total breaches and records in the database

## 🛠️ Development

### Backend Structure

- `config/`: Supabase client, Winston logger configuration
- `controllers/`: Business logic for auth and breach operations
- `middleware/`: Authentication, validation, error handling
- `routes/`: Express route definitions
- `utils/`: Helper functions (crypto, etc.)

### Frontend Structure

- `components/`: React components (Auth, BreachChecker)
- `services/`: API client with axios
- Clean, functional component design

### Logging

Logs are stored in `backend/logs/`:
- `error.log`: Error-level logs only
- `all.log`: All log levels

## 📜 Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 3000) |
| NODE_ENV | Environment | No (default: development) |
| SUPABASE_URL | Supabase project URL | Yes |
| SUPABASE_ANON_KEY | Supabase anon key | No |
| SUPABASE_SERVICE_KEY | Supabase service role key | Yes |
| JWT_SECRET | Secret for signing JWT tokens | Yes |
| JWT_EXPIRES_IN | JWT expiration time | No (default: 24h) |
| BCRYPT_ROUNDS | bcrypt hashing rounds | No (default: 12) |
| RATE_LIMIT_WINDOW_MS | Rate limit window | No (default: 900000) |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | No (default: 100) |

### Frontend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| VITE_API_URL | Backend API URL | Yes |

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with Express.js, React, and Supabase
- Inspired by Have I Been Pwned
- Security best practices from OWASP

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review API documentation above

---

**Note**: This application is for educational and security awareness purposes. Always handle breach data responsibly and in compliance with applicable laws and regulations.

