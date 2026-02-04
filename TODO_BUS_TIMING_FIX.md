# TODO: Fix Bus Timing Duplicate Issue

## Problem
When searching for routes (e.g., Dhaka to Chittagong), the same bus schedule appears multiple times at the same departure time (e.g., 1pm to 6pm). This violates the constraint that buses with the same name can't serve the same route at the same time.

## Root Cause
The original SQL used `hashtext()` for bus assignment:
```sql
(abs(hashtext(ua.route_from || ua.route_to || ua.hours_offset::text)) % total_buses + 1
```

This caused **hash collisions** when multiple routes had the same `(route_from, route_to, hours_offset)` - they got the same hash → same bus → `DISTINCT ON` only kept one entry.

## Solution Applied
Replace `hashtext()` with **round-robin distribution** using `ROW_NUMBER()`:
```sql
((ROW_NUMBER() OVER (ORDER BY ua.route_from, ua.route_to, ua.hours_offset, ua.days_offset) - 1) % 
    (SELECT COUNT(*) FROM bus_pool) + 1)::int as bus_rn
```

This ensures:
- Each route gets a **different sequential bus**
- No hash collisions
- Routes are evenly distributed across all buses
- Each (bus, route, time) combination is unique

## Files Modified
- `/Users/musfiqulislamshaon/training-ground-7/supabase/fix_bus_timing.sql`

## How to Apply
1. Run `supabase db reset` to clear existing data
2. Or run `supabase db execute -f supabase/fix_bus_timing.sql`

## Verification Queries Included
The fix file includes:
- ✅ Duplicate bus check (same bus, route, time)
- ✅ Overlap check (same bus at overlapping times)
- ✅ Sample data verification (Dhaka→Chittagong schedules)
- ✅ Distribution check (routes per bus)
- ✅ Route coverage check (unique buses per route)

## Expected Result
After applying the fix:
- Each route gets exactly one unique bus per departure time
- No duplicate schedules for the same route and time
- Even distribution of routes across all available buses

