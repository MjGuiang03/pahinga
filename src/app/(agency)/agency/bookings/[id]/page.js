'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import axios from 'axios';
import {
  ArrowLeft, Users, Calendar, MapPin, Phone,
  Clock, ShieldAlert, CheckCircle, Car, UserCheck
} from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatPrice, formatShortDate, statusBadgeClass } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function AgencyBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user, isLoading: authLoading } = useAuth();

  // Action states
  const [updating, setUpdating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Driver / Vehicle Selector States
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  // Auth Guard
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'agency')) {
      router.push(`/login?redirect=/agency/bookings/${id}`);
    }
  }, [user, authLoading, router, id]);

  // Fetch Booking Details
  const { data: bookingData, error: bookingError, isLoading: bookingLoading, mutate: mutateBooking } = useSWR(
    id ? `/api/bookings/${id}` : null,
    fetcher
  );

  // Fetch Drivers and Vehicles lists for the dropdown selectors
  const { data: driversData } = useSWR(user ? '/api/drivers' : null, fetcher);
  const { data: vehiclesData } = useSWR(user ? '/api/vehicles' : null, fetcher);

  const booking = bookingData?.booking;
  const adv = booking?.adventureId || {};
  const hiker = booking?.hikerId || {};
  const driver = booking?.driverId;
  const vehicle = booking?.vehicleId;

  // Sync form inputs when booking data changes
  useEffect(() => {
    if (booking) {
      if (booking.driverId) setSelectedDriver(booking.driverId._id || booking.driverId);
      if (booking.vehicleId) setSelectedVehicle(booking.vehicleId._id || booking.vehicleId);
      if (booking.pickupTime) {
        setPickupTime(new Date(booking.pickupTime).toISOString().slice(0, 16));
      }
    }
  }, [booking]);

  if (authLoading || bookingLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  if (bookingError || !booking) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-700">Failed to load booking</h2>
        <button onClick={() => router.push('/agency/bookings')} className="btn btn-primary btn-sm mt-6">
          Back to Bookings
        </button>
      </div>
    );
  }

  const handleConfirmBooking = async () => {
    setUpdating(true);
    try {
      await axios.post(`/api/bookings/${id}/status`, { status: 'confirmed' });
      toast.success('Booking confirmed successfully.');
      mutateBooking();
    } catch (err) {
      toast.error('Failed to confirm booking.');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelBooking = async () => {
    setUpdating(true);
    try {
      await axios.post(`/api/bookings/${id}/status`, { status: 'cancelled' });
      toast.success('Booking cancelled successfully.');
      mutateBooking();
      setShowCancelModal(false);
    } catch (err) {
      toast.error('Failed to cancel booking.');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDriver || !selectedVehicle || !pickupTime) {
      toast.error('Please fill in driver, vehicle, and pickup time.');
      return;
    }

    setAssigning(true);
    try {
      await axios.post(`/api/bookings/${id}/assign-driver`, {
        driverId: selectedDriver,
        vehicleId: selectedVehicle,
        pickupTime,
      });
      toast.success('Driver and vehicle assigned successfully.');
      mutateBooking();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to assign transportation.';
      toast.error(errMsg);
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  const driversList = driversData?.drivers || [];
  const vehiclesList = vehiclesData?.vehicles || [];

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => router.push('/agency/bookings')}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-green-600 border-none bg-transparent cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Bookings</span>
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-green-950 dark:text-green-100">Manage Booking</h1>
          <p className="text-xs text-gray-500">Review hiker details and allocate transport assets.</p>
        </div>
        <span className={`badge ${statusBadgeClass(booking.status)} uppercase text-xs font-extrabold tracking-wider`}>
          {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Details) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Hiker Details */}
          <div className="card p-5 border border-green-100 dark:border-dark-border space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Hiker Information</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm select-none">
                  {hiker.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-extrabold text-green-950 dark:text-green-100">{hiker.name}</p>
                  <p className="text-gray-400 mt-0.5">{hiker.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="font-bold text-gray-400">Contact Number</p>
                  <p className="text-green-950 dark:text-green-100 mt-0.5 font-mono">{hiker.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-400">Pickup Option</p>
                  <p className="text-green-950 dark:text-green-100 mt-0.5">
                    {booking.pickupNeeded ? 'Van Pickup Requested' : 'Self Travel (No Pickup)'}
                  </p>
                </div>
              </div>

              {booking.pickupNeeded && (
                <div className="pt-1">
                  <p className="font-bold text-gray-400">Pickup Address</p>
                  <p className="text-green-950 dark:text-green-100 mt-0.5 font-semibold bg-green-50/50 dark:bg-dark-surface p-2 rounded border border-green-100 dark:border-dark-border">
                    {booking.pickupAddress}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Adventure Tour details */}
          <div className="card p-5 border border-green-100 dark:border-dark-border space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Adventure Tour</h3>
            <div className="space-y-3 text-xs">
              <p className="text-sm font-extrabold text-green-900 dark:text-green-300">{adv.title}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-bold text-gray-400">Scheduled Date</p>
                  <p className="text-green-950 dark:text-green-100 mt-0.5">
                    {adv.startDate ? formatShortDate(adv.startDate) : 'Flexible'}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-gray-400">Participants Count</p>
                  <p className="text-green-950 dark:text-green-100 mt-0.5">{booking.paxCount} Pax</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment details */}
          <div className="card p-5 border border-green-100 dark:border-dark-border space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Payment Details</h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="font-bold text-gray-400">Total Price</p>
                  <p className="text-sm font-black text-green-950 dark:text-green-100 mt-0.5">{formatPrice(booking.totalAmount)}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-400">Payment Method</p>
                  <p className="text-green-950 dark:text-green-100 mt-0.5 uppercase">{booking.paymentMethod}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-400">Payment Status</p>
                  <span className={`badge ${
                    booking.paymentStatus === 'paid'
                      ? 'badge-easy'
                      : booking.paymentStatus === 'refunded'
                      ? 'badge-difficult'
                      : 'badge-moderate'
                  } uppercase text-[9px] mt-0.5`}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Actions */}
          <div className="flex gap-4">
            {booking.status === 'pending' && (
              <>
                <button
                  onClick={handleConfirmBooking}
                  disabled={updating}
                  className="btn btn-primary flex-1 py-3"
                >
                  Confirm booking
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={updating}
                  className="btn btn-danger flex-1 py-3"
                >
                  Cancel booking
                </button>
              </>
            )}

            {booking.status === 'confirmed' && (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={updating}
                className="btn btn-danger w-full py-3"
              >
                Cancel booking
              </button>
            )}
          </div>
        </div>

        {/* Right Column (Transport Assignment) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          {booking.status === 'cancelled' || booking.status === 'completed' ? (
            <div className="card p-6 border border-green-100 dark:border-dark-border text-center text-xs text-gray-400 py-12">
              <ShieldAlert className="w-10 h-10 mx-auto text-green-200 mb-2" />
              <p className="font-bold text-green-950 dark:text-green-100">Assignment Not Available</p>
              <p className="mt-1">
                {booking.status === 'cancelled' ? 'This booking is cancelled.' : 'This trip is completed.'}
              </p>
            </div>
          ) : (
            <div className="card border border-green-100 dark:border-dark-border p-6 space-y-4">
              <h3 className="text-sm font-bold text-green-950 dark:text-green-100 flex items-center gap-1.5 border-b border-green-50 dark:border-dark-border pb-3">
                <Car className="w-5 h-5 text-green-600" />
                <span>Assign Driver & Vehicle</span>
              </h3>

              <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
                {/* Driver */}
                <div className="space-y-1.5">
                  <label className="form-label block">Select Driver</label>
                  <select
                    className="form-select"
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    required
                  >
                    <option value="">-- Choose a driver --</option>
                    {driversList.map((drv) => (
                      <option key={drv._id} value={drv._id}>
                        {drv.name} ({drv.status === 'available' ? 'Available' : 'On Trip'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vehicle */}
                <div className="space-y-1.5">
                  <label className="form-label block">Select Vehicle</label>
                  <select
                    className="form-select"
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    required
                  >
                    <option value="">-- Choose a vehicle --</option>
                    {vehiclesList.map((veh) => (
                      <option key={veh._id} value={veh._id}>
                        {veh.type} - Plate: {veh.plateNumber} ({veh.capacity} seats)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time picker */}
                <div className="space-y-1.5">
                  <label className="form-label block">Pickup Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="form-input text-xs"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={assigning}
                  className="btn btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2"
                >
                  {assigning ? <Spinner className="w-5 h-5" /> : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>{driver ? 'Re-assign Driver & Vehicle' : 'Assign Driver & Vehicle'}</span>
                    </>
                  )}
                </button>
              </form>

              {driver && (
                <div className="mt-4 p-4 rounded-lg bg-green-50/50 dark:bg-dark-surface border border-green-100 dark:border-dark-border text-xs space-y-2">
                  <p className="font-bold text-green-800 dark:text-green-400">Current Assignment:</p>
                  <p className="text-gray-600 dark:text-gray-300">Driver: <span className="font-semibold">{driver.name}</span> ({driver.phone})</p>
                  <p className="text-gray-600 dark:text-gray-300">Vehicle: <span className="font-semibold">{vehicle?.type}</span> - Plate: <span className="font-mono">{vehicle?.plateNumber}</span></p>
                  <p className="text-gray-600 dark:text-gray-300">Pickup: <span className="font-semibold">{new Date(booking.pickupTime).toLocaleString()}</span></p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel confirm modal */}
      {showCancelModal && (
        <ConfirmModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelBooking}
          title="Cancel Booking"
          message={`Are you sure you want to cancel this booking reference: "${booking.referenceNumber}"? The hiker will be notified and slots will be restored.`}
          confirmText="Yes, Cancel Booking"
          cancelText="No, Keep It"
          loading={updating}
        />
      )}
    </div>
  );
}
