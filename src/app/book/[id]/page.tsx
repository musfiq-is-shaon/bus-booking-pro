'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  Bus, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowLeft,
  ChevronRight,
  User,
  Users,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Download
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime, getStatusColor, downloadTicketPDF, type TicketData, isDateTimeInPast } from '@/lib/utils';
import { createBooking, confirmBooking } from '@/actions/bookings';

interface SeatLayout {
  rows: number;
  seatsPerRow: number;
  aisleAfter: number;
}

const BUS_SEAT_LAYOUTS: Record<string, SeatLayout> = {
  standard: { rows: 10, seatsPerRow: 5, aisleAfter: 2 },
  'semi-sleeper': { rows: 10, seatsPerRow: 5, aisleAfter: 2 },
  luxury: { rows: 9, seatsPerRow: 4, aisleAfter: 2 },
  sleeper: { rows: 8, seatsPerRow: 4, aisleAfter: 2 },
};

interface Schedule {
  id: string;
  departure_time: string;
  arrival_time: string;
  available_seats: number;
  bus: {
    id: string;
    bus_name: string;
    bus_type: string;
    total_seats: number;
    amenities: string[];
  };
  route: {
    from_city: string;
    to_city: string;
    price: number;
    estimated_duration_minutes: number | null;
  };
}

interface Seat {
  seat_number: number;
  status: 'available' | 'booked' | 'reserved';
}

