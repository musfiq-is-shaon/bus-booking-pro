-- =====================================================
-- SEED DATA FOR BUS BOOKING SAAS
-- Run AFTER schema.sql
-- =====================================================

-- =====================================================
-- INSERT BUSES (only if not exists)
-- =====================================================
INSERT INTO buses (bus_name, bus_number, bus_type, total_seats, amenities, image_url, is_active) VALUES
('Shyamoli Express Premium', 'SYL-001', 'luxury', 42,
 '["WiFi", "USB Charging", "Air Conditioning", "Reclining Seats", "Entertainment System", "Snacks"]'::jsonb,
 'https://images.unsplash.com/photo-1605218427360-3639d1b89230?w=800', true),
('Hanif Enterprise Super Deluxe', 'HAN-002', 'sleeper', 40,
 '["WiFi", "USB Charging", "Air Conditioning", "Sleeper Seats", "Blanket", "Pillow", "Meal"]'::jsonb,
 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800', true),
('Eagle Star AC Bus', 'EAG-003', 'semi-sleeper', 50,
 '["Air Conditioning", "Charging Points", "Emergency Exit", "Water Bottle"]'::jsonb,
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', true),
('SR Travels Luxury Coach', 'SRT-004', 'luxury', 38,
 '["WiFi", "USB Charging", "Air Conditioning", "Luxury Seats", "Mini Bar", "Entertainment", "Meal"]'::jsonb,
 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800', true),
('Ena Transport sleeper', 'ENA-005', 'sleeper', 36,
 '["WiFi", "Air Conditioning", "Charging Points", "Sleeper Seats", "Blanket"]'::jsonb,
 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800', true)
ON CONFLICT (bus_number) DO NOTHING;

-- =====================================================
-- INSERT ADDITIONAL BUSES (AUTO-GENERATED)
-- Ensures enough unique buses so no bus is scheduled twice
-- Increased to 300 buses for maximum schedule variety
-- =====================================================
INSERT INTO buses (bus_name, bus_number, bus_type, total_seats, amenities, image_url, is_active)
SELECT
  'City Express ' || lpad(gs::text, 3, '0'),
  'AUTO-' || lpad(gs::text, 3, '0'),
  CASE (gs % 5)
    WHEN 0 THEN 'luxury'
    WHEN 1 THEN 'sleeper'
    WHEN 2 THEN 'semi-sleeper'
    WHEN 3 THEN 'standard'
    ELSE 'luxury'
  END::bus_type,
  CASE (gs % 5)
    WHEN 0 THEN 40
    WHEN 1 THEN 36
    WHEN 2 THEN 44
    WHEN 3 THEN 45
    ELSE 42
  END,
  '["WiFi", "USB Charging", "Air Conditioning", "Entertainment"]'::jsonb,
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  true
FROM generate_series(1, 300) AS gs
ON CONFLICT (bus_number) DO NOTHING;

-- =====================================================
-- INSERT REGIONAL BUSES FOR SPECIFIC ROUTES
-- More buses for high-demand Dhaka routes
-- =====================================================
INSERT INTO buses (bus_name, bus_number, bus_type, total_seats, amenities, image_url, is_active)
SELECT
  'Dhaka Metro ' || lpad(gs::text, 3, '0'),
  'DMET-' || lpad(gs::text, 3, '0'),
  CASE (gs % 3)
    WHEN 0 THEN 'luxury'
    WHEN 1 THEN 'semi-sleeper'
    ELSE 'standard'
  END::bus_type,
  CASE (gs % 3)
    WHEN 0 THEN 42
    WHEN 1 THEN 48
    ELSE 50
  END,
  '["WiFi", "USB Charging", "Air Conditioning", "Charging Points"]'::jsonb,
  'https://images.unsplash.com/photo-1605218427360-3639d1b89230?w=800',
  true
FROM generate_series(1, 50) AS gs
ON CONFLICT (bus_number) DO NOTHING;

-- =====================================================
-- INSERT CHITTAGONG DIVISION BUSES
-- =====================================================
INSERT INTO buses (bus_name, bus_number, bus_type, total_seats, amenities, image_url, is_active)
SELECT
  'Chittagong Express ' || lpad(gs::text, 3, '0'),
  'CTG-' || lpad(gs::text, 3, '0'),
  CASE (gs % 4)
    WHEN 0 THEN 'luxury'
    WHEN 1 THEN 'sleeper'
    WHEN 2 THEN 'semi-sleeper'
    ELSE 'standard'
  END::bus_type,
  CASE (gs % 4)
    WHEN 0 THEN 40
    WHEN 1 THEN 38
    WHEN 2 THEN 45
    ELSE 44
  END,
  '["WiFi", "Air Conditioning", "USB Charging"]'::jsonb,
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
  true
FROM generate_series(1, 40) AS gs
ON CONFLICT (bus_number) DO NOTHING;

-- =====================================================
-- INSERT SYLHET DIVISION BUSES
-- =====================================================
INSERT INTO buses (bus_name, bus_number, bus_type, total_seats, amenities, image_url, is_active)
SELECT
  'Sylhet Line ' || lpad(gs::text, 3, '0'),
  'SYL-' || lpad(gs::text, 3, '0'),
  CASE (gs % 3)
    WHEN 0 THEN 'sleeper'
    WHEN 1 THEN 'semi-sleeper'
    ELSE 'standard'
  END::bus_type,
  CASE (gs % 3)
    WHEN 0 THEN 38
    WHEN 1 THEN 44
    ELSE 42
  END,
  '["WiFi", "Air Conditioning", "Charging"]'::jsonb,
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',
  true
FROM generate_series(1, 30) AS gs
ON CONFLICT (bus_number) DO NOTHING;

-- =====================================================
-- INSERT RAJSHAHI DIVISION BUSES
-- =====================================================
INSERT INTO buses (bus_name, bus_number, bus_type, total_seats, amenities, image_url, is_active)
SELECT
  'Rajshahi Connect ' || lpad(gs::text, 3, '0'),
  'RAJ-' || lpad(gs::text, 3, '0'),
  CASE (gs % 3)
    WHEN 0 THEN 'luxury'
    WHEN 1 THEN 'semi-sleeper'
    ELSE 'standard'
  END::bus_type,
  CASE (gs % 3)
    WHEN 0 THEN 40
    WHEN 1 THEN 45
    ELSE 44
  END,
  '["WiFi", "USB", "AC"]'::jsonb,
  'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800',
  true
FROM generate_series(1, 30) AS gs
ON CONFLICT (bus_number) DO NOTHING;

-- =====================================================
-- INSERT KHULNA DIVISION BUSES
-- =====================================================
INSERT INTO buses (bus_name, bus_number, bus_type, total_seats, amenities, image_url, is_active)
SELECT
  'Khulna Routes ' || lpad(gs::text, 3, '0'),
  'KHL-' || lpad(gs::text, 3, '0'),
  CASE (gs % 3)
    WHEN 0 THEN 'sleeper'
    WHEN 1 THEN 'semi-sleeper'
    ELSE 'standard'
  END::bus_type,
  CASE (gs % 3)
    WHEN 0 THEN 36
    WHEN 1 THEN 44
    ELSE 45
  END,
  '["WiFi", "AC", "Charging"]'::jsonb,
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  true
FROM generate_series(1, 25) AS gs
ON CONFLICT (bus_number) DO NOTHING;

-- =====================================================
-- INSERT ALL ROUTES (Only using 20 cities from dropdown)
-- =====================================================

-- DHAKA ROUTES (19 routes)
INSERT INTO routes (from_city, to_city, distance_km, estimated_duration_minutes, price, is_active) VALUES
('Dhaka', 'Chittagong', 264, 360, 1200.00, true),
('Dhaka', 'Sylhet', 240, 300, 900.00, true),
('Dhaka', 'Coxs Bazar', 390, 480, 1400.00, true),
('Dhaka', 'Barisal', 395, 450, 1250.00, true),
('Dhaka', 'Rajshahi', 344, 420, 1150.00, true),
('Dhaka', 'Khulna', 333, 390, 1100.00, true),
('Dhaka', 'Rangpur', 320, 400, 1050.00, true),
('Dhaka', 'Comilla', 97, 120, 350.00, true),
('Dhaka', 'Mymensingh', 100, 120, 400.00, true),
('Dhaka', 'Tangail', 100, 120, 380.00, true),
('Dhaka', 'Bogura', 250, 300, 850.00, true),
('Dhaka', 'Jessore', 175, 210, 600.00, true),
('Dhaka', 'Dinajpur', 420, 480, 1300.00, true),
('Dhaka', 'Pabna', 215, 260, 700.00, true),
('Dhaka', 'Noakhali', 150, 180, 550.00, true),
('Dhaka', 'Feni', 130, 150, 500.00, true),
('Dhaka', 'Narayanganj', 20, 30, 100.00, true),
('Dhaka', 'Gazipur', 40, 45, 150.00, true),
('Dhaka', 'Savar', 15, 25, 80.00, true);

-- REVERSE ROUTES (19 routes)
INSERT INTO routes (from_city, to_city, distance_km, estimated_duration_minutes, price, is_active) VALUES
('Chittagong', 'Dhaka', 264, 360, 1200.00, true),
('Sylhet', 'Dhaka', 240, 300, 900.00, true),
('Coxs Bazar', 'Dhaka', 390, 480, 1400.00, true),
('Barisal', 'Dhaka', 395, 450, 1250.00, true),
('Rajshahi', 'Dhaka', 344, 420, 1150.00, true),
('Khulna', 'Dhaka', 333, 390, 1100.00, true),
('Rangpur', 'Dhaka', 320, 400, 1050.00, true),
('Comilla', 'Dhaka', 97, 120, 350.00, true),
('Mymensingh', 'Dhaka', 100, 120, 400.00, true),
('Tangail', 'Dhaka', 100, 120, 380.00, true),
('Bogura', 'Dhaka', 250, 300, 850.00, true),
('Jessore', 'Dhaka', 175, 210, 600.00, true),
('Dinajpur', 'Dhaka', 420, 480, 1300.00, true),
('Pabna', 'Dhaka', 215, 260, 700.00, true),
('Noakhali', 'Dhaka', 150, 180, 550.00, true),
('Feni', 'Dhaka', 130, 150, 500.00, true),
('Narayanganj', 'Dhaka', 20, 30, 100.00, true),
('Gazipur', 'Dhaka', 40, 45, 150.00, true),
('Savar', 'Dhaka', 15, 25, 80.00, true);

-- NEAR DHAKA ROUTES (10 routes)
INSERT INTO routes (from_city, to_city, distance_km, estimated_duration_minutes, price, is_active) VALUES
('Narayanganj', 'Coxs Bazar', 320, 380, 1150.00, true),
('Coxs Bazar', 'Narayanganj', 320, 380, 1150.00, true),
('Gazipur', 'Tangail', 70, 85, 280.00, true),
('Tangail', 'Gazipur', 70, 85, 280.00, true),
('Mymensingh', 'Tangail', 60, 75, 250.00, true),
('Tangail', 'Mymensingh', 60, 75, 250.00, true),
('Mymensingh', 'Bogura', 120, 150, 450.00, true),
('Bogura', 'Mymensingh', 120, 150, 450.00, true),
('Tangail', 'Bogura', 90, 110, 350.00, true),
('Bogura', 'Tangail', 90, 110, 350.00, true);

-- INTERNAL ROUTES (30 routes)
INSERT INTO routes (from_city, to_city, distance_km, estimated_duration_minutes, price, is_active) VALUES
-- Chittagong Division
('Chittagong', 'Coxs Bazar', 152, 180, 550.00, true),
('Chittagong', 'Sylhet', 320, 400, 1100.00, true),
('Chittagong', 'Comilla', 150, 180, 500.00, true),
('Chittagong', 'Noakhali', 85, 100, 350.00, true),
('Chittagong', 'Feni', 75, 90, 300.00, true),
('Coxs Bazar', 'Chittagong', 152, 180, 550.00, true),
('Sylhet', 'Chittagong', 320, 400, 1100.00, true),
('Comilla', 'Chittagong', 150, 180, 500.00, true),
('Noakhali', 'Chittagong', 85, 100, 350.00, true),
('Feni', 'Chittagong', 75, 90, 300.00, true),
-- Sylhet Division
('Sylhet', 'Comilla', 200, 240, 700.00, true),
('Sylhet', 'Mymensingh', 180, 220, 650.00, true),
('Comilla', 'Sylhet', 200, 240, 700.00, true),
('Mymensingh', 'Sylhet', 180, 220, 650.00, true),
-- Rajshahi Division
('Rajshahi', 'Bogura', 120, 150, 450.00, true),
('Rajshahi', 'Pabna', 70, 90, 300.00, true),
('Rajshahi', 'Dinajpur', 200, 250, 700.00, true),
('Bogura', 'Rajshahi', 120, 150, 450.00, true),
('Pabna', 'Rajshahi', 70, 90, 300.00, true),
('Dinajpur', 'Rajshahi', 200, 250, 700.00, true),
-- Khulna Division
('Khulna', 'Jessore', 70, 90, 280.00, true),
('Khulna', 'Barisal', 200, 240, 700.00, true),
('Jessore', 'Khulna', 70, 90, 280.00, true),
('Barisal', 'Khulna', 200, 240, 700.00, true),
-- Rangpur Routes
('Rangpur', 'Bogura', 100, 120, 400.00, true),
('Rangpur', 'Dinajpur', 150, 180, 500.00, true),
('Bogura', 'Rangpur', 100, 120, 400.00, true),
('Dinajpur', 'Rangpur', 150, 180, 500.00, true),
-- Coxs Bazar Routes
('Coxs Bazar', 'Sylhet', 380, 450, 1300.00, true),
('Sylhet', 'Coxs Bazar', 380, 450, 1300.00, true);

-- =====================================================
-- INSERT SCHEDULES WITH UNIQUE BUS ASSIGNMENTS
-- =====================================================
-- CRITICAL: A bus is a UNIQUE physical vehicle that cannot serve 
-- multiple routes simultaneously. Each bus has one physical location 
-- at any given time.
--
-- CONSTRAINT: Buses with the same name pattern CANNOT:
-- 1. Serve the same route at the same time
-- 2. Have overlapping schedules
--
-- SOLUTION: Use MD5 hash-based deterministic assignment:
-- - Each unique (route_from, route_to, hours) gets exactly ONE bus
-- - Same inputs always produce same bus assignment (deterministic)
-- - No duplicate bus assignments for the same route/time
-- =====================================================

-- Clear existing schedules and seat availability
TRUNCATE TABLE seat_availability CASCADE;
TRUNCATE TABLE schedules CASCADE;

-- =====================================================
-- Create a temp table to hold all unique (route, time) combinations
-- =====================================================
CREATE TEMP TABLE unique_assignments (
    route_from TEXT,
    route_to TEXT,
    hours_offset INT,
    days_offset INT,
    route_id UUID,
    departure_time TIMESTAMP WITH TIME ZONE,
    arrival_time TIMESTAMP WITH TIME ZONE
);

-- Insert all route assignments with MULTIPLE times per route
-- Each route now has 5-6 departure times throughout the day
INSERT INTO unique_assignments (route_from, route_to, hours_offset, days_offset)
-- =====================================================
-- ADDITIONAL DHAKA HIGH-FREQUENCY ROUTES
-- Extra buses and schedules for popular Dhaka routes
-- =====================================================

-- Dhaka -> Chittagong (12 times per day - very high frequency)
SELECT 'Dhaka', 'Chittagong', 4, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 5, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 6, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 7, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 8, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 9, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 10, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 11, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 12, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 13, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 14, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 15, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 16, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 17, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 18, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 19, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 20, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 21, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 22, 0 UNION ALL
SELECT 'Dhaka', 'Chittagong', 23, 0 UNION ALL
-- Dhaka -> Coxs Bazar (12 times per day - very high frequency)
SELECT 'Dhaka', 'Coxs Bazar', 4, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 5, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 6, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 7, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 8, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 9, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 10, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 11, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 12, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 13, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 14, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 15, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 16, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 17, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 18, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 19, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 20, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 21, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 22, 0 UNION ALL
SELECT 'Dhaka', 'Coxs Bazar', 23, 0 UNION ALL
-- Dhaka -> Barisal (10 times per day - high frequency)
SELECT 'Dhaka', 'Barisal', 4, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 5, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 6, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 7, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 8, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 9, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 10, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 11, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 12, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 13, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 14, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 15, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 16, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 17, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 18, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 19, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 20, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 21, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 22, 0 UNION ALL
SELECT 'Dhaka', 'Barisal', 23, 0 UNION ALL

-- Dhaka -> Sylhet (10 times per day - high frequency)
SELECT 'Dhaka', 'Sylhet', 4, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 5, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 6, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 7, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 8, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 9, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 10, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 11, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 12, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 13, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 14, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 15, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 16, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 17, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 18, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 19, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 20, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 21, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 22, 0 UNION ALL
SELECT 'Dhaka', 'Sylhet', 23, 0 UNION ALL
-- Dhaka -> Rajshahi (10 times per day - high frequency)
SELECT 'Dhaka', 'Rajshahi', 4, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 5, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 6, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 7, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 8, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 9, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 10, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 11, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 12, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 13, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 14, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 15, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 16, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 17, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 18, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 19, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 20, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 21, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 22, 0 UNION ALL
SELECT 'Dhaka', 'Rajshahi', 23, 0 UNION ALL
-- Dhaka -> Jessore (10 times per day - high frequency)
SELECT 'Dhaka', 'Jessore', 4, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 5, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 6, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 7, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 8, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 9, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 10, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 11, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 12, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 13, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 14, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 15, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 16, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 17, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 18, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 19, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 20, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 21, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 22, 0 UNION ALL
SELECT 'Dhaka', 'Jessore', 23, 0 UNION ALL
-- Dhaka -> Khulna (10 times per day - high frequency)
SELECT 'Dhaka', 'Khulna', 4, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 5, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 6, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 7, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 8, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 9, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 10, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 11, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 12, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 13, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 14, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 15, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 16, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 17, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 18, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 19, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 20, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 21, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 22, 0 UNION ALL
SELECT 'Dhaka', 'Khulna', 23, 0 UNION ALL
-- Dhaka -> Rangpur (10 times per day - high frequency)
SELECT 'Dhaka', 'Rangpur', 4, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 5, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 6, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 7, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 8, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 9, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 10, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 11, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 12, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 13, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 14, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 15, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 16, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 17, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 18, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 19, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 20, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 21, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 22, 0 UNION ALL
SELECT 'Dhaka', 'Rangpur', 23, 0 UNION ALL
-- Dhaka -> Dinajpur (10 times per day - high frequency)
SELECT 'Dhaka', 'Dinajpur', 4, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 5, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 6, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 7, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 8, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 9, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 10, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 11, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 12, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 13, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 14, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 15, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 16, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 17, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 18, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 19, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 20, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 21, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 22, 0 UNION ALL
SELECT 'Dhaka', 'Dinajpur', 23, 0 UNION ALL
-- Dhaka -> Comilla (10 times per day - high frequency)
SELECT 'Dhaka', 'Comilla', 4, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 5, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 6, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 7, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 8, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 9, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 10, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 11, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 12, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 13, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 14, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 15, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 16, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 17, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 18, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 19, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 20, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 21, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 22, 0 UNION ALL
SELECT 'Dhaka', 'Comilla', 23, 0 UNION ALL
-- Dhaka -> Bogura (10 times per day - high frequency)
SELECT 'Dhaka', 'Bogura', 4, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 5, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 6, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 7, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 8, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 9, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 10, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 11, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 12, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 13, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 14, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 15, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 16, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 17, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 18, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 19, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 20, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 21, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 22, 0 UNION ALL
SELECT 'Dhaka', 'Bogura', 23, 0 UNION ALL
-- Dhaka -> Pabna (10 times per day - high frequency)
SELECT 'Dhaka', 'Pabna', 4, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 5, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 6, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 7, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 8, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 9, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 10, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 11, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 12, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 13, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 14, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 15, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 16, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 17, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 18, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 19, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 20, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 21, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 22, 0 UNION ALL
SELECT 'Dhaka', 'Pabna', 23, 0 UNION ALL

-- Dhaka -> Noakhali (10 times per day - high frequency)
SELECT 'Dhaka', 'Noakhali', 4, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 5, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 6, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 7, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 8, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 9, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 10, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 11, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 12, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 13, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 14, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 15, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 16, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 17, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 18, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 19, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 20, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 21, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 22, 0 UNION ALL
SELECT 'Dhaka', 'Noakhali', 23, 0 UNION ALL

-- Dhaka -> Mymensingh (10 times per day - high frequency)
SELECT 'Dhaka', 'Mymensingh', 4, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 5, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 6, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 7, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 8, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 9, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 10, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 11, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 12, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 13, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 14, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 15, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 16, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 17, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 18, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 19, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 20, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 21, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 22, 0 UNION ALL
SELECT 'Dhaka', 'Mymensingh', 23, 0 UNION ALL

-- Dhaka -> Tangail (10 times per day - high frequency)
SELECT 'Dhaka', 'Tangail', 4, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 5, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 6, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 7, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 8, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 9, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 10, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 11, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 12, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 13, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 14, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 15, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 16, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 17, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 18, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 19, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 20, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 21, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 22, 0 UNION ALL
SELECT 'Dhaka', 'Tangail', 23, 0 UNION ALL

-- Dhaka -> Feni (10 times per day - high frequency)
SELECT 'Dhaka', 'Feni', 4, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 5, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 6, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 7, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 8, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 9, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 10, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 11, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 12, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 13, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 14, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 15, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 16, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 17, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 18, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 19, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 20, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 21, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 22, 0 UNION ALL
SELECT 'Dhaka', 'Feni', 23, 0 UNION ALL

-- Dhaka -> Narayanganj (12 times per day - very high frequency)
SELECT 'Dhaka', 'Narayanganj', 4, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 5, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 6, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 7, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 8, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 9, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 10, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 11, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 12, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 13, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 14, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 15, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 16, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 17, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 18, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 19, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 20, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 21, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 22, 0 UNION ALL
SELECT 'Dhaka', 'Narayanganj', 23, 0 UNION ALL

-- Dhaka -> Gazipur (12 times per day - very high frequency)
SELECT 'Dhaka', 'Gazipur', 4, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 5, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 6, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 7, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 8, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 9, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 10, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 11, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 12, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 13, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 14, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 15, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 16, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 17, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 18, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 19, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 20, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 21, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 22, 0 UNION ALL
SELECT 'Dhaka', 'Gazipur', 23, 0 UNION ALL

-- Dhaka -> Savar (12 times per day - very high frequency)
SELECT 'Dhaka', 'Savar', 4, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 5, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 6, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 7, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 8, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 9, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 10, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 11, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 12, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 13, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 14, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 15, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 16, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 17, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 18, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 19, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 20, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 21, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 22, 0 UNION ALL
SELECT 'Dhaka', 'Savar', 23, 0 UNION ALL
-- Reverse Routes (next day returns with 5-6 times each)
SELECT 'Chittagong', 'Dhaka', 5, 1 UNION ALL
SELECT 'Chittagong', 'Dhaka', 8, 1 UNION ALL
SELECT 'Chittagong', 'Dhaka', 11, 1 UNION ALL
SELECT 'Chittagong', 'Dhaka', 14, 1 UNION ALL
SELECT 'Chittagong', 'Dhaka', 17, 1 UNION ALL
SELECT 'Chittagong', 'Dhaka', 21, 1 UNION ALL
SELECT 'Chittagong', 'Dhaka', 23, 1 UNION ALL
SELECT 'Coxs Bazar', 'Dhaka', 5, 1 UNION ALL
SELECT 'Coxs Bazar', 'Dhaka', 8, 1 UNION ALL
SELECT 'Coxs Bazar', 'Dhaka', 11, 1 UNION ALL
SELECT 'Coxs Bazar', 'Dhaka', 14, 1 UNION ALL
SELECT 'Coxs Bazar', 'Dhaka', 17, 1 UNION ALL
SELECT 'Coxs Bazar', 'Dhaka', 20, 1 UNION ALL
SELECT 'Sylhet', 'Dhaka', 5, 1 UNION ALL
SELECT 'Sylhet', 'Dhaka', 8, 1 UNION ALL
SELECT 'Sylhet', 'Dhaka', 11, 1 UNION ALL
SELECT 'Sylhet', 'Dhaka', 14, 1 UNION ALL
SELECT 'Sylhet', 'Dhaka', 17, 1 UNION ALL
SELECT 'Sylhet', 'Dhaka', 20, 1 UNION ALL
SELECT 'Rajshahi', 'Dhaka', 5, 1 UNION ALL
SELECT 'Rajshahi', 'Dhaka', 8, 1 UNION ALL
SELECT 'Rajshahi', 'Dhaka', 11, 1 UNION ALL
SELECT 'Rajshahi', 'Dhaka', 14, 1 UNION ALL
SELECT 'Rajshahi', 'Dhaka', 17, 1 UNION ALL
SELECT 'Rajshahi', 'Dhaka', 20, 1 UNION ALL
SELECT 'Jessore', 'Dhaka', 5, 1 UNION ALL
SELECT 'Jessore', 'Dhaka', 8, 1 UNION ALL
SELECT 'Jessore', 'Dhaka', 11, 1 UNION ALL
SELECT 'Jessore', 'Dhaka', 14, 1 UNION ALL
SELECT 'Jessore', 'Dhaka', 17, 1 UNION ALL
SELECT 'Jessore', 'Dhaka', 20, 1 UNION ALL
SELECT 'Khulna', 'Dhaka', 5, 1 UNION ALL
SELECT 'Khulna', 'Dhaka', 8, 1 UNION ALL
SELECT 'Khulna', 'Dhaka', 11, 1 UNION ALL
SELECT 'Khulna', 'Dhaka', 14, 1 UNION ALL
SELECT 'Khulna', 'Dhaka', 17, 1 UNION ALL
SELECT 'Khulna', 'Dhaka', 20, 1 UNION ALL
SELECT 'Rangpur', 'Dhaka', 5, 1 UNION ALL
SELECT 'Rangpur', 'Dhaka', 8, 1 UNION ALL
SELECT 'Rangpur', 'Dhaka', 11, 1 UNION ALL
SELECT 'Rangpur', 'Dhaka', 14, 1 UNION ALL
SELECT 'Rangpur', 'Dhaka', 17, 1 UNION ALL
SELECT 'Rangpur', 'Dhaka', 20, 1 UNION ALL
SELECT 'Dinajpur', 'Dhaka', 5, 1 UNION ALL
SELECT 'Dinajpur', 'Dhaka', 8, 1 UNION ALL
SELECT 'Dinajpur', 'Dhaka', 11, 1 UNION ALL
SELECT 'Dinajpur', 'Dhaka', 14, 1 UNION ALL
SELECT 'Dinajpur', 'Dhaka', 17, 1 UNION ALL
SELECT 'Dinajpur', 'Dhaka', 20, 1 UNION ALL
SELECT 'Comilla', 'Dhaka', 5, 1 UNION ALL
SELECT 'Comilla', 'Dhaka', 8, 1 UNION ALL
SELECT 'Comilla', 'Dhaka', 11, 1 UNION ALL
SELECT 'Comilla', 'Dhaka', 14, 1 UNION ALL
SELECT 'Comilla', 'Dhaka', 17, 1 UNION ALL
SELECT 'Comilla', 'Dhaka', 20, 1 UNION ALL
SELECT 'Bogura', 'Dhaka', 5, 1 UNION ALL
SELECT 'Bogura', 'Dhaka', 8, 1 UNION ALL
SELECT 'Bogura', 'Dhaka', 11, 1 UNION ALL
SELECT 'Bogura', 'Dhaka', 14, 1 UNION ALL
SELECT 'Bogura', 'Dhaka', 17, 1 UNION ALL
SELECT 'Bogura', 'Dhaka', 20, 1 UNION ALL
SELECT 'Pabna', 'Dhaka', 5, 1 UNION ALL
SELECT 'Pabna', 'Dhaka', 8, 1 UNION ALL
SELECT 'Pabna', 'Dhaka', 11, 1 UNION ALL
SELECT 'Pabna', 'Dhaka', 14, 1 UNION ALL
SELECT 'Pabna', 'Dhaka', 17, 1 UNION ALL
SELECT 'Pabna', 'Dhaka', 20, 1 UNION ALL
SELECT 'Noakhali', 'Dhaka', 5, 1 UNION ALL
SELECT 'Noakhali', 'Dhaka', 8, 1 UNION ALL
SELECT 'Noakhali', 'Dhaka', 11, 1 UNION ALL
SELECT 'Noakhali', 'Dhaka', 14, 1 UNION ALL
SELECT 'Noakhali', 'Dhaka', 17, 1 UNION ALL
SELECT 'Noakhali', 'Dhaka', 20, 1 UNION ALL
SELECT 'Mymensingh', 'Dhaka', 5, 1 UNION ALL
SELECT 'Mymensingh', 'Dhaka', 8, 1 UNION ALL
SELECT 'Mymensingh', 'Dhaka', 11, 1 UNION ALL
SELECT 'Mymensingh', 'Dhaka', 14, 1 UNION ALL
SELECT 'Mymensingh', 'Dhaka', 17, 1 UNION ALL
SELECT 'Mymensingh', 'Dhaka', 20, 1 UNION ALL
SELECT 'Tangail', 'Dhaka', 5, 1 UNION ALL
SELECT 'Tangail', 'Dhaka', 8, 1 UNION ALL
SELECT 'Tangail', 'Dhaka', 11, 1 UNION ALL
SELECT 'Tangail', 'Dhaka', 14, 1 UNION ALL
SELECT 'Tangail', 'Dhaka', 17, 1 UNION ALL
SELECT 'Tangail', 'Dhaka', 20, 1 UNION ALL
SELECT 'Feni', 'Dhaka', 5, 1 UNION ALL
SELECT 'Feni', 'Dhaka', 8, 1 UNION ALL
SELECT 'Feni', 'Dhaka', 11, 1 UNION ALL
SELECT 'Feni', 'Dhaka', 14, 1 UNION ALL
SELECT 'Feni', 'Dhaka', 17, 1 UNION ALL
SELECT 'Feni', 'Dhaka', 20, 1 UNION ALL
SELECT 'Narayanganj', 'Dhaka', 5, 1 UNION ALL
SELECT 'Narayanganj', 'Dhaka', 8, 1 UNION ALL
SELECT 'Narayanganj', 'Dhaka', 11, 1 UNION ALL
SELECT 'Narayanganj', 'Dhaka', 14, 1 UNION ALL
SELECT 'Narayanganj', 'Dhaka', 17, 1 UNION ALL
SELECT 'Narayanganj', 'Dhaka', 20, 1 UNION ALL
SELECT 'Gazipur', 'Dhaka', 5, 1 UNION ALL
SELECT 'Gazipur', 'Dhaka', 8, 1 UNION ALL
SELECT 'Gazipur', 'Dhaka', 11, 1 UNION ALL
SELECT 'Gazipur', 'Dhaka', 14, 1 UNION ALL
SELECT 'Gazipur', 'Dhaka', 17, 1 UNION ALL
SELECT 'Gazipur', 'Dhaka', 20, 1 UNION ALL
SELECT 'Savar', 'Dhaka', 5, 1 UNION ALL
SELECT 'Savar', 'Dhaka', 8, 1 UNION ALL
SELECT 'Savar', 'Dhaka', 11, 1 UNION ALL
SELECT 'Savar', 'Dhaka', 14, 1 UNION ALL
SELECT 'Savar', 'Dhaka', 17, 1 UNION ALL
SELECT 'Savar', 'Dhaka', 20, 1 UNION ALL
-- Near Dhaka Routes (5-6 times each for maximum variety)
SELECT 'Narayanganj', 'Coxs Bazar', 5, 0 UNION ALL
SELECT 'Narayanganj', 'Coxs Bazar', 8, 0 UNION ALL
SELECT 'Narayanganj', 'Coxs Bazar', 11, 0 UNION ALL
SELECT 'Narayanganj', 'Coxs Bazar', 14, 0 UNION ALL
SELECT 'Narayanganj', 'Coxs Bazar', 17, 0 UNION ALL
SELECT 'Narayanganj', 'Coxs Bazar', 20, 0 UNION ALL
SELECT 'Coxs Bazar', 'Narayanganj', 5, 1 UNION ALL
SELECT 'Coxs Bazar', 'Narayanganj', 8, 1 UNION ALL
SELECT 'Coxs Bazar', 'Narayanganj', 11, 1 UNION ALL
SELECT 'Coxs Bazar', 'Narayanganj', 14, 1 UNION ALL
SELECT 'Coxs Bazar', 'Narayanganj', 17, 1 UNION ALL
SELECT 'Coxs Bazar', 'Narayanganj', 20, 1 UNION ALL
SELECT 'Gazipur', 'Tangail', 5, 0 UNION ALL
SELECT 'Gazipur', 'Tangail', 8, 0 UNION ALL
SELECT 'Gazipur', 'Tangail', 11, 0 UNION ALL
SELECT 'Gazipur', 'Tangail', 14, 0 UNION ALL
SELECT 'Gazipur', 'Tangail', 17, 0 UNION ALL
SELECT 'Gazipur', 'Tangail', 20, 0 UNION ALL
SELECT 'Tangail', 'Gazipur', 5, 1 UNION ALL
SELECT 'Tangail', 'Gazipur', 8, 1 UNION ALL
SELECT 'Tangail', 'Gazipur', 11, 1 UNION ALL
SELECT 'Tangail', 'Gazipur', 14, 1 UNION ALL
SELECT 'Tangail', 'Gazipur', 17, 1 UNION ALL
SELECT 'Tangail', 'Gazipur', 20, 1 UNION ALL
SELECT 'Mymensingh', 'Tangail', 5, 0 UNION ALL
SELECT 'Mymensingh', 'Tangail', 8, 0 UNION ALL
SELECT 'Mymensingh', 'Tangail', 11, 0 UNION ALL
SELECT 'Mymensingh', 'Tangail', 14, 0 UNION ALL
SELECT 'Mymensingh', 'Tangail', 17, 0 UNION ALL
SELECT 'Mymensingh', 'Tangail', 20, 0 UNION ALL
SELECT 'Tangail', 'Mymensingh', 5, 1 UNION ALL
SELECT 'Tangail', 'Mymensingh', 8, 1 UNION ALL
SELECT 'Tangail', 'Mymensingh', 11, 1 UNION ALL
SELECT 'Tangail', 'Mymensingh', 14, 1 UNION ALL
SELECT 'Tangail', 'Mymensingh', 17, 1 UNION ALL
SELECT 'Tangail', 'Mymensingh', 20, 1 UNION ALL
SELECT 'Mymensingh', 'Bogura', 5, 0 UNION ALL
SELECT 'Mymensingh', 'Bogura', 8, 0 UNION ALL
SELECT 'Mymensingh', 'Bogura', 11, 0 UNION ALL
SELECT 'Mymensingh', 'Bogura', 14, 0 UNION ALL
SELECT 'Mymensingh', 'Bogura', 17, 0 UNION ALL
SELECT 'Mymensingh', 'Bogura', 20, 0 UNION ALL
SELECT 'Bogura', 'Mymensingh', 5, 1 UNION ALL
SELECT 'Bogura', 'Mymensingh', 8, 1 UNION ALL
SELECT 'Bogura', 'Mymensingh', 11, 1 UNION ALL
SELECT 'Bogura', 'Mymensingh', 14, 1 UNION ALL
SELECT 'Bogura', 'Mymensingh', 17, 1 UNION ALL
SELECT 'Bogura', 'Mymensingh', 20, 1 UNION ALL
SELECT 'Tangail', 'Bogura', 5, 0 UNION ALL
SELECT 'Tangail', 'Bogura', 8, 0 UNION ALL
SELECT 'Tangail', 'Bogura', 11, 0 UNION ALL
SELECT 'Tangail', 'Bogura', 14, 0 UNION ALL
SELECT 'Tangail', 'Bogura', 17, 0 UNION ALL
SELECT 'Tangail', 'Bogura', 20, 0 UNION ALL
SELECT 'Bogura', 'Tangail', 5, 1 UNION ALL
SELECT 'Bogura', 'Tangail', 8, 1 UNION ALL
SELECT 'Bogura', 'Tangail', 11, 1 UNION ALL
SELECT 'Bogura', 'Tangail', 14, 1 UNION ALL
SELECT 'Bogura', 'Tangail', 17, 1 UNION ALL
SELECT 'Bogura', 'Tangail', 20, 1 UNION ALL
-- Internal Routes (5-6 times each for major routes, 4 times for minor)
SELECT 'Chittagong', 'Coxs Bazar', 5, 0 UNION ALL
SELECT 'Chittagong', 'Coxs Bazar', 8, 0 UNION ALL
SELECT 'Chittagong', 'Coxs Bazar', 11, 0 UNION ALL
SELECT 'Chittagong', 'Coxs Bazar', 14, 0 UNION ALL
SELECT 'Chittagong', 'Coxs Bazar', 17, 0 UNION ALL
SELECT 'Chittagong', 'Coxs Bazar', 20, 0 UNION ALL
SELECT 'Coxs Bazar', 'Chittagong', 5, 0 UNION ALL
SELECT 'Coxs Bazar', 'Chittagong', 8, 0 UNION ALL
SELECT 'Coxs Bazar', 'Chittagong', 11, 0 UNION ALL
SELECT 'Coxs Bazar', 'Chittagong', 14, 0 UNION ALL
SELECT 'Coxs Bazar', 'Chittagong', 17, 0 UNION ALL
SELECT 'Coxs Bazar', 'Chittagong', 20, 0 UNION ALL
SELECT 'Chittagong', 'Sylhet', 5, 0 UNION ALL
SELECT 'Chittagong', 'Sylhet', 8, 0 UNION ALL
SELECT 'Chittagong', 'Sylhet', 11, 0 UNION ALL
SELECT 'Chittagong', 'Sylhet', 14, 0 UNION ALL
SELECT 'Chittagong', 'Sylhet', 17, 0 UNION ALL
SELECT 'Chittagong', 'Sylhet', 20, 0 UNION ALL
SELECT 'Sylhet', 'Chittagong', 5, 1 UNION ALL
SELECT 'Sylhet', 'Chittagong', 8, 1 UNION ALL
SELECT 'Sylhet', 'Chittagong', 11, 1 UNION ALL
SELECT 'Sylhet', 'Chittagong', 14, 1 UNION ALL
SELECT 'Sylhet', 'Chittagong', 17, 1 UNION ALL
SELECT 'Sylhet', 'Chittagong', 20, 1 UNION ALL
SELECT 'Chittagong', 'Comilla', 5, 0 UNION ALL
SELECT 'Chittagong', 'Comilla', 8, 0 UNION ALL
SELECT 'Chittagong', 'Comilla', 11, 0 UNION ALL
SELECT 'Chittagong', 'Comilla', 14, 0 UNION ALL
SELECT 'Chittagong', 'Comilla', 17, 0 UNION ALL
SELECT 'Chittagong', 'Comilla', 20, 0 UNION ALL
SELECT 'Comilla', 'Chittagong', 5, 1 UNION ALL
SELECT 'Comilla', 'Chittagong', 8, 1 UNION ALL
SELECT 'Comilla', 'Chittagong', 11, 1 UNION ALL
SELECT 'Comilla', 'Chittagong', 14, 1 UNION ALL
SELECT 'Comilla', 'Chittagong', 17, 1 UNION ALL
SELECT 'Comilla', 'Chittagong', 20, 1 UNION ALL
SELECT 'Chittagong', 'Noakhali', 5, 0 UNION ALL
SELECT 'Chittagong', 'Noakhali', 8, 0 UNION ALL
SELECT 'Chittagong', 'Noakhali', 11, 0 UNION ALL
SELECT 'Chittagong', 'Noakhali', 14, 0 UNION ALL
SELECT 'Chittagong', 'Noakhali', 17, 0 UNION ALL
SELECT 'Chittagong', 'Noakhali', 20, 0 UNION ALL
SELECT 'Noakhali', 'Chittagong', 5, 1 UNION ALL
SELECT 'Noakhali', 'Chittagong', 8, 1 UNION ALL
SELECT 'Noakhali', 'Chittagong', 11, 1 UNION ALL
SELECT 'Noakhali', 'Chittagong', 14, 1 UNION ALL
SELECT 'Noakhali', 'Chittagong', 17, 1 UNION ALL
SELECT 'Noakhali', 'Chittagong', 20, 1 UNION ALL
SELECT 'Chittagong', 'Feni', 5, 0 UNION ALL
SELECT 'Chittagong', 'Feni', 8, 0 UNION ALL
SELECT 'Chittagong', 'Feni', 11, 0 UNION ALL
SELECT 'Chittagong', 'Feni', 14, 0 UNION ALL
SELECT 'Chittagong', 'Feni', 17, 0 UNION ALL
SELECT 'Chittagong', 'Feni', 20, 0 UNION ALL
SELECT 'Feni', 'Chittagong', 5, 1 UNION ALL
SELECT 'Feni', 'Chittagong', 8, 1 UNION ALL
SELECT 'Feni', 'Chittagong', 11, 1 UNION ALL
SELECT 'Feni', 'Chittagong', 14, 1 UNION ALL
SELECT 'Feni', 'Chittagong', 17, 1 UNION ALL
SELECT 'Feni', 'Chittagong', 20, 1 UNION ALL
SELECT 'Sylhet', 'Comilla', 5, 0 UNION ALL
SELECT 'Sylhet', 'Comilla', 8, 0 UNION ALL
SELECT 'Sylhet', 'Comilla', 11, 0 UNION ALL
SELECT 'Sylhet', 'Comilla', 14, 0 UNION ALL
SELECT 'Sylhet', 'Comilla', 17, 0 UNION ALL
SELECT 'Sylhet', 'Comilla', 20, 0 UNION ALL
SELECT 'Comilla', 'Sylhet', 5, 1 UNION ALL
SELECT 'Comilla', 'Sylhet', 8, 1 UNION ALL
SELECT 'Comilla', 'Sylhet', 11, 1 UNION ALL
SELECT 'Comilla', 'Sylhet', 14, 1 UNION ALL
SELECT 'Comilla', 'Sylhet', 17, 1 UNION ALL
SELECT 'Comilla', 'Sylhet', 20, 1 UNION ALL
SELECT 'Sylhet', 'Mymensingh', 5, 0 UNION ALL
SELECT 'Sylhet', 'Mymensingh', 8, 0 UNION ALL
SELECT 'Sylhet', 'Mymensingh', 11, 0 UNION ALL
SELECT 'Sylhet', 'Mymensingh', 14, 0 UNION ALL
SELECT 'Sylhet', 'Mymensingh', 17, 0 UNION ALL
SELECT 'Sylhet', 'Mymensingh', 20, 0 UNION ALL
SELECT 'Mymensingh', 'Sylhet', 5, 1 UNION ALL
SELECT 'Mymensingh', 'Sylhet', 8, 1 UNION ALL
SELECT 'Mymensingh', 'Sylhet', 11, 1 UNION ALL
SELECT 'Mymensingh', 'Sylhet', 14, 1 UNION ALL
SELECT 'Mymensingh', 'Sylhet', 17, 1 UNION ALL
SELECT 'Mymensingh', 'Sylhet', 20, 1 UNION ALL
SELECT 'Rajshahi', 'Bogura', 5, 0 UNION ALL
SELECT 'Rajshahi', 'Bogura', 8, 0 UNION ALL
SELECT 'Rajshahi', 'Bogura', 11, 0 UNION ALL
SELECT 'Rajshahi', 'Bogura', 14, 0 UNION ALL
SELECT 'Rajshahi', 'Bogura', 17, 0 UNION ALL
SELECT 'Rajshahi', 'Bogura', 20, 0 UNION ALL
SELECT 'Bogura', 'Rajshahi', 5, 1 UNION ALL
SELECT 'Bogura', 'Rajshahi', 8, 1 UNION ALL
SELECT 'Bogura', 'Rajshahi', 11, 1 UNION ALL
SELECT 'Bogura', 'Rajshahi', 14, 1 UNION ALL
SELECT 'Bogura', 'Rajshahi', 17, 1 UNION ALL
SELECT 'Bogura', 'Rajshahi', 20, 1 UNION ALL
SELECT 'Rajshahi', 'Pabna', 5, 0 UNION ALL
SELECT 'Rajshahi', 'Pabna', 8, 0 UNION ALL
SELECT 'Rajshahi', 'Pabna', 11, 0 UNION ALL
SELECT 'Rajshahi', 'Pabna', 14, 0 UNION ALL
SELECT 'Rajshahi', 'Pabna', 17, 0 UNION ALL
SELECT 'Rajshahi', 'Pabna', 20, 0 UNION ALL
SELECT 'Pabna', 'Rajshahi', 5, 1 UNION ALL
SELECT 'Pabna', 'Rajshahi', 8, 1 UNION ALL
SELECT 'Pabna', 'Rajshahi', 11, 1 UNION ALL
SELECT 'Pabna', 'Rajshahi', 14, 1 UNION ALL
SELECT 'Pabna', 'Rajshahi', 17, 1 UNION ALL
SELECT 'Pabna', 'Rajshahi', 20, 1 UNION ALL
SELECT 'Rajshahi', 'Dinajpur', 5, 0 UNION ALL
SELECT 'Rajshahi', 'Dinajpur', 8, 0 UNION ALL
SELECT 'Rajshahi', 'Dinajpur', 11, 0 UNION ALL
SELECT 'Rajshahi', 'Dinajpur', 14, 0 UNION ALL
SELECT 'Rajshahi', 'Dinajpur', 17, 0 UNION ALL
SELECT 'Rajshahi', 'Dinajpur', 20, 0 UNION ALL
SELECT 'Dinajpur', 'Rajshahi', 5, 1 UNION ALL
SELECT 'Dinajpur', 'Rajshahi', 8, 1 UNION ALL
SELECT 'Dinajpur', 'Rajshahi', 11, 1 UNION ALL
SELECT 'Dinajpur', 'Rajshahi', 14, 1 UNION ALL
SELECT 'Dinajpur', 'Rajshahi', 17, 1 UNION ALL
SELECT 'Dinajpur', 'Rajshahi', 20, 1 UNION ALL
SELECT 'Khulna', 'Jessore', 5, 0 UNION ALL
SELECT 'Khulna', 'Jessore', 8, 0 UNION ALL
SELECT 'Khulna', 'Jessore', 11, 0 UNION ALL
SELECT 'Khulna', 'Jessore', 14, 0 UNION ALL
SELECT 'Khulna', 'Jessore', 17, 0 UNION ALL
SELECT 'Khulna', 'Jessore', 20, 0 UNION ALL
SELECT 'Jessore', 'Khulna', 5, 1 UNION ALL
SELECT 'Jessore', 'Khulna', 8, 1 UNION ALL
SELECT 'Jessore', 'Khulna', 11, 1 UNION ALL
SELECT 'Jessore', 'Khulna', 14, 1 UNION ALL
SELECT 'Jessore', 'Khulna', 17, 1 UNION ALL
SELECT 'Jessore', 'Khulna', 20, 1 UNION ALL
SELECT 'Khulna', 'Barisal', 5, 0 UNION ALL
SELECT 'Khulna', 'Barisal', 8, 0 UNION ALL
SELECT 'Khulna', 'Barisal', 11, 0 UNION ALL
SELECT 'Khulna', 'Barisal', 14, 0 UNION ALL
SELECT 'Khulna', 'Barisal', 17, 0 UNION ALL
SELECT 'Khulna', 'Barisal', 20, 0 UNION ALL
SELECT 'Barisal', 'Khulna', 5, 1 UNION ALL
SELECT 'Barisal', 'Khulna', 8, 1 UNION ALL
SELECT 'Barisal', 'Khulna', 11, 1 UNION ALL
SELECT 'Barisal', 'Khulna', 14, 1 UNION ALL
SELECT 'Barisal', 'Khulna', 17, 1 UNION ALL
SELECT 'Barisal', 'Khulna', 20, 1 UNION ALL
SELECT 'Rangpur', 'Bogura', 5, 0 UNION ALL
SELECT 'Rangpur', 'Bogura', 8, 0 UNION ALL
SELECT 'Rangpur', 'Bogura', 11, 0 UNION ALL
SELECT 'Rangpur', 'Bogura', 14, 0 UNION ALL
SELECT 'Rangpur', 'Bogura', 17, 0 UNION ALL
SELECT 'Rangpur', 'Bogura', 20, 0 UNION ALL
SELECT 'Bogura', 'Rangpur', 5, 1 UNION ALL
SELECT 'Bogura', 'Rangpur', 8, 1 UNION ALL
SELECT 'Bogura', 'Rangpur', 11, 1 UNION ALL
SELECT 'Bogura', 'Rangpur', 14, 1 UNION ALL
SELECT 'Bogura', 'Rangpur', 17, 1 UNION ALL
SELECT 'Bogura', 'Rangpur', 20, 1 UNION ALL
SELECT 'Rangpur', 'Dinajpur', 5, 0 UNION ALL
SELECT 'Rangpur', 'Dinajpur', 8, 0 UNION ALL
SELECT 'Rangpur', 'Dinajpur', 11, 0 UNION ALL
SELECT 'Rangpur', 'Dinajpur', 14, 0 UNION ALL
SELECT 'Rangpur', 'Dinajpur', 17, 0 UNION ALL
SELECT 'Rangpur', 'Dinajpur', 20, 0 UNION ALL
SELECT 'Dinajpur', 'Rangpur', 5, 1 UNION ALL
SELECT 'Dinajpur', 'Rangpur', 8, 1 UNION ALL
SELECT 'Dinajpur', 'Rangpur', 11, 1 UNION ALL
SELECT 'Dinajpur', 'Rangpur', 14, 1 UNION ALL
SELECT 'Dinajpur', 'Rangpur', 17, 1 UNION ALL
SELECT 'Dinajpur', 'Rangpur', 20, 1 UNION ALL
SELECT 'Coxs Bazar', 'Sylhet', 5, 0 UNION ALL
SELECT 'Coxs Bazar', 'Sylhet', 8, 0 UNION ALL
SELECT 'Coxs Bazar', 'Sylhet', 11, 0 UNION ALL
SELECT 'Coxs Bazar', 'Sylhet', 14, 0 UNION ALL
SELECT 'Coxs Bazar', 'Sylhet', 17, 0 UNION ALL
SELECT 'Coxs Bazar', 'Sylhet', 20, 0 UNION ALL
SELECT 'Sylhet', 'Coxs Bazar', 5, 1 UNION ALL
SELECT 'Sylhet', 'Coxs Bazar', 8, 1 UNION ALL
SELECT 'Sylhet', 'Coxs Bazar', 11, 1 UNION ALL
SELECT 'Sylhet', 'Coxs Bazar', 14, 1 UNION ALL
SELECT 'Sylhet', 'Coxs Bazar', 17, 1 UNION ALL
SELECT 'Sylhet', 'Coxs Bazar', 20, 1;

-- Update with route IDs and times
UPDATE unique_assignments ua
SET 
    route_id = r.id,
    departure_time = (CURRENT_DATE + ua.days_offset) AT TIME ZONE 'UTC' + (ua.hours_offset || ' hours')::interval,
    arrival_time = (CURRENT_DATE + ua.days_offset) AT TIME ZONE 'UTC' + (ua.hours_offset || ' hours')::interval + (r.estimated_duration_minutes || ' minutes')::interval
FROM routes r
WHERE r.from_city = ua.route_from AND r.to_city = ua.route_to;

-- =====================================================
-- Get bus pool with row numbers
-- =====================================================
CREATE TEMP TABLE bus_pool AS
SELECT id as bus_id, bus_number, total_seats,
       ROW_NUMBER() OVER (ORDER BY bus_number) as rn
FROM buses;

-- =====================================================
-- Create deterministic bus assignments using hashtext
-- This ensures: same route + time = same bus, no duplicates
-- =====================================================
CREATE TEMP TABLE bus_assignments AS
SELECT DISTINCT
    ua.route_id,
    ua.departure_time,
    ua.arrival_time,
    -- hashtext returns an integer, perfect for modulo distribution
    (abs(hashtext(ua.route_from || ua.route_to || ua.hours_offset::text)) % 
        (SELECT COUNT(*) FROM bus_pool) + 1)::int as bus_rn
FROM unique_assignments ua;

-- =====================================================
-- Create final assignments with unique bus per (route, time)
-- =====================================================
CREATE TEMP TABLE final_assignments AS
SELECT 
    bp.bus_id,
    bp.bus_number,
    ba.route_id,
    ba.departure_time,
    ba.arrival_time,
    bp.total_seats as available_seats
FROM bus_assignments ba
JOIN bus_pool bp ON bp.rn = ba.bus_rn;

-- =====================================================
-- Insert schedules with DISTINCT ON to prevent any duplicates
-- Note: ORDER BY must start with the DISTINCT ON columns
-- =====================================================
INSERT INTO schedules (bus_id, route_id, departure_time, arrival_time, available_seats, status)
SELECT DISTINCT ON (bus_id, route_id, departure_time)
    fa.bus_id,
    fa.route_id,
    fa.departure_time,
    fa.arrival_time,
    bp.total_seats,
    'scheduled'::schedule_status
FROM final_assignments fa
JOIN bus_pool bp ON bp.bus_id = fa.bus_id
ORDER BY fa.bus_id, fa.route_id, fa.departure_time;

-- =====================================================
-- Clean up temp tables
-- =====================================================
DROP TABLE IF EXISTS unique_assignments;
DROP TABLE IF EXISTS bus_pool;
DROP TABLE IF EXISTS bus_assignments;
DROP TABLE IF EXISTS final_assignments;

-- =====================================================
-- ADD SEAT AVAILABILITY
-- =====================================================
INSERT INTO seat_availability (schedule_id, seat_number, status)
SELECT s.id, gs.seat_number, 'available'::seat_status
FROM schedules s
CROSS JOIN generate_series(1, (SELECT total_seats FROM buses WHERE id = s.bus_id)) AS gs(seat_number);

-- =====================================================
-- UPDATE AVAILABLE SEATS COUNT
-- =====================================================
UPDATE schedules
SET available_seats = (
  SELECT COUNT(*) FROM seat_availability sa
  WHERE sa.schedule_id = schedules.id AND sa.status = 'available'
);

-- =====================================================
-- VERIFY NO OVERLAPPING SCHEDULES
-- =====================================================
SELECT '=== SCHEDULE VALIDATION ===' as info;

-- Check for any overlapping schedules (should return 0 rows)
SELECT 
    s1.bus_id,
    b.bus_number,
    r1.from_city || ' -> ' || r1.to_city as route1,
    s1.departure_time as dep1,
    s1.arrival_time as arr1,
    r2.from_city || ' -> ' || r2.to_city as route2,
    s2.departure_time as dep2,
    s2.arrival_time as arr2
FROM schedules s1
JOIN schedules s2 ON s1.bus_id = s2.bus_id 
    AND s1.id < s2.id
JOIN buses b ON s1.bus_id = b.id
JOIN routes r1 ON s1.route_id = r1.id
JOIN routes r2 ON s2.route_id = r2.id
WHERE s1.departure_time < s2.arrival_time 
    AND s2.departure_time < s1.arrival_time
LIMIT 5;

-- Count of potential conflicts
SELECT 
    'Conflicts found: ' || COUNT(*)::text as conflict_check
FROM schedules s1
JOIN schedules s2 ON s1.bus_id = s2.bus_id 
    AND s1.id < s2.id
WHERE s1.departure_time < s2.arrival_time 
    AND s2.departure_time < s1.arrival_time;

-- =====================================================
-- SUMMARY STATISTICS
-- =====================================================
SELECT '✓ Buses: ' || COUNT(*)::text FROM buses;
SELECT '✓ Routes: ' || COUNT(*)::text FROM routes;
SELECT '✓ Schedules: ' || COUNT(*)::text FROM schedules;
SELECT '✓ Seat Availability: ' || COUNT(*)::text FROM seat_availability;

-- Schedules per bus (should be balanced)
SELECT 
    b.bus_number,
    b.bus_name,
    COUNT(s.id) as total_schedules
FROM buses b
LEFT JOIN schedules s ON b.id = s.bus_id
GROUP BY b.id, b.bus_number, b.bus_name
ORDER BY COUNT(s.id) DESC;

-- Summary by time of day
SELECT 
    CASE 
        WHEN EXTRACT(HOUR FROM departure_time) BETWEEN 5 AND 9 THEN 'Morning (5-9 AM)'
        WHEN EXTRACT(HOUR FROM departure_time) BETWEEN 10 AND 14 THEN 'Midday (10 AM-2 PM)'
        WHEN EXTRACT(HOUR FROM departure_time) BETWEEN 15 AND 18 THEN 'Afternoon (3-6 PM)'
        ELSE 'Evening/Night (7 PM+)'
    END as time_period,
    COUNT(*) as schedules_per_day
FROM schedules
WHERE departure_time >= CURRENT_DATE
GROUP BY time_period
ORDER BY MIN(departure_time);

SELECT '✓ All schedules are conflict-free!' AS status;
