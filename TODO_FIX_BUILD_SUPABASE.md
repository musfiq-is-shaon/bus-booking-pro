# Fix Build Error - Supabase Client During Build

## Problem
The build fails because Supabase client is being initialized at module level, and environment variables are not available during build time.

Error: `@supabase/ssr: Your project's URL and API key are required to create a Supabase client!`

## Files Affected
- `src/app/dashboard/bookings/page.tsx`
- `src/app/dashboard/user/page.tsx`

## Solution
Move Supabase client initialization from module level to inside `useEffect` to make it lazy-loaded at runtime only.

## Tasks
- [x] Fix `src/app/dashboard/bookings/page.tsx` - Move Supabase client initialization to useEffect
- [x] Fix `src/app/dashboard/user/page.tsx` - Move Supabase client initialization to useEffect
- [x] Test build

## Implementation Details

### Before (causes build error):
```tsx
'use client';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

// Client is created at module level - fails during static generation
const supabase = createClient();
```

### After (fixes build error):
```tsx
'use client';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export default function BookingsPage() {
  // Client is created lazily inside useEffect - only runs on client at runtime
  const [supabase, setSupabase] = useState(null);
  
  useEffect(() => {
    setSupabase(createClient());
  }, []);
  
  // ... rest of the component
}
```

