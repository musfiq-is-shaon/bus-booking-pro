# Fix Plan: Client-Side Error on Vercel Deployment

## Root Cause Analysis

The "Application error: a client-side exception has occurred" on Vercel can be caused by:

1. **Supabase Environment Variables Not Configured**: The app has fallback values that return invalid placeholder URLs when env vars aren't set
2. **Supabase SSR Client Issues**: The server client returns a minimal dummy client that doesn't fully implement the Supabase interface
3. **Lazy Supabase Client Timing Issues**: Client initialization timing can cause use-before-set errors
4. **useContext Without Provider**: Theme context might be accessed before provider is mounted
5. **Null/Unsafe Property Access**: Various components access properties on potentially null objects
6. **Console Errors During Hydration**: Some Supabase errors are logged but don't crash the app, but can cause hydration issues

## Files to Edit

### 1. `src/lib/supabase/client.ts` - Fix Supabase URL validation
**Issue**: Returns invalid placeholder URLs when env vars are missing
**Fix**: Add validation to prevent creating client with invalid credentials

### 2. `src/lib/supabase/server.ts` - Fix server client implementation
**Issue**: Returns incomplete dummy client
**Fix**: Properly handle missing credentials or implement full dummy interface

### 3. `src/lib/theme-provider.tsx` - Fix context safety
**Issue**: useTheme() might be called before provider mounts
**Fix**: Add safety checks and default values

### 4. `src/app/page.tsx` - Fix Supabase client safety
**Issue**: supabase might be null when used
**Fix**: Add null checks before Supabase operations

### 5. `src/app/search/page.tsx` - Fix Supabase client usage
**Issue**: supabase from useState might be null initially
**Fix**: Add proper null checks

### 6. `src/app/dashboard/user/page.tsx` - Fix null safety
**Issue**: Multiple places access properties on potentially null objects
**Fix**: Add optional chaining and null checks

### 7. `src/app/book/[id]/page.tsx` - Fix booking summary access
**Issue**: schedule?.route?.price might crash if null
**Fix**: Add safety checks and fallback values

## Implementation Steps

### Step 1: Fix Supabase Client (`src/lib/supabase/client.ts`)
- Add validation to prevent creating client with invalid credentials
- Add error boundary to catch initialization errors
- Log helpful error messages when env vars are missing

### Step 2: Fix Server Client (`src/lib/supabase/server.ts`)
- Implement proper error handling for missing credentials
- Create a more complete dummy client if needed
- Add proper TypeScript types

### Step 3: Fix Theme Provider (`src/lib/theme-provider.tsx`)
- Add mounted state check to prevent hydration mismatches
- Add safety check in useTheme hook

### Step 4: Add Error Boundary Component
- Create a global error boundary to catch and display errors gracefully
- Wrap critical components with error boundary

### Step 5: Add Null Safety Checks
- Add optional chaining (?.) throughout components
- Add loading states to prevent premature rendering
- Add fallback UI for null states

## Expected Outcome

After implementing these fixes:
1. The app should load without client-side exceptions
2. Errors should be caught and displayed gracefully
3. Supabase connection issues should show helpful error messages
4. The app should work even without Supabase (with limited functionality)

## Verification Steps

1. Build the app locally: `npm run build`
2. Start preview: `npm run start`
3. Open browser console (F12)
4. Check for any red errors in console
5. Verify all pages load without exceptions

## Environment Variables Checklist

Ensure these are set in Vercel:
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY

## Related Documentation

See `VERCEL_DEPLOYMENT.md` for full deployment instructions.
See `DEPLOYMENT_CHECKLIST.md` for pre-deployment checklist.

