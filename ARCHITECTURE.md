# CredWatch Architecture

## System Overview

CredWatch is a privacy-preserving credential breach monitoring system built with a clear separation between frontend, backend, and database layers.

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │         React Frontend (Vite)                          │   │
│  │  - Auth Components (Login/Register)                    │   │
│  │  - Breach Checker Interface                            │   │
│  │  - API Client (Axios)                                  │   │
│  └────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            │ HTTP/JSON                          │
│                            ▼                                    │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │
┌─────────────────────────────────────────────────────────────────┐
│                      Backend Server                              │
│                   (Node.js + Express)                           │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │  Auth Routes     │  │  Breach Routes   │                   │
│  │  /auth/register  │  │  /breach/check   │                   │
│  │  /auth/login     │  │  /breach/history │                   │
│  │  /auth/me        │  │  /breach/stats   │                   │
│  └──────────────────┘  └──────────────────┘                   │
│           │                      │                              │
│           ▼                      ▼                              │
│  ┌──────────────────────────────────────┐                     │
│  │        Middleware Layer              │                     │
│  │  - Authentication (JWT)              │                     │
│  │  - Validation (express-validator)    │                     │
│  │  - Rate Limiting                     │                     │
│  │  - Security Headers (Helmet)         │                     │
│  │  - CORS                              │                     │
│  └──────────────────────────────────────┘                     │
│           │                      │                              │
│           ▼                      ▼                              │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │ Auth Controller  │  │ Breach Controller│                   │
│  │ - register()     │  │ - checkBreach()  │                   │
│  │ - login()        │  │ - getHistory()   │                   │
│  │ - me()           │  │ - getStats()     │                   │
│  └──────────────────┘  └──────────────────┘                   │
│           │                      │                              │
│           └──────────┬───────────┘                              │
│                      ▼                                          │
│             ┌─────────────────┐                                │
│             │  Crypto Utils   │                                │
│             │  - hashEmail()  │                                │
│             └─────────────────┘                                │
│                      │                                          │
└──────────────────────│──────────────────────────────────────────┘
                       │
                       │ Supabase Client
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL)                         │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐         │
│  │   users     │  │   breaches   │  │ breach_records │         │
│  ├─────────────┤  ├──────────────┤  ├────────────────┤         │
│  │ id (uuid)   │  │ id (uuid)    │  │ id (uuid)      │         │
│  │ email       │  │ name         │  │ breach_id (fk) │         │
│  │ password_   │  │ breach_date  │  │ email_hash     │         │
│  │   hash      │  │ description  │  │ created_at     │         │
│  │ created_at  │  │ data_classes │  └────────────────┘         │
│  │ updated_at  │  │ created_at   │                             │
│  └─────────────┘  └──────────────┘  ┌────────────────┐         │
│                                      │ breach_checks  │         │
│                                      ├────────────────┤         │
│                                      │ id (uuid)      │         │
│                                      │ user_id (fk)   │         │
│                                      │ email_hash     │         │
│                                      │ breaches_found │         │
│                                      │ checked_at     │         │
│                                      └────────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                       ▲
                       │
                       │
┌─────────────────────────────────────────────────────────────────┐
│                  Breach Ingestion Scripts                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  ingestBreach.js                                        │    │
│  │  - Reads CSV/JSON files                                 │    │
│  │  - Hashes emails (SHA-256)                              │    │
│  │  - Batch inserts to database                            │    │
│  │  - Progress tracking                                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (React + Vite)

**Technology Stack:**
- React 18+ (with Hooks)
- Vite (build tool and dev server)
- Axios (HTTP client)
- CSS3 (no framework, custom styling)

**Key Components:**
1. **Auth.jsx**: Handles user registration and login
   - Form validation
   - JWT token storage
   - Error handling

2. **BreachChecker.jsx**: Main application interface
   - Email breach checking
   - Results display
   - History viewing
   - Statistics dashboard

**Security Features:**
- JWT tokens stored in localStorage
- Automatic token injection via Axios interceptors
- Client-side validation
- HTTPS recommended for production

### Backend (Node.js + Express)

**Technology Stack:**
- Node.js 18+
- Express.js 5
- ES6 Modules (type: "module")
- JWT for authentication
- bcrypt for password hashing

**Layers:**

1. **Routes Layer** (`src/routes/`)
   - Defines API endpoints
   - Maps URLs to controllers
   - Applies middleware

2. **Middleware Layer** (`src/middleware/`)
   - `auth.js`: JWT token verification
   - `validators.js`: Input validation using express-validator
   - Rate limiting (express-rate-limit)
   - Security headers (helmet)
   - CORS configuration

3. **Controller Layer** (`src/controllers/`)
   - `authController.js`: User authentication logic
   - `breachController.js`: Breach checking logic
   - Business logic and orchestration

4. **Utility Layer** (`src/utils/`)
   - `crypto.js`: Email hashing (SHA-256)
   - Helper functions

