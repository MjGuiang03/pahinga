'use client';

import React, { useEffect, useState, useRef } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, Calendar, ChevronRight, ChevronLeft,
  Sparkles, Mountain, Clock, Tent, Navigation, Radio,
  PanelRightClose, PanelRightOpen, MapPin, Star,
} from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import AdventureCard from '@/components/adventure/AdventureCard';
import { formatShortDate, statusBadgeClass, formatPrice } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';

const fetcher = (url) => axios.get(url).then(res => res.data);

/** Horizontal scroll row with prev/next arrows */
function TrailRow({ title, adventures, emptyText }) {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-3">
      {/* Row header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-black text-green-950 dark:text-white tracking-tight">{title}</h2>
          <span className="text-[10px] text-gray-400 font-medium">({adventures.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll(-1)}
            className="w-7 h-7 rounded-full border border-green-100 dark:border-dark-border bg-white dark:bg-dark-surface flex items-center justify-center text-gray-400 hover:text-green-600 hover:border-green-400 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-7 h-7 rounded-full border border-green-100 dark:border-dark-border bg-white dark:bg-dark-surface flex items-center justify-center text-gray-400 hover:text-green-600 hover:border-green-400 transition-all cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable cards */}
      {adventures.length > 0 ? (
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {adventures.map((adv) => (
            <div key={adv._id} className="w-64 shrink-0">
              <AdventureCard adventure={adv} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-green-50 dark:border-dark-border text-xs text-gray-400">
          <Mountain className="w-4 h-4 text-gray-300 dark:text-gray-600" />
          {emptyText || 'No trips in this category yet.'}
        </div>
      )}
    </div>
  );
}

export default function HikerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [rightCollapsed, setRightCollapsed] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !['hiker', 'coordinator', 'driver'].includes(user.role))) {
      router.push('/login?redirect=/hiker/dashboard');
    }
  }, [user, authLoading, router]);

  const { data: bookingsData, isLoading: bookingsLoading } = useSWR(
    user ? '/api/bookings' : null, fetcher
  );
  const { data: adventuresData, isLoading: adventuresLoading } = useSWR(
    '/api/adventures', fetcher
  );

  if (authLoading || adventuresLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  const bookings = bookingsData?.bookings || [];
  const allAdventures = adventuresData?.adventures || [];
  const upcomingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');

  // ── Active hike detection ──
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeHike = bookings.find((b) => {
    if (b.status !== 'confirmed') return false;
    const adv = b.adventureId || {};
    if (!adv.startDate) return false;
    const start = new Date(adv.startDate);
    start.setHours(0, 0, 0, 0);
    const end = adv.endDate ? new Date(adv.endDate) : start;
    end.setHours(23, 59, 59, 999);
    return today >= start && today <= end;
  });

  // ── Categorize adventures ──
  const searchLower = search.toLowerCase();
  const base = allAdventures.filter((adv) =>
    !search ||
    adv.title?.toLowerCase().includes(searchLower) ||
    adv.location?.toLowerCase().includes(searchLower) ||
    adv.adventureType?.some(t => t.toLowerCase().includes(searchLower))
  );

  // Day hike: duration ≤ 1 day (handles timezone-shifted UTC dates safely)
  const MS_PER_DAY = 86400000;
  const dayHikes = base.filter((adv) => {
    if (!adv.startDate) return false;
    if (!adv.endDate) return true; // no end = assume single day
    const diff = new Date(adv.endDate) - new Date(adv.startDate);
    return diff <= MS_PER_DAY;
  });

  // Multi-day: duration > 1 day
  const multiDay = base.filter((adv) => {
    if (!adv.startDate || !adv.endDate) return false;
    const diff = new Date(adv.endDate) - new Date(adv.startDate);
    return diff > MS_PER_DAY;
  });

  // By adventure type (dynamic from data)
  const typeSet = new Set();
  allAdventures.forEach(adv => (adv.adventureType || []).forEach(t => typeSet.add(t)));
  const types = [...typeSet];

  // Rows config
  const staticRows = [
    { key: 'day',   title: 'Day Hikes',      list: dayHikes,  empty: 'No day hike tours available right now.' },
    { key: 'multi', title: 'Multi-Day Treks', list: multiDay,  empty: 'No multi-day packages listed yet.' },
  ];

  const typeRows = types.map((type) => ({
    key: type,
    title: type,
    list: base.filter(adv => (adv.adventureType || []).includes(type)),
    empty: `No ${type} trips listed yet.`,
  }));

  const rows = [...staticRows, ...typeRows];

  return (
    <div className="flex gap-0 min-h-screen bg-gray-50 dark:bg-dark-bg">

      {/* ── Main column ── */}
      <div className="flex-1 min-w-0 p-7 space-y-5">

        {/* Header + search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-green-950 dark:text-white">Discover Adventures</h1>
            <p className="text-xs text-gray-400 mt-0.5">{allAdventures.length} trips available across the Philippines</p>
          </div>
          <Link
            href="/hiker/recommender"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 transition-colors no-underline shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            Smart Match Finder
          </Link>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search trails, locations, activity type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-green-100 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-green-950 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 hover:text-red-400 border-none bg-transparent cursor-pointer"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Categorized rows */}
        <div className="space-y-5">
          {rows.map((row) => (
            <TrailRow
              key={row.key}
              title={row.title}
              icon={row.icon}
              adventures={row.list}
              emptyText={row.empty}
            />
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      {rightCollapsed ? (
        // Thin collapsed strip
        <aside className="w-10 shrink-0 sticky top-0 h-screen border-l border-green-100 dark:border-dark-border bg-white dark:bg-dark-card flex flex-col items-center py-4 gap-3 z-20">
          <button
            onClick={() => setRightCollapsed(false)}
            title="Expand panel"
            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-dark-surface transition-all border-none bg-transparent cursor-pointer"
          >
            <PanelRightOpen className="w-4 h-4" />
          </button>
          {upcomingBookings.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-green-600 text-white text-[9px] font-black flex items-center justify-center">
              {upcomingBookings.length}
            </span>
          )}
        </aside>
      ) : (
        <aside className="w-72 shrink-0 sticky top-0 h-screen border-l border-green-100 dark:border-dark-border bg-white dark:bg-dark-card flex flex-col overflow-y-auto z-20 shadow-sm">

        {/* Greeting */}
        <div className="p-5 border-b border-green-50 dark:border-dark-border bg-green-600 dark:bg-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-green-200 uppercase tracking-widest">Hey,</p>
              <p className="text-base font-black text-white truncate">{user?.name?.split(' ')[0]} 👋</p>
              <p className="text-[10px] text-green-200 mt-0.5">Ang lunas sa araw-araw.</p>
            </div>
            <button
              onClick={() => setRightCollapsed(true)}
              title="Collapse panel"
              className="p-1.5 rounded-lg text-green-200 hover:text-white hover:bg-green-700/50 transition-all border-none bg-transparent cursor-pointer shrink-0"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Hike Banner */}
        {activeHike && (() => {
          const adv = activeHike.adventureId || {};
          return (
            <div className="mx-3 mt-3 rounded-xl overflow-hidden border border-green-400/40 dark:border-green-500/30 bg-gradient-to-br from-green-600 to-green-700 dark:from-green-700 dark:to-green-900 shadow-md">
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                </span>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Live — Ongoing Hike</span>
              </div>
              <div className="px-4 pb-4 pt-2 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-2xl shrink-0">{adv.image || '🏔️'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-white leading-snug line-clamp-2">{adv.title}</p>
                    {adv.location && (
                      <div className="flex items-center gap-1 mt-1">
                        <Navigation className="w-3 h-3 text-green-300 shrink-0" />
                        <span className="text-[10px] text-green-200 truncate">{adv.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-green-200">
                  <Tent className="w-3 h-3" />
                  <span>
                    {formatShortDate(adv.startDate)}
                    {adv.endDate && adv.endDate !== adv.startDate ? ` – ${formatShortDate(adv.endDate)}` : ''}
                  </span>
                </div>
                <Link
                  href={`/hiker/bookings/${activeHike._id}`}
                  className="mt-1 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-extrabold bg-white text-green-700 hover:bg-green-50 transition-colors no-underline"
                >
                  <Radio className="w-3 h-3" />
                  View Trip Details
                </Link>
              </div>
            </div>
          );
        })()}

        {/* Quick stats */}
        <div className={`grid grid-cols-2 border-b border-green-50 dark:border-dark-border divide-x divide-green-50 dark:divide-dark-border ${activeHike ? 'mt-3' : ''}`}>
          {[
            { label: 'Upcoming', value: upcomingBookings.length },
            { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length },
          ].map(s => (
            <div key={s.label} className="p-4 text-center">
              <p className="text-xl font-black text-green-950 dark:text-white">{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Upcoming bookings */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-green-900 dark:text-white">Upcoming</span>
            </div>
            <Link href="/hiker/bookings" className="text-[10px] font-bold text-green-600 dark:text-green-400 hover:underline flex items-center gap-0.5 no-underline">
              All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="px-3 pb-4 space-y-2">
              {upcomingBookings.map((b) => {
                const adv = b.adventureId || {};
                return (
                  <Link
                    key={b._id}
                    href={`/hiker/bookings/${b._id}`}
                    className="flex items-start gap-3 p-3 rounded-xl bg-green-50/50 dark:bg-dark-surface hover:bg-green-50 dark:hover:bg-dark-surface/80 transition-colors no-underline group"
                  >
                    <span className="text-xl mt-0.5 shrink-0">{adv.image || '🏔️'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-green-950 dark:text-white truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {adv.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-gray-400">
                          {adv.startDate ? formatShortDate(adv.startDate) : 'Flexible'}
                        </span>
                        <span className={`badge ${statusBadgeClass(b.status)} text-[8px] uppercase font-bold py-0`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-green-600 dark:text-green-400 mt-0.5">
                        {formatPrice(b.totalAmount)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="px-3 pb-3 space-y-4">

              {/* D — Soonest available trips */}
              {(() => {
                const soonest = [...allAdventures]
                  .filter(a => a.status === 'active' && a.slotsRemaining > 0)
                  .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                  .slice(0, 2);
                return soonest.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 pt-2 px-1">
                      Soonest Available
                    </p>
                    {soonest.map(adv => (
                      <Link
                        key={adv._id}
                        href={`/adventure/${adv._id}`}
                        className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-surface hover:bg-green-50/50 dark:hover:bg-white/5 transition-colors no-underline group border border-green-50 dark:border-dark-border"
                      >
                        <span className="text-lg shrink-0 mt-0.5">{adv.image || '🏔️'}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-green-950 dark:text-white truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            {adv.title}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="text-[10px] text-gray-400 truncate">{adv.location}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-green-600 dark:text-green-400 font-bold">
                              {formatPrice(adv.price)}
                            </span>
                            <span className="text-[9px] text-gray-400">
                              {formatShortDate(adv.startDate)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : null;
              })()}

              {/* A — Featured / highest rated */}
              {(() => {
                const featured = [...allAdventures]
                  .filter(a => a.status === 'active' && a.slotsRemaining > 0)
                  .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                  .slice(0, 2);
                return featured.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                      Top Rated
                    </p>
                    {featured.map(adv => (
                      <Link
                        key={adv._id}
                        href={`/hiker/book/${adv._id}`}
                        className="flex items-start gap-3 p-3 rounded-xl bg-green-600/5 dark:bg-green-500/10 hover:bg-green-600/10 dark:hover:bg-green-500/15 transition-colors no-underline group border border-green-100 dark:border-green-500/20"
                      >
                        <span className="text-lg shrink-0 mt-0.5">{adv.image || '🏔️'}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-green-950 dark:text-white truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            {adv.title}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                            <span className="text-[10px] font-bold text-amber-500">{adv.rating || '—'}</span>
                            <span className="text-[10px] text-gray-400 ml-1">{adv.reviewCount} reviews</span>
                          </div>
                          <span className="inline-block mt-1.5 text-[10px] font-extrabold text-green-600 dark:text-green-400">
                            Book now →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : null;
              })()}

            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="p-4 border-t border-green-50 dark:border-dark-border">
          <Link
            href="/hiker/bookings"
            className="w-full btn btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 no-underline"
          >
            <Calendar className="w-3.5 h-3.5" />
            View all my bookings
          </Link>
        </div>
      </aside>
      )} {/* end right panel */}
    </div>
  );
}
