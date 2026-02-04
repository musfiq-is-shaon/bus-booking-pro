-- =====================================================
-- AUTO-UPDATE AVAILABLE SEATS TRIGGER
-- This trigger automatically updates available_seats count
-- whenever seat_availability table is modified
-- =====================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_available_seats_on_change ON seat_availability;
DROP FUNCTION IF EXISTS update_available_seats();

-- Create function to auto-update available seats
CREATE OR REPLACE FUNCTION update_available_seats()
RETURNS TRIGGER AS $$
DECLARE
  v_schedule_id UUID;
  v_available_count INTEGER;
BEGIN
  -- Get the schedule_id from the row
  IF TG_OP = 'DELETE' THEN
    v_schedule_id := OLD.schedule_id;
  ELSE
    v_schedule_id := NEW.schedule_id;
  END IF;

  -- Count available seats for this schedule
  SELECT COUNT(*) INTO v_available_count
  FROM seat_availability
  WHERE schedule_id = v_schedule_id
  AND status = 'available';

  -- Update the schedules table
  UPDATE schedules
  SET available_seats = v_available_count,
      updated_at = NOW()
  WHERE id = v_schedule_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT, UPDATE, DELETE on seat_availability
CREATE TRIGGER update_available_seats_on_change
  AFTER INSERT OR UPDATE OR DELETE
  ON seat_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_available_seats();

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'Auto-update available seats trigger created successfully!' AS status;

-- Test the trigger by checking a sample schedule
-- SELECT 
--   s.id,
--   s.available_seats as current_value,
--   (SELECT COUNT(*) FROM seat_availability WHERE schedule_id = s.id AND status = 'available') as calculated_value
-- FROM schedules s
-- LIMIT 1;

