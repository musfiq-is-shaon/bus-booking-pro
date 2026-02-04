# Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
Create a `.env.local` file with these variables:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

### 2. Supabase Setup
- [ ] Create project at https://supabase.com
- [ ] Run `supabase/schema.sql` in SQL Editor
- [ ] (Optional) Run `supabase/seed.sql` for sample data
- [ ] Enable Email auth provider in Authentication → Providers
- [ ] Configure site URL in Authentication → URL Configuration

### 3. Vercel Configuration
- [ ] Connect GitHub repository to Vercel
- [ ] Add environment variables in Vercel dashboard
- [ ] Deploy and verify

## 🚀 Quick Deploy Commands

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Start production server (for testing)
npm start
```

## 📋 Environment Variables for Vercel

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXT_PUBLIC_APP_URL` | Your Vercel app URL | Yes |

## 🔧 Supabase Dashboard Settings

1. **Authentication → Providers**: Enable Email provider
2. **Authentication → URL Configuration**:
   - Site URL: `https://your-project.vercel.app`
   - Redirect URLs: `https://your-project.vercel.app/auth/callback`

3. **API → Project URL**: Copy for `NEXT_PUBLIC_SUPABASE_URL`
4. **API → anon public key**: Copy for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🧪 Testing Checklist

- [ ] Landing page loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Bus search returns results
- [ ] Seat selection works
- [ ] Booking creation works
- [ ] User dashboard shows bookings
- [ ] Admin dashboard accessible (admin only)
- [ ] Logout works

## 🎯 Deployment Status: READY ✅

The project is fully configured and ready for Vercel deployment!

