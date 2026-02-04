# Vercel Deployment Guide for BusBooking Pro

This guide provides step-by-step instructions to deploy the BusBooking Pro application to Vercel.

## Prerequisites

Before you begin, ensure you have:

1. A [Vercel account](https://vercel.com)
2. A [Supabase project](https://supabase.com) with the database schema set up
3. Node.js 18.x or later installed locally
4. Git installed and the project pushed to a GitHub/GitLab/Bitbucket repository

## Environment Variables Setup

Before deploying, you need to set up the following environment variables in Vercel:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Your deployed app URL | Auto-detected |

### Where to Find These Values

1. Go to [Supabase Dashboard](https://dashboard.supabase.com)
2. Select your project
3. Go to **Project Settings** → **API**
4. Copy the **Project URL** and **anon** public key

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Log in to Vercel**
   - Visit [vercel.com](https://vercel.com) and sign in with your GitHub/GitLab/Bitbucket account

2. **Import Your Repository**
   - Click "Add New..." → "Project"
   - Select your Git provider (GitHub, GitLab, or Bitbucket)
   - Find and select the `bus-booking-saas` repository
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: `Next.js` (auto-detected)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

4. **Add Environment Variables**
   - In the "Environment Variables" section, add:
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - Click "Add" for each variable
   - Ensure both variables are set to **Production**, **Preview**, and **Development**

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Wait for the build to complete (usually 2-5 minutes)

6. **Visit Your Deployed App**
   - Once deployed, Vercel will provide a live URL (e.g., `bus-booking-pro.vercel.app`)
   - Click the URL to verify your deployment

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Log in to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd /Users/musfiqulislamshaon/training-ground-7
   vercel
   ```

4. **Follow the Prompts**
   - Set up and deploy: `Yes`
   - Which scope: Select your account
   - Link to existing project: `No` (for first deployment)
   - Project Name: `bus-booking-pro` (or your preferred name)
   - Directory: Press Enter (current directory)
   - Want to modify settings?: `No`

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Database Setup for Production

Before using the application, ensure your Supabase database is set up:

1. **Run Database Migrations**
   - Go to Supabase Dashboard → **SQL Editor**
   - Copy and execute the contents of:
     - `supabase/schema.sql` - Main schema
     - `supabase/seed.sql` - Sample data (optional)
     - Any additional fix files as needed

2. **Enable Row Level Security (RLS)**
   - The schema includes RLS policies for security
   - Ensure policies are active in Supabase Dashboard → **Authentication** → **Policies**

3. **Configure Authentication**
   - In Supabase Dashboard → **Authentication** → **Providers**
   - Ensure Email provider is enabled
   - (Optional) Configure Google/GitHub providers for social login

## Supabase Configuration Checklist

- [ ] Created Supabase project
- [ ] Executed `supabase/schema.sql`
- [ ] Executed `supabase/seed.sql` (optional, for demo data)
- [ ] Configured email authentication
- [ ] Set up RLS policies (should be automatic with schema)
- [ ] Added your deployment URL to Supabase redirect URLs:
  - Go to Supabase → **Authentication** → **URL Configuration**
  - Add your Vercel URL to "Redirect URLs"

## Post-Deployment Verification

1. **Check Application Loads**
   - Visit your deployed URL
   - Verify the homepage loads correctly

2. **Test Authentication**
   - Try signing up a new user
   - Verify email confirmation works

3. **Test Core Features**
   - Search for buses
   - Try booking a seat
   - Check user dashboard

4. **Monitor Errors**
   - Check Vercel Dashboard → **Deployments** → **Functions**
   - Review any function errors
   - Check browser console for client-side errors

## Troubleshooting

### Build Fails

If the build fails:

1. **Check Build Logs**
   - Go to Vercel Dashboard → Deployments
   - Click on the failed deployment
   - Review the build logs for errors

2. **Common Issues**
   - Missing environment variables
   - TypeScript errors
   - Dependency issues

### Runtime Errors

If the app builds but has runtime errors:

1. **Check Function Logs**
   - Vercel Dashboard → Functions → Function Logs
   - Look for Supabase connection errors

2. **Verify Environment Variables**
   - Ensure variables are set in Vercel
   - Check for typos in variable names
   - Variables must start with `NEXT_PUBLIC_` to be available client-side

### CORS Errors

If you see CORS errors:

1. **Check Supabase Configuration**
   - Go to Supabase → **Project Settings** → **API**
   - Ensure your Vercel URL is in "Redirect URLs" (Authentication section)

### Authentication Issues

If login/signup doesn't work:

1. **Verify Supabase URL and Key**
   - Double-check environment variables in Vercel
   - Ensure you're using the **anon** key, not service role key

2. **Check Email Templates**
   - Supabase → Authentication → Email Templates
   - Verify confirmation email is configured

## Performance Optimization

### Vercel Analytics

Enable Vercel Analytics for performance insights:

1. Go to Vercel Dashboard → Settings → Analytics
2. Enable Web Vitals tracking

### Edge Caching

The `vercel.json` file includes caching headers for optimal performance:
- Static assets cached for 1 year
- API responses properly configured
- Security headers enabled

## Custom Domain (Optional)

To add a custom domain:

1. Go to Vercel Dashboard → **Domains**
2. Click "Add"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for DNS propagation (up to 24 hours)

## Continuous Deployment

Every push to your main branch will automatically trigger a new deployment:

1. Make code changes
2. Push to GitHub
3. Vercel automatically builds and deploys
4. Check deployment status in Vercel Dashboard

## Support

If you encounter issues not covered here:

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Check [Next.js Documentation](https://nextjs.org/docs)
3. Check [Supabase Documentation](https://supabase.com/docs)
4. Review deployment logs in Vercel Dashboard

## Quick Deploy Command

To quickly deploy from the terminal:

```bash
cd /Users/musfiqulislamshaon/training-ground-7
vercel --prod
```

This will deploy to production in a few minutes!

