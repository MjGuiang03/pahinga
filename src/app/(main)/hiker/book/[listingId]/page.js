'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import axios from 'axios';
import {
  Compass, Check, CheckCircle, CreditCard, Wallet,
  Calendar, Users, MapPin, Map, ArrowLeft, ArrowRight
} from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { formatPrice, formatShortDate } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const fetcher = (url) => axios.get(url).then(res => res.data);

function BookingFlowContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { listingId } = params;
  const { user } = useAuth();

  const [step, setStep] = useState(1);

  // Step 1 States
  const [paxCount, setPaxCount] = useState(1);
  const [pickupNeeded, setPickupNeeded] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');

  // Step 2 States
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [gcashReference, setGcashReference] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Step 3 States
  const [createdBooking, setCreatedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load initial pax from query parameter if available
  useEffect(() => {
    const p = searchParams.get('pax');
    if (p) {
      setPaxCount(Number(p));
    }
  }, [searchParams]);

  // Fetch listing details
  const { data, error, isLoading: adventureLoading } = useSWR(`/api/adventures/${listingId}`, fetcher);

  if (adventureLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="w-10 h-10" />
      </div>
    );
  }

  if (error || !data?.adventure) {
    return (
      <div className="text-center py-12">
        <h2 className="text-sm font-bold text-red-700 dark:text-red-400">Failed to load adventure details</h2>
        <Link href="/browse" className="btn btn-primary btn-sm mt-6">
          Back to Explore
        </Link>
      </div>
    );
  }

  const adventure = data.adventure;
  const agency = adventure.agencyId || {};
  const totalAmount = adventure.price * paxCount;

  // Handle Step 1 Submit
  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    if (paxCount > adventure.slotsRemaining) {
      toast.error(`Not enough slots. Only ${adventure.slotsRemaining} left.`);
      return;
    }
    if (pickupNeeded && !pickupAddress.trim()) {
      toast.error('Please specify a pickup address.');
      return;
    }
    setStep(2);
  };

  // Handle Step 2 (Submit Booking)
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'gcash' && !gcashReference.trim()) {
      toast.error('Please enter GCash Reference Number.');
      return;
    }
    if (paymentMethod === 'card' && (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim())) {
      toast.error('Please fill in card details.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        adventureId: listingId,
        paxCount,
        pickupNeeded,
        pickupAddress: pickupNeeded ? pickupAddress : null,
        paymentMethod,
        gcashReference: paymentMethod === 'gcash' ? gcashReference : null,
        cardNumber: paymentMethod === 'card' ? cardNumber : null,
      };

      const res = await axios.post('/api/bookings', payload);
      setCreatedBooking(res.data.booking);
      setStep(3);
      toast.success('Adventure booked successfully!');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Booking failed. Please try again.';
      toast.error(errMsg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Step Indicator */}
      <div className="mb-10 select-none">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Details' },
            { num: 2, label: 'Payment' },
            { num: 3, label: 'Confirmation' },
          ].map((s) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step === s.num
                      ? 'bg-green-600 text-green-50 dark:bg-green-400 dark:text-dark-bg font-extrabold'
                      : step > s.num
                      ? 'bg-green-100 text-green-600 dark:bg-dark-surface dark:text-green-400'
                      : 'bg-gray-100 text-gray-400 dark:bg-dark-surface dark:text-gray-600'
                  }`}
                >
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    step === s.num
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {s.num < 3 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    step > s.num ? 'bg-green-600 dark:bg-green-400' : 'bg-gray-100 dark:bg-dark-border'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* STEP 1: Details */}
      {step === 1 && (
        <form onSubmit={handleDetailsSubmit} className="space-y-6">
          <div className="card p-5 border border-green-100 dark:border-dark-border space-y-4">
            <h3 className="text-base font-bold text-green-950 dark:text-green-100">Trip Summary</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p className="font-extrabold text-green-800 dark:text-green-300 text-base">{adventure.title}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-4 h-4 text-green-600" />
                <span>{formatShortDate(adventure.startDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Compass className="w-4 h-4 text-green-600" />
                <span>Verified Agency: {agency.orgName}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="form-label block">Number of participants</label>
            <select
              className="form-select"
              value={paxCount}
              onChange={(e) => setPaxCount(Number(e.target.value))}
            >
              {[...Array(adventure.slotsRemaining || 1)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Hiker{i > 0 ? 's' : ''}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400">Slots remaining: {adventure.slotsRemaining}</p>
          </div>

          <div className="space-y-4">
            <label className="form-label block">Transportation Pickup</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setPickupNeeded(true)}
                className={`btn flex-1 py-3 ${pickupNeeded ? 'btn-primary' : 'btn-secondary'}`}
              >
                Yes, I need pickup
              </button>
              <button
                type="button"
                onClick={() => setPickupNeeded(false)}
                className={`btn flex-1 py-3 ${!pickupNeeded ? 'btn-primary' : 'btn-secondary'}`}
              >
                No, I&apos;ll go myself
              </button>
            </div>

            {pickupNeeded && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="form-label block">Pickup Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-green-600 dark:text-green-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter complete address for pickup"
                    className="form-input pl-10"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-gray-400">Coordinators will pick you up at this location on the day of the trip.</p>
              </div>
            )}
          </div>

          <hr className="divider" />

          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-400">Total Price</p>
              <p className="text-2xl font-black text-green-950 dark:text-green-100">{formatPrice(totalAmount)}</p>
            </div>
            <button type="submit" className="btn btn-primary px-8 py-3 gap-2">
              <span>Continue to payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Payment */}
      {step === 2 && (
        <form onSubmit={handlePaymentSubmit} className="space-y-6">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-green-600 border-none bg-transparent cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <div className="card p-5 border border-green-100 dark:border-dark-border space-y-3 bg-green-50/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Booking Summary</h3>
            <div className="space-y-1 text-sm">
              <p className="font-extrabold text-green-900 dark:text-green-100">{adventure.title}</p>
              <p className="text-xs text-gray-500">Hikers: {paxCount} pax</p>
              {pickupNeeded && <p className="text-xs text-gray-500 truncate">Pickup: {pickupAddress}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <label className="form-label block">Select Payment Method</label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'gcash', label: 'GCash e-Wallet', icon: Wallet, desc: 'Instantly pay using GCash app' },
                { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, or JCB' },
                { id: 'arrival', label: 'Pay on Arrival', icon: Map, desc: 'Pay cash to guide/driver at jump-off' },
              ].map((method) => {
                const Icon = method.icon;
                return (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`card p-4 flex items-start gap-4 border cursor-pointer select-none transition-all ${
                      paymentMethod === method.id
                        ? 'border-green-600 bg-green-50/10 dark:border-green-400'
                        : 'border-green-100 dark:border-dark-border hover:border-green-200'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full border border-green-300 dark:border-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {paymentMethod === method.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-green-600 dark:bg-green-400" />
                      )}
                    </div>
                    <Icon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-green-950 dark:text-green-100">{method.label}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{method.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {paymentMethod === 'gcash' && (
            <div className="card p-5 border border-green-100 dark:border-dark-border space-y-4 animate-fadeIn">
              <div className="bg-green-50 dark:bg-dark-surface p-4 rounded-xl text-center space-y-1">
                <p className="text-xs text-gray-500">Send exactly <span className="font-extrabold text-green-900 dark:text-green-100">{formatPrice(totalAmount)}</span> to</p>
                <p className="text-base font-extrabold text-green-600 dark:text-green-400">0917-123-PAHI (7244)</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">PAHINGA OUTDOORS INC.</p>
              </div>

              <div className="space-y-1.5">
                <label className="form-label block">GCash Reference Number</label>
                <input
                  type="text"
                  required
                  placeholder="13-digit transaction ref number"
                  className="form-input"
                  value={gcashReference}
                  onChange={(e) => setGcashReference(e.target.value)}
                />
              </div>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="card p-5 border border-green-100 dark:border-dark-border space-y-4 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="form-label block">Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="4111 2222 3333 4444"
                  className="form-input"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="form-label block">Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    className="form-input"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="form-label block">CVC / CVV</label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    className="form-input"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'arrival' && (
            <div className="card p-4 border border-green-100 dark:border-dark-border bg-amber-50/10 text-xs text-amber-700 dark:text-amber-400 animate-fadeIn">
              No online payment is required right now. You will pay the total amount of {formatPrice(totalAmount)} directly to the guide or assigned coordinator upon arrival at the hike jump-off location.
            </div>
          )}

          <hr className="divider" />

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full py-3 gap-2"
          >
            {submitting ? (
              <Spinner className="w-5 h-5" />
            ) : (
              <span>Confirm and pay {formatPrice(totalAmount)}</span>
            )}
          </button>
        </form>
      )}

      {/* STEP 3: Confirmation */}
      {step === 3 && createdBooking && (
        <div className="text-center space-y-8 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-dark-surface flex items-center justify-center mx-auto text-green-600 dark:text-green-400 shadow-lg">
            <CheckCircle className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-green-950 dark:text-green-100">Booking Confirmed!</h1>
            <p className="text-xs text-gray-500">Your adventure is secured. Get ready to escape!</p>
          </div>

          <div className="card border border-green-100 dark:border-dark-border p-6 text-left space-y-4 bg-white dark:bg-dark-card">
            <div className="flex justify-between items-center border-b border-green-50 dark:border-dark-border pb-3">
              <span className="text-xs text-gray-400">Reference Number</span>
              <span className="text-sm font-extrabold text-green-900 dark:text-green-100 select-all">
                {createdBooking.referenceNumber}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Adventure</p>
                <p className="text-sm font-bold text-green-950 dark:text-green-100">{adventure.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Date</p>
                  <p className="text-xs font-semibold text-green-900 dark:text-green-100">
                    {formatShortDate(adventure.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Hikers</p>
                  <p className="text-xs font-semibold text-green-900 dark:text-green-100">
                    {createdBooking.paxCount} Pax
                  </p>
                </div>
              </div>

              {createdBooking.pickupNeeded && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Pickup Location</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {createdBooking.pickupAddress}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="card border border-green-100 dark:border-dark-border p-5 text-left bg-green-50/10 space-y-2">
            <h4 className="text-xs font-extrabold uppercase text-green-600 dark:text-green-400">Transportation Info</h4>
            <p className="text-xs text-gray-500">
              Your pickup details will appear here once the agency assigns a driver. You can check your booking detail page later for real-time status updates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/hiker/bookings`} className="btn btn-primary flex-1 py-3">
              View my booking
            </Link>
            <Link href="/browse" className="btn btn-secondary flex-1 py-3">
              Browse more adventures
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default function BookingFlowPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { listingId } = params;

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please log in to proceed.');
      router.push(`/login?redirect=/hiker/book/${listingId}`);
    }
  }, [user, authLoading, router, listingId]);

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto px-6 py-10 w-full flex-1 flex flex-col justify-center">
      <Suspense fallback={
        <div className="flex justify-center py-20">
          <Spinner className="w-10 h-10" />
        </div>
      }>
        <BookingFlowContent />
      </Suspense>
    </div>
  );
}
