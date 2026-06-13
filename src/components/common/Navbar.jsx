'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mountain, Sun, Moon, Menu, X, LogOut, User as UserIcon, Settings, Calendar, Award } from 'lucide-react';
import { useAuth } from '@/frontend/hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    setIsDark(newTheme === 'dark');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Nav links based on role
  const getNavLinks = () => {
    if (!user) {
      return [
        { label: 'Home', href: '/' },
        { label: 'Explore', href: '/browse' },
      ];
    }

    switch (user.role) {
      case 'admin':
        return [
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Agencies', href: '/admin/agencies' },
          { label: 'Users', href: '/admin/users' },
          { label: 'Refunds', href: '/admin/refunds' },
          { label: 'Reviews', href: '/admin/reviews' },
        ];
      case 'agency':
        return [
          { label: 'Dashboard', href: '/agency/dashboard' },
          { label: 'Listings', href: '/agency/listings' },
          { label: 'Bookings', href: '/agency/bookings' },
          { label: 'Drivers', href: '/agency/drivers' },
          { label: 'Vehicles', href: '/agency/vehicles' },
          { label: 'Reviews', href: '/agency/reviews' },
        ];
      case 'driver':
        return [
          { label: 'Assignments', href: '/driver/assignments' },
          { label: 'Profile', href: '/driver/profile' },
        ];
      case 'hiker':
      default:
        return [
          { label: 'Home', href: '/' },
          { label: 'Explore', href: '/browse' },
          { label: 'Dashboard', href: '/hiker/dashboard' },
          { label: 'My Bookings', href: '/hiker/bookings' },
          { label: 'Recommender', href: '/hiker/recommender' },
        ];
    }
  };

  const links = getNavLinks();
  const userInitials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '';

  return (
    <header className="navbar select-none relative">
      {/* Brand logo */}
      <Link href="/" className="navbar-logo flex items-center gap-2">
        <Mountain className="w-6 h-6 text-green-600 dark:text-green-400" />
        <span>Pahinga</span>
      </Link>

      {/* Desktop navigation */}
      <nav className="hidden lg:flex items-center gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-semibold text-green-900 dark:text-green-100 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right control panel */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-green-50 dark:hover:bg-dark-surface transition-colors text-green-600 dark:text-green-400"
          title="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {user ? (
          /* Logged in user dropdown */
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 focus:outline-none"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-green-200 dark:border-green-600 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-green-600 text-green-50 dark:bg-green-400 dark:text-dark-bg flex items-center justify-center text-xs font-bold border border-green-200 dark:border-green-600">
                  {userInitials}
                </div>
              )}
            </button>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl shadow-modal z-20 py-2">
                  <div className="px-4 py-2 border-b border-green-50 dark:border-dark-border">
                    <p className="text-xs text-gray-400 dark:text-gray-500">Signed in as</p>
                    <p className="text-sm font-bold text-green-900 dark:text-green-100 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 badge badge-green text-[10px] uppercase font-bold tracking-wider">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    href={user.role === 'driver' ? '/driver/profile' : user.role === 'agency' ? '/agency/dashboard' : '/hiker/dashboard'}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-green-800 dark:text-green-200 hover:bg-green-50 dark:hover:bg-dark-surface transition-colors no-underline"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <UserIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span>My Dashboard</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border-none bg-transparent cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Guest login/signup */
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/login" className="btn btn-sm btn-secondary">Log In</Link>
            <Link href="/register" className="btn btn-sm btn-primary">Sign Up</Link>
          </div>
        )}

        {/* Hamburger menu for mobile */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 rounded-md hover:bg-green-50 dark:hover:bg-dark-surface transition-colors text-green-600 dark:text-green-400"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-[60px] left-0 right-0 bg-white dark:bg-dark-bg border-b border-green-100 dark:border-dark-border z-40 p-4 space-y-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded-md text-base font-medium text-green-900 dark:text-green-100 hover:bg-green-50 dark:hover:bg-dark-surface no-underline"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-green-100 dark:border-dark-border">
              <Link href="/login" className="btn btn-secondary w-full text-center" onClick={() => setIsMenuOpen(false)}>Log In</Link>
              <Link href="/register" className="btn btn-primary w-full text-center" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
