# 🔧 SETUP GUIDE - RELIEF CONNECT

> **Cập nhật:** 2025-11-24 - Security improvements applied

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/your-username/relief-connect.git
cd relief-connect
```

### 2. Setup Backend (.NET API)

#### Step 1: Configure Supabase Credentials

```bash
cd ReliefConnect.API
```

**Option A: Development (Local)**

Copy the example file and add your credentials:

```bash
# Copy template
cp appsettings.Development.json.example appsettings.Development.json

# Edit appsettings.Development.json with your Supabase credentials
```

Edit `appsettings.Development.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "SupabaseUrl": "https://your-project.supabase.co",
  "SupabaseKey": "your-anon-key-here"
}
```

**Option B: Production (Environment Variables)**

Set environment variables:
```bash
# Windows PowerShell
$env:SupabaseUrl="https://your-project.supabase.co"
$env:SupabaseKey="your-anon-key-here"

# Linux/Mac
export SupabaseUrl="https://your-project.supabase.co"
export SupabaseKey="your-anon-key-here"
```

#### Step 2: Run Backend

```bash
dotnet restore
dotnet run
```

✅ Backend running at: `http://localhost:5162`  
✅ Swagger UI: `http://localhost:5162/swagger`

---

### 3. Setup Frontend (Next.js)

```bash
cd ../relief-web
```

#### Step 1: Configure API URL

**Option A: Local Development**

Copy the example file:
```bash
# Copy template
cp .env.example .env.local
```

The `.env.local` file is already configured for local development:
```env
NEXT_PUBLIC_API_URL=http://localhost:5162/api
```

**Option B: Production/Ngrok**

Edit `.env.local`:
```env
# For ngrok
NEXT_PUBLIC_API_URL=https://your-ngrok-url.ngrok-free.app/api

# For production
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

#### Step 2: Install Dependencies

```bash
npm install
# or
pnpm install
```

#### Step 3: Run Frontend

```bash
npm run dev
# or
pnpm dev
```

✅ Frontend running at: `http://localhost:3000`

---

## 🔐 Security Notes

### ⚠️ IMPORTANT: Never Commit Credentials

The following files contain sensitive information and are **gitignored**:

**Backend:**
- ✅ `appsettings.Development.json` - Contains Supabase credentials
- ✅ `appsettings.Local.json` - Alternative local config
- ✅ `.env` and `.env.local` - Environment variables

**Frontend:**
- ✅ `.env.local` - Contains API URL
- ✅ `.env.development.local` - Development overrides
- ✅ `.env.production.local` - Production overrides

### ✅ Safe to Commit

**Backend:**
- ✅ `appsettings.json` - Template without credentials
- ✅ `appsettings.Development.json.example` - Example template

**Frontend:**
- ✅ `.env.example` - Example template

---

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database to initialize

### 2. Run Schema

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy content from `schema.sql`
3. Click **Run**

### 3. Get Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key**

---

## 🧪 Testing

### Test Backend

```bash
# Check if API is running
curl http://localhost:5162/api/requests

# Or open Swagger UI
# http://localhost:5162/swagger
```

### Test Frontend

1. Open browser: `http://localhost:3000`
2. Click "Tôi Cần Giúp Đỡ" or "Tôi Muốn Giúp"
3. Verify API calls in browser console

---

## 🚀 Deployment

### Backend Deployment

**Railway/Render:**

1. Connect GitHub repository
2. Set environment variables:
   ```
   SupabaseUrl=https://your-project.supabase.co
   SupabaseKey=your-anon-key-here
   ```
3. Deploy

### Frontend Deployment

**Vercel:**

1. Connect GitHub repository
2. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
   ```
3. Deploy

---

## 🔧 Troubleshooting

### Backend Issues

**Problem:** "Configuration 'SupabaseUrl' not found"

**Solution:** Make sure `appsettings.Development.json` exists with correct credentials

```bash
# Check if file exists
ls appsettings.Development.json

# If not, copy from example
cp appsettings.Development.json.example appsettings.Development.json
```

### Frontend Issues

**Problem:** "API calls failing"

**Solution:** Check if `.env.local` exists and has correct API URL

```bash
# Check if file exists
cat .env.local

# Should show:
# NEXT_PUBLIC_API_URL=http://localhost:5162/api
```

**Problem:** "Environment variable not loading"

**Solution:** Restart Next.js dev server after changing `.env.local`

```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

---

## 📚 Additional Resources

- [Backend API Documentation](ReliefConnect.API/README.md)
- [Frontend Integration Guide](doc-for-frontend.md)
- [Database Schema](schema.sql)

---

## ✅ Checklist

Before running the application:

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Backend: `appsettings.Development.json` configured
- [ ] Frontend: `.env.local` configured
- [ ] Backend running at `http://localhost:5162`
- [ ] Frontend running at `http://localhost:3000`
- [ ] API calls working (check browser console)

---

**Happy Coding! 🚀**