5. **Configuration Layer** (`src/config/`)
   - `supabase.js`: Database client
   - `logger.js`: Winston logging setup

**Security Measures:**
- Password hashing with bcrypt (12 rounds)
- JWT with configurable expiration
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- Security headers via Helmet
- CORS restrictions
- Environment variable protection

### Database (Supabase/PostgreSQL)

**Schema Design:**

1. **users**: User accounts
   - Stores hashed passwords (bcrypt)
   - Email is stored for authentication only
   - UUID primary keys

2. **breaches**: Breach metadata
   - Name, date, description
   - data_classes array (compromised data types)

3. **breach_records**: Hashed emails from breaches
   - Stores SHA-256 hashes only (no plaintext)
   - Foreign key to breaches table
   - Indexed for fast lookups

4. **breach_checks**: Audit log
   - Tracks who checked what and when
   - Stores hash (not plaintext email)
   - User relationship for history

**Indexes:**
- users.email (unique)
- breaches.name
- breach_records.email_hash (critical for performance)
- breach_records.breach_id
- breach_checks.user_id
- breach_checks.checked_at

**Row Level Security (RLS):**
- Enabled on all tables
- Users can only see their own data
- Service role bypasses RLS (backend operations)

### Ingestion Scripts

**Purpose:** Import breach data from external sources

**Process Flow:**
1. Read CSV/JSON file
2. Extract email addresses
3. Normalize (lowercase, trim)
4. Hash with SHA-256
5. Create breach metadata record
6. Batch insert hashed records (1000 per batch)
7. Progress tracking and error handling

**Supported Formats:**
- CSV: One email per line
- JSON: Array of emails or objects with "email" field

## Data Flow

### User Registration Flow

```
1. User submits email + password
   ↓
2. Frontend sends POST to /api/auth/register
   ↓
3. Backend validates input (format, password strength)
   ↓
4. Backend checks if user exists
   ↓
5. Password hashed with bcrypt (12 rounds)
   ↓
6. User record created in Supabase
   ↓
7. JWT token generated and signed
   ↓
8. Token returned to frontend
   ↓
9. Frontend stores token in localStorage
```

### Breach Check Flow

```
1. User enters email to check
   ↓
2. Frontend sends POST to /api/breach/check with JWT
   ↓
3. Backend verifies JWT token
   ↓
4. Email normalized (lowercase, trim)
   ↓
5. Email hashed with SHA-256
   ↓
6. Database query for email_hash in breach_records
   ↓
7. If found, join with breaches table for details
   ↓
8. Audit record inserted into breach_checks
   ↓
9. Results returned to frontend
   ↓
10. Frontend displays breach information
```

### Breach Ingestion Flow

```
1. Admin runs ingestion script with file path
   ↓
2. Script reads CSV/JSON file
   ↓
3. Emails extracted and parsed
   ↓
4. Breach metadata inserted into breaches table
   ↓
5. For each email:
   - Normalize (lowercase, trim)
   - Hash with SHA-256
   - Add to batch
   ↓
6. Batch insert to breach_records (1000 at a time)
   ↓
7. Progress displayed in console
   ↓
8. Completion summary shown
```

## Privacy Architecture

### Email Hashing Strategy

**Why SHA-256?**
- Deterministic: Same email always produces same hash
- Fast: Efficient for both hashing and lookups
- One-way: Cannot reverse hash to get email
- Fixed length: 64 hex characters (256 bits)

**Process:**
```javascript
email → normalize → SHA-256 → hex string (64 chars)
```

**Example:**
```
Input:  "User@Example.COM  "
Normalize: "user@example.com"
Hash:   "b4c9a289323b21a01c3e940f150eb9b8c542587f1abfd8f0e1cc1ffc5e475514"
```

**Trade-offs:**
- ✅ Privacy: No plaintext emails stored
- ✅ Fast lookups: Hash-based indexing
- ⚠️ Rainbow tables: Known emails can be brute-forced
- ⚠️ No fuzzy matching: Exact hash match only

**Future Enhancements:**
- Add salt for additional security (requires different lookup strategy)
- Use k-anonymity for queries
- Implement bloom filters for initial filtering

## Security Architecture

### Authentication Flow

1. **Registration:**
   - Password validated (min 8 chars, uppercase, lowercase, number)
   - Password hashed with bcrypt (12 rounds, configurable)
   - User created with hashed password only

2. **Login:**
   - Password compared using bcrypt.compare()
   - JWT token generated with user ID and email
   - Token signed with secret from environment
   - Token expires after configured time (default: 24h)

3. **Protected Routes:**
   - JWT token required in Authorization header
   - Token verified and decoded
   - User context added to request
   - Controller uses verified user ID

### Rate Limiting

**Configuration:**
- Window: 15 minutes (900,000ms)
- Max requests: 100 per IP
- Applies to all endpoints

