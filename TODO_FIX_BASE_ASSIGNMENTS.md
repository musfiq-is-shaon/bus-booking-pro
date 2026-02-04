# Fix base_assignments INSERT Error

## Problem
SQL Error: INSERT has more expressions than target columns
- `base_assignments` table has 3 columns: (route_from, route_to, hours_offset)
- But INSERT provides 4 values per row including days_offset

## Root Cause
The `base_assignments` INSERT statement incorrectly includes `days_offset` (extra column):
```sql
SELECT 'Dhaka', 'Chittagong', 4, 0 UNION ALL  -- 4 values, should be 3
```

## Fix Required
Remove the extra `0` (days_offset) from ALL SELECT statements in the base_assignments INSERT.

The days_offset is correctly added later:
```sql
INSERT INTO unique_assignments (route_from, route_to, hours_offset, days_offset)
SELECT ba.route_from, ba.route_to, ba.hours_offset, gs.day_offset
FROM base_assignments ba
CROSS JOIN generate_series(0, 3) AS gs(day_offset);
```

## Files to Edit
- supabase/seed.sql

## Steps
1. Find line 326 area with `INSERT INTO base_assignments`
2. Remove trailing `0` from all SELECT statements
3. Verify only 3 values per SELECT: route_from, route_to, hours_offset

