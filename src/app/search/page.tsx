'use client';

import { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  Bus, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowLeft,
  Search,
  ChevronRight,
  Star,
  Sun,
  Moon,
  User,
  LogOut,
  Menu
} from 'lucide-react';
import { formatCurrency, formatTime, formatDate, CITIES, BUS_TYPES, isDateInPast } from '@/lib/utils';
import { useTheme } from '@/lib/theme-provider';

// Calculate price based on distance if route price is null or 0
function calculatePrice(price: number | null | undefined, distanceKm: number | null | undefined): number {
  if (price && price > 0) return price;
  
  // Default pricing based on distance (BDT) - realistic Bangladesh bus fares
  const distance = distanceKm || 100;
  
  // Short distance (up to 100km)
  if (distance <= 50) return 150;
  if (distance <= 75) return 200;
  if (distance <= 100) return 350;
  
  // Medium distance (100-200km)
  if (distance <= 125) return 450;
  if (distance <= 150) return 500;
  if (distance <= 175) return 550;
  if (distance <= 200) return 600;
  
  // Long distance (200-350km)
  if (distance <= 250) return 750;
  if (distance <= 300) return 900;
  if (distance <= 350) return 1050;
  
  // Very long distance (350km+)
  if (distance <= 400) return 1200;
  if (distance <= 450) return 1350;
  if (distance > 450) return 1500;
  
  return 450; // Default fallback
}

interface Schedule {
  id: string;
  departure_time: string;
  arrival_time: string;
  available_seats: number;
  bus: {
    bus_name: string;
    bus_type: string;
    amenities: string[];
  };
  route: {
    from_city: string;
    to_city: string;
    price: number;
    distance_km?: number | null;
  };
}

interface BusData {
  id: string;
  bus_name: string;
  bus_type: string;
  amenities: string[];
}

interface RouteData {
  id: string;
  from_city: string;
  to_city: string;
  price: number;
  distance_km?: number | null;
}

interface EnrichedSchedule {
  id: string;
  departure_time: string;
  arrival_time: string;
  available_seats: number;
  bus: BusData;
  route: RouteData;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { theme, toggleTheme } = useTheme();
  
