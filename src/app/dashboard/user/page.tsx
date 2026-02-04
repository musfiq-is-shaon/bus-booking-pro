'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Bus, 
  LogOut,
  Search,
  Ticket,
  Settings,
  CheckCircle2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  X
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime, getStatusColor } from '@/lib/utils';

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
    };
    route: {
      from_city: string;
      to_city: string;
    };
  };
}

export default function UserDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ 
    id: string;
    full_name: string | null; 
    email: string;
    phone?: string;
  } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          router.push('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        setUser({
          id: authUser.id,
          full_name: authUser.user_metadata.full_name || profile?.full_name || '',
          email: authUser.email!,
          phone: profile?.phone || '',
        });
        
        setFullName(authUser.user_metadata.full_name || profile?.full_name || '');
        setPhone(profile?.phone || '');

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
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleOpenSettings = () => {
    setMessage(null);
    setShowSettingsModal(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (authError) {
        setMessage({ type: 'error', text: authError.message });
        setSaving(false);
        return;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          full_name: fullName,
          phone: phone,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        setMessage({ type: 'error', text: profileError.message });
        setSaving(false);
        return;
      }

      setUser(prev => prev ? { ...prev, full_name: fullName, phone: phone } : null);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    setChangingPassword(true);
    setMessage(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
        setChangingPassword(false);
        return;
      }

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setChangingPassword(false);
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
              <button onClick={handleLogout} className="btn-ghost btn-sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">
            Welcome back, {user?.full_name || 'Traveler'}!
          </h1>
          <p className="text-secondary-600 mt-1">Manage your bookings and travel plans</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Link href="/search" className="card-hover p-5 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                <Search className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900">Search Buses</h3>
                <p className="text-sm text-secondary-500">Find your next journey</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/bookings" className="card-hover p-5 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                <Ticket className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900">My Bookings</h3>
                <p className="text-sm text-secondary-500">{upcomingBookings.length} upcoming trips</p>
              </div>
            </div>
          </Link>

          <div onClick={handleOpenSettings} className="card-hover p-5 group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                <Settings className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900">Account Settings</h3>
                <p className="text-sm text-secondary-500">Manage your profile</p>
              </div>
            </div>
          </div>
        </div>

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
                    <div key={booking.id} className="p-5 bg-secondary-50 rounded-xl border border-secondary-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-secondary-200">
                            <Bus className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-secondary-900">{booking.schedule.bus.bus_name}</h3>
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
                        <Link href="/dashboard/bookings" className="btn-secondary btn-sm">
                          View Ticket
                        </Link>
                      </div>
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
                  <Link href="/search" className="btn-primary btn-md">Search Buses</Link>
                </div>
              )
            ) : pastBookings.length > 0 ? (
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <div key={booking.id} className="p-5 bg-secondary-50 rounded-xl border border-secondary-100 opacity-75">
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
                    <div className="flex justify-end">
                      <Link href={`/search?from=${booking.schedule.route.from_city}&to=${booking.schedule.route.to_city}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        Book Again
                      </Link>
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

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-secondary-900">Account Settings</h2>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-secondary-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {message.text}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input bg-secondary-50 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input"
                    placeholder="Phone number"
                  />
                </div>

                <button onClick={handleSaveProfile} disabled={saving} className="w-full btn-primary btn-md">
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-secondary-100">
                <h3 className="text-sm font-semibold text-secondary-900 mb-4">Change Password</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input pr-10"
                        placeholder="Min 8 characters"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                      >
                        {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Confirm Password</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input"
                      placeholder="Confirm password"
                    />
                  </div>

                  <button 
                    onClick={handleChangePassword} 
                    disabled={changingPassword || !newPassword || !confirmPassword}
                    className="w-full btn-secondary btn-md"
                  >
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

