-- =====================================================
-- FIX: Add UPDATE policy for seat_availability
-- =====================================================
-- The current RLS policies don't allow regular users to update 
-- seat availability records, which prevents booking from working properly
-- =====================================================

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can update own seat bookings" ON seat_availability;
DROP POLICY IF EXISTS "Anyone can update seats" ON seat_availability;
DROP POLICY IF EXISTS "Users can book seats" ON seat_availability;

-- Allow users to update seat availability when booking (mark as booked)
CREATE POLICY "Users can book and release seats" ON seat_availability
  FOR UPDATE
  USING (
    status = 'available' 
    OR (status = 'booked' AND booked_by = auth.uid())
    OR (status = 'reserved' AND booked_by = auth.uid())
  )
  WITH CHECK (
    -- Allow setting status to 'booked' when booking
    (status = 'booked' AND booked_by = auth.uid())
    -- OR allow setting status to 'available' when releasing/canceling
    OR (status = 'available' AND booked_by IS NULL)
  );

-- Allow users to view all seat availability (for seeing which seats are taken)
CREATE POLICY "Anyone can view seats" ON seat_availability
  FOR SELECT
  USING (true);

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'RLS policies for seat_availability updated successfully!' AS status;

-- Check existing policies
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'seat_availability';

