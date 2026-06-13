'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

export default function RegisterAgencyPage() {
  const [form, setForm] = useState({
    orgName: '', contactPerson: '', email: '', phone: '', description: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { registerAgency } = useAuth();
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerAgency(form);
      toast.success('Application submitted!');
      router.push('/agency/pending');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Register your agency</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Start posting hiking adventures on Pahinga</p>
        </div>

        <div className="bg-white dark:bg-surface-dark-alt rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Organization / Agency Name</label>
              <input type="text" id="orgName" name="orgName" value={form.orgName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors" placeholder="Summit Trail Adventures" required />
            </div>

            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contact Person</label>
              <input type="text" id="contactPerson" name="contactPerson" value={form.contactPerson} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors" placeholder="Full name" required />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input type="email" id="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors" placeholder="agency@example.com" required />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors" placeholder="09xx xxx xxxx" />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Agency Description <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors resize-none" placeholder="Tell hikers about your agency..." />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <input type="password" id="password" name="password" value={form.password} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors" placeholder="Min. 8 characters" minLength={8} required />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors" placeholder="Re-enter your password" required />
            </div>

            <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-sm bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-brand-600 dark:text-brand-400 hover:underline">Log in</Link>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Not an agency?{' '}
              <Link href="/register" className="font-medium text-brand-600 dark:text-brand-400 hover:underline">Sign up as a hiker</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
