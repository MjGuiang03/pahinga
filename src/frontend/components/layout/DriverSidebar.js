'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/frontend/hooks/useAuth';
import {
  Car, LayoutDashboard, History,
  LogOut, Sun, Moon, User,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { label: 'Dashboard',    href: '/driver/dashboard', icon: LayoutDashboard },
  { label: 'Trip History', href: '/driver/history',   icon: History },
  { label: 'My Vehicle',   href: '/driver/vehicle',   icon: Car },
  { label: 'Profile',      href: '/driver/profile',   icon: User },
];

export default function DriverSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    const next = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    setIsDark(next === 'dark');
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-dark-card border-r border-green-100 dark:border-dark-border flex flex-col z-30">
      {/* Brand */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-green-100 dark:border-dark-border">
        <Car className="w-7 h-7 text-green-600 dark:text-green-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-green-900 dark:text-green-100 truncate">{user?.name || 'Driver'}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">Driver Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-green-50 dark:bg-dark-surface text-green-700 dark:text-green-400 font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-green-50/50 dark:hover:bg-dark-surface/50'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-green-100 dark:border-dark-border space-y-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-green-50/50 dark:hover:bg-dark-surface/50 transition-colors border-none bg-transparent cursor-pointer text-left"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border-none bg-transparent cursor-pointer text-left"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
