'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, User, Eye, EyeOff, Bus, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

// Rate limit error messages from Supabase
const RATE_LIMIT_ERRORS = [
  'email rate exceeded',
  'too many requests',
  'rate limit',
  'frequency limit',
  'security',
  'email provider',
];

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRateLimitOptions, setShowRateLimitOptions] = useState(false);

  const isRateLimitError = (message: string) => {
    return RATE_LIMIT_ERRORS.some(err => message.toLowerCase().includes(err));
  };

  const getUserFriendlyError = (message: string) => {
    if (isRateLimitError(message)) {
      return 'Too many signup attempts from this email. Please try again after a few minutes.';
    }
    if (message.includes('User already registered') || message.includes('already registered')) {
      return 'An account with this email already exists. Please login instead.';
    }
    if (message.includes('invalid email') || message.includes('email format')) {
      return 'Please enter a valid email address.';
    }
    if (message.includes('password') && message.includes('length')) {
      return 'Password must be at least 8 characters long.';
    }
    return message;
  };

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(formData.password), text: 'One lowercase letter' },
    { met: /[0-9]/.test(formData.password), text: 'One number' },
  ];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowRateLimitOptions(false);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (error) {
        const errorMsg = error.message;
        setError(getUserFriendlyError(errorMsg));
        if (isRateLimitError(errorMsg)) {
          setShowRateLimitOptions(true);
        }
        return;
      }

      // Sign up successful - auto sign in and redirect
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        // If auto sign-in fails, still redirect to login
        router.push('/login');
      } else {
        // Redirect to dashboard
        router.push('/dashboard/user');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAndRetry = () => {
    setShowRateLimitOptions(false);
    setError(null);
    setFormData({
      ...formData,
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-secondary-900">BusBooking<span className="text-primary-600">Pro</span></span>
          </Link>

          <h2 className="text-3xl font-bold text-secondary-900 mb-2">Create an account</h2>
          <p className="text-secondary-600 mb-8">Start your journey with BusBooking Pro today</p>

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
                  <p className="text-sm text-amber-800 mb-3"><strong>Options:</strong></p>
                  <div className="space-y-2">
                    <button type="button" onClick={handleClearAndRetry} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-amber-200 rounded-lg text-amber-800 hover:bg-amber-50 transition-colors text-sm">
                      <RefreshCw className="w-4 h-4" />Use different email
                    </button>
                    <button type="button" onClick={handleGoToLogin} className="w-full btn-secondary btn-sm">Go to Login</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-secondary-700 mb-2">Full name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input id="fullName" type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="input pl-12" placeholder="Enter your full name" required />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input pl-12" placeholder="Enter your email" required />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input id="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input pl-12 pr-12" placeholder="Create a password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className={`w-4 h-4 ${req.met ? 'text-emerald-500' : 'text-secondary-300'}`} />
                    <span className={req.met ? 'text-emerald-700' : 'text-secondary-500'}>{req.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-2">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input id="confirmPassword" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className={`input pl-12 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-300' : ''}`} placeholder="Confirm your password" required />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && <p className="mt-2 text-sm text-red-600">Passwords do not match</p>}
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary btn-lg">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner" />Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Create account<ArrowRight className="w-5 h-5 ml-2" />
                </span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-secondary-600">Already have an account? <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link></p>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-600 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="absolute inset-0 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <h3 className="text-3xl font-bold mb-4">Join Thousands of Travelers</h3>
            <p className="text-primary-100 text-lg mb-8">Experience the easiest way to book bus tickets across Bangladesh.</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-primary-200 text-sm">Happy Travelers</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl font-bold">100+</div>
                <div className="text-primary-200 text-sm">Cities</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-primary-200 text-sm">Bus Partners</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

