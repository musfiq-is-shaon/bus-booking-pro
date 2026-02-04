'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Shield, 
  Clock, 
  Star, 
  ArrowRight,
  Bus,
  ChevronRight,
  CheckCircle2,
  Zap,
  Heart,
  Sun,
  Moon,
  User,
  LogOut,
  Menu
} from 'lucide-react';
import { formatCurrency, CITIES, BUS_TYPES } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/lib/theme-provider';

// Force dynamic rendering to avoid build-time Supabase errors
export const dynamic = 'force-dynamic';

export default function HomePage() {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const supabase = createClient();
  const { theme, toggleTheme } = useTheme();

  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: today, // Default to today
  });

  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to search results page with params
    const params = new URLSearchParams({
      from: searchData.from,
      to: searchData.to,
      date: searchData.date,
    });
    window.location.href = `/search?${params.toString()}`;
  };

  const stats = [
    { label: 'Happy Travelers', value: '150K+', icon: Users },
    { label: 'Cities Covered', value: '20+', icon: MapPin },
    { label: 'Bus Partners', value: '25+', icon: Bus },
    { label: 'Routes', value: '78+', icon: Bus },
  ];

  const features = [
    {
      icon: Search,
      title: 'Easy Search',
      description: 'Find buses across hundreds of routes with our smart search engine.',
    },
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Safe and secure payments with instant confirmation.',
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Track your booking and get live seat availability updates.',
    },
    {
      icon: Heart,
      title: 'Customer Support',
      description: '24/7 support for all your travel queries and concerns.',
    },
  ];

  const popularRoutes = [
    { from: 'Dhaka', to: 'Coxs Bazar', price: 1200, duration: '8h', trips: 25 },
    { from: 'Dhaka', to: 'Sylhet', price: 900, duration: '5h', trips: 30 },
    { from: 'Dhaka', to: 'Chittagong', price: 800, duration: '6h', trips: 35 },
    { from: 'Chittagong', to: 'Coxs Bazar', price: 400, duration: '3h', trips: 20 },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-xl group-hover:shadow-primary-500/30 transition-all">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-secondary-900">BusBooking<span className="text-primary-600">Pro</span></span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/search" className="text-secondary-600 hover:text-primary-600 transition-colors font-medium">
                Search Buses
              </Link>
              {user && (
                <Link href="/dashboard/user" className="text-secondary-600 hover:text-primary-600 transition-colors font-medium">
                  My Bookings
                </Link>
              )}
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {loadingUser ? (
                <div className="w-8 h-8 rounded-full bg-secondary-200 animate-pulse" />
              ) : user ? (
                <div className="flex items-center gap-3">
                  <Link href="/dashboard/user" className="flex items-center gap-2 text-secondary-700 hover:text-primary-600">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user.email?.split('@')[0]}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-secondary-600 hover:text-red-600 transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-secondary-700 hover:text-secondary-900 transition-colors">
                    Log in
                  </Link>
                  <Link href="/signup" className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-secondary-900 hover:bg-secondary-800 rounded-xl transition-all shadow-lg shadow-secondary-900/25 hover:shadow-xl hover:shadow-secondary-900/30 hover:-translate-y-0.5">
                    Sign up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg text-secondary-600 hover:bg-secondary-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-secondary-100">
              <div className="flex flex-col gap-4">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 p-2 rounded-lg text-secondary-600 hover:bg-secondary-100"
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>

                <Link href="/search" className="text-secondary-600 hover:text-primary-600 font-medium">
                  Search Buses
                </Link>

                {loadingUser ? (
                  <div className="h-8 w-24 bg-secondary-200 rounded animate-pulse" />
                ) : user ? (
                  <>
                    <Link href="/dashboard/user" className="text-secondary-600 hover:text-primary-600 font-medium">
                      My Bookings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-secondary-600 hover:text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login" className="text-secondary-600 hover:text-secondary-900 font-medium">
                      Log in
                    </Link>
                    <Link href="/signup" className="btn-primary btn-sm w-full">
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-200 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6 animate-fade-in">
                <Zap className="w-4 h-4" />
                <span>Bangladesh&apos;s Trusted Bus Booking Platform</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 leading-tight mb-6 animate-slide-up">
                Travel Smart,
                <br />
                <span className="gradient-text">Travel Comfortably</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-secondary-600 mb-8 max-w-xl mx-auto lg:mx-0 animate-slide-up stagger-1">
                Book bus tickets effortlessly. Choose from thousands of routes, select your preferred seats, and enjoy a seamless travel experience.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 animate-slide-up stagger-2">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                    <stat.icon className="w-5 h-5 text-primary-600 mb-2" />
                    <div className="text-2xl font-bold text-secondary-900">{stat.value}</div>
                    <div className="text-sm text-secondary-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Card */}
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl blur-2xl opacity-20" />
              <div className="relative bg-white rounded-3xl shadow-soft-lg border border-secondary-100 p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-secondary-900 mb-6">Search Buses</h2>
                
                <form onSubmit={handleSearch} className="space-y-4">
                  {/* From */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">From</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <select
                        value={searchData.from}
                        onChange={(e) => setSearchData({ ...searchData, from: e.target.value })}
                        className="input pl-12 appearance-none cursor-pointer"
                        required
                      >
                        <option value="">Select departure city</option>
                        {CITIES.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400 rotate-90" />
                    </div>
                  </div>

                  {/* To */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">To</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <select
                        value={searchData.to}
                        onChange={(e) => setSearchData({ ...searchData, to: e.target.value })}
                        className="input pl-12 appearance-none cursor-pointer"
                        required
                      >
                        <option value="">Select destination city</option>
                        {CITIES.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400 -rotate-90" />
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type="date"
                        value={searchData.date}
                        onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                        className="input pl-12"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-primary btn-lg mt-4"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search Buses
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-secondary-100">
                  <p className="text-sm text-secondary-500 text-center">
                    <span className="text-secondary-700 font-medium">Popular:</span>{' '}
                    {popularRoutes.slice(0, 3).map((route, index) => (
                      <span key={index}>
                        {route.from} → {route.to}
                        {index < 2 && ', '}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Why Choose BusBooking Pro?</h2>
            <p className="section-subtitle mx-auto">
              We provide the best bus booking experience with features designed for your comfort and convenience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-secondary-50 rounded-2xl border border-secondary-100 hover:border-primary-200 hover:bg-white transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">{feature.title}</h3>
                <p className="text-secondary-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="section-title mb-2">Popular Routes</h2>
              <p className="text-secondary-600">Most booked routes this month</p>
            </div>
            <Link
              href="/search"
              className="hidden sm:inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              View all routes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularRoutes.map((route, index) => (
              <Link
                key={index}
                href={`/search?from=${route.from}&to=${route.to}&date=${today}`}
                className="card-hover p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 text-secondary-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{route.from}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-secondary-400" />
                  <div className="flex items-center gap-1 text-secondary-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{route.to}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-secondary-900">{formatCurrency(route.price)}</p>
                    <p className="text-sm text-secondary-500">{route.duration} • {route.trips}+ trips</p>
                  </div>
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                    <ArrowRight className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              View all routes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bus Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Choose Your Travel Style</h2>
            <p className="section-subtitle mx-auto">
              From budget-friendly options to luxury travel, we have it all.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BUS_TYPES.map((type, index) => (
              <div
                key={type.value}
                className="group p-6 bg-gradient-to-br from-secondary-50 to-white rounded-2xl border border-secondary-100 hover:border-primary-200 hover:shadow-soft transition-all duration-300 cursor-pointer"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center mb-4 group-hover:from-primary-500 group-hover:to-primary-600 transition-all">
                  <Bus className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">{type.label}</h3>
                <p className="text-sm text-secondary-600">{type.description}</p>
                <div className="mt-4 flex items-center gap-2 text-primary-600 font-medium text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Available
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-secondary-900 to-secondary-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-secondary-300 mb-8 max-w-2xl mx-auto">
            Join millions of travelers who trust BusBooking Pro for their bus travel needs. Sign up today and get exclusive offers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="btn-primary btn-lg"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/search"
              className="btn-secondary btn-lg bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Browse Routes
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <Bus className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">BusBooking<span className="text-primary-400">Pro</span></span>
              </Link>
              <p className="text-secondary-400 text-sm">
                Bangladesh&apos;s trusted platform for bus ticket booking. Travel comfortably with ease.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/search" className="text-secondary-400 hover:text-white transition-colors text-sm">Search Buses</Link></li>
                <li><Link href="#" className="text-secondary-400 hover:text-white transition-colors text-sm">Cancel Booking</Link></li>
                <li><Link href="#" className="text-secondary-400 hover:text-white transition-colors text-sm">Print Ticket</Link></li>
                <li><Link href="#" className="text-secondary-400 hover:text-white transition-colors text-sm">My Account</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-secondary-400 hover:text-white transition-colors text-sm">Help Center</Link></li>
                <li><Link href="#" className="text-secondary-400 hover:text-white transition-colors text-sm">Contact Us</Link></li>
                <li><Link href="#" className="text-secondary-400 hover:text-white transition-colors text-sm">FAQs</Link></li>
                <li><Link href="#" className="text-secondary-400 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-secondary-400 text-sm">
                <li>support@busbookingpro.com.bd</li>
                <li>+880 1XXX-XXXXXX</li>
                <li>24/7 Customer Support</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-secondary-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-secondary-500 text-sm">
              © 2025 BusBooking Pro. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-secondary-400 hover:text-white transition-colors text-sm">Privacy Policy</Link>
              <Link href="#" className="text-secondary-400 hover:text-white transition-colors text-sm">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

