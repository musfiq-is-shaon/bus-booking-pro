-- =====================================================
-- BUS BOOKING SAAS - DATABASE SCHEMA
-- Complete schema with RLS policies, triggers, and functions
-- =====================================================

-- =====================================================
-- EXTENSION: UUID
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE bus_type AS ENUM ('standard', 'luxury', 'sleeper', 'semi-sleeper');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE schedule_status AS ENUM ('scheduled', 'departed', 'arrived', 'cancelled');
CREATE TYPE seat_status AS ENUM ('available', 'booked', 'reserved');

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- BUSES TABLE
-- =====================================================
CREATE TABLE buses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  bus_name TEXT NOT NULL,
  bus_number TEXT NOT NULL UNIQUE,
  bus_type bus_type DEFAULT 'standard' NOT NULL,
  total_seats INTEGER NOT NULL,
  amenities JSONB DEFAULT '[]'::jsonb NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT buses_total_seats_positive CHECK (total_seats > 0)
);

-- =====================================================
-- ROUTES TABLE
-- =====================================================
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  distance_km INTEGER,
  estimated_duration_minutes INTEGER,
  price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT routes_same_city_check CHECK (from_city != to_city),
  CONSTRAINT routes_price_positive CHECK (price >= 0)
);

-- =====================================================
-- SCHEDULES TABLE
-- =====================================================
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
  available_seats INTEGER NOT NULL DEFAULT 0,
  status schedule_status DEFAULT 'scheduled' NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT schedules_valid_times CHECK (arrival_time > departure_time)
);

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  booking_reference TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  seats_booked INTEGER[] NOT NULL,
  passenger_details JSONB NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status booking_status DEFAULT 'pending' NOT NULL,
  payment_method TEXT,
  payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT bookings_price_positive CHECK (total_price >= 0)
);

-- =====================================================
-- SEAT AVAILABILITY TABLE
-- =====================================================
CREATE TABLE seat_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  seat_number INTEGER NOT NULL,
  status seat_status DEFAULT 'available' NOT NULL,
  booked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  booked_at TIMESTAMP WITH TIME ZONE,
  lock_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (schedule_id, seat_number)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Buses indexes
CREATE INDEX idx_buses_type ON buses(bus_type);
CREATE INDEX idx_buses_active ON buses(is_active);
CREATE INDEX idx_buses_number ON buses(bus_number);

-- Routes indexes
CREATE INDEX idx_routes_from ON routes(from_city);
CREATE INDEX idx_routes_to ON routes(to_city);
CREATE INDEX idx_routes_active ON routes(is_active);
CREATE INDEX idx_routes_cities ON routes(from_city, to_city);

-- Schedules indexes
CREATE INDEX idx_schedules_bus ON schedules(bus_id);
CREATE INDEX idx_schedules_route ON schedules(route_id);
CREATE INDEX idx_schedules_departure ON schedules(departure_time);
CREATE INDEX idx_schedules_status ON schedules(status);
CREATE INDEX idx_schedules_available ON schedules(available_seats);
CREATE INDEX idx_schedules_composite ON schedules(route_id, departure_time);

-- Bookings indexes
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_schedule ON bookings(schedule_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_created ON bookings(created_at);

-- Seat availability indexes
CREATE INDEX idx_seat_availability_schedule ON seat_availability(schedule_id);
CREATE INDEX idx_seat_availability_status ON seat_availability(status);

-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at_column to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buses_updated_at BEFORE UPDATE ON buses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seat_availability_updated_at BEFORE UPDATE ON seat_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER: AUTO CREATE PROFILE ON USER SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FUNCTION: CONFIRM BOOKING AND UPDATE SEATS
-- =====================================================
CREATE OR REPLACE FUNCTION confirm_booking_and_update_seats(
  p_booking_id UUID,
  p_payment_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_booking bookings;
  v_seats INTEGER[];
  v_count INTEGER;
BEGIN
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
  
  IF v_booking IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Booking not found');
  END IF;

  IF v_booking.status = 'confirmed' THEN
    RETURN json_build_object('success', false, 'error', 'Booking already confirmed');
  END IF;

  IF v_booking.status = 'cancelled' THEN
    RETURN json_build_object('success', false, 'error', 'Booking has been cancelled');
  END IF;

  UPDATE bookings
  SET status = 'confirmed',
      payment_id = COALESCE(p_payment_id, payment_id),
      updated_at = NOW()
  WHERE id = p_booking_id;

  v_seats := v_booking.seats_booked;
  
  UPDATE seat_availability
  SET status = 'booked',
      booked_by = v_booking.user_id,
      booked_at = NOW(),
      updated_at = NOW()
  WHERE schedule_id = v_booking.schedule_id
  AND seat_number = ANY(v_seats);

  GET DIAGNOSTICS v_count = ROW_COUNT;

  UPDATE schedules
  SET available_seats = available_seats - v_count,
      updated_at = NOW()
  WHERE id = v_booking.schedule_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Booking confirmed successfully',
    'seats_confirmed', v_count
  );
END;
$$;

-- =====================================================
-- FUNCTION: LOCK SEATS FOR BOOKING
-- =====================================================
CREATE OR REPLACE FUNCTION lock_seats_for_booking(
  p_schedule_id UUID,
  p_seats INTEGER[],
  p_user_id UUID,
  p_lock_minutes INTEGER DEFAULT 10
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_available_seats INTEGER;
  v_locked_count INTEGER := 0;
  v_seat INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_available_seats
  FROM seat_availability
  WHERE schedule_id = p_schedule_id
  AND seat_number = ANY(p_seats)
  AND status = 'available';

  IF v_available_seats < array_length(p_seats, 1) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Some seats are not available'
    );
  END IF;

  FOREACH v_seat IN ARRAY p_seats LOOP
    UPDATE seat_availability
    SET status = 'reserved',
        booked_by = p_user_id,
        lock_expires_at = NOW() + (p_lock_minutes || ' minutes')::interval,
        updated_at = NOW()
    WHERE schedule_id = p_schedule_id AND seat_number = v_seat;
    
    v_locked_count := v_locked_count + 1;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'message', 'Seats locked successfully',
    'seats_locked', v_locked_count,
    'expires_at', NOW() + (p_lock_minutes || ' minutes')::interval
  );
