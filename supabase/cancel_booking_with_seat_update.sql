-- =====================================================
-- FUNCTION: CANCEL BOOKING AND RESTORE SEATS
-- This function atomically cancels a booking and restores
-- the seats back to available status
-- =====================================================

CREATE OR REPLACE FUNCTION cancel_booking_with_seat_update(
  p_booking_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_booking bookings;
  v_seats INTEGER[];
  v_count INTEGER;
  v_seat INTEGER;
BEGIN
  -- Get the booking
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
  
  IF v_booking IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Booking not found');
  END IF;

  -- Check authorization
  IF v_booking.user_id != p_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized to cancel this booking');
  END IF;

  -- Check if already cancelled
  IF v_booking.status = 'cancelled' THEN
    RETURN json_build_object('success', false, 'error', 'Booking is already cancelled');
  END IF;

  -- Check if already completed
  IF v_booking.status = 'completed' THEN
    RETURN json_build_object('success', false, 'error', 'Cannot cancel a completed booking');
  END IF;

  -- Update booking status
  UPDATE bookings
  SET status = 'cancelled',
      updated_at = NOW()
  WHERE id = p_booking_id;

  v_seats := v_booking.seats_booked;
  
  -- Release seats - set to available and clear booking info
  -- Using a loop to handle each seat individually
  FOREACH v_seat IN ARRAY v_seats LOOP
    UPDATE seat_availability
    SET status = 'available',
        booked_by = NULL,
        booked_at = NULL,
        lock_expires_at = NULL,
        updated_at = NOW()
    WHERE schedule_id = v_booking.schedule_id AND seat_number = v_seat;
    
    v_count := v_count + 1;
  END LOOP;

  -- The trigger will automatically update available_seats count
  -- But we can also update it directly for immediate consistency
  UPDATE schedules
  SET available_seats = available_seats + v_count,
      updated_at = NOW()
  WHERE id = v_booking.schedule_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Booking cancelled successfully',
    'seats_restored', v_count
  );
END;
$$;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'cancel_booking_with_seat_update function created successfully!' AS status;

