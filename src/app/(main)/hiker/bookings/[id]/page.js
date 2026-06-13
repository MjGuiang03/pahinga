'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import axios from 'axios';
import {
  Compass, Calendar, Users, MapPin, Phone,
  Clock, ShieldAlert, CheckCircle, ArrowLeft,
  XCircle, Car, UserCheck
} from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatPrice, formatShortDate, statusBadgeClass } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user, isLoading: authLoading } = useAuth();
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/hiker/bookings/${id}`);
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
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Failed to load booking details</h2>
        <button onClick={() => router.push('/hiker/bookings')} className="btn btn-primary btn-sm mt-6">
          Back to My Bookings
        </button>
      </div>
    );
  }

  const booking = data.booking;
  const adv = booking.adventureId || {};
  const agency = booking.agencyId || {};
  const driver = booking.driverId;
  const vehicle = booking.vehicleId;

  // Check cancellation rules: only if status is pending/confirmed and >24hrs before trip
  const canCancel = (() => {
    if (booking.status !== 'pending' && booking.status !== 'confirmed') return false;
    if (!adv.startDate) return false;
    const hoursDiff = (new Date(adv.startDate) - new Date()) / (1000 * 60 * 60);
    return hoursDiff > 24;
  })();

  const handleCancelBooking = async () => {
    setCancelling(true);
    try {
      await axios.post(`/api/bookings/${id}/status`, { status: 'cancelled' });
      toast.success('Booking cancelled successfully.');
      mutate();
      setShowCancelModal(false);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Cancellation failed. Please try again.';
      toast.error(errMsg);
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  const getTransportStatusBadge = (status) => {
    if (status === 'assigned') return 'badge-green';
    if (status === 'picked_up') return 'badge-moderate';
    if (status === 'dropped_off') return 'badge-easy';
    return 'badge-outline';
  };

  return (
    <div className="container-main py-10">
      {/* Header back navigation */}
      <button
        onClick={() => router.push('/hiker/bookings')}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-green-600 border-none bg-transparent cursor-pointer mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Bookings</span>
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Booking Info */}
        <div className="lg:col-span-8 space-y-6">
          {/* Reference Card */}
          <div className="card p-5 border border-green-100 dark:border-dark-border space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-green-50 dark:border-dark-border pb-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Reference Number</p>
                <p className="text-base font-extrabold text-green-900 dark:text-green-100">{booking.referenceNumber}</p>
              </div>
              <span className={`badge ${statusBadgeClass(booking.status)} uppercase text-xs font-extrabold tracking-wider`}>
                {booking.status}
              </span>
            </div>

            {/* Adventure details */}
            <div className="flex gap-4 items-center">
              <div className="w-[64px] h-[64px] rounded-lg bg-green-50 dark:bg-dark-surface flex items-center justify-center text-4xl select-none flex-shrink-0">
                {adv.image || '🏔️'}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-green-950 dark:text-green-100">
                  {adv.title}
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Organized by <span className="font-semibold">{agency.orgName}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Location: {adv.location}
                </p>
              </div>
            </div>
          </div>

          {/* Pax and Payment details */}
          <div className="card p-5 border border-green-100 dark:border-dark-border space-y-4">
            <h3 className="text-sm font-bold text-green-950 dark:text-green-100">Participant & Payment Info</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-green-50/40 dark:bg-dark-surface p-3 rounded-lg">
                <Users className="w-4 h-4 text-green-600 mx-auto mb-1" />
                <p className="text-[9px] uppercase font-semibold text-gray-400">Hikers</p>
                <p className="text-xs font-bold text-green-900 dark:text-green-100">{booking.paxCount} Pax</p>
              </div>
              <div className="bg-green-50/40 dark:bg-dark-surface p-3 rounded-lg">
                <Clock className="w-4 h-4 text-green-600 mx-auto mb-1" />
                <p className="text-[9px] uppercase font-semibold text-gray-400">Trip Date</p>
                <p className="text-xs font-bold text-green-900 dark:text-green-100 truncate">
                  {adv.startDate ? formatShortDate(adv.startDate) : 'Flexible'}
                </p>
              </div>
              <div className="bg-green-50/40 dark:bg-dark-surface p-3 rounded-lg">
                <Wallet className="w-4 h-4 text-green-600 mx-auto mb-1" />
                <p className="text-[9px] uppercase font-semibold text-gray-400">Total Paid</p>
                <p className="text-xs font-bold text-green-900 dark:text-green-100">{formatPrice(booking.totalAmount)}</p>
              </div>
              <div className="bg-green-50/40 dark:bg-dark-surface p-3 rounded-lg">
                <Phone className="w-4 h-4 text-green-600 mx-auto mb-1" />
                <p className="text-[9px] uppercase font-semibold text-gray-400">Method</p>
                <p className="text-xs font-bold text-green-900 dark:text-green-100 uppercase">{booking.paymentMethod}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-green-50 dark:border-dark-border text-xs">
              <span className="text-gray-400">Payment Status</span>
              <span className={`badge ${
                booking.paymentStatus === 'paid'
                  ? 'badge-easy'
                  : booking.paymentStatus === 'refunded'
                  ? 'badge-difficult'
                  : 'badge-moderate'
              } uppercase text-[10px]`}>
                {booking.paymentStatus}
              </span>
            </div>

            {booking.gcashReference && (
              <p className="text-xs text-gray-400">
                GCash Ref: <span className="font-mono font-bold select-all text-green-900 dark:text-green-100">{booking.gcashReference}</span>
              </p>
            )}
            {booking.cardNumber && (
              <p className="text-xs text-gray-400">
                Card ending in: <span className="font-mono font-bold text-green-900 dark:text-green-100">**** **** **** {booking.cardNumber}</span>
              </p>
            )}
          </div>

          {/* Refund Status display if present */}
          {booking.refundRequest && booking.refundRequest.status !== 'none' && (
            <div className="card p-4 border border-red-100 dark:border-red-950 bg-red-50/10 space-y-2 text-xs">
              <h4 className="font-bold text-red-800 dark:text-red-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Refund Request: {booking.refundRequest.status.toUpperCase()}</span>
              </h4>
              <p className="text-gray-500">Amount: {formatPrice(booking.refundRequest.amount)}</p>
              <p className="text-gray-500">Reason: {booking.refundRequest.reason}</p>
              {booking.refundRequest.remarks && (
                <p className="text-gray-400 italic mt-1">Admin remarks: &ldquo;{booking.refundRequest.remarks}&rdquo;</p>
              )}
            </div>
          )}

          {/* Cancel Button */}
          {canCancel && (
            <div className="pt-2">
              <button
                onClick={() => setShowCancelModal(true)}
                className="btn btn-danger w-full sm:w-auto"
              >
                Cancel booking
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Transportation Info */}
        <div className="lg:col-span-4 lg:sticky lg:top-20">
          <div className="card border border-green-100 dark:border-dark-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-green-50 dark:border-dark-border pb-3">
              <h3 className="text-sm font-bold text-green-950 dark:text-green-100">Transport Details</h3>
              {driver && (
                <span className={`badge ${getTransportStatusBadge(booking.transportStatus)} uppercase text-[9px] tracking-wider`}>
                  {booking.transportStatus}
                </span>
              )}
            </div>

            {!driver ? (
              /* Driver Not Assigned State */
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-dark-surface flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed max-w-[200px] mx-auto">
                  Your pickup details will appear here once the agency assigns a driver.
                </p>
              </div>
            ) : (
              /* Driver Assigned State */
              <div className="space-y-4">
                {/* Driver profile row */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-green-50 dark:bg-green-400 dark:text-dark-bg flex items-center justify-center font-bold text-sm">
                    {driver.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-green-950 dark:text-green-100">
                      {driver.name}
                    </h4>
                    <p className="text-[10px] text-gray-400">Assigned Driver</p>
                  </div>
                </div>

                {/* Vehicle details */}
                <div className="flex items-center gap-3 text-xs bg-green-50/40 dark:bg-dark-surface p-3 rounded-lg">
                  <Car className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-semibold text-green-950 dark:text-green-100">
                      {vehicle?.type} ({vehicle?.capacity} seats)
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      Plate: {vehicle?.plateNumber}
                    </p>
                  </div>
                </div>

                {/* Locations and Schedule */}
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="font-semibold text-gray-400">Pickup Location</p>
                    <p className="text-green-950 dark:text-green-100 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-green-600" />
                      <span>{booking.pickupAddress || 'Jump-off'}</span>
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-400">Pickup Time</p>
                    <p className="text-green-950 dark:text-green-100 mt-0.5">
                      {booking.pickupTime ? new Date(booking.pickupTime).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '04:00 AM'}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-400">Destination</p>
                    <p className="text-green-950 dark:text-green-100 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{adv.location}</span>
                    </p>
                  </div>
                </div>

                {/* Driver Contact link */}
                <a
                  href={`tel:${driver.phone}`}
                  className="btn btn-secondary w-full py-2.5 text-center flex items-center justify-center gap-1.5 text-xs no-underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {driver.name} ({driver.phone})</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation confirmation modal */}
      {showCancelModal && (
        <ConfirmModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelBooking}
          title="Cancel Booking"
          message={`Are you sure you want to cancel your booking for "${adv.title}"? Your slots will be released immediately.`}
          confirmText="Yes, Cancel Booking"
          cancelText="No, Keep It"
          loading={cancelling}
        />
      )}
    </div>
  );
}
