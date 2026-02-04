'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Bus, 
  Calendar, 
  MapPin, 
  Clock, 
  LogOut,
  Search,
  Ticket,
  Settings,
  ChevronRight,
  ArrowLeft,
  Download,
  FileText,
  X,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime, getStatusColor, downloadTicketPDF, type TicketData } from '@/lib/utils';
import { cancelBooking } from '@/actions/bookings';

// Force dynamic rendering to avoid build-time Supabase errors
export const dynamic = 'force-dynamic';

interface Booking {
  id: string;
  booking_reference: string;
  seats_booked: number[];
  total_price: number;
  status: string;
  created_at: string;
  schedule: {
    departure_time: string;
    arrival_time: string;
    bus: {
      bus_name: string;
      bus_type: string;
      amenities: string[];
    };
    route: {
      from_city: string;
      to_city: string;
      price: number;
    };
  };
  passenger_details: {
    name: string;
    age: number;
    gender: string;
  }[];
}

export default function BookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ full_name: string | null; email: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Lazy-load Supabase client inside useEffect to avoid build-time errors
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    // Initialize Supabase client on the client side only
    setSupabase(createClient());
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const checkAuthAndFetchData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          router.push('/login');
          return;
        }

        setUser({
          full_name: authUser.user_metadata.full_name,
          email: authUser.email!,
        });

        // Fetch bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`
            *,
            schedule:schedules(
              *,
              bus:buses(*),
              route:routes(*)
            )
          `)
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false });

        setBookings(bookingsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [router, supabase]);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleDownloadTicket = (booking: Booking) => {
    const ticketData: TicketData = {
      bookingReference: booking.booking_reference,
      passengerName: booking.passenger_details?.[0]?.name || user?.full_name || 'Passenger',
      fromCity: booking.schedule.route.from_city,
      toCity: booking.schedule.route.to_city,
      departureDate: formatDate(booking.schedule.departure_time),
      departureTime: formatTime(booking.schedule.departure_time),
      arrivalTime: formatTime(booking.schedule.arrival_time),
      busName: booking.schedule.bus.bus_name,
      busType: booking.schedule.bus.bus_type,
      seats: booking.seats_booked,
      price: booking.total_price,
    };
    downloadTicketPDF(ticketData);
  };

  const handleViewTicket = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowTicketModal(true);
  };

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking || !supabase) return;
    
    setCancelLoading(true);
    setMessage(null);
    
    try {
      const result = await cancelBooking(selectedBooking.id);
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Booking cancelled successfully!' });
        setShowCancelModal(false);
        // Refresh bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`
            *,
            schedule:schedules(
              *,
              bus:buses(*),
              route:routes(*)
            )
          `)
          .eq('user_id', user?.email)
          .order('created_at', { ascending: false });
        setBookings(bookingsData || []);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setCancelLoading(false);
    }
  };

  const upcomingBookings = bookings.filter(
    b => new Date(b.schedule.departure_time) > new Date() && b.status !== 'cancelled'
  );
  const pastBookings = bookings.filter(
    b => new Date(b.schedule.departure_time) <= new Date() || b.status === 'completed' || b.status === 'cancelled'
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8 border-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Bus className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-secondary-900">BusBooking<span className="text-primary-600">Pro</span></span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/search" className="btn-secondary btn-sm hidden sm:inline-flex">
                <Search className="w-4 h-4 mr-2" />
                Search Buses
              </Link>
              <Link href="/dashboard" className="btn-ghost btn-sm">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-ghost btn-sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-secondary-600 hover:text-secondary-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">My Bookings</h1>
          <p className="text-secondary-600 mt-1">View and manage all your bookings</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <Ticket className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        {/* Bookings Section */}
        <div className="card">
          <div className="border-b border-secondary-100">
            <div className="flex gap-6 px-6">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'upcoming'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700'
                }`}
              >
                Upcoming Trips ({upcomingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'past'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700'
                }`}
              >
                Past Trips ({pastBookings.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'upcoming' ? (
              upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-5 bg-secondary-50 rounded-xl border border-secondary-100 hover:border-primary-200 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-secondary-200">
                            <Bus className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-secondary-900">
                              {booking.schedule.bus.bus_name}
                            </h3>
                            <p className="text-sm text-secondary-500">{booking.schedule.bus.bus_type}</p>
                          </div>
                        </div>
                        <span className={`badge ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-secondary-500 mb-1">From</p>
                          <p className="font-medium text-secondary-900">{booking.schedule.route.from_city}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500 mb-1">To</p>
                          <p className="font-medium text-secondary-900">{booking.schedule.route.to_city}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500 mb-1">Date & Time</p>
                          <p className="font-medium text-secondary-900">{formatDate(booking.schedule.departure_time)}</p>
                          <p className="text-sm text-secondary-500">{formatTime(booking.schedule.departure_time)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500 mb-1">Seats</p>
                          <p className="font-medium text-secondary-900">{booking.seats_booked.join(', ')}</p>
                          <p className="text-sm text-secondary-500">{booking.seats_booked.length} passenger(s)</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                        <div>
                          <p className="text-sm text-secondary-500">Total Paid</p>
                          <p className="text-lg font-bold text-secondary-900">{formatCurrency(booking.total_price)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleViewTicket(booking)}
                            className="btn-secondary btn-sm flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            View Ticket
                          </button>
                          <button 
                            onClick={() => handleDownloadTicket(booking)}
                            className="btn-primary btn-sm flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                          <button 
                            onClick={() => handleCancelClick(booking)}
                            className="btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-secondary-500 mt-2">Ref: {booking.booking_reference}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Ticket className="w-8 h-8 text-secondary-400" />
                  </div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">No upcoming trips</h3>
                  <p className="text-secondary-500 mb-4">Start planning your next adventure!</p>
                  <Link href="/search" className="btn-primary btn-md">
                    Search Buses
                  </Link>
                </div>
              )
            ) : pastBookings.length > 0 ? (
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-5 bg-secondary-50 rounded-xl border border-secondary-100 opacity-75"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-secondary-200">
                          <Bus className="w-5 h-5 text-secondary-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-secondary-700">
                            {booking.schedule.route.from_city} → {booking.schedule.route.to_city}
                          </h3>
                          <p className="text-sm text-secondary-500">{formatDate(booking.schedule.departure_time)}</p>
                        </div>
                      </div>
                      <span className={`badge ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-secondary-500">Ref: {booking.booking_reference}</span>
                      <button 
                        onClick={() => handleDownloadTicket(booking)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Download Ticket
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-secondary-500">No past trips yet</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* View Ticket Modal */}
      {showTicketModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-secondary-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-secondary-900">E-Ticket</h2>
              <button 
                onClick={() => setShowTicketModal(false)}
                className="p-2 hover:bg-secondary-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Booking Reference */}
              <div className="bg-secondary-50 rounded-xl p-4 text-center mb-6">
                <p className="text-sm text-secondary-500 mb-1">Booking Reference</p>
                <p className="text-2xl font-mono font-bold text-primary-600">{selectedBooking.booking_reference}</p>
              </div>

              {/* Route */}
              <div className="flex items-center justify-between mb-6 p-4 bg-secondary-50 rounded-xl">
                <div className="text-center">
                  <p className="text-lg font-bold text-secondary-900">{selectedBooking.schedule.route.from_city}</p>
                  <p className="text-sm text-secondary-500">{formatDate(selectedBooking.schedule.departure_time)}</p>
                  <p className="text-sm text-secondary-500">{formatTime(selectedBooking.schedule.departure_time)}</p>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-full max-w-[100px] border-t-2 border-dashed border-secondary-300 relative">
                    <Bus className="w-6 h-6 text-primary-600 bg-white absolute left-1/2 -translate-x-1/2 -top-3" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-secondary-900">{selectedBooking.schedule.route.to_city}</p>
                  <p className="text-sm text-secondary-500">{formatDate(selectedBooking.schedule.arrival_time)}</p>
                  <p className="text-sm text-secondary-500">{formatTime(selectedBooking.schedule.arrival_time)}</p>
                </div>
              </div>

              {/* Bus Details */}
              <div className="mb-6">
                <h3 className="font-semibold text-secondary-900 mb-3">Bus Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary-50 rounded-lg">
                    <p className="text-sm text-secondary-500">Bus Name</p>
                    <p className="font-medium">{selectedBooking.schedule.bus.bus_name}</p>
                  </div>
                  <div className="p-3 bg-secondary-50 rounded-lg">
                    <p className="text-sm text-secondary-500">Bus Type</p>
                    <p className="font-medium">{selectedBooking.schedule.bus.bus_type}</p>
                  </div>
                </div>
              </div>

              {/* Seats */}
              <div className="mb-6">
                <h3 className="font-semibold text-secondary-900 mb-3">Seat(s)</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.seats_booked.map(seat => (
                    <span key={seat} className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-bold">
                      Seat {seat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Passengers */}
              <div className="mb-6">
                <h3 className="font-semibold text-secondary-900 mb-3">Passenger(s)</h3>
                <div className="space-y-2">
                  {selectedBooking.passenger_details?.map((p, i) => (
                    <div key={i} className="p-3 bg-secondary-50 rounded-lg">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-secondary-500">{p.age} years, {p.gender}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-sm text-emerald-600 mb-1">Total Paid</p>
                <p className="text-3xl font-bold text-emerald-700">{formatCurrency(selectedBooking.total_price)}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => {
                    handleDownloadTicket(selectedBooking);
                    setShowTicketModal(false);
                  }}
                  className="flex-1 btn-primary btn-md"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Ticket
                </button>
                <button 
                  onClick={() => setShowTicketModal(false)}
                  className="flex-1 btn-secondary btn-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 text-center border-b border-secondary-100">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900">Cancel Booking?</h2>
              <p className="text-secondary-600 mt-2">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
            </div>
            
            <div className="p-6">
              <div className="bg-secondary-50 rounded-xl p-4 mb-4">
                <p className="font-medium text-secondary-900">{selectedBooking.schedule.bus.bus_name}</p>
                <p className="text-sm text-secondary-500">
                  {selectedBooking.schedule.route.from_city} → {selectedBooking.schedule.route.to_city}
                </p>
                <p className="text-sm text-secondary-500">
                  {formatDate(selectedBooking.schedule.departure_time)} at {formatTime(selectedBooking.schedule.departure_time)}
                </p>
                <p className="text-sm text-secondary-500 mt-1">Seats: {selectedBooking.seats_booked.join(', ')}</p>
              </div>
              
              <div className="text-center mb-4">
                <p className="text-sm text-secondary-500">Refund will be processed within 5-7 business days</p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleConfirmCancel}
                  disabled={cancelLoading}
                  className="flex-1 btn-md bg-red-600 text-white hover:bg-red-700"
                >
                  {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Booking'}
                </button>
                <button 
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelLoading}
                  className="flex-1 btn-secondary btn-md"
                >
                  No, Keep Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

