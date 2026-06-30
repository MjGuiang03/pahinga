'use client';

import { Menu, Mountain } from 'lucide-react';
import Link from 'next/link';

export default function DashboardMobileHeader({ onMenuClick }) {
  return (
    <div className="md:hidden flex items-center justify-between px-4 h-16 bg-white dark:bg-dark-card border-b border-green-100 dark:border-dark-border sticky top-0 z-40">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-green-600 dark:bg-green-500 flex items-center justify-center shadow-sm">
          <Mountain className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-black text-green-900 dark:text-white tracking-tight">Pahinga</span>
      </Link>
      
      <button 
        onClick={onMenuClick}
        className="p-2 -mr-2 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-dark-surface transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>
    </div>
  );
}
