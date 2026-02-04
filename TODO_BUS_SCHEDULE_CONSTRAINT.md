# Bus Schedule Constraint Implementation Plan

## Problem Statement
Buses are unique physical vehicles that cannot serve multiple routes simultaneously. A bus cannot be on two different routes at the same time. This constraint must be enforced at the database level.

## Issues Identified in Current Seed Data
1. **No database constraint** prevents overlapping schedules
2. **Seed data may have conflicts** - same bus assigned to multiple routes departing at the same time
3. **No consideration for travel time** when assigning buses to reverse routes

## Solution Components

### Component 1: Database Constraint
Add a PostgreSQL function + trigger to validate that:
- A bus cannot have overlapping schedules
- Account for travel time (arrival_time) not just departure_time
- Optional: Add buffer/turnaround time between trips

### Component 2: Fix Seed Data
Ensure seed data follows the constraint:
- No bus has overlapping schedules
- Proper time gaps between a bus's trips (accounting for travel + turnaround)
- Each route has multiple buses but without conflicts

## Implementation Steps

### Step 1: Add Overlap Prevention Function
```sql
CREATE OR REPLACE FUNCTION prevent_bus_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there's any existing schedule for this bus that overlaps
  -- with the new schedule (including arrival time)
  IF EXISTS (
    SELECT 1 FROM schedules
    WHERE bus_id = NEW.bus_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND (
      -- New schedule starts before existing schedule ends
      (NEW.departure_time < arrival_time AND NEW.departure_time >= departure_time)
      OR
      -- New schedule ends after existing schedule starts
      (NEW.arrival_time > departure_time AND NEW.arrival_time <= arrival_time)
      OR
      -- New schedule completely contains existing schedule
      (NEW.departure_time <= departure_time AND NEW.arrival_time >= arrival_time)
    )
  ) THEN
    RAISE EXCEPTION 'Bus cannot have overlapping schedules';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_bus_overlap
  BEFORE INSERT OR UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION prevent_bus_overlap();
```

### Step 2: Update Seed Data
Create bus assignment logic that ensures:
1. No bus is assigned to routes that would cause time conflicts
2. Consider travel duration + turnaround time (e.g., 60 min)
3. Distribute buses across routes realistically

### Step 3: Verification
Query to check for any remaining conflicts:
```sql
-- Find overlapping schedules for any bus
SELECT 
  s1.bus_id,
  b.bus_number,
  s1.route_id as route1,
  r1.from_city || ' -> ' || r1.to_city as route1_name,
  s1.departure_time as dep1,
  s1.arrival_time as arr1,
  s2.route_id as route2,
  r2.from_city || ' -> ' || r2.to_city as route2_name,
  s2.departure_time as dep2,
  s2.arrival_time as arr2
FROM schedules s1
JOIN schedules s2 ON s1.bus_id = s2.bus_id 
  AND s1.id < s2.id  -- Avoid self-join duplicates
JOIN buses b ON s1.bus_id = b.id
JOIN routes r1 ON s1.route_id = r1.id
JOIN routes r2 ON s2.route_id = r2.id
WHERE s1.departure_time < s2.arrival_time 
  AND s2.departure_time < s1.arrival_time;
```

## Files to Modify
1. `/Users/musfiqulislamshaon/training-ground-7/supabase/schema.sql` - Add constraint function + trigger
2. `/Users/musfiqulislamshaon/training-ground-7/supabase/seed.sql` - Fix bus assignments to prevent conflicts

## Success Criteria
1. Database prevents overlapping schedules via trigger
2. Seed data contains no overlapping schedules
3. Each bus has realistic route assignments with proper time gaps
4. All routes still have coverage (multiple buses per route)

