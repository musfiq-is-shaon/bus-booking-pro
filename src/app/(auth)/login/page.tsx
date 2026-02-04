'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, Eye, EyeOff, Bus, ArrowRight, AlertCircle } from 'lucide-react';

// Rate limit error messages from Supabase
const RATE_LIMIT_ERRORS = [
  'email rate exceeded',
  'too many requests',
  'rate limit',
  'frequency limit',
  'security',
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRateLimitOptions, setShowRateLimitOptions] = useState(false);

  const isRateLimitError = (message: string) => {
    return RATE_LIMIT_ERRORS.some(err => message.toLowerCase().includes(err));
  };

  const getUserFriendlyError = (message: string) => {
    if (isRateLimitError(message)) {
      return 'Too many login attempts. Please wait a few minutes before trying again.';
    }
    if (message.includes('Invalid credentials') || message.includes('invalid credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (message.includes('user not found') || message.includes('no user')) {
      return 'No account found with this email. Please sign up first.';
    }
    return message;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowRateLimitOptions(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const errorMsg = error.message;
        setError(getUserFriendlyError(errorMsg));
        if (isRateLimitError(errorMsg)) {
          setShowRateLimitOptions(true);
        }
        return;
      }

      router.push('/dashboard/user');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-secondary-900">Transitly</span>
          </Link>

          <h2 className="text-3xl font-bold text-secondary-900 mb-2">Welcome back</h2>
          <p className="text-secondary-600 mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="mb-6">
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
              {showRateLimitOptions && (
                <div className="mt-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-sm text-amber-800">
                    Too many login attempts. Please wait a few minutes before trying again.
                  </p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-12"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-12 pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary btn-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner" />
                  Signing in...
                </span>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-secondary-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-600 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="absolute inset-0 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <h3 className="text-3xl font-bold mb-4">Your Journey Starts Here</h3>
            <p className="text-primary-100 text-lg mb-8">
              Access your bookings, manage your trips, and travel with confidence. Join thousands of happy travelers.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
                <span>Instant booking confirmation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
                <span>Real-time seat selection</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
                <span>Secure payment processing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

