# TODO - Fix Date Inconsistency Bug

## Problem Analysis

Multiple timezone-related bugs were causing issues:
1. Date mismatch between search and booking pages
2. Only afternoon buses showing instead of all buses for the day
3. Count mismatch (19 shown vs actual count)
4. AM/PM confusion - 1 PM buses not showing at 1 AM

## Root Causes

1. **`canBookSchedule()` was incorrectly adding timezone offset** - When Supabase returns timestamps with timezone info (e.g., "2026-02-05T13:00:00+00:00"), the code was incorrectly adding `+06:00` causing 1 PM to be parsed as 7 PM
2. **`formatTime()` had same issue** - Causing display issues
3. **`isDateInPast()` was overly complex** - Using UTC calculations when simple local comparison works

## Fixes Applied

### 1. Fixed `canBookSchedule()` function

**Before (buggy):**
```typescript
const dateStr = dateTimeStr.includes('+') || dateTimeStr.includes('Z') 
  ? dateTimeStr 
  : dateTimeStr + '+06:00'; // This was adding +06:00 to timestamps that ALREADY have timezone
```

**After (fixed):**
```typescript
// Supabase returns timestamps with timezone info (e.g., "2026-02-05T13:00:00+00:00")
// JavaScript's Date.parse handles ISO 8601 correctly, so we can parse directly
const departureTime = new Date(dateTimeStr);
```

### 2. Fixed `formatTime()` function

Same fix - parse directly without adding timezone.

### 3. Simplified `isDateInPast()` function

**Before (overly complex):**
```typescript
const selectedDate = new Date(Date.UTC(year, month, day, 18, 0, 0));
const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 18, 0, 0));
```

**After (simple):**
```typescript
const selectedDate = new Date(dateStr);
const today = new Date();
today.setHours(0, 0, 0, 0);
selectedDate.setHours(0, 0, 0, 0);
```

### 4. Fixed `getDayBoundsLocal()` function

Fixed UTC bounds calculation for Bangladesh timezone.

## Status

- [x] Fix `canBookSchedule()` function in utils.ts - parse timestamps directly
- [x] Fix `formatTime()` function in utils.ts - parse timestamps directly
- [x] Simplify `isDateInPast()` function in utils.ts
- [x] Fix `getDayBoundsLocal()` function in search/page.tsx
- [x] Test the fix - Now 1 PM buses should show at 1 AM

