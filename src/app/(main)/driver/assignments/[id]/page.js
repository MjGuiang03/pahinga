'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import axios from 'axios';
import {
  Phone, MapPin, Calendar, Users, ArrowLeft,
  Navigation, CheckCircle2, Car, Compass
} from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { formatShortDate } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function DriverAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user, isLoading: authLoading } = useAuth();
  
  const [updating, setUpdating] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/driver/assignments/${id}`);
    } else if (user && user.role !== 'driver') {
      router.push('/');
    }
  }, [user, authLoading, router, id]);

  const { data, error, isLoading: bookingLoading, mutate } = useSWR(
    id ? `/api/bookings/${id}` : null,
    fetcher
  );

  if (authLoading || bookingLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  if (error || !data?.booking) {
    return (
      <div className="container-main py-16 text-center">
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Failed to load assignment</h2>
        <button onClick={() => router.push('/driver/assignments')} className="btn btn-primary btn-sm mt-6">
          Back to Assignments
        </button>
      </div>
    );
  }

  const booking = data.booking;
  const adv = booking.adventureId || {};
  const hiker = booking.hikerId || {};
  const status = booking.transportStatus;

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await axios.post(`/api/bookings/${id}/status`, { transportStatus: newStatus });
      toast.success(`Trip status updated successfully.`);
      mutate();
    } catch (err) {
      toast.error('Failed to update status. Please try again.');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-[600px] mx-auto px-6 py-10 w-full flex-1 flex flex-col justify-center">
      {/* Back navigation */}
      <button
        onClick={() => router.push('/driver/assignments')}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-green-600 border-none bg-transparent cursor-pointer mb-6 self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assignments</span>
      </button>

      <div className="space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-xl font-black text-green-950 dark:text-green-100">Assignment Detail</h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Ref: {booking.referenceNumber}</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded bg-green-50 dark:bg-dark-surface text-green-700 dark:text-green-400 capitalize">
            {status?.replace('_', ' ')}
          </span>
        </div>

        {/* Hiker Information */}
        <div className="card p-5 border border-green-100 dark:border-dark-border space-y-4 bg-white dark:bg-dark-card">
          <h3 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Hiker Contact Info</h3>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                {hiker.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-green-950 dark:text-green-100">{hiker.name}</h4>
                <p className="text-[11px] text-gray-500">{booking.paxCount} Hiker{booking.paxCount > 1 ? 's' : ''}</p>
              </div>
            </div>

            {hiker.phone && (
              <a
                href={`tel:${hiker.phone}`}
                className="w-10 h-10 rounded-full bg-green-50 dark:bg-dark-surface flex items-center justify-center text-green-600 dark:text-green-400 border border-green-100 dark:border-dark-border hover:bg-green-100"
              >
                <Phone className="w-4.5 h-4.5" />
              </a>
            )}
          </div>
        </div>

        {/* Route details */}
        <div className="card p-5 border border-green-100 dark:border-dark-border space-y-4 bg-white dark:bg-dark-card">
          <h3 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Trip Route</h3>

          <div className="space-y-4 relative pl-5 border-l border-green-100 dark:border-dark-border ml-2 text-xs">
            {/* Pickup */}
            <div className="relative">
              <div className="absolute -left-[27px] top-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-white dark:border-dark-bg" />
              <p className="font-extrabold text-gray-400">Pickup Location</p>
              <p className="text-green-950 dark:text-green-100 mt-1 font-semibold">
                {booking.pickupAddress || 'Jump-off station'}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Pickup Time: {booking.pickupTime ? new Date(booking.pickupTime).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '04:00 AM'}
              </p>
            </div>

            {/* Destination */}
            <div className="relative">
              <div className="absolute -left-[27px] top-0.5 w-3 h-3 rounded-full bg-green-600 border-2 border-white dark:border-dark-bg" />
              <p className="font-extrabold text-gray-400">Destination</p>
              <p className="text-green-950 dark:text-green-100 mt-1 font-semibold">
                {adv.title}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Location: {adv.location}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button at the Bottom */}
        <div className="pt-4 space-y-3">
          {status === 'assigned' && (
            <button
              onClick={() => handleStatusUpdate('picked_up')}
              disabled={updating}
              className="btn btn-primary w-full py-3.5 text-center flex items-center justify-center gap-2"
            >
              {updating ? <Spinner className="w-5 h-5" /> : (
                <>
                  <Car className="w-5 h-5" />
                  <span>Start Trip (Mark Picked Up)</span>
                </>
              )}
            </button>
          )}

          {status === 'picked_up' && (
            <button
              onClick={() => handleStatusUpdate('dropped_off')}
              disabled={updating}
              className="btn btn-primary w-full py-3.5 text-center flex items-center justify-center gap-2"
            >
              {updating ? <Spinner className="w-5 h-5" /> : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>End Trip (Mark Completed)</span>
                </>
              )}
            </button>
          )}

          {status === 'dropped_off' && (
            <button
              disabled
              className="w-full py-3.5 text-center rounded-lg font-extrabold text-sm border-none bg-green-600 text-white opacity-80 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Trip Completed</span>
            </button>
          )}

          {hiker.phone && (
            <a
              href={`tel:${hiker.phone}`}
              className="btn btn-secondary w-full py-3 text-center flex items-center justify-center gap-2 text-xs no-underline"
            >
              <Phone className="w-4 h-4" />
              <span>Call Hiker ({hiker.phone})</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