**Purpose:**
- Prevent brute force attacks
- Mitigate DoS attacks
- Protect resources

### Input Validation

**Validation Points:**
1. Client-side (basic checks)
2. Server-side (express-validator)
3. Database constraints

**Validated Fields:**
- Email format
- Password strength
- Request body structure
- Query parameters

### Logging and Auditing

**Winston Logger:**
- Levels: error, warn, info, http, debug
- Outputs: Console + Files
- Files: `logs/error.log`, `logs/all.log`

**Audit Trail:**
- All breach checks logged
- User ID, email hash, timestamp, results
- Cannot be deleted by users
- Used for analytics and investigation

## Scalability Considerations

### Current Architecture

**Suitable for:**
- Small to medium deployments
- Up to ~10M breach records
- Hundreds of concurrent users

### Bottlenecks

1. **Database Queries:**
   - Hash lookup is O(log n) with index
   - Joining with breaches table adds overhead
   - Solution: Denormalize or use caching

2. **Hashing:**
   - SHA-256 is fast but still has cost
   - Solution: Already minimized, no further optimization needed

3. **Single Server:**
   - Backend runs on one instance
   - Solution: Horizontal scaling with load balancer

### Scaling Strategies

**Horizontal Scaling:**
- Deploy multiple backend instances
- Use load balancer (nginx, AWS ALB)
- Stateless architecture supports this

**Database Optimization:**
- Already uses indexes on critical columns
- Consider read replicas for queries
- Partition breach_records by hash prefix

**Caching:**
- Add Redis for frequently checked emails
- Cache breach metadata
- TTL-based invalidation

**CDN for Frontend:**
- Serve static frontend from CDN
- Reduces backend load
- Improves global performance

## Technology Choices

### Why Node.js?

- **Pros:**
  - JavaScript full-stack (same language)
  - Large ecosystem (npm)
  - Good performance for I/O-bound operations
  - Easy async/await
  - Fast development

- **Cons:**
  - Single-threaded (but event loop handles I/O well)
  - Not ideal for CPU-intensive tasks

### Why React?

- **Pros:**
  - Component-based architecture
  - Large community and resources
  - Virtual DOM for performance
  - Hooks for state management
  - Easy to learn basics

- **Cons:**
  - Relatively larger bundle size
  - Learning curve for advanced patterns

### Why Supabase?

- **Pros:**
  - Managed PostgreSQL (no server management)
  - Built-in auth (though we use custom)
  - Row Level Security
  - Real-time capabilities (not used yet)
  - Generous free tier
  - Great developer experience

- **Cons:**
  - Vendor lock-in (mitigated: standard PostgreSQL)
  - Less control than self-hosted

### Why SHA-256 for Hashing?

- **Pros:**
  - Fast and deterministic
  - Widely supported
  - Good enough for this use case
  - Simple implementation

- **Cons:**
  - Vulnerable to rainbow tables
  - No built-in salt (by design for this use case)

- **Alternative Considered:**
  - Argon2/bcrypt: Too slow for lookups
  - MD5: Too weak
  - SHA-512: Overkill, no benefit for this use

## Future Enhancements

### Potential Features

1. **Email Verification:**
   - Verify email ownership before breach checking
   - Prevents checking arbitrary emails

2. **Notifications:**
   - Alert users when new breaches affect them
   - Require email verification

3. **API Rate Limiting per User:**
   - Different limits for authenticated users
   - Premium tiers with higher limits

4. **Breach Data Sources:**
   - Automated ingestion from Have I Been Pwned API
   - Integration with other breach databases

5. **Analytics Dashboard:**
   - Admin interface for breach statistics
   - User activity metrics

6. **Multi-Factor Authentication:**
   - TOTP support for user accounts
   - SMS or email-based 2FA

7. **Password Manager Integration:**
   - Browser extension
   - API for password managers

8. **Improved Privacy:**
   - k-anonymity for queries
   - Client-side hashing option
   - Zero-knowledge proofs

## Deployment Architecture

### Development

```
Localhost:3000 (Backend) ←→ Localhost:5173 (Frontend)
        ↓
   Supabase Cloud
```

### Production (Recommended)

```
        CloudFlare/CDN (Frontend Static Files)
                ↓
        User Browser
                ↓
        Load Balancer
                ↓
        ┌─────────┬─────────┬─────────┐
        Backend   Backend   Backend
        Instance  Instance  Instance
                ↓
        Supabase Cloud / Self-hosted PostgreSQL
                ↓
        Backup System
```

**Recommendations:**
- Use HTTPS everywhere
- Environment-specific configs
- Automated deployments (CI/CD)
- Health checks and monitoring
- Automated backups
- Secrets management (not .env files)

---

This architecture prioritizes:
1. **Security**: Multiple layers of protection
2. **Privacy**: No plaintext email storage
3. **Simplicity**: Clear separation of concerns
4. **Maintainability**: Clean code structure
5. **Scalability**: Can grow with demand