  const [fromCity, setFromCity] = useState(searchParams.get('from') || '');
  const [toCity, setToCity] = useState(searchParams.get('to') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [schedules, setSchedules] = useState<EnrichedSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Use a ref to track if we've initialized to prevent duplicate searches
  const initializedRef = useRef(false);

  useEffect(() => {
    checkUser();
    
    // Check for past schedule error
    if (searchParams.get('error') === 'past') {
      setErrorMessage('This bus has already departed. Please select an upcoming bus.');
      // Clear the error query param
      router.replace('/search', { scroll: false });
    }
  }, [searchParams, router]);

  const checkUser = async () => {
    if (!supabase) {
      setLoadingUser(false);
      return;
    }
    
    try {
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const { data: { user: currentUser } } = await Promise.race([
        supabase.auth.getUser(),
        timeoutPromise.then(() => ({ data: { user: null }, error: null }))
      ]);
      
      setUser(currentUser);
    } catch (error) {
      console.warn('User check timed out or error:', error);
      // Set user to null on error/timeout
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  // Get day bounds - simplified to use local date
  const getDayBounds = (dateStr: string) => {
    // Parse YYYY-MM-DD and create date at local midnight
    const dateObj = new Date(dateStr + 'T00:00:00');
    const startOfDay = dateObj.toISOString();
    const endOfDay = new Date(dateObj.getTime() + 24 * 60 * 60 * 1000).toISOString();
    return { start: startOfDay, end: endOfDay };
  };

  // Get day bounds in Bangladesh time (UTC+6)
  const getDayBoundsLocal = (dateStr: string) => {
    // Parse YYYY-MM-DD
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(5, 7)) - 1;
    const day = parseInt(dateStr.substring(8, 10));
    
    // Bangladesh is UTC+6
    // Local midnight = 18:00 UTC previous day
    // So for Feb 4 local, we search from Feb 3 18:00 UTC to Feb 4 18:00 UTC
    const startOfDay = new Date(Date.UTC(year, month, day, 18, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month, day + 1, 18, 0, 0));
    
    return {
      start: startOfDay.toISOString(),
      end: endOfDay.toISOString()
    };
  };

  const handleSearch = useCallback(async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault();
    
    // Validate inputs
    if (!fromCity || !toCity || !date) {
      setErrorMessage('Please fill in all search fields');
      return;
    }

    // Check if selected date is in the past
    if (isDateInPast(date)) {
      setErrorMessage('Cannot search for past dates. Please select today or a future date.');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setErrorMessage(null);

    try {
      const { start: startISO, end: endISO } = getDayBoundsLocal(date);

      // First, fetch routes matching the cities
      const { data: routes, error: routesError } = await supabase
        .from('routes')
        .select('*')
        .ilike('from_city', fromCity)
        .ilike('to_city', toCity);

      if (routesError) {
        console.error('Error fetching routes:', routesError);
        setErrorMessage('Error searching routes. Please try again.');
        setSchedules([]);
        setLoading(false);
        return;
      }

      // If no direct routes found, try reverse route
      if (!routes || routes.length === 0) {
        const { data: reverseRoutes } = await supabase
          .from('routes')
          .select('*')
          .ilike('from_city', toCity)
          .ilike('to_city', fromCity);

        if (reverseRoutes && reverseRoutes.length > 0) {
          // Search for schedules with reversed route
          const routeIds = reverseRoutes.map((r: RouteData) => r.id);
          
          const { data: schedulesData, error: schedulesError } = await supabase
            .from('schedules')
            .select(`
              *,
              bus:buses(*)
            `)
            .in('route_id', routeIds)
            .eq('status', 'scheduled')
            .gte('departure_time', startISO)
            .lt('departure_time', endISO)
            .order('departure_time', { ascending: true });

          if (schedulesError) {
            console.error('Error fetching schedules (reverse):', schedulesError);
          }

          if (schedulesData && schedulesData.length > 0) {
            // Enrich with route data (reversed)
            const enrichedSchedules = schedulesData.map((schedule: any) => {
              const route = reverseRoutes.find((r: RouteData) => r.id === schedule.route_id);
              return {
                ...schedule,
                route: route ? {
                  ...route,
                  from_city: route.to_city,
                  to_city: route.from_city,
                } : null
              };
            });

            // Recalculate available seats from seat_availability table
            const scheduleIds = enrichedSchedules.map(s => s.id);
            const { data: latestSeats, error: seatsError } = await supabase
              .from('seat_availability')
              .select('schedule_id, status')
              .in('schedule_id', scheduleIds);

            if (!seatsError && latestSeats) {
              const availableCounts: Record<string, number> = {};
              scheduleIds.forEach(id => availableCounts[id] = 0);
              latestSeats.forEach(seat => {
                if (seat.status === 'available') {
                  availableCounts[seat.schedule_id] = (availableCounts[seat.schedule_id] || 0) + 1;
                }
              });
              const correctedData = enrichedSchedules.map(schedule => ({
                ...schedule,
                available_seats: availableCounts[schedule.id] || 0
              })).filter(s => s.available_seats > 0);
              setSchedules(correctedData);
            } else {
              setSchedules(enrichedSchedules);
            }
            setLoading(false);
            return;
          }
        }
        
        setSchedules([]);
        setLoading(false);
        return;
      }

      const routeIds = routes.map((r: RouteData) => r.id);

      // Fetch schedules for these routes - don't filter by available_seats, we'll recalculate from seat_availability
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('schedules')
        .select(`
          *,
          bus:buses(*)
        `)
        .in('route_id', routeIds)
        .eq('status', 'scheduled')
        .gte('departure_time', startISO)
        .lt('departure_time', endISO)
        .order('departure_time', { ascending: true });

      if (schedulesError) {
        console.error('Error fetching schedules:', schedulesError);
        setErrorMessage('Error searching schedules. Please try again.');
        setSchedules([]);
        setLoading(false);
        return;
      }

      // If no results with date filter, try without date filter
      if (!schedulesData || schedulesData.length === 0) {
        console.log('No schedules found for exact date, trying broader search...');
        
        const { data: broadData, error: broadError } = await supabase
          .from('schedules')
          .select(`
            *,
            bus:buses(*)
          `)
          .in('route_id', routeIds)
          .eq('status', 'scheduled')
          .order('departure_time', { ascending: true });

        if (broadError) {
          console.error('Broad search error:', broadError);
        }

        if (broadData && broadData.length > 0) {
          // Filter by date in JavaScript (since schedules are stored with full timestamps)
          const filteredByDate = broadData.filter((schedule: any) => {
            const scheduleDate = new Date(schedule.departure_time).toISOString().split('T')[0];
            return scheduleDate === date;
          });

          if (filteredByDate.length > 0) {
            const enrichedData = filteredByDate.map((schedule: any) => ({
              ...schedule,
              route: routes.find((r: RouteData) => r.id === schedule.route_id) || null
            }));

            // Recalculate available seats
            const scheduleIds = enrichedData.map(s => s.id);
            const { data: latestSeats, error: seatsError } = await supabase
              .from('seat_availability')
              .select('schedule_id, status')
              .in('schedule_id', scheduleIds);

            if (!seatsError && latestSeats) {
              const availableCounts: Record<string, number> = {};
              scheduleIds.forEach(id => availableCounts[id] = 0);
              latestSeats.forEach(seat => {
                if (seat.status === 'available') {
                  availableCounts[seat.schedule_id] = (availableCounts[seat.schedule_id] || 0) + 1;
                }
              });
              const correctedData = enrichedData.map(schedule => ({
                ...schedule,
                available_seats: availableCounts[schedule.id] || 0
              })).filter(s => s.available_seats > 0);
              setSchedules(correctedData);
            } else {
              setSchedules(enrichedData);
            }
          } else {
            setSchedules([]);
            setErrorMessage(`No buses found for ${fromCity} to ${toCity} on ${formatDate(date)}. Try a different date.`);
          }
        } else {
          // Try reverse route as last resort
          const { data: reverseRoutes } = await supabase
            .from('routes')
            .select('*')
            .ilike('from_city', toCity)
            .ilike('to_city', fromCity);

          if (reverseRoutes && reverseRoutes.length > 0) {
            const reverseRouteIds = reverseRoutes.map((r: RouteData) => r.id);
            
            const { data: reverseSchedules, error: reverseError } = await supabase
              .from('schedules')
              .select(`
                *,
                bus:buses(*)
              `)
              .in('route_id', reverseRouteIds)
              .eq('status', 'scheduled')
              .order('departure_time', { ascending: true });

            if (!reverseError && reverseSchedules && reverseSchedules.length > 0) {
              const filteredReverse = reverseSchedules.filter((schedule: any) => {
                const scheduleDate = new Date(schedule.departure_time).toISOString().split('T')[0];
                return scheduleDate === date;
              });

              if (filteredReverse.length > 0) {
                const enrichedSchedules = filteredReverse.map((schedule: any) => {
                  const route = reverseRoutes.find((r: RouteData) => r.id === schedule.route_id);
                  return {
                    ...schedule,
                    route: route ? {
                      ...route,
                      from_city: route.to_city,
                      to_city: route.from_city,
                    } : null
                  };
                });

                // Recalculate available seats
                const scheduleIds = enrichedSchedules.map(s => s.id);
                const { data: latestSeats, error: seatsError } = await supabase
                  .from('seat_availability')
                  .select('schedule_id, status')
                  .in('schedule_id', scheduleIds);

                if (!seatsError && latestSeats) {
                  const availableCounts: Record<string, number> = {};
                  scheduleIds.forEach(id => availableCounts[id] = 0);
                  latestSeats.forEach(seat => {
                    if (seat.status === 'available') {
                      availableCounts[seat.schedule_id] = (availableCounts[seat.schedule_id] || 0) + 1;
                    }
                  });
                  const correctedData = enrichedSchedules.map(schedule => ({
                    ...schedule,
                    available_seats: availableCounts[schedule.id] || 0
                  })).filter(s => s.available_seats > 0);
                  setSchedules(correctedData);
                } else {
                  setSchedules(enrichedSchedules);
                }
                setLoading(false);
                return;
              }
            }
          }
          setSchedules([]);
          setErrorMessage(`No buses found for ${fromCity} to ${toCity} on ${formatDate(date)}. Try a different date or route.`);
        }
        setLoading(false);
        return;
      }

      // Enrich with route data and recalculate available seats
      if (schedulesData && schedulesData.length > 0) {
        const enrichedData = schedulesData.map((schedule: any) => ({
          ...schedule,
          route: routes.find((r: RouteData) => r.id === schedule.route_id) || null
        }));

        // Immediately recalculate available seats from seat_availability table
        const scheduleIds = enrichedData.map(s => s.id);
        const { data: latestSeats, error: seatsError } = await supabase
          .from('seat_availability')
          .select('schedule_id, status')
          .in('schedule_id', scheduleIds);

        if (!seatsError && latestSeats) {
          const availableCounts: Record<string, number> = {};
          scheduleIds.forEach(id => availableCounts[id] = 0);

          latestSeats.forEach(seat => {
            if (seat.status === 'available') {
              availableCounts[seat.schedule_id] = (availableCounts[seat.schedule_id] || 0) + 1;
            }
          });

          // Update enriched data with correct available seats
          const correctedData = enrichedData.map(schedule => ({
            ...schedule,
            available_seats: availableCounts[schedule.id] || 0
          }));

          // Filter out schedules with 0 available seats
          const filteredData = correctedData.filter(schedule => schedule.available_seats > 0);

          setSchedules(filteredData);
        } else {
          setSchedules(enrichedData);
        }

        setErrorMessage(null);
      } else {
        setSchedules([]);
        setErrorMessage(`No buses found for ${fromCity} to ${toCity} on ${formatDate(date)}`);
      }
    } catch (error) {
      console.error('Search error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [fromCity, toCity, date, supabase]);

  // Function to recalculate available seats from seat_availability table
  const recalculateAvailableSeats = useCallback(async () => {
    if (schedules.length === 0) return;

    try {
      // Get schedule IDs that need updating
      const scheduleIds = schedules.map(s => s.id);

      // Fetch latest seat availability for all schedules
      const { data: latestSeats, error: seatsError } = await supabase
        .from('seat_availability')
        .select('schedule_id, status')
        .in('schedule_id', scheduleIds);

      if (seatsError) {
        console.error('Error fetching latest seat data:', seatsError);
        return;
      }

      // Calculate available seats per schedule
      const availableCounts: Record<string, number> = {};
      
      // Initialize all schedules with 0
      scheduleIds.forEach(id => {
        availableCounts[id] = 0;
      });

      // Count available seats for each schedule
      latestSeats?.forEach(seat => {
        if (seat.status === 'available') {
          availableCounts[seat.schedule_id] = (availableCounts[seat.schedule_id] || 0) + 1;
        }
      });

      // Update schedules in database with recalculated counts
      for (const scheduleId of scheduleIds) {
        const availableCount = availableCounts[scheduleId] || 0;
        const { error: updateError } = await supabase
          .from('schedules')
          .update({ available_seats: availableCount })
          .eq('id', scheduleId);
        
        if (updateError) {
          console.error(`Error updating schedule ${scheduleId}:`, updateError);
        }
      }

      // Update local state with recalculated counts
      setSchedules(prevSchedules => 
        prevSchedules.map(schedule => ({
          ...schedule,
          available_seats: availableCounts[schedule.id] ?? schedule.available_seats
        }))
      );

      console.log('[Search] Recalculated available seats:', availableCounts);
    } catch (error) {
      console.error('Error recalculating available seats:', error);
    }
  }, [schedules, supabase]);

  // Always recalculate available seats from seat_availability table when schedules change
  // This ensures we always show accurate seat counts, not cached data
  useEffect(() => {
    if (hasSearched && schedules.length > 0) {
      console.log('[Search] Schedules loaded, recalculating available seats from seat_availability table...');
      recalculateAvailableSeats();
    }
  }, [hasSearched, schedules.length, recalculateAvailableSeats]);

  // Refresh search results when page is focused (e.g., after booking or cancellation)
  useEffect(() => {
    let isActive = true;
    let refreshInterval: NodeJS.Timeout | null = null;

    const refreshData = async () => {
      if (!isActive || !hasSearched || !fromCity || !toCity || !date) return;
      
      console.log('[Search] Refreshing search results (focus/interval)...');
      
      // Force fresh search
      initializedRef.current = false;
      await handleSearch();
    };

    const handleFocus = () => {
      refreshData();
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // Add small delay to ensure database updates are committed
        setTimeout(refreshData, 200);
      }
    };

    // Also set up an interval to refresh every 10 seconds for active tab
    refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && hasSearched) {
        refreshData();
      }
    }, 10000);

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Initial refresh on mount
    refreshData();
    
    return () => {
      isActive = false;
      if (refreshInterval) clearInterval(refreshInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasSearched, fromCity, toCity, date, handleSearch]);

  // Auto-search if params are provided - fixed with proper initialization check
  useEffect(() => {
    const shouldAutoSearch = fromCity && toCity && date && !loadingUser && !initializedRef.current;
    
    if (shouldAutoSearch) {
      initializedRef.current = true;
      // Add a small delay to ensure state is properly set
      const timer = setTimeout(() => {
        handleSearch();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [fromCity, toCity, date, loadingUser, handleSearch]);

  // Real-time subscription for seat availability changes
  useEffect(() => {
    if (schedules.length === 0) return;

    console.log('[Search] Setting up real-time subscription for seat availability...');

    const scheduleIds = schedules.map(s => s.id);

    // Subscribe to seat_availability changes
    const subscription = supabase
      .channel('seat-availability-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seat_availability',
          filter: `schedule_id=in.(${scheduleIds.join(',')})`
        },
        (payload) => {
          console.log('[Search] Seat availability change detected:', payload);
          // Recalculate available seats when any change occurs
          recalculateAvailableSeats();
        }
      )
      .subscribe((status) => {
        console.log('[Search] Subscription status:', status);
      });

    // Also subscribe to schedules changes (available_seats column updates)
    const scheduleSubscription = supabase
      .channel('schedule-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'schedules',
          filter: `id=in.(${scheduleIds.join(',')})`
        },
        (payload) => {
          console.log('[Search] Schedule update detected:', payload);
          // Update the available_seats directly from the schedule
          if (payload.new && payload.new.id) {
            setSchedules(prevSchedules => 
              prevSchedules.map(schedule => 
                schedule.id === payload.new.id 
                  ? { ...schedule, available_seats: payload.new.available_seats }
                  : schedule
              )
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('[Search] Schedule subscription status:', status);
      });

    return () => {
      console.log('[Search] Cleaning up subscriptions...');
      supabase.removeChannel(subscription);
      supabase.removeChannel(scheduleSubscription);
    };
  }, [schedules.length, supabase, recalculateAvailableSeats]);

  const getBusTypeLabel = (type: string) => {
    const found = BUS_TYPES.find(b => b.value === type);
    return found?.label || type;
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white border-b border-secondary-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Bus className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-secondary-900">Transitly</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/search" className="text-secondary-600 hover:text-primary-600 transition-colors font-medium">
                Search Buses
              </Link>
              {user && (
                <Link href="/dashboard/user" className="text-secondary-600 hover:text-primary-600 transition-colors font-medium">
                  My Bookings
                </Link>
              )}
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {loadingUser ? (
                <div className="w-8 h-8 rounded-full bg-secondary-200 animate-pulse" />
              ) : user ? (
                <div className="flex items-center gap-3">
                  <Link href="/dashboard/user" className="flex items-center gap-2 text-secondary-700 hover:text-primary-600">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user.email?.split('@')[0]}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-secondary-600 hover:text-red-600 transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-secondary-600 hover:text-secondary-900 transition-colors font-medium">
                    Log in
                  </Link>
                  <Link href="/signup" className="btn-primary btn-sm">
                    Sign up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg text-secondary-600 hover:bg-secondary-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-secondary-100">
              <div className="flex flex-col gap-4">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 p-2 rounded-lg text-secondary-600 hover:bg-secondary-100"
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>

                <Link href="/search" className="text-secondary-600 hover:text-primary-600 font-medium">
                  Search Buses
                </Link>

                {loadingUser ? (
                  <div className="h-8 w-24 bg-secondary-200 rounded animate-pulse" />
                ) : user ? (
                  <>
                    <Link href="/dashboard/user" className="text-secondary-600 hover:text-primary-600 font-medium">
                      My Bookings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-secondary-600 hover:text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login" className="text-secondary-600 hover:text-secondary-900 font-medium">
                      Log in
                    </Link>
                    <Link href="/signup" className="btn-primary btn-sm w-full">
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Search Section */}
      <div className="bg-white border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            {/* From */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-secondary-700 mb-2">From</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <select
                  value={fromCity}
                  onChange={(e) => {
                    setFromCity(e.target.value);
                    initializedRef.current = false; // Reset so we can search again
                  }}
                  className="input pl-12 appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select departure city</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* To */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-secondary-700 mb-2">To</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <select
                  value={toCity}
                  onChange={(e) => {
                    setToCity(e.target.value);
                    initializedRef.current = false;
                  }}
                  className="input pl-12 appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select destination city</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-secondary-700 mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    initializedRef.current = false;
                  }}
                  className="input pl-12"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary btn-lg w-full md:w-auto"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" />
                    Searching...
                  </span>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-secondary-600 hover:text-secondary-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {hasSearched && !loading && (
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">
                {fromCity} <span className="text-secondary-400">→</span> {toCity}
              </h1>
              <p className="text-secondary-600">
                {date && formatDate(date)} • {schedules.length} buses found
              </p>
            </div>
            <button
              onClick={() => {
                initializedRef.current = false;
                handleSearch();
              }}
              className="btn-secondary btn-sm flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Refresh
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner w-10 h-10 border-4" />
          </div>
        ) : errorMessage ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">Search Issue</h3>
            <p className="text-secondary-600 mb-6">{errorMessage}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setErrorMessage(null);
                  handleSearch();
                }}
                className="btn-primary btn-md"
              >
                Try Again
              </button>
              <Link href="/" className="btn-secondary btn-md">
                Modify Search
              </Link>
            </div>
          </div>
        ) : schedules.length > 0 ? (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="card-hover p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Bus Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <Bus className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary-900">{schedule.bus?.bus_name || 'Unknown Bus'}</h3>
                        <p className="text-sm text-secondary-500">{getBusTypeLabel(schedule.bus?.bus_type || 'standard')}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                        <span className="text-sm font-medium text-secondary-700">4.5</span>
                      </div>
                    </div>

                    {/* Times & Route */}
                    <div className="flex items-center gap-4 lg:gap-8">
                      <div>
                        <p className="text-2xl font-bold text-secondary-900">{formatTime(schedule.departure_time)}</p>
                        <p className="text-sm text-secondary-500">{schedule.route?.from_city || 'Unknown'}</p>
                      </div>

                      <div className="flex-1 max-w-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-px flex-1 bg-secondary-200" />
                          <Clock className="w-4 h-4 text-secondary-400" />
                          <div className="h-px flex-1 bg-secondary-200" />
                        </div>
                      </div>

                      <div>
                        <p className="text-2xl font-bold text-secondary-900">{formatTime(schedule.arrival_time)}</p>
                        <p className="text-sm text-secondary-500">{schedule.route?.to_city || 'Unknown'}</p>
                      </div>
                    </div>

                    {/* Amenities */}
                    {schedule.bus?.amenities && schedule.bus.amenities.length > 0 && (
                      <div className="flex items-center gap-2 mt-4 flex-wrap">
                        {schedule.bus.amenities.slice(0, 4).map((amenity: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-secondary-100 text-secondary-600 text-xs rounded-lg">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price & Book */}
                  <div className="flex items-center justify-between lg:flex-col lg:items-end gap-4 lg:gap-2">
                    <div className="text-right">
                      <p className="text-3xl font-bold text-secondary-900">
                        {formatCurrency(calculatePrice(schedule.route?.price, schedule.route?.distance_km))}
                      </p>
                      <p className="text-sm text-secondary-500">{schedule.available_seats} seats left</p>
                    </div>
                    <Link
                      href={`/book/${schedule.id}`}
                      className="btn-primary btn-md"
                    >
                      Select Seats
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : hasSearched ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-secondary-400" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">No buses found</h3>
            <p className="text-secondary-600 mb-6">
              We couldn&apos;t find any buses for this route on the selected date. Try changing your search criteria.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  // Try searching for tomorrow
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setDate(tomorrow.toISOString().split('T')[0]);
                  initializedRef.current = false;
                }}
                className="btn-primary btn-md"
              >
                Search Tomorrow
              </button>
              <Link href="/" className="btn-secondary btn-md">
                Modify Search
              </Link>
            </div>
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">Search for buses</h3>
            <p className="text-secondary-600">
              Enter your travel details above to find available buses.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="spinner w-10 h-10 border-4" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

