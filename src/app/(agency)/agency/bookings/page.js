'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Users, Wallet, CalendarDays } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { formatPrice, formatShortDate, statusBadgeClass } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function AgencyBookingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');

  // Auth Guard
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'agency')) {
      router.push('/login?redirect=/agency/bookings');
    }
  }, [user, authLoading, router]);

  // Fetch bookings
  const { data, error, isLoading: bookingsLoading } = useSWR(
    user ? '/api/bookings' : null,
    fetcher
  );

  if (authLoading || bookingsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  const bookings = data?.bookings || [];

  // Filter bookings based on activeTab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  return (
    <div className="w-full min-w-0 p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-green-950 dark:text-green-100">Bookings Management</h1>
        <p className="text-xs text-gray-500">Track paid transactions, confirm bookings, and assign drivers.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-green-100 dark:border-dark-border select-none">
        {[
          { id: 'all', label: 'All Bookings' },
          { id: 'pending', label: 'Pending' },
          { id: 'confirmed', label: 'Confirmed' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors -mb-[2px] cursor-pointer ${
              activeTab === tab.id
                ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400 font-extrabold'
                : 'border-transparent text-gray-400 hover:text-green-600 hover:border-green-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filteredBookings.length > 0 ? (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-green-50/50 dark:bg-dark-surface border-b border-green-100 dark:border-dark-border text-gray-400 font-extrabold uppercase">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Adventure Tour</th>
                  <th className="p-4">Hiker Name</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4">Trip Date</th>
                  <th className="p-4 text-center">Pax</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const adv = b.adventureId || {};
                  const hiker = b.hikerId || {};
                  
                  return (
                    <tr key={b._id} className="border-b border-green-50 dark:border-dark-border hover:bg-green-50/10 transition-colors">
                      <td className="p-4 font-mono font-bold text-green-900 dark:text-green-400 select-all">{b.referenceNumber}</td>
                      <td className="p-4 font-semibold text-green-950 dark:text-green-100 truncate max-w-[150px]">{adv.title}</td>
                      <td className="p-4">{hiker.name || 'Pahinga Traveler'}</td>
                      <td className="p-4 font-mono">{hiker.phone || 'N/A'}</td>
                      <td className="p-4 whitespace-nowrap">{adv.startDate ? formatShortDate(adv.startDate) : 'Flexible'}</td>
                      <td className="p-4 text-center font-bold">{b.paxCount}</td>
                      <td className="p-4 text-right font-bold">{formatPrice(b.totalAmount)}</td>
                      <td className="p-4">
                        <span className={`badge ${statusBadgeClass(b.status)} text-[9px] uppercase font-bold`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <Link href={`/agency/bookings/${b._id}`} className="btn btn-ghost btn-sm py-1 px-3">
                          Manage
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
        <div className="w-full min-w-0 bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-6 sm:p-10 md:p-16 text-center max-w-md mx-auto space-y-4">
          <CalendarDays className="w-12 h-12 text-green-200 dark:text-green-800 mx-auto" />
          <h3 className="text-lg font-bold text-green-950 dark:text-green-100">No bookings found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            There are no hiker bookings under the selected filter tab right now.
          </p>
        </div>
      )}
    </div>
  );
}



