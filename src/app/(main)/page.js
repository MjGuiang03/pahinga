'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import axios from 'axios';
import {
  Search, Calendar, Compass, MapPin, Star,
  Anchor, Wind, Tent, ShieldCheck, Users,
  ChevronRight, ArrowRight, Eye, Sparkles, Map
} from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import AdventureCard from '@/components/adventure/AdventureCard';
import { useAuth } from '@/frontend/hooks/useAuth';
import Spinner from '@/components/common/Spinner';

const fetcher = (url) => axios.get(url).then(res => res.data);

const activities = [
  { name: 'Hiking', icon: Compass },
  { name: 'Diving', icon: Anchor },
  { name: 'Surfing', icon: Wind },
  { name: 'Camping', icon: Tent },
  { name: 'Canyoneering', icon: Sparkles },
  { name: 'Island Hopping', icon: Map },
];

const ROLE_DASHBOARDS = {
  hiker: '/hiker/dashboard',
  agency: '/agency/dashboard',
  driver: '/driver/assignments',
  admin: '/admin/dashboard',
};

export default function Home() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [searchWhere, setSearchWhere] = useState('');
  const [searchWhen, setSearchWhen] = useState('');
  const [searchType, setSearchType] = useState('All');

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(ROLE_DASHBOARDS[user.role] || '/hiker/dashboard');
    }
  }, [user, authLoading, router]);

  // Fetch featured adventures
  const { data } = useSWR('/api/adventures', fetcher);
  const adventures = data?.adventures || [];
  const featuredAdventures = adventures.slice(0, 4);

  // Show spinner while checking auth (avoids landing page flash)
  if (authLoading || user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchWhere) params.set('search', searchWhere);
    if (searchWhen) params.set('date', searchWhen);
    if (searchType && searchType !== 'All') params.set('type', searchType);
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] bg-gradient-to-b from-green-900 to-green-800 flex flex-col justify-center py-20 px-6 overflow-hidden">
        {/* Abstract background details */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-green-700/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-green-600/10 rounded-full blur-3xl" />

        <div className="w-full min-w-0 max-w-4xl mx-auto text-center z-10 space-y-8">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Ang lunas sa araw-araw.
          </h1>
          <p className="w-full min-w-0 text-lg sm:text-xl text-green-100 max-w-2xl mx-auto font-medium">
            Book guided hikes, dives, and outdoor escapes with trusted local agencies across the Philippines.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/browse" className="btn btn-lg btn-primary shadow-lg">
              Explore adventures
            </Link>
            <Link href="/register/agency" className="btn btn-lg border-white text-white hover:bg-white/10 transition-colors">
              Post your agency
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 sm:gap-12 pt-6 text-sm text-green-100 font-semibold">
            <div className="flex flex-col items-center sm:flex-row gap-1 sm:gap-2">
              <span className="text-white text-lg font-bold">120+</span>
              <span className="opacity-80">Adventures</span>
            </div>
            <div className="flex flex-col items-center sm:flex-row gap-1 sm:gap-2">
              <span className="text-white text-lg font-bold">48</span>
              <span className="opacity-80">Agencies</span>
            </div>
            <div className="flex flex-col items-center sm:flex-row gap-1 sm:gap-2">
              <span className="text-white text-lg font-bold">4.9</span>
              <span className="opacity-80">Avg rating</span>
            </div>
          </div>
        </div>

        {/* Subtle mountain silhouette SVG at the bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0]">
          <svg
            className="relative block w-full h-[60px] text-white dark:text-dark-bg fill-current"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M0,0 L120,40 L240,15 L360,60 L480,30 L600,80 L720,20 L840,70 L960,40 L1080,85 L1200,10 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* Search Bar Section (overlapping hero) */}
      <section className="relative z-20 px-6 -mt-10">
        <form
          onSubmit={handleSearch}
          className="w-full min-w-0 bg-white dark:bg-dark-card p-5 rounded-2xl shadow-modal border border-green-100 dark:border-dark-border max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
        >
          <div className="md:col-span-4 space-y-1.5">
            <label className="form-label block">Where do you want to go?</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-green-600 dark:text-green-400" />
              <input
                type="text"
                placeholder="Region, mountain, province..."
                className="form-input pl-10"
                value={searchWhere}
                onChange={(e) => setSearchWhere(e.target.value)}
              />
            </div>
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="form-label block">When?</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-green-600 dark:text-green-400" />
              <input
                type="date"
                className="form-input pl-10"
                value={searchWhen}
                onChange={(e) => setSearchWhen(e.target.value)}
              />
            </div>
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="form-label block">Adventure type</label>
            <select
              className="form-select"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="All">All types</option>
              <option value="Hiking">Hiking</option>
              <option value="Diving">Diving</option>
              <option value="Surfing">Surfing</option>
              <option value="Camping">Camping</option>
              <option value="Canyoneering">Canyoneering</option>
              <option value="Island Hopping">Island Hopping</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button type="submit" className="btn btn-primary w-full h-[46px] gap-2">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </form>
      </section>

      {/* Category Tags Section */}
      <section className="py-16 px-6 container-main">
        <div className="mb-6">
          <span className="text-xs font-extrabold uppercase tracking-widest text-green-600 dark:text-green-400">
            Browse by activity
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
          {activities.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.name}
                onClick={() => router.push(`/browse?type=${act.name}`)}
                className="tag flex-shrink-0"
              >
                <Icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>{act.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Adventures Section */}
      <section className="py-12 px-6 container-main">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-green-600 dark:text-green-400 block mb-1">
              Popular right now
            </span>
            <h2 className="text-2xl font-black text-green-900 dark:text-green-100">
              Featured adventures
            </h2>
          </div>
          <Link
            href="/browse"
            className="text-sm font-bold text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
          >
            <span>View all adventures</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredAdventures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAdventures.map((adv) => (
              <AdventureCard key={adv._id} adventure={adv} />
            ))}
          </div>
        ) : (
          <div className="bg-green-50/50 dark:bg-dark-surface p-10 rounded-2xl text-center border border-green-100 dark:border-dark-border">
            <Compass className="w-12 h-12 text-green-200 dark:text-green-700 mx-auto mb-3 animate-pulse" />
            <p className="text-sm font-semibold text-green-900 dark:text-green-100">Loading amazing activities for you...</p>
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-green-50 dark:bg-dark-surface px-6">
        <div className="container-main">
          <div className="w-full min-w-0 text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-green-600 dark:text-green-400">
              Simple steps
            </span>
            <h2 className="text-3xl font-black text-green-900 dark:text-green-100">
              How it works
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your gateway to seamless outdoor experiences in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Browse adventures',
                desc: 'Explore a verified catalog of hikes, dives, and island tours with detailed schedules.',
                icon: Compass,
              },
              {
                step: '2',
                title: 'Book and pay',
                desc: 'Confirm your slots securely via GCash or Card payments, or opt to pay upon arrival.',
                icon: ShieldCheck,
              },
              {
                step: '3',
                title: 'Show up and escape',
                desc: 'Get matched with coordinate drivers, track pickup details, and enjoy your break.',
                icon: Wind,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border p-8 rounded-2xl text-center relative hover:shadow-card transition-all"
                >
                  <div className="absolute top-4 left-4 w-7 h-7 rounded-full bg-green-600 text-green-50 dark:bg-green-400 dark:text-dark-bg flex items-center justify-center text-xs font-extrabold">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-dark-surface flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Agencies Section */}
      <section className="py-20 px-6 container-main">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-green-600 dark:text-green-400 block mb-1">
              Trusted partners
            </span>
            <h2 className="text-2xl font-black text-green-900 dark:text-green-100">
              Trusted agencies
            </h2>
          </div>
          <Link
            href="/browse"
            className="text-sm font-bold text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
          >
            <span>See all agencies</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Trail Seekers PH', rating: 4.9, count: 12, initials: 'TS' },
            { name: 'Sea To Summit PH', rating: 4.8, count: 9, initials: 'SS' },
            { name: 'Peak Escapes Co.', rating: 4.7, count: 6, initials: 'PE' },
          ].map((agency) => (
            <div
              key={agency.name}
              className="card p-5 flex items-center gap-4 hover:border-green-200 dark:hover:border-green-600 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-base select-none">
                {agency.initials}
              </div>
              <div>
                <h4 className="text-sm font-bold text-green-900 dark:text-green-100">
                  {agency.name}
                </h4>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{agency.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{agency.count} adventures</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

