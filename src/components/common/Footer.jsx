import React from 'react';
import Link from 'next/link';
import { Mountain } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-green-50 dark:bg-dark-surface border-t border-green-100 dark:border-dark-border py-10 mt-auto">
      <div className="container-main">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 text-green-800 dark:text-green-200 font-extrabold text-lg no-underline">
              <Mountain className="w-6 h-6 text-green-600 dark:text-green-400" />
              <span>Pahinga</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Ang lunas sa araw-araw. Curated outdoor adventure bookings across the Philippine islands.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-green-800 dark:text-green-200 uppercase tracking-wider mb-4">Adventures</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/browse" className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Explore Trails</Link></li>
              <li><Link href="/browse?category=camping" className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Camping Sites</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-green-800 dark:text-green-200 uppercase tracking-wider mb-4">For Partners</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register/agency" className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Register Agency</Link></li>
              <li><Link href="/login" className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Partner Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-green-800 dark:text-green-200 uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Help Center</Link></li>
              <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Safety Guidelines</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-100 dark:border-dark-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Pahinga. All rights reserved.</p>
          <div className="flex gap-4 text-xs">
            <Link href="#" className="text-gray-400 hover:text-green-600">Privacy Policy</Link>
            <Link href="#" className="text-gray-400 hover:text-green-600">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
