-- =====================================================
-- RESET BOOKING DATA
-- Run this in Supabase SQL Editor to:
-- 1. Delete all booked tickets
-- 2. Restore all seats to available
-- 3. Reset available_seats count to maximum
-- =====================================================

-- 1. First, let's see what we're working with (optional)
SELECT 
  'Current bookings count: ' || COUNT(*) as info 
FROM bookings;

SELECT 
  'Seats by status:' as info,
  status,
  COUNT(*) as count
FROM seat_availability
GROUP BY status;

-- 2. Delete all bookings
DELETE FROM bookings;
SELECT 'All bookings deleted!' as status;

-- 3. Reset all seat availability to 'available' and clear bookings
UPDATE seat_availability
SET 
  status = 'available',
  booked_by = NULL,
  booked_at = NULL,
  lock_expires_at = NULL,
  updated_at = NOW();

SELECT 'All seats reset to available!' as status;

-- 4. Get seat counts per schedule and update available_seats
-- This uses a subquery to calculate the correct counts
UPDATE schedules s
SET 
  available_seats = (
    SELECT COUNT(*) 
    FROM seat_availability sa 
    WHERE sa.schedule_id = s.id AND sa.status = 'available'
  ),
  updated_at = NOW();

SELECT 'Available seats counts updated!' as status;

-- 5. Verify the reset
SELECT 
  'Verification:' as info,
  (SELECT COUNT(*) FROM bookings) as bookings_count,
  (SELECT COUNT(*) FROM seat_availability WHERE status = 'available') as available_seats,
  (SELECT COUNT(*) FROM seat_availability WHERE status = 'booked') as booked_seats,
  (SELECT COUNT(*) FROM seat_availability WHERE status = 'reserved') as reserved_seats;

-- 6. Also reset all schedules status to 'scheduled'
UPDATE schedules
SET status = 'scheduled', updated_at = NOW();
SELECT 'All schedules status reset to scheduled!' as status;

-- =====================================================
-- ALTERNATIVE: Selective Reset
-- =====================================================

-- If you only want to reset seats for past/future schedules:
-- Reset seats for schedules that haven't departed yet
-- UPDATE seat_availability sa
-- SET status = 'available', booked_by = NULL, booked_at = NULL
-- FROM schedules s
-- WHERE sa.schedule_id = s.id 
-- AND s.departure_time > NOW();

-- =====================================================
-- NOTE: 
-- This script will:
-- - Remove all booking records
-- - Set all seats to available
-- - Reset available_seats count to match seat_availability
-- - Reset all schedules to 'scheduled' status
-- =====================================================

