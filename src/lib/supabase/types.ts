export type UserRole = 'user' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type SeatStatus = 'available' | 'booked' | 'reserved';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Bus {
  id: string;
  bus_name: string;
  bus_number: string;
  bus_type: 'standard' | 'luxury' | 'sleeper' | 'semi-sleeper';
  total_seats: number;
  amenities: string[];
  image_url: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  from_city: string;
  to_city: string;
  distance_km: number | null;
  estimated_duration_minutes: number | null;
  price: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  bus_id: string;
  route_id: string;
  bus?: Bus;
  route?: Route;
  departure_time: string;
  arrival_time: string;
  available_seats: number;
  status: 'scheduled' | 'departed' | 'arrived' | 'cancelled';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeatAvailability {
  id: string;
  schedule_id: string;
  seat_number: number;
  status: SeatStatus;
  booked_by: string | null;
  booked_at: string | null;
  lock_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PassengerDetails {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  email?: string;
  phone?: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  user_id: string;
  schedule_id: string;
  schedule?: Schedule;
  seats_booked: number[];
  passenger_details: PassengerDetails[];
  total_price: number;
  status: BookingStatus;
  payment_method: string | null;
  payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SearchParams {
  from: string;
  to: string;
  date: string;
}

export interface SeatLayout {
  rows: number;
  seatsPerRow: number;
  aisleAfter: number; // Seat index after which aisle starts (0-indexed)
}

export const BUS_SEAT_LAYOUTS: Record<string, SeatLayout> = {
  standard: { rows: 10, seatsPerRow: 5, aisleAfter: 2 },
  'semi-sleeper': { rows: 10, seatsPerRow: 5, aisleAfter: 2 },
  luxury: { rows: 9, seatsPerRow: 4, aisleAfter: 2 },
  sleeper: { rows: 8, seatsPerRow: 4, aisleAfter: 2 },
};

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

