-- =====================================================
-- ADD VARIED BUS TIMINGS - Standalone Migration
-- Run this AFTER schema.sql to add schedules with varied timings
-- =====================================================

-- Clear existing schedules
TRUNCATE TABLE seat_availability CASCADE;
TRUNCATE TABLE schedules CASCADE;

-- Create temp table for bus assignments
CREATE TEMP TABLE route_bus_assignment (
    route_from text,
    route_to text,
    bus_number text,
    hours_offset int
);

-- Dhaka Routes (3 times each - morning, afternoon, night)
INSERT INTO route_bus_assignment VALUES
('Dhaka', 'Chittagong', 'SYL-001', 6),
('Dhaka', 'Chittagong', 'HAN-002', 14),
('Dhaka', 'Chittagong', 'SRT-004', 22),
('Dhaka', 'Sylhet', 'SYL-001', 7),
('Dhaka', 'Sylhet', 'HAN-002', 14),
('Dhaka', 'Sylhet', 'SRT-004', 21),
('Dhaka', 'Coxs Bazar', 'SYL-001', 8),
('Dhaka', 'Coxs Bazar', 'HAN-002', 15),
('Dhaka', 'Coxs Bazar', 'EAG-003', 22),
('Dhaka', 'Barisal', 'HAN-002', 7),
('Dhaka', 'Barisal', 'SRT-004', 13),
('Dhaka', 'Barisal', 'EAG-003', 21),
('Dhaka', 'Rajshahi', 'SRT-004', 8),
('Dhaka', 'Rajshahi', 'EAG-003', 15),
('Dhaka', 'Khulna', 'EAG-003', 8),
('Dhaka', 'Khulna', 'ENA-005', 14),
('Dhaka', 'Rangpur', 'ENA-005', 7),
('Dhaka', 'Rangpur', 'HAN-002', 14);

-- Insert schedules
INSERT INTO schedules (bus_id, route_id, departure_time, arrival_time, available_seats, status)
SELECT 
    b.id as bus_id,
    r.id as route_id,
    (CURRENT_DATE + gs.day_offset) AT TIME ZONE 'UTC' + (rba.hours_offset || ' hours')::interval as departure_time,
    (CURRENT_DATE + gs.day_offset) AT TIME ZONE 'UTC' + (rba.hours_offset || ' hours')::interval + (r.estimated_duration_minutes || ' minutes')::interval as arrival_time,
    b.total_seats as available_seats,
    'scheduled' as status
FROM route_bus_assignment rba
CROSS JOIN generate_series(0, 6) AS gs(day_offset)
JOIN buses b ON b.bus_number = rba.bus_number
JOIN routes r ON r.from_city = rba.route_from AND r.to_city = rba.route_to;

DROP TABLE route_bus_assignment;

-- Add seat availability
INSERT INTO seat_availability (schedule_id, seat_number, status)
SELECT s.id, gs.seat_number, 'available'
FROM schedules s
CROSS JOIN generate_series(1, (SELECT total_seats FROM buses WHERE id = s.bus_id)) AS gs(seat_number);

-- Update available seats count
UPDATE schedules
SET available_seats = (
    SELECT COUNT(*) FROM seat_availability sa
    WHERE sa.schedule_id = schedules.id AND sa.status = 'available'
);

SELECT 'Done! Schedules with varied timings created.' as status;

