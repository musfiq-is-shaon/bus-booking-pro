'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from './auth';
import { generateBookingReference, isDateTimeInPast } from '@/lib/utils';
import { searchSchedulesSchema, createBookingSchema } from '@/lib/schemas';

export async function searchSchedules(formData: FormData) {
  const rawData = {
    fromCity: formData.get('from') as string,
    toCity: formData.get('to') as string,
    date: formData.get('date') as string,
  };

  const validated = searchSchedulesSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  try {
    const supabase = await createClient();

    // Get route
    const { data: route } = await supabase
      .from('routes')
      .select('id')
      .eq('from_city', validated.data.fromCity)
      .eq('to_city', validated.data.toCity)
      .eq('is_active', true)
      .single();

    if (!route) {
      return { error: 'No routes found for this journey' };
    }

    // Get schedules for the date
    const startOfDay = new Date(validated.data.date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(validated.data.date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: schedules, error } = await supabase
      .from('schedules')
      .select(`
        *,
        bus:buses(*),
        route:routes(*)
      `)
      .eq('route_id', route.id)
      .eq('status', 'scheduled')
      .gte('departure_time', startOfDay.toISOString())
      .lte('departure_time', endOfDay.toISOString())
      .gt('available_seats', 0)
      .order('departure_time', { ascending: true });

    if (error) {
      return { error: error.message };
    }

    return { success: true, data: schedules };
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

// Get seat availability
export async function getSeatAvailability(scheduleId: string) {
  try {
    const supabase = await createClient();

    const { data: seats, error } = await supabase
      .from('seat_availability')
      .select('*')
      .eq('schedule_id', scheduleId)
      .order('seat_number', { ascending: true });

    if (error) {
      return { error: error.message };
    }

    return { success: true, data: seats };
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function createBooking(formData: FormData) {
  console.log('[createBooking] Starting booking process...');
  
  const rawData = {
    scheduleId: formData.get('scheduleId') as string || '',
    seats: JSON.parse(formData.get('seats') as string || '[]'),
    passengers: JSON.parse(formData.get('passengers') as string || '[]'),
    notes: formData.get('notes') as string || undefined,
  };

  console.log('[createBooking] Raw data:', JSON.stringify(rawData, null, 2));

  const validated = createBookingSchema.safeParse(rawData);

  if (!validated.success) {
    console.log('[createBooking] Validation failed:', validated.error.errors);
    return { error: validated.error.errors[0].message };
  }

  try {
    const supabase = await createClient();
    console.log('[createBooking] Supabase client created');

    // Get current user from auth directly
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    console.log('[createBooking] Auth user:', authUser?.id, 'Error:', authError);

    if (authError || !authUser) {
      return { error: 'Please sign in to book tickets' };
    }

    // Get schedule details first
    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .select(`
        *,
        route:routes(price),
        bus:buses(total_seats)
      `)
      .eq('id', validated.data.scheduleId)
      .single();

    console.log('[createBooking] Schedule:', schedule ? 'found' : 'not found', 'Error:', scheduleError);

    if (scheduleError || !schedule) {
      return { error: 'Schedule not found' };
    }

    // Check if the schedule departure time is in the past
    if (isDateTimeInPast(schedule.departure_time)) {
      console.log('[createBooking] Schedule is in the past, blocking booking');
      return { error: 'Cannot book tickets for a schedule that has already departed. Please select an upcoming bus.' };
    }

    // Check if seats are still available
    const { data: existingSeats, error: seatsError } = await supabase
      .from('seat_availability')
      .select('*')
      .eq('schedule_id', validated.data.scheduleId)
      .in('seat_number', validated.data.seats);

    console.log('[createBooking] Existing seats check:', existingSeats?.length, 'Error:', seatsError);

    if (seatsError) {
      return { error: 'Failed to check seat availability' };
    }

    const bookedSeats = existingSeats?.filter(s => s.status === 'booked') || [];
    const reservedSeats = existingSeats?.filter(s => 
      s.status === 'reserved' && new Date(s.lock_expires_at) > new Date()
    ) || [];

    const unavailableSeats = [...bookedSeats, ...reservedSeats];

    console.log('[createBooking] Unavailable seats:', unavailableSeats);

    if (unavailableSeats.length > 0) {
      return { error: `Seats ${unavailableSeats.map(s => s.seat_number).join(', ')} are no longer available` };
    }

    // Calculate total price
    const totalPrice = schedule.route.price * validated.data.seats.length;
    console.log('[createBooking] Total price:', totalPrice);

    // Create booking
    const bookingReference = generateBookingReference();
    console.log('[createBooking] Creating booking with ref:', bookingReference);
    
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_reference: bookingReference,
        user_id: authUser.id,
        schedule_id: validated.data.scheduleId,
        seats_booked: validated.data.seats,
        passenger_details: validated.data.passengers,
        total_price: totalPrice,
        notes: validated.data.notes,
        status: 'confirmed',
      })
      .select()
      .single();

    console.log('[createBooking] Booking created:', booking ? 'success' : 'failed', 'Error:', bookingError);

    if (bookingError) {
      return { error: bookingError.message };
    }

    // Lock seats temporarily
    console.log('[createBooking] Locking seats...');
    
    // Use UPDATE instead of upsert because RLS policy only allows UPDATE (not INSERT) for non-admin users
    // The seat_availability records are pre-created when schedules are created
    const { error: lockError } = await supabase
      .from('seat_availability')
      .update({
        status: 'reserved',
        booked_by: authUser.id,
        lock_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        updated_at: new Date().toISOString()
      })
      .eq('schedule_id', validated.data.scheduleId)
      .in('seat_number', validated.data.seats);

    console.log('[createBooking] Seats locked, Error:', lockError);

    if (lockError) {
      return { error: `Failed to reserve seats: ${lockError.message}` };
    }

    // Revalidate all relevant paths to update seat availability across the app
    revalidatePath('/dashboard');
    revalidatePath('/book/' + validated.data.scheduleId);
    revalidatePath('/search');
    
    console.log('[createBooking] Booking successful!');
    return { success: true, data: booking };
  } catch (error) {
    console.error('[createBooking] CAUGHT ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
    return { error: errorMessage };
  }
}

// Confirm booking (payment complete)
export async function confirmBooking(bookingId: string, paymentId?: string) {
  try {
    const supabase = await createClient();

    // First check if booking exists and belongs to user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, status, user_id')
      .eq('id', bookingId)
      .single();

    if (bookingError) {
      return { error: 'Booking not found' };
    }

    if (booking.status === 'confirmed') {
      return { error: 'Booking is already confirmed' };
    }

    if (booking.status === 'cancelled') {
      return { error: 'This booking has been cancelled' };
    }

    // Try to call the database function to confirm booking
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('confirm_booking_and_update_seats', {
        p_booking_id: bookingId,
        p_payment_id: paymentId,
      });

    if (rpcError) {
      // Fallback: Manual confirmation if RPC fails
      console.warn('RPC confirm_booking_and_update_seats failed, using fallback:', rpcError.message);
      
      // Update booking status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          status: 'confirmed',
          payment_id: paymentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (updateError) {
        return { error: `Failed to confirm booking: ${updateError.message}` };
      }

      // Get booking details to update seats
      const { data: confirmedBooking } = await supabase
        .from('bookings')
        .select('seats_booked, schedule_id')
        .eq('id', bookingId)
        .single();

      if (confirmedBooking) {
        // Update seat availability
        await supabase
          .from('seat_availability')
          .update({
            status: 'booked',
            booked_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('schedule_id', confirmedBooking.schedule_id)
          .in('seat_number', confirmedBooking.seats_booked);

        // Update available seats count
        const { count } = await supabase
          .from('seat_availability')
          .select('*', { count: 'exact', head: true })
          .eq('schedule_id', confirmedBooking.schedule_id)
          .eq('status', 'available');

        await supabase
          .from('schedules')
          .update({ 
            available_seats: count || 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', confirmedBooking.schedule_id);
      }
    }

    // Revalidate all relevant paths to update seat availability across the app
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/bookings');
    revalidatePath('/book/' + bookingId); // This will trigger seat availability refresh for the specific schedule
    revalidatePath('/search');

    return { success: true, message: 'Booking confirmed successfully' };
  } catch (error) {
    console.error('confirmBooking error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

// Cancel booking
export async function cancelBooking(bookingId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { error: 'Please sign in to cancel booking' };
    }

    const supabase = await createClient();

    // Get booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError) {
      return { error: bookingError.message };
    }

    if (booking.user_id !== user.id && user.role !== 'admin') {
      return { error: 'You are not authorized to cancel this booking' };
    }

    if (booking.status === 'cancelled') {
      return { error: 'Booking is already cancelled' };
    }

    if (booking.status === 'completed') {
      return { error: 'Cannot cancel a completed booking' };
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (updateError) {
      return { error: updateError.message };
    }

    // Release seats
    await supabase
      .from('seat_availability')
      .delete()
      .eq('schedule_id', booking.schedule_id)
      .in('seat_number', booking.seats_booked);

    // Update available seats
    await supabase
      .from('schedules')
      .update({
        available_seats: booking.seats_booked.length
      })
      .eq('id', booking.schedule_id);

    // Revalidate all relevant paths to update seat availability across the app
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/bookings');
    revalidatePath('/book/' + booking.schedule_id);
    revalidatePath('/search');

    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

// Get user bookings
export async function getUserBookings() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { error: 'Please sign in to view bookings' };
    }

    const supabase = await createClient();

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        schedule:schedules(
          *,
          bus:buses(*),
          route:routes(*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { success: true, data: bookings };
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

// Get booking by reference
export async function getBookingByReference(reference: string) {
  try {
    const supabase = await createClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        schedule:schedules(
          *,
          bus:buses(*),
          route:routes(*)
        )
      `)
      .eq('booking_reference', reference)
      .single();

    if (error) {
      return { error: error.message };
    }

    return { success: true, data: booking };
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

