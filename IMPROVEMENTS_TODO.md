# Improvements TODO

## Task 1: Update CITIES to Bangladesh
- [x] Update CITIES array in `src/lib/utils.ts` with Bangladesh cities
- [x] Update formatCurrency to use BDT currency

## Task 2: Create Bangladesh-Oriented Seed Data
- [x] Update `supabase/seed.sql` with Bangladesh bus companies
- [x] Add Bangladesh routes (Dhaka-Chittagong, Dhaka-Sylhet, etc.)
- [x] Set schedules to future dates
- [x] Add realistic prices in BDT

## Task 3: Improve Login Page Error Handling
- [x] Add rate limit error detection and handling
- [x] Add "Try different email" option when rate limited
- [x] Add user-friendly error messages for auth errors

## Task 4: Improve Signup Page Error Handling
- [x] Add rate limit error detection and handling
- [x] Add "Send confirmation email anyway" option
- [x] Improve error messages for rate limits

## Task 5: Test the Application
- [ ] Verify search returns buses (requires running seed.sql in Supabase)
- [ ] Verify login/signup error handling

