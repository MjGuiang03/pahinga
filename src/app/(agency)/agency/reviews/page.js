'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Star, Trash2, ShieldAlert, HeartCrack } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatShortDate } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function AgencyReviewsModerationPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'agency')) {
      router.push('/login?redirect=/agency/reviews');
    }
  }, [user, authLoading, router]);

  // Agency reviews page already exists — this one is the moderation view
  // Fetch all reviews for this agency
  const { data, isLoading: reviewsLoading, mutate } = useSWR(
    user ? '/api/reviews' : null, fetcher
  );

  if (authLoading || reviewsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  const allReviews = data?.reviews || [];

  // Summary stats
  const flaggedCount = allReviews.filter(r => r.flagged).length;
  const avgRating = allReviews.length
    ? (allReviews.reduce((s, r) => s + (r.rating || 0), 0) / allReviews.length).toFixed(1)
    : '—';

  const filtered = allReviews.filter((rev) => {
    if (activeTab === 'flagged') return rev.flagged === true;
    return true;
  });

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await axios.delete(`/api/reviews/${deleteId}`);
      toast.success('Review removed successfully.');
      mutate();
      setDeleteId(null);
    } catch (err) {
      toast.error('Failed to delete review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-green-950 dark:text-white">Reviews Moderation</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor hiker feedback on your adventures and remove inappropriate content.
          </p>
        </div>
        {/* Quick stats */}
        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2 rounded-xl bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border">
            <p className="text-lg font-black text-green-950 dark:text-white">{allReviews.length}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border">
            <p className="text-lg font-black text-amber-500">{avgRating}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Avg Rating</p>
          </div>
          {flaggedCount > 0 && (
            <div className="text-center px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40">
              <p className="text-lg font-black text-red-600 dark:text-red-400">{flaggedCount}</p>
              <p className="text-[10px] text-red-400 uppercase tracking-wider">Flagged</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-green-100 dark:border-dark-border select-none">
        {[
          { id: 'all', label: 'All Reviews', count: allReviews.length },
          { id: 'flagged', label: 'Flagged Content', count: flaggedCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-colors -mb-px cursor-pointer bg-transparent ${
              activeTab === tab.id
                ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                : 'border-transparent text-gray-400 hover:text-green-600 hover:border-green-100'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                tab.id === 'flagged'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-dark-surface text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-green-50/50 dark:bg-dark-surface border-b border-green-100 dark:border-dark-border text-gray-400 font-extrabold uppercase tracking-wider">
                  <th className="p-4 w-28">Rating</th>
                  <th className="p-4">Hiker</th>
                  <th className="p-4">Adventure</th>
                  <th className="p-4">Comment</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rev) => {
                  const hiker = rev.hikerId || {};
                  const adv = rev.adventureId || {};
                  return (
                    <tr key={rev._id} className="border-b border-green-50 dark:border-dark-border hover:bg-green-50/10 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4">
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
                          <span className="ml-1 font-bold text-gray-600 dark:text-gray-400">{rev.rating}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold dark:text-white">{hiker.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{hiker.email}</p>
                      </td>
                      <td className="p-4 font-medium text-green-950 dark:text-white max-w-[120px] truncate" title={adv.title}>
                        {adv.title}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300 max-w-[200px] truncate" title={rev.comment}>
                        &ldquo;{rev.comment}&rdquo;
                      </td>
                      <td className="p-4 whitespace-nowrap text-gray-400">
                        {rev.createdAt ? formatShortDate(rev.createdAt) : '—'}
                      </td>
                      <td className="p-4">
                        {rev.flagged ? (
                          <span className="badge badge-difficult text-[9px] uppercase font-bold inline-flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Flagged
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[10px]">Normal</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setDeleteId(rev._id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800/40 cursor-pointer transition-colors"
                          title="Remove review"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-16 text-center space-y-3">
          <HeartCrack className="w-10 h-10 text-green-200 dark:text-green-800 mx-auto" />
          <p className="text-sm font-bold text-green-950 dark:text-white">No reviews found</p>
          <p className="text-xs text-gray-400">
            {activeTab === 'flagged' ? 'No flagged reviews on your adventures.' : 'Hikers haven\'t left reviews yet.'}
          </p>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <ConfirmModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleConfirmDelete}
          title="Remove Review"
          message="Are you sure you want to permanently remove this review? This action cannot be undone."
          confirmText="Yes, Remove"
          cancelText="Cancel"
          loading={submitting}
        />
      )}
    </div>
  );
}
