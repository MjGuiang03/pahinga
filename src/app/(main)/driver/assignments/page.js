'use client';

import React, { useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Users, ChevronRight, Navigation } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { formatShortDate } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function DriverAssignmentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/driver/assignments');
    } else if (user && user.role !== 'driver') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const { data, error, isLoading: bookingsLoading } = useSWR(
    user ? '/api/bookings' : null,
    fetcher
  );

  if (authLoading || bookingsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  const assignments = data?.bookings || [];

  const getTransportBadgeClass = (status) => {
    if (status === 'assigned') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    if (status === 'picked_up') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    if (status === 'dropped_off') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    return 'bg-gray-100 text-gray-800 dark:bg-dark-surface dark:text-gray-400';
  };

  return (
    <div className="max-w-[600px] mx-auto px-6 py-10 w-full flex-1 flex flex-col">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-green-950 dark:text-green-100">My Assignments</h1>
          <p className="text-xs text-gray-500">View and update your transit routes for scheduled trips.</p>
        </div>

        {assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.map((booking) => {
              const adv = booking.adventureId || {};
              const hiker = booking.hikerId || {};
              
              return (
                <Link
                  key={booking._id}
                  href={`/driver/assignments/${booking._id}`}
                  className="card card-hover p-5 border border-green-100 dark:border-dark-border flex items-center justify-between gap-4 no-underline text-inherit select-none group"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${getTransportBadgeClass(booking.transportStatus)}`}>
                        {booking.transportStatus?.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">{booking.referenceNumber}</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-green-900 dark:text-green-100 leading-snug group-hover:text-green-600 transition-colors">
                      {adv.title}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-green-600" />
                        <span>{adv.startDate ? formatShortDate(adv.startDate) : 'Flexible'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-green-600" />
                        <span>{hiker.name} ({booking.paxCount} Pax)</span>
                      </div>
                    </div>

                    {booking.pickupAddress && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 truncate pt-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                        <span className="truncate">{booking.pickupAddress}</span>
                      </div>
                    )}
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-6 sm:p-10 md:p-16 text-center space-y-4">
            <Navigation className="w-12 h-12 text-green-200 dark:text-green-800 mx-auto" />
            <h3 className="text-lg font-bold text-green-950 dark:text-green-100">No Assignments</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You do not have any pickup assignments scheduled right now. Check back later or contact your agency administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

