'use client';

import Link from 'next/link';
import { useAuth } from '@/frontend/hooks/useAuth';
import { Mountain, Sun, Moon, Bell, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const newTheme = html.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    setIsDark(newTheme === 'dark');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'agency') return '/agency/dashboard';
    return '/hiker/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Mountain className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Pahinga</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Home</Link>
            <Link href="/explore" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Explore</Link>
            <Link href="/about" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">About</Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-dark-tertiary transition-colors" title="Toggle theme">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                <Link href={`${getDashboardPath().replace('/dashboard', '/notifications')}`} className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-dark-tertiary transition-colors">
                  <Bell className="w-5 h-5" />
                </Link>

                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-dark-tertiary transition-colors">
                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-brand-700 dark:text-brand-400">{user.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">{user.name?.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-dark-alt rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                      </div>
                      <Link href={getDashboardPath()} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-dark-tertiary" onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                      <button onClick={() => { setDropdownOpen(false); logout(); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-surface-dark-tertiary border-t border-gray-100 dark:border-gray-700">Log Out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-surface-dark-tertiary transition-colors">Log In</Link>
                <Link href="/register" className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors">Sign Up</Link>
              </>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-dark-tertiary">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark">
          <div className="px-4 py-3 space-y-1">
            <Link href="/" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-dark-tertiary" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/explore" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-dark-tertiary" onClick={() => setMobileOpen(false)}>Explore</Link>
            <Link href="/about" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-dark-tertiary" onClick={() => setMobileOpen(false)}>About</Link>
            {!user && (
              <Link href="/login" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-dark-tertiary sm:hidden" onClick={() => setMobileOpen(false)}>Log In</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