interface Passenger {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  email?: string;
  phone?: string;
}

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [currentStep, setCurrentStep] = useState<'seats' | 'passengers' | 'payment' | 'confirmation'>('seats');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingReference, setBookingReference] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      // Add timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        console.warn('Schedule fetch timeout - redirecting');
        setLoading(false);
        router.push('/search');
      }, 10000);

      try {
        const { data, error } = await supabase
          .from('schedules')
          .select(`
            *,
            bus:buses(*),
            route:routes(*)
          `)
          .eq('id', params.id)
          .single();

        if (error || !data) {
          router.push('/search');
          return;
        }

        // Check if the schedule departure time is in the past
        if (isDateTimeInPast(data.departure_time)) {
          router.push('/search?error=past');
          return;
        }

        setSchedule(data);
        
        // Fetch seat availability
        const { data: seatsData } = await supabase
          .from('seat_availability')
          .select('*')
          .eq('schedule_id', params.id)
          .order('seat_number', { ascending: true });

        // Generate seats array
        const seatsArray: Seat[] = [];
        for (let i = 1; i <= data.bus.total_seats; i++) {
          const seatAvailability = seatsData?.find(s => s.seat_number === i);
          seatsArray.push({
            seat_number: i,
            status: seatAvailability?.status as 'available' | 'booked' | 'reserved' || 'available',
          });
        }
        setSeats(seatsArray);
      } catch (error) {
        console.warn('Schedule fetch error:', error);
        router.push('/search');
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [params.id, router, supabase]);

  const handleSeatClick = (seatNumber: number) => {
    const seat = seats.find(s => s.seat_number === seatNumber);
    if (!seat || seat.status !== 'available') return;

    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(s => s !== seatNumber);
      } else {
        // Prevent selecting more than 4 seats
        if (prev.length >= 4) {
          return prev;
        }
        return [...prev, seatNumber];
      }
    });
  };

  const updatePassenger = (index: number, field: keyof Passenger, value: string | number) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const proceedToPassengers = () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }
    setError(null);
    
    // Initialize passengers array
    const initialPassengers: Passenger[] = selectedSeats.map(() => ({
      name: '',
      age: 18,
      gender: 'male' as const,
    }));
    setPassengers(initialPassengers);
    setCurrentStep('passengers');
  };

  // Show message when max seats selected
  const isMaxSeatsSelected = selectedSeats.length >= 4;

  const proceedToPayment = async () => {
    // Validate all passengers
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name.trim() || p.age < 1) {
        setError(`Please fill in all passenger details for passenger ${i + 1}`);
        return;
      }
    }
    setError(null);
    setCurrentStep('payment');
  };

  const handleBooking = async () => {
    setBookingLoading(true);
    setError(null);

    try {
      // Use the createBooking server action which includes daily limit check
      const formData = new FormData();
      formData.append('scheduleId', schedule!.id);
      formData.append('seats', JSON.stringify(selectedSeats));
      formData.append('passengers', JSON.stringify(passengers));
      
      const result = await createBooking(formData);

      if (result.error) {
        setError(result.error);
        setBookingLoading(false);
        return;
      }

      // Confirm the booking directly since user already authenticated
      // This bypasses the server action RLS issue by using client-side update
      const { error: confirmError } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', result.data?.id);

      if (confirmError) {
        setError(`Failed to confirm booking: ${confirmError.message}`);
        setBookingLoading(false);
        return;
      }

      // Booking successful
      setBookingReference(result.data?.booking_reference || null);
      setCurrentStep('confirmation');
    } catch (err) {
      console.error('Booking error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-10 h-10 border-4" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary-600 mb-4">Loading schedule...</p>
        </div>
      </div>
    );
  }

  const totalPrice = selectedSeats.length * (schedule.route?.price || 0);
  const layout = BUS_SEAT_LAYOUTS[schedule.bus?.bus_type || 'standard'] || BUS_SEAT_LAYOUTS.standard;
  const seatsPerRow = layout.seatsPerRow;

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/search" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Bus className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-secondary-900">BusBooking<span className="text-primary-600">Pro</span></span>
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {['seats', 'passengers', 'payment', 'confirmation'].map((step, index) => {
              const stepLabels: Record<string, string> = {
                seats: 'Select Seats',
                passengers: 'Passengers',
                payment: 'Payment',
                confirmation: 'Confirm',
              };
              const isActive = currentStep === step;
              const isCompleted = ['seats', 'passengers', 'payment', 'confirmation'].indexOf(currentStep) > index;
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center gap-2 ${isActive ? 'text-primary-600' : isCompleted ? 'text-emerald-600' : 'text-secondary-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-primary-100' : isCompleted ? 'bg-emerald-100' : 'bg-secondary-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span className="hidden sm:block font-medium">{stepLabels[step]}</span>
                  </div>
                  {index < 3 && (
                    <div className={`w-12 sm:w-24 h-0.5 mx-2 ${isCompleted ? 'bg-emerald-500' : 'bg-secondary-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href={`/search?from=${schedule.route.from_city}&to=${schedule.route.to_city}`} className="inline-flex items-center gap-2 text-secondary-600 hover:text-secondary-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 'seats' && (
              <div className="card">
                <div className="px-6 py-4 border-b border-secondary-100">
                  <h2 className="text-lg font-semibold text-secondary-900">Select Your Seats</h2>
                  <p className="text-sm text-secondary-500">Click on available seats to select them</p>
                </div>
                <div className="p-6">
                  {/* Seat Legend */}
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white border-2 border-secondary-300" />
                      <span className="text-sm text-secondary-600">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary-500 border-2 border-primary-500" />
                      <span className="text-sm text-secondary-600">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-secondary-100 border-2 border-secondary-200" />
                      <span className="text-sm text-secondary-600">Booked</span>
                    </div>
                  </div>

                  {/* Max seats message */}
                  {isMaxSeatsSelected && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                      <p className="text-sm text-amber-800">
                        Maximum 4 seats per booking. Deselect a seat to choose a different one.
                      </p>
                    </div>
                  )}

                  {/* Seat Map */}
                  <div className="flex flex-col items-center gap-2">
                    {Array.from({ length: Math.ceil(seats.length / seatsPerRow) }, (_, rowIndex) => (
                      <div key={rowIndex} className="flex items-center gap-2">
                        {/* Left side seats */}
                        <div className="flex gap-2">
                          {Array.from({ length: layout.aisleAfter }, (_, seatIndex) => {
                            const seatNumber = rowIndex * seatsPerRow + seatIndex + 1;
                            const seat = seats.find(s => s.seat_number === seatNumber);
                            if (!seat) return null;
                            
                            const isSelected = selectedSeats.includes(seatNumber);
                            
                            return (
                              <button
                                key={seatNumber}
                                onClick={() => handleSeatClick(seatNumber)}
                                disabled={seat.status !== 'available'}
                                className={`seat ${
                                  isSelected ? 'seat-selected' :
                                  seat.status === 'booked' ? 'seat-booked' :
                                  seat.status === 'reserved' ? 'seat-reserved' :
                                  'seat-available'
                                }`}
                              >
                                {seatNumber}
                              </button>
                            );
                          })}
                        </div>

                        {/* Aisle */}
                        <div className="w-8" />

                        {/* Right side seats */}
                        <div className="flex gap-2">
                          {Array.from({ length: seatsPerRow - layout.aisleAfter }, (_, seatIndex) => {
                            const seatNumber = rowIndex * seatsPerRow + layout.aisleAfter + seatIndex + 1;
                            const seat = seats.find(s => s.seat_number === seatNumber);
                            if (!seat) return null;
                            
                            const isSelected = selectedSeats.includes(seatNumber);
                            
                            return (
                              <button
                                key={seatNumber}
                                onClick={() => handleSeatClick(seatNumber)}
                                disabled={seat.status !== 'available'}
                                className={`seat ${
                                  isSelected ? 'seat-selected' :
                                  seat.status === 'booked' ? 'seat-booked' :
                                  seat.status === 'reserved' ? 'seat-reserved' :
                                  'seat-available'
                                }`}
                              >
                                {seatNumber}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Front of bus indicator */}
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-100 rounded-lg">
                      <Bus className="w-4 h-4 text-secondary-400" />
                      <span className="text-sm text-secondary-500">Front of Bus</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'passengers' && (
              <div className="card">
                <div className="px-6 py-4 border-b border-secondary-100">
                  <h2 className="text-lg font-semibold text-secondary-900">Passenger Details</h2>
                  <p className="text-sm text-secondary-500">Enter details for {selectedSeats.length} passenger(s)</p>
                </div>
                <div className="p-6 space-y-6">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="p-4 bg-secondary-50 rounded-xl">
                      <h3 className="font-medium text-secondary-900 mb-4 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Passenger {index + 1} (Seat {selectedSeats[index]})
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={passenger.name}
                            onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                            className="input"
                            placeholder="Enter full name"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-2">Age</label>
                          <input
                            type="number"
                            value={passenger.age}
                            onChange={(e) => updatePassenger(index, 'age', parseInt(e.target.value) || 0)}
                            className="input"
                            min="1"
                            max="120"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-2">Gender</label>
                          <select
                            value={passenger.gender}
                            onChange={(e) => updatePassenger(index, 'gender', e.target.value as 'male' | 'female' | 'other')}
                            className="input appearance-none cursor-pointer"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-2">Email (Optional)</label>
                          <input
                            type="email"
                            value={passenger.email || ''}
                            onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                            className="input"
                            placeholder="Enter email"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'payment' && (
              <div className="card">
                <div className="px-6 py-4 border-b border-secondary-100">
                  <h2 className="text-lg font-semibold text-secondary-900">Payment</h2>
                  <p className="text-sm text-secondary-500">Complete your booking</p>
                </div>
                <div className="p-6">
                  <div className="p-4 bg-secondary-50 rounded-xl mb-6">
                    <h3 className="font-medium text-secondary-900 mb-2">Demo Payment</h3>
                    <p className="text-sm text-secondary-600">
                      This is a demo. No actual payment will be processed.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 p-4 border border-secondary-200 rounded-xl">
                    <CreditCard className="w-8 h-8 text-secondary-400" />
                    <div>
                      <p className="font-medium text-secondary-900">Demo Payment Method</p>
                      <p className="text-sm text-secondary-500">Click below to complete booking</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'confirmation' && (
              <div className="card">
                <div className="p-6 text-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-secondary-900 mb-2">Booking Confirmed!</h2>
                  <p className="text-secondary-600 mb-6">
                    Your booking reference is <span className="font-mono font-bold text-primary-600">{bookingReference}</span>
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={() => {
                        const ticketData: TicketData = {
                          bookingReference: bookingReference || '',
                          passengerName: passengers[0]?.name || 'Passenger',
                          fromCity: schedule.route?.from_city || 'Unknown',
                          toCity: schedule.route?.to_city || 'Unknown',
                          departureDate: formatDate(schedule.departure_time),
                          departureTime: formatTime(schedule.departure_time),
                          arrivalTime: formatTime(schedule.arrival_time),
                          busName: schedule.bus?.bus_name || 'Unknown Bus',
                          busType: schedule.bus?.bus_type || 'standard',
                          seats: selectedSeats,
                          price: totalPrice,
                        };
                        downloadTicketPDF(ticketData);
                      }}
                      className="btn-primary btn-md flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download Ticket
                    </button>
                    <Link href="/dashboard/bookings" className="btn-secondary btn-md">
                      View My Bookings
                    </Link>
                    <Link href="/search" className="btn-ghost btn-md">
                      Book Another Trip
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <div className="px-6 py-4 border-b border-secondary-100">
                <h2 className="text-lg font-semibold text-secondary-900">Booking Summary</h2>
              </div>
              <div className="p-6">
                {/* Route Info */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <span className="font-medium text-secondary-900">{schedule.route.from_city}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-6">
                    <div className="w-0.5 h-4 bg-secondary-200" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <span className="font-medium text-secondary-900">{schedule.route.to_city}</span>
                  </div>
                </div>

                {/* Bus Info */}
                <div className="mb-6 p-4 bg-secondary-50 rounded-xl">
                  <h3 className="font-medium text-secondary-900">{schedule.bus.bus_name}</h3>
                  <p className="text-sm text-secondary-500">{schedule.bus.bus_type}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4 text-secondary-400" />
                    <span className="text-sm text-secondary-600">{formatDate(schedule.departure_time)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-secondary-400" />
                    <span className="text-sm text-secondary-600">{formatTime(schedule.departure_time)}</span>
                  </div>
                </div>

                {/* Selected Seats */}
                {selectedSeats.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium text-secondary-900 mb-2">Selected Seats</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.sort((a, b) => a - b).map(seat => (
                        <span key={seat} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium">
                          Seat {seat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="border-t border-secondary-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-secondary-600">Price per seat</span>
                    <span className="font-medium text-secondary-900">{formatCurrency(schedule.route.price)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-secondary-600">Seats</span>
                    <span className="font-medium text-secondary-900">x {selectedSeats.length}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-lg mt-4 pt-4 border-t border-secondary-100">
                    <span className="text-secondary-900">Total</span>
                    <span className="text-primary-600">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>

                {/* Action Button */}
                {currentStep !== 'confirmation' && (
                  <div className="mt-6">
                    {currentStep === 'seats' ? (
                      <button
                        onClick={proceedToPassengers}
                        disabled={selectedSeats.length === 0}
                        className="w-full btn-primary btn-lg"
                      >
                        Continue
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </button>
                    ) : currentStep === 'passengers' ? (
                      <button
                        onClick={proceedToPayment}
                        className="w-full btn-primary btn-lg"
                      >
                        Continue to Payment
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </button>
                    ) : currentStep === 'payment' ? (
                      <button
                        onClick={handleBooking}
                        disabled={bookingLoading}
                        className="w-full btn-primary btn-lg"
                      >
                        {bookingLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="spinner" />
                            Booking...
                          </span>
                        ) : (
                          <>
                            Confirm Booking - {formatCurrency(totalPrice)}
                            <CheckCircle2 className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

