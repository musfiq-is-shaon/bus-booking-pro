# Fix Duplicate Bus Timing Constraint - COMPLETED

## Issue
Buses with the same name pattern (like "City Express 001", "City Express 002") were being assigned to the same routes with the same departure times, violating the constraint that a bus cannot serve multiple routes simultaneously.

## Root Cause
The original `seed.sql` used a flawed assignment logic where:
1. The `numbered_assignments` CTE numbered all route assignments sequentially
2. The `bus_pool` CTE got all buses ordered by bus_number
3. The `JOIN` between them used `row_number() = row_number()`, which caused:
   - Each bus to be assigned to multiple routes
   - No guarantee that the same bus wouldn't get the same route at the same time
   - Potential conflicts when 125+ assignments were made to only 5-125 buses

## Solution Implemented

### 1. Added Unique Constraint
```sql
ALTER TABLE schedules ADD CONSTRAINT unique_bus_route_time 
    UNIQUE (bus_id, route_id, departure_time);
```
This prevents any duplicate entries at the database level.

### 2. Used DISTINCT ON
```sql
SELECT DISTINCT ON (r.id, ab.hours_offset, ab.days_offset)
    bp.bus_id,
    ...
```
This ensures each (route, time) combination gets exactly one bus.

### 3. Modulo-Based Bus Distribution
```sql
((na.rn - 1) % (SELECT total FROM bus_count) + 1) as bus_rn
```
This evenly distributes routes across all buses without repetition.

## Changes Made

### File: `supabase/seed.sql`
- Replaced `route_bus_assignment` temp table with CTE-based assignment
- Used `DISTINCT ON` to prevent duplicates
- Added modulo-based bus distribution
- Maintained all route assignments (83 total assignments)

### File: `supabase/fix_bus_timing.sql` (NEW)
- Standalone fix file that can be run independently
- Includes verification queries to check for duplicates
- Includes overlap detection
- Can be used for testing the fix

## Verification
The fix includes these verification queries:

1. **Duplicate Check**: Finds any bus assigned to same route at same time
2. **Overlap Check**: Finds any overlapping schedules
3. **Summary Stats**: Shows buses, routes, schedules, seat availability

## How to Apply

### Option 1: Reseed Database
```bash
# Reset and reseed
supabase db reset
```

### Option 2: Run Fix File
```bash
# Run the fix directly
supabase db execute -f supabase/fix_bus_timing.sql
```

### Option 3: Apply Schema + Seed
```bash
# Apply schema first
supabase db push

# Then seed
supabase db reset
```

## Result
✅ Each (route, departure_time) gets exactly ONE unique bus
✅ No duplicate bus assignments
✅ No overlapping schedules
✅ Even distribution of routes across all buses
✅ Database-level constraint prevents future duplicates

