import Link from 'next/link';
import { Mountain } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-surface-dark-alt border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Mountain className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">Pahinga</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Discover curated hiking adventures across the Philippines with trusted agencies.</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Explore</h4>
            <ul className="space-y-2.5">
              <li><Link href="/explore" className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Browse Adventures</Link></li>
              <li><Link href="/about" className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">For Agencies</h4>
            <ul className="space-y-2.5">
              <li><Link href="/register/agency" className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Register Your Agency</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li><Link href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Help Center</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center">&copy; {new Date().getFullYear()} Pahinga. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
