# Bus Schedule Constraint Implementation - COMPLETED

## Summary
Implemented database-level constraint and seed data fixes to ensure buses cannot serve multiple routes simultaneously.

## Changes Made

### 1. Schema Changes (`supabase/schema.sql`)
Added three new PostgreSQL functions:

#### `prevent_bus_overlap()` - Trigger Function
- **Purpose**: Prevents inserting/updating schedules that overlap for the same bus
- **Logic**: Checks if any existing schedule for the bus overlaps with the proposed schedule
- **Enforcement**: RAISES EXCEPTION if conflict detected with detailed error message

#### `validate_bus_schedule_feasibility()`
- **Purpose**: Validates if a proposed schedule is feasible before inserting
- **Checks**: 
  - No overlapping routes
  - Minimum 60-minute turnaround time between trips
- **Returns**: JSON with validation result and reason

#### `get_bus_schedule_timeline()`
- **Purpose**: Returns all scheduled trips for a bus within a date range
- **Use Case**: Visualize bus availability and plan assignments

### 2. Seed Data Fixes (`supabase/seed.sql`)
Completely rewrote schedule generation with proper bus allocation:

#### Key Logic Changes:
1. **Added `days_offset` column** - Return trips scheduled on next day (days_offset=1) instead of same day
2. **Proper bus positioning** - Bus that ends in Chittagong can only serve Chittagong→ routes next day
3. **Travel time consideration** - Arrival time calculated using `estimated_duration_minutes`

#### Bus Allocation Strategy:
- **SYL-001**: Dhaka-based, serves long routes (Chittagong, Coxs Bazar)
- **HAN-002**: Dhaka-based, serves medium routes (Sylhet, Rajshahi)
- **EAG-003**: Chittagong-based for division routes
- **SRT-004**: Regional routes (Rajshahi division)
- **ENA-005**: Short routes and nearby cities

#### Example of the Fix:
**Before (INVALID)**:
```sql
-- Same bus at same time on conflicting routes!
('Dhaka', 'Chittagong', 'SYL-001', 6),    -- 6 AM: Dhaka → Chittagong
('Chittagong', 'Dhaka', 'SYL-001', 6),    -- 6 AM: Chittagong → Dhaka (IMPOSSIBLE!)
```

**After (VALID)**:
```sql
-- Bus completes Dhaka→Chittagong (~12 PM), returns next day
('Dhaka', 'Chittagong', 'SYL-001', 6, 0),   -- Day 0, 6 AM departure
('Chittagong', 'Dhaka', 'SYL-001', 6, 1),   -- Day 1, 6 AM departure (next day!)
```

### 3. Verification Queries
Added to seed.sql:
- Conflict detection query to find overlapping schedules
- Summary statistics (schedules per bus, time distribution)
- Validation output showing conflict check results

## Business Logic Enforced

### Constraint: One Bus = One Location at a Time
```
IF Bus X is on Route A (departure: 6 AM, arrival: 12 PM)
THEN Bus X CANNOT be on any route between 6 AM and 12 PM
AND Bus X can only serve routes starting FROM destination city AFTER 12 PM
```

### Turnaround Time
- Minimum 60 minutes between arrival and next departure
- Applied via `validate_bus_schedule_feasibility()` function

## How to Test

### 1. Run Schema Migration
```bash
# Apply schema.sql (includes new trigger)
supabase db push
```

### 2. Run Seed Data
```bash
# Reset and seed database
supabase db reset
```

### 3. Verify No Conflicts
The seed.sql includes verification queries that output:
- Number of conflicts found (should be 0)
- Schedules per bus (should be balanced)
- Time distribution summary

### 4. Test Constraint
```sql
-- This INSERT will FAIL due to the trigger:
INSERT INTO schedules (bus_id, route_id, departure_time, arrival_time)
SELECT id, (SELECT id FROM routes LIMIT 1),
       NOW(), NOW() + INTERVAL '2 hours'
FROM buses LIMIT 1;
-- ERROR: BUS_SCHEDULE_CONFLICT: Bus cannot have overlapping schedules
```

## Files Modified
1. `/Users/musfiqulislamshaon/training-ground-7/supabase/schema.sql` - Added constraint functions
2. `/Users/musfiqulislamshaon/training-ground-7/supabase/seed.sql` - Fixed bus assignments

## Result
✅ Buses are now unique physical vehicles that cannot be in multiple places at once  
✅ Database prevents schedule conflicts via trigger  
✅ Seed data contains realistic, conflict-free schedules  
✅ Each route still has multiple buses available  
✅ Return trips properly scheduled on next day

