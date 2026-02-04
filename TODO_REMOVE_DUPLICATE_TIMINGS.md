# TODO: Remove Duplicate Bus Route Timings

## Issues Found:
1. **Typo in city name**: `('Sylyet', 'Mymensingh', 'SYL-001', 13)` should be `('Sylhet', 'Mymensingh', 'SYL-001', 13)`
2. **Potential duplicate schedule entries** need to be prevented
3. **Enum type casting issue**: status columns need proper type casting

## Fix Plan:
- [x] Identify the typo in Sylhet Division section
- [x] Fix 'Sylyet' → 'Sylhet'
- [x] Add DISTINCT to INSERT statement to prevent duplicates
- [x] Cast 'scheduled' to 'scheduled'::schedule_status
- [x] Cast 'available' to 'available'::seat_status
- [x] Verify fix works correctly

## Changes Made:
- ✅ Fixed typo in seed.sql: 'Sylyet' → 'Sylhet'
- ✅ Added DISTINCT to SELECT statement to prevent duplicate schedule entries
- ✅ Added proper type casting for status columns
- ✅ Removed trailing newline

## Files Modified:
- `/Users/musfiqulislamshaon/training-ground-7/supabase/seed.sql`

## Summary:
The seed.sql file now has:
1. Correct city names (no typos)
2. DISTINCT keyword prevents duplicate schedule entries
3. Proper type casting for enum columns (schedule_status, seat_status)