END;
$$;

-- =====================================================
-- FUNCTION: RELEASE EXPIRED SEAT LOCKS
-- =====================================================
CREATE OR REPLACE FUNCTION release_expired_seat_locks()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_released_count INTEGER := 0;
BEGIN
  UPDATE seat_availability
  SET status = 'available',
      booked_by = NULL,
      lock_expires_at = NULL,
      updated_at = NOW()
  WHERE status = 'reserved'
  AND lock_expires_at < NOW();

  GET DIAGNOSTICS v_released_count = ROW_COUNT;
  
  RETURN v_released_count;
END;
$$;

-- =====================================================
-- FUNCTION: GET SEAT LAYOUT FOR BUS
-- =====================================================
CREATE OR REPLACE FUNCTION get_seat_layout(p_bus_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_bus buses;
  v_rows INTEGER;
  v_seats_per_row INTEGER;
  v_aisle_after INTEGER;
  v_layout JSON;
BEGIN
  SELECT * INTO v_bus FROM buses WHERE id = p_bus_id;
  
  IF v_bus IS NULL THEN
    RETURN NULL;
  END IF;

  CASE v_bus.bus_type
    WHEN 'standard' THEN
      v_rows := 10; v_seats_per_row := 5; v_aisle_after := 2;
    WHEN 'semi-sleeper' THEN
      v_rows := 10; v_seats_per_row := 5; v_aisle_after := 2;
    WHEN 'luxury' THEN
      v_rows := 9; v_seats_per_row := 4; v_aisle_after := 2;
    WHEN 'sleeper' THEN
      v_rows := 8; v_seats_per_row := 4; v_aisle_after := 2;
    ELSE
      v_rows := 10; v_seats_per_row := 5; v_aisle_after := 2;
  END CASE;

  v_layout := json_build_object(
    'bus_id', p_bus_id,
    'bus_name', v_bus.bus_name,
    'bus_type', v_bus.bus_type,
    'total_seats', v_bus.total_seats,
    'rows', v_rows,
    'seats_per_row', v_seats_per_row,
    'aisle_after', v_aisle_after
  );

  RETURN v_layout;
END;
$$;

-- =====================================================
-- FUNCTION: PREVENT BUS SCHEDULE OVERLAPS
-- =====================================================
-- A bus is a unique physical vehicle that cannot serve multiple routes
-- simultaneously. This function ensures no overlapping schedules exist
-- for the same bus, considering both departure and arrival times.
-- =====================================================
CREATE OR REPLACE FUNCTION prevent_bus_overlap()
RETURNS TRIGGER AS $$
DECLARE
  v_conflict RECORD;
BEGIN
  -- Find any existing schedule for this bus that overlaps with the new schedule
  SELECT 
    s.id,
    r.from_city || ' -> ' || r.to_city as route_name,
    s.departure_time,
    s.arrival_time
  INTO v_conflict
  FROM schedules s
  JOIN routes r ON s.route_id = r.id
  WHERE s.bus_id = NEW.bus_id
    AND s.id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND (
      -- New schedule starts before existing schedule ends
      (NEW.departure_time < s.arrival_time AND NEW.departure_time >= s.departure_time)
      OR
      -- New schedule ends after existing schedule starts
      (NEW.arrival_time > s.departure_time AND NEW.arrival_time <= s.arrival_time)
      OR
      -- New schedule completely contains existing schedule
      (NEW.departure_time <= s.departure_time AND NEW.arrival_time >= s.arrival_time)
    )
  LIMIT 1;

  IF v_conflict IS NOT NULL THEN
    RAISE EXCEPTION 'BUS_SCHEDULE_CONFLICT: Bus cannot have overlapping schedules. Existing schedule % (% to %) conflicts with proposed schedule (departure: %, arrival: %).',
      v_conflict.id,
      v_conflict.route_name,
      v_conflict.departure_time,
      v_conflict.arrival_time,
      NEW.departure_time;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the bus overlap prevention trigger
DROP TRIGGER IF EXISTS check_bus_overlap ON schedules;
CREATE TRIGGER check_bus_overlap
  BEFORE INSERT OR UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION prevent_bus_overlap();

-- =====================================================
-- FUNCTION: VALIDATE BUS SCHEDULE FEASIBILITY
-- =====================================================
-- Checks if a bus schedule is feasible considering:
-- 1. No overlapping routes on the same day
-- 2. Adequate turnaround time between trips
-- Returns JSON with validation result
-- =====================================================
CREATE OR REPLACE FUNCTION validate_bus_schedule_feasibility(
  p_bus_id UUID,
  p_departure_time TIMESTAMP WITH TIME ZONE,
  p_arrival_time TIMESTAMP WITH TIME ZONE,
  p_min_turnaround_minutes INTEGER DEFAULT 60
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_has_overlap BOOLEAN;
  v_conflict_count INTEGER;
  v_min_gap INTEGER;
BEGIN
  -- Check for any overlap
  SELECT COUNT(*) INTO v_conflict_count
  FROM schedules s
  WHERE s.bus_id = p_bus_id
    AND s.departure_time < p_arrival_time
    AND s.arrival_time > p_departure_time;

  IF v_conflict_count > 0 THEN
    RETURN json_build_object(
      'valid', false,
      'reason', 'OVERLAP',
      'message', 'Bus already has a schedule that overlaps with the proposed time'
    );
  END IF;

  -- Check minimum gap from previous schedule
  SELECT MIN(EXTRACT(EPOCH FROM (p_departure_time - s.arrival_time))/60)::INTEGER
  INTO v_min_gap
  FROM schedules s
  WHERE s.bus_id = p_bus_id
    AND s.arrival_time < p_departure_time;

  IF v_min_gap IS NOT NULL AND v_min_gap < p_min_turnaround_minutes THEN
    RETURN json_build_object(
      'valid', false,
      'reason', 'INSUFFICIENT_TURNAROUND',
      'message', 'Minimum ' || p_min_turnaround_minutes || ' minute turnaround required. Only ' || v_min_gap || ' minutes available.',
      'available_gap_minutes', v_min_gap
    );
  END IF;

  RETURN json_build_object(
    'valid', true,
    'reason', 'OK',
    'message', 'Schedule is feasible'
  );
END;
$$;

-- =====================================================
-- FUNCTION: GET BUS SCHEDULE TIMELINE
-- =====================================================
-- Returns all scheduled trips for a bus within a date range
-- Useful for visualizing bus availability
-- =====================================================
CREATE OR REPLACE FUNCTION get_bus_schedule_timeline(
  p_bus_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
)
RETURNS TABLE (
  schedule_id UUID,
  route_from TEXT,
  route_to TEXT,
  departure_time TIMESTAMP WITH TIME ZONE,
  arrival_time TIMESTAMP WITH TIME ZONE,
  status schedule_status,
  route_duration_minutes INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    r.from_city,
    r.to_city,
    s.departure_time,
    s.arrival_time,
    s.status,
    r.estimated_duration_minutes
  FROM schedules s
  JOIN routes r ON s.route_id = r.id
  WHERE s.bus_id = p_bus_id
    AND s.departure_time >= p_start_date
    AND s.departure_time <= p_end_date
  ORDER BY s.departure_time;
END;
$$;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_availability ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES RLS POLICIES
-- =====================================================

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- BUSES RLS POLICIES
-- =====================================================

CREATE POLICY "Anyone can view active buses" ON buses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all buses" ON buses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage buses" ON buses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- ROUTES RLS POLICIES
-- =====================================================

CREATE POLICY "Anyone can view active routes" ON routes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all routes" ON routes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage routes" ON routes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- SCHEDULES RLS POLICIES
-- =====================================================

CREATE POLICY "Anyone can view scheduled schedules" ON schedules
  FOR SELECT USING (status = 'scheduled');

CREATE POLICY "Anyone can view available schedules" ON schedules
  FOR SELECT USING (available_seats > 0);

CREATE POLICY "Admins can view all schedules" ON schedules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage schedules" ON schedules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- BOOKINGS RLS POLICIES
-- =====================================================

CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id AND status IN ('pending', 'confirmed'))
  WITH CHECK (auth.uid() = user_id AND status = 'cancelled');

CREATE POLICY "Admins can manage bookings" ON bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- SEAT AVAILABILITY RLS POLICIES
-- =====================================================

CREATE POLICY "Anyone can view seat availability" ON seat_availability
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage seats" ON seat_availability
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'Schema created successfully!' AS status;

SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

