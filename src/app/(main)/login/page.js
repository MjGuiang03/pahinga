'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const ROLE_DASHBOARDS = {
  hiker: '/hiker/dashboard',
  agency: '/agency/dashboard',
  driver: '/hiker/dashboard',
  coordinator: '/hiker/dashboard',
  admin: '/admin/dashboard',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, isLoading: authLoading, login } = useAuth();
  const router = useRouter();

  // Already logged in — redirect to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(ROLE_DASHBOARDS[user.role] || '/hiker/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success('Welcome back!');
      router.push(ROLE_DASHBOARDS[data.user.role] || '/hiker/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Log in to your Pahinga account</p>
        </div>

        <div className="bg-white dark:bg-surface-dark-alt rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors" placeholder="you@example.com" required />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors" placeholder="Enter your password" required />
            </div>

            <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-sm bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-brand-600 dark:text-brand-400 hover:underline">Sign up</Link>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you an agency?{' '}
              <Link href="/register/agency" className="font-medium text-brand-600 dark:text-brand-400 hover:underline">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
