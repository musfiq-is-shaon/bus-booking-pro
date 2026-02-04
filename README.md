# Transitly - Bus Booking System

A modern, full-featured bus booking application built with Next.js 14, Supabase, and Tailwind CSS. Designed for the Bangladesh transportation market with support for multiple bus types, real-time seat availability, and comprehensive booking management.

## 🌟 Key Features

### 🔐 Authentication & User Management
- **Secure Sign Up/Login** - Email/password authentication via Supabase Auth
- **Profile Management** - Users can update their profiles with full name, phone, and avatar
- **Role-based Access** - User and admin roles with appropriate permissions
- **Session Management** - Persistent sessions with secure token handling
- **Protected Routes** - Middleware protection for authenticated pages

### 🔍 Smart Search System
- **City-based Search** - Search buses between 20+ major cities in Bangladesh
- **Date-based Filtering** - Find buses for specific travel dates
- **Reverse Route Support** - Automatically handles reverse route searches
- **Real-time Availability** - Live seat availability updates
- **Auto-search** - Automatically searches when URL parameters are provided
- **Past Date Prevention** - Blocks searching for past dates
- **Dynamic Pricing** - Calculates prices based on distance

### 💺 Interactive Seat Selection
- **Visual Seat Map** - Interactive seat selection interface
- **4 Bus Types** - Standard, Semi-Sleeper, Sleeper, and Luxury buses
- **Seat Status Indicators** - Clearly shows available, selected, booked, and reserved seats
- **Maximum 4 Seats** - Limits selection to 4 seats per booking per user per day
- **Dynamic Layouts** - Different seat arrangements per bus type
- **Real-time Updates** - Seat availability updates in real-time via Supabase subscriptions

### 📝 Complete Booking Flow
- **Multi-step Booking** - Seat selection → Passenger details → Payment → Confirmation
- **Passenger Management** - Add multiple passengers with name, age, gender, email, phone
- **Live Price Calculation** - Real-time price updates as seats are selected
- **Booking Reference** - Unique booking reference (e.g., BK-20240101-ABC123)
- **Instant Confirmation** - Immediate booking confirmation upon completion
- **Daily Seat Limit** - Users can only book max 4 seats per day

### 🎫 E-Ticket Generation
- **PDF Ticket Download** - Generate and download printable PDF tickets
- **Ticket Preview** - View tickets in a modal before downloading
- **Complete Ticket Info** - Includes booking reference, passenger details, route, bus info, seats, and price
- **Print-ready Format** - Tickets formatted for printing or PDF save

### 📱 User Dashboard
- **Upcoming Trips** - View and manage upcoming bookings
- **Past Trips** - Access history of completed and cancelled bookings
- **Booking Status** - Track booking status (confirmed, pending, cancelled, completed)
- **Quick Actions** - View ticket, download ticket, or cancel booking
- **Tab Navigation** - Switch between upcoming and past bookings

### ❌ Booking Cancellation
- **Self-service Cancellation** - Users can cancel their own bookings
- **Cancellation Confirmation** - Modal confirmation before cancellation
- **Automatic Seat Release** - Cancelled seats automatically become available
- **Available Seats Update** - Real-time update of available seats count
- **Refund Information** - Shows refund processing timeframe

### 🛡️ Database Constraints & Validation
- **Bus Schedule Overlap Prevention** - Prevents same bus from having overlapping schedules
- **Minimum Turnaround Time** - Ensures adequate time between trips (60+ minutes)
- **Seat Locking** - Temporary seat locks during booking process
- **Auto Seat Release** - Expired seat locks automatically released
- **Daily Seat Limit** - Maximum 4 seats per user per day enforced at application level

### 📊 Admin Features
- **Admin Dashboard** - Full access to manage all bookings
- **User Management** - View and manage user profiles
- **Bus Management** - Add, edit, and remove buses
- **Route Management** - Manage routes between cities
- **Schedule Management** - Create and manage bus schedules
- **Role-based Permissions** - Admin users have elevated privileges

## 🚀 Technical Features

### Frontend
- **Next.js 14 App Router** - Modern React framework with App Router
- **TypeScript** - Full type safety across the codebase
- **Tailwind CSS** - Utility-first styling with custom design system
- **Lucide Icons** - Beautiful, consistent icon set
- **Server Actions** - Full-stack capabilities with type-safe server actions
- **Real-time Updates** - Live seat availability via Supabase Realtime
- **Form Validation** - Zod schemas for robust form validation
- **Error Handling** - Comprehensive error boundaries and fallback UI
- **Loading States** - Skeleton loaders and spinners
- **Responsive Design** - Mobile-first, works on all devices
- **Dark/Light Mode** - Theme switching support

### Backend (Supabase)
- **PostgreSQL Database** - Robust relational database
- **Row Level Security (RLS)** - Fine-grained access control
- **Database Functions** - Stored procedures for complex operations
- **Database Triggers** - Automatic data management
- **Authentication** - Secure user authentication
- **Real-time Subscriptions** - Live data updates
- **Auto Profile Creation** - Automatic profile on signup

