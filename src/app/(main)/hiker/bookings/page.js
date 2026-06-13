'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { Mountain, Calendar, Users, Wallet, Star, ChevronRight } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { formatPrice, formatShortDate, statusBadgeClass } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';
import { useRouter } from 'next/navigation';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function MyBookingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/hiker/bookings');
    }
  }, [user, authLoading, router]);

  // Fetch bookings
  const { data, error, isLoading: bookingsLoading, mutate } = useSWR(
    user ? `/api/bookings` : null,
    fetcher
  );

  if (authLoading || bookingsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  const bookings = data?.bookings || [];

  // Filter bookings based on tab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return b.status === 'pending' || b.status === 'confirmed';
    if (activeTab === 'completed') return b.status === 'completed';
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <div className="container-main py-10">
      <div className="space-y-6">
        <div>
          <h1 className="page-title">My bookings</h1>
          <p className="page-subtitle">Track your outdoor bookings, payments, and trip coordination details.</p>
        </div>

        {/* Tab Filter */}
        <div className="flex border-b border-green-100 dark:border-dark-border select-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors -mb-[2px] cursor-pointer ${
                activeTab === tab.id
                  ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400 font-extrabold'
                  : 'border-transparent text-gray-400 hover:text-green-600 hover:border-green-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List View */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const adv = booking.adventureId || {};
              const agency = booking.agencyId || {};
              const badgeClass = statusBadgeClass(booking.status);

              return (
                <div
                  key={booking._id}
                  className="card card-hover p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-green-100 dark:border-dark-border"
                >
                  {/* Left Column (Image & Info) */}
                  <div className="flex items-center gap-4 flex-1">
                    {/* Small adventure image / placeholder */}
                    <div className="w-[60px] h-[60px] rounded-lg bg-green-50 dark:bg-dark-surface flex items-center justify-center text-3xl select-none flex-shrink-0">
                      {adv.image || '🏔️'}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-green-900 dark:text-green-100">
                        {adv.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Organized by <span className="font-semibold">{agency.orgName}</span>
                      </p>
                      <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-green-600" />
                          <span>{adv.startDate ? formatShortDate(adv.startDate) : 'Flexible'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-green-600" />
                          <span>{booking.paxCount} Participant{booking.paxCount > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Total & Actions) */}
                  <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto justify-between border-t sm:border-none pt-3 sm:pt-0 border-green-50">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400">Total Paid</p>
                      <p className="text-base font-extrabold text-green-950 dark:text-green-100">
                        {formatPrice(booking.totalAmount)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`badge ${badgeClass} uppercase text-[9px] tracking-wider font-bold`}>
                        {booking.status}
                      </span>
                      
                      <Link
                        href={`/hiker/bookings/${booking._id}`}
                        className="text-xs font-bold text-green-600 dark:text-green-400 hover:underline flex items-center"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {booking.status === 'completed' && !booking.reviewLeft && (
                      <Link
                        href={`/hiker/review/${booking._id}`}
                        className="btn btn-sm bg-amber-500 hover:bg-amber-600 text-white font-extrabold border-none mt-1"
                      >
                        Leave a review
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-16 text-center max-w-md mx-auto space-y-4">
            <Mountain className="w-12 h-12 text-green-200 dark:text-green-800 mx-auto" />
            <h3 className="text-lg font-bold text-green-950 dark:text-green-100">No bookings yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You haven&apos;t booked any outdoor getaways. Discover local Philippine adventures today.
            </p>
            <Link href="/browse" className="btn btn-primary px-6 py-2.5">
              Find your first adventure
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
