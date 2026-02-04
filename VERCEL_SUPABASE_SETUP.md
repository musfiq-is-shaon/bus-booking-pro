# How to Add Supabase Credentials to Vercel

## Step 1: Get Your Supabase Credentials

### Option A: From Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Visit: https://dashboard.supabase.com
   - Log in to your account

2. **Select Your Project**
   - Click on your project from the list

3. **Navigate to API Settings**
   - Go to **Project Settings** (gear icon) → **API**

4. **Copy Your Credentials**
   - **Project URL**: Copy the URL (e.g., `https://abc123xyz.supabase.co`)
   - **anon public key**: Copy the key starting with `eyJ...`

### Option B: From Project Settings

1. Go to **Settings** → **API**
2. You'll see:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon key**: `eyJhbGciOiJIUzI1NiIsInR...` (public key)

---

## Step 2: Add Credentials to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Navigate to Settings**
   - Click **Settings** tab
   - Go to **Environment Variables**

3. **Add Variables**

   Add these TWO variables:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL (from Step 1) | All (Production, Preview, Development) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key (from Step 1) | All (Production, Preview, Development) |

4. **Save**
   - Click **Add** for each variable
   - Make sure both have ✅ selected for all three environments

5. **Redeploy**
   - Go to **Deployments**
   - Click **Redeploy** on the latest deployment
   - Or push a small change to trigger auto-deploy

### Method 2: Vercel CLI

1. **Open Terminal**

2. **Run These Commands**:

```bash
# Navigate to your project
cd /Users/musfiqulislamshaon/training-ground-7

# Add Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL

# Add Supabase anon key
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

3. **Follow the Prompts**
   - Select your project
   - Choose environment (Production)
   - Enter the value when prompted

---

## Step 3: Configure Supabase for Vercel

### Add Vercel URL to Supabase Redirect URLs

1. **Go to Supabase Dashboard**
2. Navigate to **Authentication** → **URL Configuration**
3. Add these URLs:

```
# For production
https://your-project.vercel.app

# For preview deployments (optional)
https://*-your-project.vercel.app

# For local development
http://localhost:3000
```

4. **Save Changes**

---

## Step 4: Verify Configuration

### Check Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify you see:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

### Test the App

1. Open your Vercel deployment URL
2. Open browser Developer Console (F12)
3. Check for any red errors
4. The app should load without client-side exceptions

---

## Troubleshooting

### Still Getting Errors?

#### 1. Check Build Logs
- Go to Vercel Dashboard → Deployments → Latest
- Check for any build errors

#### 2. Verify Variable Names
Make sure variable names are EXACT:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ❌ `NEXT_PUBLIC_SUPABASE_URL` (extra space)
- ❌ `NEXT_PUBLIC_SUPABASEURL` (missing underscore)

#### 3. Check Console Warnings
Open browser console (F12) and look for:
- "NEXT_PUBLIC_SUPABASE_URL is not set"
- "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set"

If you see these, the variables aren't properly configured.

#### 4. Verify Supabase URL Format
Your URL should look like:
```
https://abc123def456.supabase.co
```
NOT:
- `https://your-project.supabase.co` (placeholder)
- `https://supabase.co` (wrong domain)

---

## Quick Reference

### Required Environment Variables

| Variable | Example Value |
|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://abc123xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR...` |

### Where to Find Them

1. Supabase Dashboard → Settings → API
2. Copy "Project URL" for NEXT_PUBLIC_SUPABASE_URL
3. Copy "anon public" key for NEXT_PUBLIC_SUPABASE_ANON_KEY

### After Adding Variables

1. ✅ Variables added to Vercel
2. ✅ Redeploy triggered
3. ✅ App loads without errors
4. ✅ Supabase features working (login, booking, etc.)

---

## Support

If you still have issues:

1. Check [Vercel Environment Variables Docs](https://vercel.com/docs/projects/environment-variables)
2. Check [Supabase Documentation](https://supabase.com/docs)
3. Review deployment logs in Vercel Dashboard

