# Deployment Checklist - BusBooking Pro

## Pre-Deployment Checklist

- [ ] Git repository is clean with latest changes
- [ ] All tests pass locally (`npm run build`)
- [ ] Environment variables are documented
- [ ] Supabase project is created and configured

## Required Environment Variables (Vercel)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon public key) |

## Database Setup (Supabase)

Execute these SQL files in order:
1. `supabase/schema.sql` - Main schema
2. `supabase/seed.sql` - Sample data (optional)

## Deployment Steps

### Quick Deploy Command

```bash
cd /Users/musfiqulislamshaon/training-ground-7
npx vercel --prod
```

### Manual Deploy

1. Push to GitHub
2. Import to Vercel Dashboard
3. Add environment variables
4. Deploy

## Post-Deployment

- [ ] Test homepage loads
- [ ] Test user registration/login
- [ ] Test bus search functionality
- [ ] Test booking flow
- [ ] Add custom domain (optional)

## Troubleshooting

If deployment fails:
1. Check Vercel deployment logs
2. Verify environment variables
3. Ensure Supabase URL is correct
4. Check browser console for errors

## Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://dashboard.supabase.com)
- [Deployment Guide](./VERCEL_DEPLOYMENT.md)

