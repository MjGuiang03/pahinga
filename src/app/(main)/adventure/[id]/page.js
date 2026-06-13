'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import axios from 'axios';
import {
  MapPin, Star, Calendar, Users, Award, ShieldCheck,
  CheckCircle, Plus, Minus, ArrowLeft, Mountain
} from 'lucide-react';
import Badge from '@/components/common/Badge';
import Spinner from '@/components/common/Spinner';
import { formatPrice, formatShortDate } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function AdventureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user } = useAuth();
  
  const [paxCount, setPaxCount] = useState(1);

  const { data, error, isLoading } = useSWR(`/api/adventures/${id}`, fetcher);
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  if (error || !data?.adventure) {
    return (
      <div className="container-main py-16 text-center">
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Failed to load adventure</h2>
        <p className="text-gray-500 mt-2">The adventure listing you are looking for might have been removed or does not exist.</p>
        <Link href="/browse" className="btn btn-primary btn-sm mt-6">
          Back to Explore
        </Link>
      </div>
    );
  }

  const { adventure, reviews } = data;
  const agency = adventure.agencyId || {};

  const handleBookClick = () => {
    if (!user) {
      toast.error('Please log in to book this adventure');
      router.push(`/login?redirect=/adventure/${id}`);
      return;
    }
    if (user.role !== 'hiker') {
      toast.error('Only hikers can book adventures');
      return;
    }
    router.push(`/hiker/book/${id}?pax=${paxCount}`);
  };

  const handleIncrement = () => {
    if (paxCount < adventure.slotsRemaining) {
      setPaxCount(paxCount + 1);
    } else {
      toast.error(`Only ${adventure.slotsRemaining} slots remaining.`);
    }
  };

  const handleDecrement = () => {
    if (paxCount > 1) {
      setPaxCount(paxCount - 1);
    }
  };

  const formattedInclusions = adventure.inclusions
    ? adventure.inclusions.split(',').map(item => item.trim())
    : [];

  const itineraryDays = adventure.itinerary
    ? adventure.itinerary.split('\n\n').map((daySection, index) => {
        const lines = daySection.split('\n');
        return {
          title: lines[0] || `Day ${index + 1}`,
          points: lines.slice(1)
        };
      })
    : [];

  return (
    <div className="container-main py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-6 select-none">
        <Link href="/" className="hover:text-green-600 no-underline">Home</Link>
        <span>&gt;</span>
        <Link href="/browse" className="hover:text-green-600 no-underline">Browse</Link>
        <span>&gt;</span>
        <span className="text-green-800 dark:text-green-200 truncate max-w-xs">{adventure.title}</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Cover Photo */}
          <div className="w-full h-[360px] bg-green-50 dark:bg-dark-surface rounded-2xl flex items-center justify-center text-7xl select-none relative overflow-hidden border border-green-100 dark:border-dark-border">
            {adventure.image ? (
              <span className="z-10">{adventure.image}</span>
            ) : (
              <Mountain className="w-24 h-24 text-green-200 dark:text-green-700 z-10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Title and Badges */}
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-green-950 dark:text-green-100 leading-tight">
              {adventure.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-green-50 dark:bg-dark-surface py-1.5 px-3 rounded-full border border-green-100 dark:border-dark-border">
                <div className="w-6 h-6 rounded-full bg-green-600 text-green-50 dark:bg-green-400 dark:text-dark-bg flex items-center justify-center text-[10px] font-bold">
                  {agency.orgName?.slice(0, 2).toUpperCase() || 'AG'}
                </div>
                <span className="text-xs font-bold text-green-900 dark:text-green-100">
                  {agency.orgName}
                </span>
                <span className="badge badge-green text-[10px] py-0.5">Verified Agency</span>
              </div>

              <Badge variant={adventure.difficulty}>{adventure.difficulty}</Badge>
              {adventure.adventureType?.map(type => (
                <span key={type} className="badge badge-outline text-[10px]">
                  {type}
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-green-50/50 dark:bg-dark-surface/50 border border-green-100 dark:border-dark-border p-4 rounded-xl text-center">
              <div className="space-y-1">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto" />
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Limit</p>
                <p className="text-sm font-bold text-green-950 dark:text-green-100">{adventure.maxSlots} Pax</p>
              </div>
              <div className="space-y-1">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400 mx-auto" />
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Rating</p>
                <p className="text-sm font-bold text-green-950 dark:text-green-100">{adventure.rating} ({adventure.reviewCount})</p>
              </div>
              <div className="space-y-1">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto" />
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Date</p>
                <p className="text-sm font-bold text-green-950 dark:text-green-100 truncate">{formatShortDate(adventure.startDate)}</p>
              </div>
              <div className="space-y-1">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto" />
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Location</p>
                <p className="text-sm font-bold text-green-950 dark:text-green-100 truncate">{adventure.location}</p>
              </div>
            </div>
          </div>

          <hr className="divider" />

          {/* Inclusions */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-green-900 dark:text-green-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span>What&apos;s included</span>
            </h3>
            {formattedInclusions.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
                {formattedInclusions.map((inc, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No specific inclusions defined.</p>
            )}
          </section>

          <hr className="divider" />

          {/* Itinerary */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-green-900 dark:text-green-100">Itinerary</h3>
            {itineraryDays.length > 0 ? (
              <div className="space-y-6 relative border-l border-green-100 dark:border-dark-border pl-6 ml-3">
                {itineraryDays.map((day, idx) => (
                  <div key={idx} className="relative">
                    {/* Timeline bullet */}
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-green-600 dark:bg-green-400 border-2 border-white dark:border-dark-bg" />
                    <h4 className="text-sm font-bold text-green-950 dark:text-green-100 mb-2">
                      {day.title}
                    </h4>
                    <ul className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                      {day.points.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No itinerary specified.</p>
            )}
          </section>

          <hr className="divider" />

          {/* Agency */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-green-900 dark:text-green-100">Meet your agency</h3>
            <div className="card p-5 border border-green-100 dark:border-dark-border flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-14 h-14 rounded-full bg-green-600 text-green-50 dark:bg-green-400 dark:text-dark-bg flex items-center justify-center font-black text-xl flex-shrink-0 select-none">
                {agency.orgName?.slice(0, 2).toUpperCase() || 'AG'}
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-base font-bold text-green-950 dark:text-green-100">
                    {agency.orgName}
                  </h4>
                  <div className="flex items-center gap-1 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{adventure.rating} Agency Rating</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {agency.description || 'No agency description provided.'}
                </p>
                <Link href={`/browse?agencyId=${agency._id}`} className="text-xs font-bold text-green-600 dark:text-green-400 hover:underline">
                  View agency profile
                </Link>
              </div>
            </div>
          </section>

          <hr className="divider" />

          {/* Reviews */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-green-900 dark:text-green-100">Reviews ({reviews?.length || 0})</h3>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((rev) => {
                  const initials = rev.hikerId?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <div key={rev._id} className="card p-4 border border-green-50 dark:border-dark-border space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {rev.hikerId?.avatar ? (
                            <img src={rev.hikerId.avatar} alt={rev.hikerId.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                              {initials}
                            </div>
                          )}
                          <div>
                            <h4 className="text-xs font-bold text-green-950 dark:text-green-100">{rev.hikerId?.name}</h4>
                            <p className="text-[10px] text-gray-400">{formatShortDate(rev.createdAt)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-200 dark:text-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No reviews yet for this adventure.</p>
            )}
          </section>
        </div>

        {/* Right Column (Sticky Booking Card) */}
        <div className="lg:col-span-4 lg:sticky lg:top-20">
          <div className="card border border-green-100 dark:border-dark-border p-6 space-y-5">
            <div>
              <p className="text-[10px] font-extrabold uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                Booking Details
              </p>
              <h2 className="text-xl font-black text-green-950 dark:text-green-100 truncate mt-1">
                {adventure.title}
              </h2>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-gray-400">Price</span>
              <div className="text-2xl font-black text-green-600 dark:text-green-400">
                {formatPrice(adventure.price)} <span className="text-xs font-medium text-gray-400">/ person</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-green-50/50 dark:bg-dark-surface p-3 rounded-lg border border-green-100 dark:border-dark-border text-xs">
              <div>
                <p className="font-bold text-green-950 dark:text-green-100">
                  {formatShortDate(adventure.startDate)}
                </p>
                <p className="text-gray-400 mt-0.5">Start Date</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-950 dark:text-green-100">
                  {adventure.slotsRemaining} slots left
                </p>
                <p className="text-gray-400 mt-0.5">Availability</p>
              </div>
            </div>

            {/* Pax Counter */}
            <div className="space-y-2">
              <label className="form-label block">Number of hikers</label>
              <div className="flex items-center justify-between border border-green-100 dark:border-dark-border rounded-lg p-2 bg-white dark:bg-dark-surface">
                <button
                  onClick={handleDecrement}
                  disabled={paxCount <= 1}
                  className="p-1.5 rounded bg-green-50 dark:bg-dark-card hover:bg-green-100 text-green-600 dark:text-green-400 disabled:opacity-40 border-none cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-extrabold text-sm text-green-950 dark:text-green-100">
                  {paxCount}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={paxCount >= adventure.slotsRemaining}
                  className="p-1.5 rounded bg-green-50 dark:bg-dark-card hover:bg-green-100 text-green-600 dark:text-green-400 disabled:opacity-40 border-none cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex justify-between items-end border-t border-green-50 dark:border-dark-border pt-4">
              <span className="text-xs text-gray-400">Total amount</span>
              <span className="text-lg font-black text-green-950 dark:text-green-100">
                {formatPrice(adventure.price * paxCount)}
              </span>
            </div>

            {/* Book Button */}
            <button
              onClick={handleBookClick}
              disabled={adventure.slotsRemaining === 0}
              className="btn btn-primary w-full py-3"
            >
              {adventure.slotsRemaining === 0 ? 'Fully Booked' : 'Book this adventure'}
            </button>

            <p className="text-[10px] text-gray-400 text-center">
              You won&apos;t be charged yet. Confirmed bookings can be tracked in your dashboard.
            </p>

            <hr className="divider" />

            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-gray-400">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{adventure.rating} ({adventure.reviewCount} verified reviews)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
