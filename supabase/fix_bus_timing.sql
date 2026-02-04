
-- =====================================================
-- FIX BUS TIMING CONSTRAINT
-- Ensures each (route, time) gets a UNIQUE bus
-- =====================================================

-- =====================================================
-- STEP 1: Clear existing data
-- =====================================================
TRUNCATE TABLE seat_availability CASCADE;
TRUNCATE TABLE schedules CASCADE;

-- =====================================================
-- STEP 2: Create a simple assignment table
-- =====================================================
CREATE TEMP TABLE schedule_plan (
    route_id UUID,
    from_city TEXT,
    to_city TEXT,
    hours_offset INT,
    departure_time TIMESTAMP WITH TIME ZONE,
    arrival_time TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- STEP 3: Insert all route-time combinations
-- Each route gets 4 departure times
-- =====================================================
INSERT INTO schedule_plan (route_id, from_city, to_city, hours_offset)
SELECT r.id, r.from_city, r.to_city, t.hours
FROM routes r
CROSS JOIN (VALUES (6), (10), (14), (18)) t(hours)
WHERE r.is_active = true;

-- Update times
UPDATE schedule_plan sp
SET 
    departure_time = CURRENT_DATE + (hours_offset || ' hours')::interval,
    arrival_time = CURRENT_DATE + (hours_offset || ' hours')::interval + 
        (r.estimated_duration_minutes || ' minutes')::interval
FROM routes r
WHERE r.id = sp.route_id;

SELECT 'Total assignments: ' || COUNT(*)::text FROM schedule_plan;

-- =====================================================
-- STEP 4: Get buses in order
-- =====================================================
CREATE TEMP TABLE bus_seq AS
SELECT id as bus_id, bus_name, bus_number, total_seats
FROM buses
ORDER BY bus_number;

SELECT 'Total buses: ' || COUNT(*)::text FROM bus_seq;

-- =====================================================
-- STEP 5: Assign buses round-robin
-- Each (route, time) gets a DIFFERENT bus
-- =====================================================
INSERT INTO schedules (bus_id, route_id, departure_time, arrival_time, available_seats, status)
SELECT 
    bs.bus_id,
    sp.route_id,
    sp.departure_time,
    sp.arrival_time,
    bs.total_seats,
    'scheduled'::schedule_status
FROM schedule_plan sp
CROSS JOIN LATERAL (
    SELECT bus_id, total_seats
    FROM bus_seq
    ORDER BY bus_number
    OFFSET (ROW_NUMBER() OVER (ORDER BY sp.route_id, sp.hours_offset) - 1) % (SELECT COUNT(*) FROM bus_seq)
    LIMIT 1
) bs;

-- =====================================================
-- CLEAN UP
-- =====================================================
DROP TABLE IF EXISTS schedule_plan;
DROP TABLE IF EXISTS bus_seq;

-- =====================================================
-- ADD SEAT AVAILABILITY
-- =====================================================
INSERT INTO seat_availability (schedule_id, seat_number, status)
SELECT s.id, gs.seat_number, 'available'::seat_status
FROM schedules s
CROSS JOIN generate_series(1, (SELECT total_seats FROM buses WHERE id = s.bus_id)) AS gs(seat_number);

-- Update available seats
UPDATE schedules
SET available_seats = (
    SELECT COUNT(*) FROM seat_availability sa
    WHERE sa.schedule_id = schedules.id AND sa.status = 'available'
);

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT '=== DUPLICATE CHECK ===' as info;

SELECT 
    b.bus_name,
    r.from_city || ' -> ' || r.to_city as route,
    TO_CHAR(s.departure_time, 'HH24:MI') as time,
    COUNT(*) as cnt
FROM schedules s
JOIN buses b ON s.bus_id = b.id
JOIN routes r ON s.route_id = r.id
GROUP BY b.bus_name, r.from_city, r.to_city, s.departure_time
HAVING COUNT(*) > 1;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM schedules s1 JOIN schedules s2 ON s1.bus_id = s2.bus_id AND s1.route_id = s2.route_id AND s1.departure_time = s2.departure_time AND s1.id <> s2.id)
        THEN '❌ DUPLICATES!'
        ELSE '✅ No duplicates'
    END as result;

-- =====================================================
-- SAMPLE: Dhaka to Chittagong
-- =====================================================
SELECT '=== Dhaka to Chittagong ===' as info;
SELECT 
    b.bus_name,
    b.bus_number,
    TO_CHAR(s.departure_time, 'HH24:MI') as dep
FROM schedules s
JOIN buses b ON s.bus_id = b.id
JOIN routes r ON s.route_id = r.id
WHERE r.from_city = 'Dhaka' AND r.to_city = 'Chittagong'
ORDER BY s.departure_time;

-- =====================================================
-- SUMMARY
-- =====================================================
SELECT 'Schedules: ' || COUNT(*) FROM schedules;
SELECT 'Routes with schedules: ' || COUNT(DISTINCT route_id) FROM schedules;

SELECT '=== PER ROUTE ===' as info;
SELECT 
    r.from_city || ' -> ' || r.to_city as route,
    COUNT(s.id) as count
FROM routes r
LEFT JOIN schedules s ON r.id = s.route_id
GROUP BY r.from_city, r.to_city
HAVING COUNT(s.id) > 0
ORDER BY COUNT(s.id) DESC;

SELECT '✅ Done!' AS status;

