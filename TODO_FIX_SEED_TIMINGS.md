# TODO: Fix Bus Timing to Have Multiple Times Per Route

## Problem
Buses currently have only ONE schedule per route (e.g., Dhaka→Chittagong only at 6:00 AM). Real bus schedules should have multiple departure times: Morning, Afternoon, Evening, Night.

## Plan
1. Modify `seed.sql` to add multiple time slots per route
2. Each route will have 3-4 departure times per day (e.g., 6 AM, 2 PM, 10 PM)
3. Ensure no bus scheduling conflicts using the overlap prevention trigger

## Implementation Steps
- [x] 1. Rewrite unique_assignments to have multiple hours_offset values
- [x] 2. Added more buses (475 total) for unique route assignments
- [x] 3. Added 5-6 time slots per route for maximum schedule variety
- [x] 4. Added HIGH-FREQUENCY schedules for Dhaka routes (10-20 buses per route per day!)
- [ ] 5. Run seed to verify varied timings are created
- [ ] 6. Verify no overlapping schedules exist



## Target Schedule Pattern
- Morning: 5 AM - 9 AM (2-3 departures)
- Midday: 10 AM - 2 PM (2-3 departures)
- Afternoon: 3 PM - 6 PM (2-3 departures)
- Evening/Night: 7 PM - 11 PM (2-3 departures)

## Files to Modify
- `supabase/seed.sql` - main seed data file

