'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/frontend/hooks/useAuth';
import {
  Car, LayoutDashboard, History,
  LogOut, User, Mountain, X,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { label: 'Dashboard',    href: '/driver/dashboard', icon: LayoutDashboard },
  { label: 'Trip History', href: '/driver/history',   icon: History },
  { label: 'My Vehicle',   href: '/driver/vehicle',   icon: Car },
  { label: 'Profile',      href: '/driver/profile',   icon: User },
];

export default function DriverSidebar({ mobileOpen, onMobileClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"
          onClick={onMobileClose}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-dark-card border-r border-green-100 dark:border-dark-border flex flex-col z-50 transition-transform duration-300 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Brand */}
        <div className="h-16 px-5 flex items-center justify-between gap-3 border-b border-green-100 dark:border-dark-border">
          <div className="flex items-center gap-3 min-w-0">
            <Car className="w-7 h-7 text-green-600 dark:text-green-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-green-900 dark:text-green-100 truncate">{user?.name || 'Driver'}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Driver Portal</p>
            </div>
          </div>
          <button onClick={onMobileClose} className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-green-600 border-none bg-transparent cursor-pointer shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={onMobileClose}
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

        {/* Switch to Hiker Profile */}
        <div className="px-3 mb-2">
          <Link href="/hiker/dashboard" onClick={onMobileClose} className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-dark-surface border border-green-100 dark:border-dark-border group no-underline transition-colors hover:border-green-300 dark:hover:border-green-700">
            <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center justify-center text-xs font-bold shrink-0 select-none group-hover:bg-green-200 dark:group-hover:bg-green-800/60 transition-colors">
              <Mountain className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-green-950 dark:text-green-100 truncate group-hover:underline">Switch to Hiker</p>
              <p className="text-[10px] text-gray-500 truncate">Book adventures</p>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-green-100 dark:border-dark-border space-y-1">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border-none bg-transparent cursor-pointer text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
