import { z } from 'zod';

// Search schedules schema
export const searchSchedulesSchema = z.object({
  fromCity: z.string().min(1, 'Please select departure city'),
  toCity: z.string().min(1, 'Please select destination city'),
  date: z.string().min(1, 'Please select a date'),
});

// Sign up schema
export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Please enter your full name'),
});

// Sign in schema
export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Please enter your password'),
});

// Create booking schema
export const createBookingSchema = z.object({
  scheduleId: z.string().uuid('Invalid schedule'),
  seats: z.array(z.number()).min(1, 'Please select at least one seat'),
  passengers: z.array(
    z.object({
      name: z.string().min(2, 'Passenger name is required'),
      age: z.number().min(1, 'Valid age is required'),
      gender: z.enum(['male', 'female', 'other']),
      email: z.string().email().optional(),
      phone: z.string().optional(),
    })
  ).min(1, 'Passenger details are required'),
  notes: z.string().optional(),
});

