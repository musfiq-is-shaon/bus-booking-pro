-- =====================================================
-- FIX SEAT COUNTS
-- Run this in Supabase SQL Editor to sync available_seats
-- =====================================================

-- Fix available_seats in schedules table based on seat_availability
UPDATE schedules s
SET available_seats = (
  SELECT COUNT(*) 
  FROM seat_availability sa 
  WHERE sa.schedule_id = s.id AND sa.status = 'available'
),
updated_at = NOW();

-- Verify the fix
SELECT 
  s.id,
  s.bus_id,
  s.available_seats as cached_count,
  (SELECT COUNT(*) FROM seat_availability WHERE schedule_id = s.id AND status = 'available') as actual_available,
  (SELECT COUNT(*) FROM seat_availability WHERE schedule_id = s.id) as total_seats
FROM schedules s
ORDER BY s.departure_time DESC
LIMIT 20;

