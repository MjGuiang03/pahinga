'use client';

import React, { useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, Clock, Car, Navigation,
  Calendar, Users, MapPin, ChevronRight,
} from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { formatShortDate } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';

const fetcher = (url) => axios.get(url).then(res => res.data);

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-black text-green-950 dark:text-white">{value}</p>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
      </div>
    </div>
  );
}

export default function DriverDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'driver')) {
      router.push('/login?redirect=/driver/dashboard');
    }
  }, [user, authLoading, router]);

  const { data, isLoading } = useSWR(user ? '/api/bookings' : null, fetcher);
  const { data: driverData } = useSWR(user ? '/api/drivers/me' : null, fetcher);

  if (authLoading || isLoading) {
    return <div className="flex-1 flex items-center justify-center py-24"><Spinner className="w-12 h-12" /></div>;
  }

  const bookings = data?.bookings || [];
  const driver = driverData?.driver || null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTrips = bookings.filter(b => {
    const start = b.adventureId?.startDate ? new Date(b.adventureId.startDate) : null;
    if (!start) return false;
    start.setHours(0, 0, 0, 0);
    return start.getTime() === today.getTime();
  });

  // All active (not yet dropped off), sorted by start date asc
  const activeAssignments = bookings
    .filter(b => b.transportStatus !== 'dropped_off')
    .sort((a, b) => new Date(a.adventureId?.startDate) - new Date(b.adventureId?.startDate));

  const completed = bookings.filter(b => b.transportStatus === 'dropped_off').length;
  const totalTrips = bookings.length;

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-green-950 dark:text-white">
          Hey, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Here's your driving overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Calendar}    label="Today's Trips"    value={todayTrips.length}  color="bg-blue-500" />
        <StatCard icon={Clock}       label="Total Assigned"   value={totalTrips}          color="bg-amber-500" />
        <StatCard icon={CheckCircle2} label="Completed"       value={completed}           color="bg-green-600" />
      </div>

      {/* Status + Vehicle banner */}
      {driver && (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Car className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-gray-400">Status</p>
              <span className={`badge text-[10px] font-bold uppercase ${
                driver.status === 'available' ? 'badge-easy'
                : driver.status === 'on_trip' ? 'badge-moderate'
                : 'badge-difficult'
              }`}>
                {driver.status?.replace('_', ' ')}
              </span>
            </div>
          </div>
          <Link
            href="/driver/vehicle"
            className="text-xs font-bold text-green-600 dark:text-green-400 hover:underline flex items-center gap-1 no-underline"
          >
            View Vehicle <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* All active assignments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">My Assignments</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            {activeAssignments.length} active
          </span>
        </div>

        {activeAssignments.length > 0 ? (
          <div className="space-y-3">
            {activeAssignments.map(b => {
              const adv = b.adventureId || {};
              const hiker = b.hikerId || {};
              const isToday = (() => {
                const start = adv.startDate ? new Date(adv.startDate) : null;
                if (!start) return false;
                start.setHours(0, 0, 0, 0);
                return start.getTime() === today.getTime();
              })();
              const statusColors = {
                assigned:   'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                picked_up:  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
                dropped_off:'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
              };
              return (
                <Link
                  key={b._id}
                  href={`/driver/assignments/${b._id}`}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl hover:border-green-400 dark:hover:border-green-600 transition-colors no-underline group"
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusColors[b.transportStatus] || 'bg-gray-100 text-gray-500'}`}>
                        {b.transportStatus?.replace('_', ' ')}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 uppercase tracking-wider">
                          Today
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-gray-400">{b.referenceNumber}</span>
                    </div>
                    <p className="text-sm font-bold text-green-950 dark:text-white truncate">{adv.title}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {adv.startDate ? formatShortDate(adv.startDate) : 'Flexible'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {hiker.name} · {b.paxCount} pax
                      </span>
                      {b.pickupAddress && (
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />{b.pickupAddress}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 rounded-xl border border-dashed border-green-100 dark:border-dark-border space-y-2">
            <Navigation className="w-10 h-10 text-green-200 dark:text-green-800" />
            <p className="text-sm font-bold text-green-950 dark:text-white">No active assignments</p>
            <p className="text-xs text-gray-400">Your trip assignments will appear here once your agency assigns you.</p>
          </div>
        )}
      </div>
    </div>
  );
}
