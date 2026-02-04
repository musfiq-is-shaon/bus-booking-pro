-- =====================================================
-- FIX RLS POLICIES FOR BUS BOOKING SAAS
-- Run this in Supabase SQL Editor to fix the infinite recursion issue
-- =====================================================

-- =====================================================
-- DROP EXISTING POLICIES CAUSING RECURSION
-- =====================================================

-- Drop admin policies from profiles (these cause infinite recursion)
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Drop admin policies from other tables that reference profiles
DROP POLICY IF EXISTS "Admins can view all buses" ON buses;
DROP POLICY IF EXISTS "Admins can manage buses" ON buses;
DROP POLICY IF EXISTS "Admins can view all routes" ON routes;
DROP POLICY IF EXISTS "Admins can manage routes" ON routes;
DROP POLICY IF EXISTS "Admins can view all schedules" ON schedules;
DROP POLICY IF EXISTS "Admins can manage schedules" ON schedules;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage seats" ON seat_availability;

-- =====================================================
-- CREATE ADMIN CHECK FUNCTION (avoids recursion)
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- This function directly checks auth.users meta instead of querying profiles
  -- to avoid infinite recursion in RLS policies
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) INTO v_is_admin;
  
  RETURN v_is_admin;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- =====================================================
-- CREATE SIMPLIFIED ADMIN POLICIES
-- =====================================================

-- Admin policies for profiles (simplified - no recursion)
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT
  USING (public.is_admin() = true);

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE
  USING (public.is_admin() = true);

-- Admin policies for buses
CREATE POLICY "Admins can view all buses" ON buses
  FOR SELECT
  USING (public.is_admin() = true);

CREATE POLICY "Admins can manage buses" ON buses
  FOR ALL
  USING (public.is_admin() = true);

-- Admin policies for routes
CREATE POLICY "Admins can view all routes" ON routes
  FOR SELECT
  USING (public.is_admin() = true);

CREATE POLICY "Admins can manage routes" ON routes
  FOR ALL
  USING (public.is_admin() = true);

-- Admin policies for schedules
CREATE POLICY "Admins can view all schedules" ON schedules
  FOR SELECT
  USING (public.is_admin() = true);

CREATE POLICY "Admins can manage schedules" ON schedules
  FOR ALL
  USING (public.is_admin() = true);

-- Admin policies for bookings
CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT
  USING (public.is_admin() = true);

CREATE POLICY "Admins can manage bookings" ON bookings
  FOR ALL
  USING (public.is_admin() = true);

-- Admin policies for seat availability
CREATE POLICY "Admins can manage seats" ON seat_availability
  FOR ALL
  USING (public.is_admin() = true);

-- =====================================================
-- VERIFY FIX
-- =====================================================
SELECT '✅ RLS policies fixed!' AS status;
SELECT 'Admin check function created: public.is_admin()' AS note;

-- Test the function (should return false for non-logged in users)
-- SELECT public.is_admin();

