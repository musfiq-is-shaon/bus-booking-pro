# BusBooking Pro - Production-Ready SaaS Bus Ticket Booking Platform

A modern, production-ready SaaS bus ticket booking platform built with Next.js 14, Supabase, TypeScript, and Tailwind CSS. Features a professional, consumer-friendly design suitable for both individual travelers and corporate clients.

![BusBooking Pro](https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop)

## ✨ Features

### Authentication & User Management
- Email/password signup & login with Supabase Auth
- Persistent sessions with secure cookie management
- Protected routes with role-based access control
- Demo accounts for testing (user & admin)

### User Roles
- **Admin**: Full access to manage buses, routes, schedules, and view all bookings
- **User**: Search buses, book tickets, view booking history, cancel bookings

### Core Features
- 🚌 **Search Buses**: Find buses by route and date with real-time availability
- 💺 **Seat Selection**: Interactive seat map with real-time availability updates
- 📱 **Mobile-First**: Fully responsive design for all devices
- 🎫 **Booking Management**: Complete booking lifecycle with ticket generation
- 📊 **Dashboard**: User dashboard for booking history, admin dashboard for platform management
- 🔒 **Security**: Supabase Row Level Security (RLS) policies

### Design
- Modern SaaS aesthetic (similar to Stripe, Airbnb, Uber)
- Soft gradients and subtle animations
- Professional typography and color scheme
- Eye-catching hero section
- Clean, intuitive navigation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works great)
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd bus-booking-saas
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up Supabase**

   a. Create a new project at [supabase.com](https://supabase.com)
   
   b. Go to the SQL Editor and run the contents of `supabase/schema.sql`
   
   c. (Optional) Run `supabase/seed.sql` to add sample data
   
   d. Enable Email auth provider in Authentication → Providers

5. **Start development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
bus-booking-saas/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth group route (login, signup)
│   │   ├── (dashboard)/       # Dashboard group route
│   │   │   ├── admin/         # Admin dashboard
│   │   │   └── user/          # User dashboard
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── actions/               # Server actions
│   │   ├── admin.ts           # Admin CRUD operations
│   │   ├── auth.ts            # Authentication actions
│   │   └── bookings.ts        # Booking operations
│   ├── components/            # React components
│   ├── lib/                   # Utilities & configurations
│   │   ├── supabase/          # Supabase client setup
│   │   └── utils.ts           # Helper functions
│   └── middleware.ts          # Auth middleware
├── supabase/
│   ├── schema.sql             # Database schema with RLS
│   └── seed.sql               # Sample data
├── public/                    # Static assets
├── tailwind.config.ts         # Tailwind configuration
├── next.config.js             # Next.js configuration
└── package.json
```

## 🗄️ Database Schema

### Tables
- **profiles**: User profiles with roles (user/admin)
- **buses**: Bus information with amenities
- **routes**: Route definitions with pricing
- **schedules**: Trip schedules with seat availability
- **bookings**: Customer bookings
- **seat_availability**: Real-time seat status

### Key Features
- UUID primary keys
- Automatic timestamps
- Row Level Security (RLS) policies
- Database functions for seat locking & booking confirmation
- Trigger for auto-creating profiles on signup

## 🔐 Security

- **Authentication**: Supabase Auth with secure session management
- **Authorization**: Role-based access (user/admin)
- **Data Protection**: RLS policies prevent unauthorized access
- **Input Validation**: Zod validation on all server actions
- **Environment Variables**: All secrets stored securely

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, CSS Variables
- **Icons**: Lucide React
- **Validation**: Zod
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Deployment**: Vercel

## 📱 UI/UX Design Notes

### Design Philosophy
- Modern SaaS aesthetic without being childish
- Professional yet approachable
- Clean typography (Inter font)
- Primary color: Sky blue (#0ea5e9)
- Soft shadows and subtle gradients
- Consistent spacing and component library

### Key Design Elements
- Rounded corners (0.75rem radius)
- Glassmorphism effects on headers
- Smooth animations and transitions
- Accessible color contrast
- Mobile-first responsive breakpoints

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🚀 Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Set Environment Variables**
   In Vercel dashboard, add the following environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live! 🎉

## 🧪 Testing Demo Accounts

After setting up the database, you can test with:

| Role | Email | Password |
|------|-------|----------|
| User | user@demo.com | demo123456 |
| Admin | admin@demo.com | demo123456 |

Or use the "Demo" buttons on the login page to auto-create test accounts.

## 📄 API & Server Actions

All backend logic uses Next.js Server Actions for type-safe, server-side operations:

```typescript
// Example: Creating a booking
import { createBooking } from '@/actions/bookings';

await createBooking(formData);
```

## 🔧 Configuration

### Tailwind Colors
Custom color palette configured in `tailwind.config.ts`:
- Primary: Sky blue tones
- Secondary: Slate gray tones
- Accent: Purple tones for special highlights

### Supabase Settings
Enable the following in your Supabase project:
- Email auth provider
- Row Level Security
- Database webhooks (optional for real-time features)

## 📝 Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this for your own projects!

---

Built with ❤️ using Next.js, Supabase, and Tailwind CSS