### Key Database Functions
- `confirm_booking_and_update_seats()` - Confirms booking and updates seat status
- `lock_seats_for_booking()` - Temporarily locks seats during checkout
- `release_expired_seat_locks()` - Auto-releases expired seat locks
- `prevent_bus_overlap()` - Prevents bus schedule conflicts
- `validate_bus_schedule_feasibility()` - Validates schedule feasibility
- `get_bus_schedule_timeline()` - Returns bus schedule timeline
- `get_seat_layout()` - Returns seat layout for a bus type
- `check_daily_seat_limit()` - Validates daily seat booking limit

## 🚌 Supported Bus Types

| Type | Description | Layout |
|------|-------------|--------|
| **Standard** | Affordable travel with essential amenities | 10 rows × 5 seats |
| **Semi-Sleeper** | Reclining seats for comfortable journey | 10 rows × 5 seats |
| **Sleeper** | Bunk beds for overnight journeys | 8 rows × 4 seats |
| **Luxury** | Premium experience with all amenities | 9 rows × 4 seats |

## 📍 Supported Cities

Dhaka, Chittagong, Sylhet, Rajshahi, Khulna, Barisal, Rangpur, Comilla, Cox's Bazar, Narayanganj, Gazipur, Mymensingh, Tangail, Bogura, Jessore, Dinajpur, Pabna, Noakhali, Feni, Savar

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 14, TypeScript, React |
| **Styling** | Tailwind CSS, Lucide Icons |
| **Backend** | Supabase (Auth, Database, Realtime) |
| **Deployment** | Vercel |
| **Validation** | Zod |
| **Utilities** | clsx, tailwind-merge |

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Authentication pages
│   │   ├── login/           # Login page
│   │   └── signup/          # Signup page
│   ├── book/[id]/           # Booking page
│   ├── dashboard/           # User dashboard
│   │   ├── user/            # User dashboard home
│   │   └── bookings/        # Bookings management
│   ├── search/              # Bus search page
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── actions/                  # Server actions
│   ├── auth.ts              # Authentication actions
│   └── bookings.ts          # Booking actions
├── lib/                     # Utilities
│   ├── supabase/            # Supabase client/server
│   │   ├── client.ts        # Client-side Supabase
│   │   ├── server.ts        # Server-side Supabase
│   │   └── types.ts         # TypeScript types
│   ├── schemas.ts           # Zod validation schemas
│   ├── utils.ts             # Helper functions
│   └── theme-provider.tsx   # Theme context provider
└── middleware.ts            # Auth protection middleware

supabase/
├── schema.sql               # Database schema with RLS policies
├── seed.sql                 # Sample data
├── fix_seat_rls_policy.sql  # RLS policy fixes
└── daily_seat_limit_function.sql  # Daily seat limit function
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd training-ground-7
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Supabase credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

### Database Setup

Run the SQL files in Supabase SQL Editor in this order:

1. `supabase/schema.sql` - Creates all tables, RLS policies, and functions
2. `supabase/seed.sql` - Adds sample data (buses, routes, schedules)
3. `supabase/fix_seat_rls_policy.sql` - Fixes seat availability RLS policies
4. `supabase/daily_seat_limit_function.sql` - Adds daily seat limit function (optional)

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side, optional) |

## 🧪 Testing Features

To test the booking system:

1. Create an account at `/signup`
2. Search for buses between cities (e.g., Dhaka → Chittagong)
3. Select seats (max 4)
4. Enter passenger details
5. Complete the demo payment
6. Download the ticket
7. Check your bookings at `/dashboard/bookings`
8. Try cancelling a booking

## 📱 Pages & Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Home page | No |
| `/search` | Bus search | No |
| `/book/[id]` | Booking page | Yes |
| `/login` | Login page | No |
| `/signup` | Signup page | No |
| `/dashboard` | User dashboard | Yes |
| `/dashboard/bookings` | My bookings | Yes |

## 🔒 Security Features

- **Row Level Security** - Users can only access their own data
- **Server-side Validation** - All inputs validated on the server
- **SQL Injection Prevention** - Parameterized queries via Supabase
- **XSS Protection** - React's automatic escaping
- **CSRF Protection** - Supabase handles auth tokens securely
- **Environment Variables** - Sensitive data not exposed to client

## 📈 Performance Features

- **Server Components** - Reduced client-side JavaScript
- **Static Generation** - Static pages for better performance
- **Route Prefetching** - Instant page transitions
- **Image Optimization** - Optimized images via Next.js
- **Code Splitting** - Automatic code splitting by route
- **Real-time Updates** - Efficient seat availability sync

## 🎨 Design System

The app uses a custom design system with:

- **Primary Color**: Indigo (#6366f1)
- **Secondary Color**: Slate gray (#475569)
- **Success Color**: Emerald (#059669)
- **Warning Color**: Amber (#d97706)
- **Error Color**: Red (#dc2626)
- **Typography**: Inter font family
- **Border Radius**: 8px (rounded-xl for cards)
- **Shadows**: Subtle shadow for depth
- **Animations**: Smooth transitions and hover effects

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js, Supabase, and Tailwind CSS

