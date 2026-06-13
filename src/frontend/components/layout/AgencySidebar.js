'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/frontend/hooks/useAuth';
import {
  Building2, LayoutDashboard, Mountain, CalendarDays, Star,
  LogOut, Sun, Moon, Users, Car, Wallet, ChevronRight,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { label: 'Dashboard',       href: '/agency/dashboard', icon: LayoutDashboard },
  { label: 'Listings',        href: '/agency/listings',  icon: Mountain },
  { label: 'Bookings',        href: '/agency/bookings',  icon: CalendarDays },
  { label: 'Drivers',         href: '/agency/drivers',   icon: Users },
  { label: 'Vehicles',        href: '/agency/vehicles',  icon: Car },
  { label: 'Reviews',         href: '/agency/reviews',   icon: Star },
  { label: 'Refund Requests', href: '/agency/refunds',   icon: Wallet },
];

export default function AgencySidebar({ collapsed, onToggle }) {
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

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AG';

  return (
    <aside
      className="fixed inset-y-0 left-0 bg-white dark:bg-dark-card border-r border-green-100 dark:border-dark-border flex flex-col z-30 transition-all duration-300 overflow-hidden"
      style={{ width: collapsed ? '64px' : '256px' }}
    >
      {/* Brand + toggle */}
      <div className="h-16 px-3 flex items-center border-b border-green-100 dark:border-dark-border shrink-0">
        {!collapsed && (
          <Link href="/agency/dashboard" className="flex items-center gap-3 flex-1 min-w-0 no-underline hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-green-600 dark:bg-green-500 flex items-center justify-center shadow-sm shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-green-900 dark:text-white tracking-tight truncate">
                {user?.name || 'Agency'}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">Agency Portal</p>
            </div>
          </Link>
        )}

        {collapsed && (
          <div className="w-8 h-8 rounded-xl bg-green-600 dark:bg-green-500 flex items-center justify-center shadow-sm mx-auto">
            <Building2 className="w-4 h-4 text-white" />
          </div>
        )}

        {!collapsed && (
          <button onClick={onToggle} title="Collapse sidebar"
            className="shrink-0 ml-2 p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-dark-surface transition-all border-none bg-transparent cursor-pointer">
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button onClick={onToggle} title="Expand sidebar"
          className="mx-auto mt-2 p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-dark-surface transition-all border-none bg-transparent cursor-pointer">
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-600 select-none">
            Navigation
          </p>
        )}
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group no-underline ${
                collapsed ? 'justify-center' : ''
              } ${
                active
                  ? 'bg-green-600 text-white font-bold shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-dark-surface hover:text-green-700 dark:hover:text-green-300'
              }`}
            >
              <Icon className={`shrink-0 ${collapsed ? 'w-5 h-5' : 'w-[18px] h-[18px]'} ${active ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400'}`} />
              {!collapsed && (
                <>
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      {!collapsed && user && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-green-50 dark:bg-dark-surface border border-green-100 dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center text-xs font-bold shrink-0 select-none">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-green-950 dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {collapsed && user && (
        <div className="flex justify-center mb-3">
          <div className="w-8 h-8 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center text-xs font-bold select-none" title={user.name}>
            {userInitials}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={`py-3 border-t border-green-100 dark:border-dark-border space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
        <button onClick={toggleTheme} title={isDark ? 'Light Mode' : 'Dark Mode'}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-dark-surface hover:text-green-700 dark:hover:text-green-300 transition-colors border-none bg-transparent cursor-pointer ${collapsed ? 'justify-center' : 'text-left'}`}>
          {isDark ? <Sun className="w-[18px] h-[18px] shrink-0" /> : <Moon className="w-[18px] h-[18px] shrink-0" />}
          {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button onClick={logout} title="Log Out"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer ${collapsed ? 'justify-center' : 'text-left'}`}>
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
