'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import axios from 'axios';
import { Star, ArrowLeft } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { formatShortDate } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function LeaveReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { bookingId } = params;
  const { user, isLoading: authLoading } = useAuth();
  
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/hiker/review/${bookingId}`);
    }
  }, [user, authLoading, router, bookingId]);

  const { data, error, isLoading: bookingLoading } = useSWR(
    bookingId ? `/api/bookings/${bookingId}` : null,
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
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Failed to load booking</h2>
        <button onClick={() => router.push('/hiker/bookings')} className="btn btn-primary btn-sm mt-6">
          Back to Bookings
        </button>
      </div>
    );
  }

  const booking = data.booking;
  const adv = booking.adventureId || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write a comment for your review.');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`/api/bookings/${bookingId}/review`, { rating, comment });
      toast.success('Thank you for sharing your experience!');
      router.push('/hiker/bookings');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to submit review.';
      toast.error(errMsg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[500px] mx-auto px-6 py-12 w-full flex-1 flex flex-col justify-center">
      <button
        onClick={() => router.push('/hiker/bookings')}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-green-600 border-none bg-transparent cursor-pointer mb-6 self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Bookings</span>
      </button>

      <div className="card border border-green-100 dark:border-dark-border p-6 space-y-6 bg-white dark:bg-dark-card">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-black text-green-950 dark:text-green-100">Leave a Review</h1>
          <p className="text-xs text-gray-500">How was your adventure escape with our local partner?</p>
        </div>

        {/* Small trip details banner */}
        <div className="bg-green-50/50 dark:bg-dark-surface p-4 rounded-xl flex gap-3 items-center">
          <div className="w-10 h-10 rounded bg-green-500 text-white flex items-center justify-center font-bold text-sm select-none flex-shrink-0">
            🏔️
          </div>
          <div className="text-left text-xs">
            <p className="font-extrabold text-green-950 dark:text-green-100 truncate">{adv.title}</p>
            <p className="text-gray-400 mt-0.5">Completed on {adv.startDate ? formatShortDate(adv.startDate) : ''}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interactive Star Rating Selector */}
          <div className="space-y-2 text-center">
            <label className="form-label block text-xs">Rate your experience</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((starNum) => (
                <button
                  type="button"
                  key={starNum}
                  onClick={() => setRating(starNum)}
                  onMouseEnter={() => setHoverRating(starNum)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 hover:scale-110 transition-transform bg-transparent border-none cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= starNum
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200 dark:text-gray-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Below Average' : 'Poor'}
            </p>
          </div>

          {/* Comment text area */}
          <div className="space-y-1.5">
            <label className="form-label block">Tell other hikers about your experience</label>
            <textarea
              required
              rows={4}
              placeholder="How was the guide, trail organization, van pickup, and overall vibe? Share details..."
              className="form-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full py-3"
          >
            {submitting ? <Spinner className="w-5 h-5 mx-auto" /> : <span>Submit review</span>}
          </button>
        </form>
      </div>
    </div>
  );
}
