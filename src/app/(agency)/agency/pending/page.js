'use client';

import { Clock } from 'lucide-react';
import { useAuth } from '@/frontend/hooks/useAuth';

export default function AgencyPendingPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white dark:bg-surface-dark">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Application Under Review</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2">Your agency registration is being reviewed by our team. This usually takes 1-2 business days.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">You will be notified once your application is approved.</p>
        <button onClick={logout} className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-surface-dark-tertiary transition-colors">
          Log Out
        </button>
      </div>
    </div>
  );
}
