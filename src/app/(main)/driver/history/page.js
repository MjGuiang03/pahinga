'use client';

import React, { useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { History, Calendar, Users, MapPin, ChevronRight } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { formatShortDate, formatPrice } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function DriverHistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'driver')) {
      router.push('/login?redirect=/driver/history');
    }
  }, [user, authLoading, router]);

  const { data, isLoading } = useSWR(user ? '/api/bookings' : null, fetcher);

  if (authLoading || isLoading) {
    return <div className="flex-1 flex items-center justify-center py-24"><Spinner className="w-12 h-12" /></div>;
  }

  const bookings = data?.bookings || [];

  // Completed = dropped_off transport status
  const history = bookings
    .filter(b => b.transportStatus === 'dropped_off')
    .sort((a, b) => new Date(b.adventureId?.startDate) - new Date(a.adventureId?.startDate));

  return (
    <div className="w-full min-w-0 p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-green-950 dark:text-white">Trip History</h1>
          <p className="text-xs text-gray-500 mt-0.5">All your completed drop-off assignments.</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border text-center">
          <p className="text-xl font-black text-green-950 dark:text-white">{history.length}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Completed</p>
        </div>
      </div>

      {history.length > 0 ? (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-green-50/50 dark:bg-dark-surface border-b border-green-100 dark:border-dark-border text-gray-400 font-extrabold uppercase tracking-wider">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Adventure</th>
                  <th className="p-4">Hiker</th>
                  <th className="p-4">Pickup</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Pax</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {history.map(b => {
                  const adv = b.adventureId || {};
                  const hiker = b.hikerId || {};
                  return (
                    <tr key={b._id} className="border-b border-green-50 dark:border-dark-border hover:bg-green-50/10 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono font-bold text-green-700 dark:text-green-400 select-all">
                        {b.referenceNumber}
                      </td>
                      <td className="p-4 font-semibold text-green-950 dark:text-white max-w-[160px] truncate">
                        {adv.title}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold dark:text-white">{hiker.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{hiker.phone || hiker.email}</p>
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400 max-w-[140px] truncate">
                        {b.pickupAddress || '—'}
                      </td>
                      <td className="p-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {adv.startDate ? formatShortDate(adv.startDate) : '—'}
                      </td>
                      <td className="p-4 text-center font-bold text-green-950 dark:text-white">
                        {b.paxCount || '—'}
                      </td>
                      <td className="p-4 text-center">
                        <span className="badge badge-easy text-[9px] uppercase font-bold">Dropped off</span>
                      </td>
                      <td className="p-4 text-center">
                        <Link href={`/driver/assignments/${b._id}`}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400 hover:underline no-underline">
                          View <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-6 sm:p-10 md:p-16 text-center space-y-3">
          <History className="w-10 h-10 text-green-200 dark:text-green-800 mx-auto" />
          <p className="text-sm font-bold text-green-950 dark:text-white">No completed trips yet</p>
          <p className="text-xs text-gray-400">Your drop-off history will appear here once you complete assignments.</p>
        </div>
      )}
    </div>
  );
}



