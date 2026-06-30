'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/frontend/hooks/useAuth';
import {
  Mountain, LayoutDashboard, CalendarDays,
  Sparkles, LogOut, ChevronRight,
  PanelLeftClose, PanelLeftOpen, Building2, Settings, Car, X,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { label: 'Dashboard',        href: '/hiker/dashboard',   icon: LayoutDashboard },
  { label: 'My Bookings',      href: '/hiker/bookings',    icon: CalendarDays },
  { label: 'Trip Recommender', href: '/hiker/recommender', icon: Sparkles },
  { label: 'Settings',         href: '/hiker/settings',    icon: Settings },
];

export default function HikerSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onMobileClose}
        />
      )}
      
      <aside
        className={`fixed inset-y-0 left-0 bg-white dark:bg-dark-card border-r border-green-100 dark:border-dark-border flex flex-col z-50 transition-all duration-300 overflow-hidden transform ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ width: collapsed ? '64px' : '256px' }}
      >
      {/* Brand + collapse toggle */}
      <div className="h-16 px-3 flex items-center border-b border-green-100 dark:border-dark-border shrink-0">
        {!collapsed && (
          <Link
            href="/"
            className="flex items-center gap-3 flex-1 min-w-0 no-underline hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-green-600 dark:bg-green-500 flex items-center justify-center shadow-sm flex-shrink-0">
              <Mountain className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-green-900 dark:text-white tracking-tight">Pahinga</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">Ang lunas sa araw-araw.</p>
            </div>
          </Link>
        )}

        {collapsed && (
          <div className="w-8 h-8 rounded-xl bg-green-600 dark:bg-green-500 flex items-center justify-center shadow-sm mx-auto">
            <Mountain className="w-4 h-4 text-white" />
          </div>
        )}

        <div className="flex md:hidden">
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-dark-surface transition-all border-none bg-transparent cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`hidden md:block shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-dark-surface transition-all border-none bg-transparent cursor-pointer ${collapsed ? 'mx-auto mt-2' : 'ml-2'}`}
          style={collapsed ? { display: 'none' } : {}}
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Collapse toggle when collapsed — shown below brand icon */}
      {collapsed && (
        <button
          onClick={onToggle}
          title="Expand sidebar"
          className="mx-auto mt-2 p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-dark-surface transition-all border-none bg-transparent cursor-pointer"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col overflow-y-auto overflow-x-hidden">
        <div className="space-y-0.5">
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-600 select-none">
            Navigation
          </p>
        )}
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
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
        </div>

        {/* Spacer to push cards to the bottom if there is room */}
        <div className="flex-1 min-h-[24px]"></div>

        <div className="space-y-3 pb-2 mt-4">
        {/* Agency profile card — hidden when collapsed */}
        {!collapsed && user?.agency && (
          <div className="mx-1 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-2">My Agency</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 select-none">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-amber-950 dark:text-amber-100 truncate">{user.agency.orgName}</p>
                <p className="text-[10px] text-amber-700/70 dark:text-amber-400/70 truncate capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Driver profile card — hidden when collapsed */}
        {!collapsed && user?.role === 'driver' && (
          <div className="mx-1 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-500 mb-2">Driver Portal</p>
            <Link href="/driver/assignments" onClick={onMobileClose} className="flex items-center gap-3 no-underline group">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 select-none group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60 transition-colors">
                <Car className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-blue-950 dark:text-blue-100 truncate group-hover:underline">Switch to Driver</p>
                <p className="text-[10px] text-blue-700/70 dark:text-blue-400/70 truncate">Manage trips</p>
              </div>
            </Link>
          </div>
        )}
        </div>
      </nav>

      {/* User profile card — hidden when collapsed */}
      <div className="shrink-0 mt-auto">
        {!collapsed && user && (
          <div className="mx-3 mb-3 p-3 rounded-xl bg-green-50 dark:bg-dark-surface border border-green-100 dark:border-dark-border">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-green-200 dark:border-green-700 shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center text-xs font-bold shrink-0 select-none">
                  {userInitials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-green-950 dark:text-white truncate">{user.name}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

      {/* Agency Avatar only when collapsed */}
      {collapsed && user?.agency && (
        <div className="flex justify-center mb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-bold select-none" title={`Agency: ${user.agency.orgName}`}>
            <Building2 className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Driver Avatar only when collapsed */}
      {collapsed && user?.role === 'driver' && (
        <div className="flex justify-center mb-3">
          <Link href="/driver/assignments" className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-bold select-none hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors" title="Switch to Driver Portal">
            <Car className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Avatar only when collapsed */}
      {collapsed && user && (
        <div className="flex justify-center mb-3">
          <div className="w-8 h-8 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center text-xs font-bold select-none" title={user.name}>
            {userInitials}
          </div>
        </div>
      )}

      {/* Footer controls */}
      <div className={`py-3 border-t border-green-100 dark:border-dark-border space-y-0.5 shrink-0 ${collapsed ? 'px-2' : 'px-3'}`}>
        <button
          onClick={logout}
          title="Log Out"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer ${collapsed ? 'justify-center' : 'text-left'}`}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
      </div>
    </aside>
    </>
  );
}
