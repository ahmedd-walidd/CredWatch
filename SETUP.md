# CredWatch Setup Guide

This guide will walk you through setting up CredWatch from scratch.

## Prerequisites

Before you begin, ensure you have:
- Node.js 18 or higher installed
- npm (comes with Node.js)
- A Supabase account (free tier is sufficient)
- A code editor (VS Code, Sublime, etc.)

## Step 1: Clone and Install

1. Clone the repository:
```bash
git clone https://github.com/ahmedd-walidd/CredWatch.git
cd CredWatch
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Install script dependencies:
```bash
cd ../scripts
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create a Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: CredWatch (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to you
   - **Pricing Plan**: Free tier is fine for development
5. Click "Create new project"
6. Wait for the project to be provisioned (1-2 minutes)

### 2.2 Set Up the Database Schema

1. In your Supabase project dashboard, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy the contents of `backend/schema.sql` from this repository
4. Paste it into the SQL Editor
5. Click "Run" to execute the schema
6. You should see success messages for each table creation

### 2.3 Get Your API Credentials

1. In your Supabase project, go to "Settings" → "API"
2. Note the following values (you'll need them soon):
   - **Project URL**: Under "Project URL"
   - **anon public key**: Under "Project API keys" → "anon public"
   - **service_role key**: Under "Project API keys" → "service_role"

⚠️ **Important**: The service_role key has full access to your database. Keep it secret!

## Step 3: Configure the Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Edit `.env` with your preferred editor:
```bash
nano .env  # or code .env, vim .env, etc.
```

4. Update the following values:
```env
PORT=3000
NODE_ENV=development

# Replace with your actual Supabase values
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_public_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Generate a strong random string for JWT_SECRET
# You can use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_strong_random_jwt_secret_here
JWT_EXPIRES_IN=24h

BCRYPT_ROUNDS=12

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

5. Save the file

## Step 4: Configure the Frontend

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Edit `.env`:
```bash
nano .env
```

4. Ensure it points to your backend:
```env
VITE_API_URL=http://localhost:3000/api
```

5. Save the file

## Step 5: Start the Application

You'll need two terminal windows/tabs.

### Terminal 1: Start the Backend

```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 3000
Environment: development
```

### Terminal 2: Start the Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v7.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

## Step 6: Test the Application

1. Open your browser and go to http://localhost:5173/
2. You should see the CredWatch login page
3. Click "Register" to create an account
4. Fill in:
   - Email: test@example.com
   - Password: TestPass123 (must have uppercase, lowercase, and number)
5. Click "Register"
6. You should be logged in and see the breach checker interface

## Step 7: Load Sample Breach Data (Optional)

To test the breach checking functionality, you need to load some breach data.

1. In a new terminal, navigate to scripts:
```bash
cd scripts
```

2. Run the sample ingestion:
```bash
node ingestBreach.js \
  --name "Sample Breach 2024" \
  --file sample-breach.csv \
  --date 2024-01-15 \
  --description "Sample breach data for testing"
```

3. You should see:
```
=== CredWatch Breach Ingestion ===
Breach Name: Sample Breach 2024
...
=== Ingestion Complete ===
```

4. Now go back to the browser and check one of the emails from `sample-breach.csv`:
   - test1@example.com
   - test2@example.com
   - etc.

5. You should see that the email is found in the "Sample Breach 2024"

## Troubleshooting

### Backend won't start

**Issue**: "Missing Supabase configuration"
- **Solution**: Make sure you've created `.env` in the backend directory and filled in all Supabase values

**Issue**: Port 3000 already in use
- **Solution**: Change PORT in `.env` to another port (e.g., 3001)

### Frontend won't connect to backend

**Issue**: Network errors when trying to log in
- **Solution**: Make sure the backend is running and VITE_API_URL in frontend/.env matches your backend port

### Ingestion script fails

**Issue**: "Cannot find package '@supabase/supabase-js'"
- **Solution**: Run `npm install` in the scripts directory

**Issue**: "Missing Supabase configuration"
- **Solution**: The script reads from `backend/.env`, make sure it's configured correctly

### Database errors

**Issue**: Tables don't exist
- **Solution**: Make sure you ran the schema.sql in Supabase SQL Editor

## Next Steps

Now that you have CredWatch running:

1. **Explore the UI**: Try checking different emails
2. **Load real breach data**: If you have access to breach data, use the ingestion script
3. **Check your history**: View your breach check history in the side panel
4. **View statistics**: See how many breaches and records are in the database
5. **Customize**: Modify the code to fit your needs

## Production Deployment

For production deployment:

1. Use strong, unique values for JWT_SECRET
2. Set NODE_ENV=production
3. Configure proper CORS origins
4. Use HTTPS for both frontend and backend
5. Set up proper rate limiting
6. Enable Supabase's Row Level Security (RLS) properly
7. Use environment-specific database instances
8. Set up monitoring and logging
9. Regularly update dependencies for security patches

## Getting Help

If you run into issues:
1. Check the error messages carefully
2. Review the documentation in README.md
3. Check the API documentation
4. Open an issue on GitHub

## Security Reminders

- Never commit `.env` files to version control
- Keep your service_role key secret
- Use strong passwords for user accounts
- Regularly update dependencies
- Monitor for security vulnerabilities
- Handle breach data responsibly

---

Congratulations! You now have CredWatch running locally. Happy breach hunting! 🔐
