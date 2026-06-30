'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { Star, Trash2, ShieldAlert, HeartCrack } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatShortDate } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function AdminReviewsPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'flagged'
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login?redirect=/admin/reviews');
    }
  }, [user, authLoading]);

  // Fetch all reviews
  const { data, error, isLoading: reviewsLoading, mutate } = useSWR(
    user ? '/api/reviews' : null,
    fetcher
  );

  if (authLoading || reviewsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  const reviews = data?.reviews || [];

  // Filter reviews
  const filteredReviews = reviews.filter((rev) => {
    if (activeTab === 'flagged') {
      return rev.flagged === true;
    }
    return true;
  });

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await axios.delete(`/api/reviews/${deleteId}`);
      toast.success('Review deleted successfully from platform.');
      mutate();
      setDeleteId(null);
    } catch (err) {
      toast.error('Failed to delete review.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-w-0 p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-green-950 dark:text-green-100">Reviews Moderation</h1>
        <p className="text-xs text-gray-500">Monitor hiker feedback ratings and purge flagged inappropriate comments.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-green-100 dark:border-dark-border select-none">
        {[
          { id: 'all', label: 'All Reviews' },
          { id: 'flagged', label: 'Flagged Content' },
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
      {filteredReviews.length > 0 ? (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-green-50/50 dark:bg-dark-surface border-b border-green-100 dark:border-dark-border text-gray-400 font-extrabold uppercase">
                  <th className="p-4 w-24">Rating</th>
                  <th className="p-4">Hiker Name</th>
                  <th className="p-4">Agency Partner</th>
                  <th className="p-4">Adventure Tour</th>
                  <th className="p-4">Comment</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((rev) => {
                  const hiker = rev.hikerId || {};
                  const agency = rev.agencyId || {};
                  const adv = rev.adventureId || {};

                  return (
                    <tr key={rev._id} className="border-b border-green-50 dark:border-dark-border hover:bg-green-50/10 transition-colors">
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
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold">{hiker.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{hiker.email}</p>
                      </td>
                      <td className="p-4 font-semibold">{agency.orgName}</td>
                      <td className="p-4 font-medium max-w-[120px] truncate" title={adv.title}>
                        {adv.title}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300 max-w-[200px] truncate" title={rev.comment}>
                        &ldquo;{rev.comment}&rdquo;
                      </td>
                      <td className="p-4 whitespace-nowrap">{rev.createdAt ? formatShortDate(rev.createdAt) : 'N/A'}</td>
                      <td className="p-4">
                        {rev.flagged ? (
                          <span className="badge badge-difficult text-[9px] uppercase font-bold inline-flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Flagged</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[10px]">Normal</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDeleteClick(rev._id)}
                          className="btn btn-ghost p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded border border-red-200/50"
                          title="Purge Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        <div className="w-full min-w-0 bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-6 sm:p-10 md:p-16 text-center max-w-md mx-auto space-y-4">
          <HeartCrack className="w-12 h-12 text-green-200 dark:text-green-800 mx-auto" />
          <h3 className="text-lg font-bold text-green-950 dark:text-green-100">No reviews found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            There are no reviews matching the active tab filter.
          </p>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <ConfirmModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleConfirmDelete}
          title="Purge Hiker Review"
          message="Are you sure you want to permanently delete this hiker review comment from the platform? This cannot be undone."
          confirmText="Yes, Purge Review"
          cancelText="No, Keep It"
          loading={submitting}
        />
      )}
    </div>
  );
}



