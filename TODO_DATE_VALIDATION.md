# Date Validation Implementation Plan

## Objective
Ensure the website knows the current date/time and does not allow users to search/book tickets for past dates/times.

## Steps

### 1. Search Page Date Validation (`src/app/search/page.tsx`) ✅
- [x] Ensure date input has proper `min` attribute for current date
- [x] Add client-side validation to show error if user tries to select past date
- [x] Add handling for past schedule error when redirected from book page

### 2. Book Page Past Schedule Check (`src/app/book/[id]/page.tsx`) ✅
- [x] Add validation when page loads to check if schedule departure is in the past
- [x] Show error message and redirect to search if schedule is in the past
- [x] Prevent booking flow if departure time has passed

### 3. Server-side Validation (`src/actions/bookings.ts`) ✅
- [x] Add validation in `createBooking` to reject past schedule bookings
- [x] Return clear error message if user tries to book past schedule

### 4. Utility Functions (`src/lib/utils.ts`) ✅
- [x] Add `isDateInPast()` function for date validation
- [x] Add `isDateTimeInPast()` function for datetime validation
- [x] Add `getCurrentDateString()` function
- [x] Add `getCurrentDateTimeString()` function

## Implementation Details

### Time-based cutoff logic:
- Current time vs schedule departure time
- For same-day bookings: prevent booking if departure time has passed
- For past dates: completely block access

### Error messages:
- "Cannot search for past dates. Please select today or a future date."
- "This bus has already departed. Please select an upcoming bus."
- "Cannot book tickets for a schedule that has already departed. Please select an upcoming bus."

