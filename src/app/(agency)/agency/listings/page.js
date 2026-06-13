'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Mountain, Calendar, Users } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatPrice, formatShortDate } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function AgencyListingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'agency')) {
      router.push('/login?redirect=/agency/listings');
    }
  }, [user, authLoading, router]);

  // Fetch listings for this agency
  // We first fetch stats to get the agency ID, then fetch adventures
  const { data: statsData } = useSWR(user ? '/api/agency/stats' : null, fetcher);
  const agencyId = statsData?.orgName ? statsData?.agencyId || '' : '';

  // Fetch adventures
  const { data, error, isLoading: adventuresLoading, mutate } = useSWR(
    user ? `/api/adventures?agencyId=all` : null, // our API returns active + inactive if requesting agency's own
    fetcher
  );

  if (authLoading || adventuresLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  const adventures = data?.adventures || [];

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/api/adventures/${deleteId}`);
      toast.success('Listing deleted successfully.');
      mutate();
      setDeleteId(null);
    } catch (err) {
      toast.error('Failed to delete listing. Please try again.');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-green-950 dark:text-green-100">My Listings</h1>
          <p className="text-xs text-gray-500">Manage and edit your adventure tour offerings.</p>
        </div>
        <Link href="/agency/listings/create" className="btn btn-primary gap-1.5 py-2.5">
          <Plus className="w-4 h-4" />
          <span>Create Listing</span>
        </Link>
      </div>

      {/* Listing Cards / Table */}
      {adventures.length > 0 ? (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-green-50/50 dark:bg-dark-surface border-b border-green-100 dark:border-dark-border text-gray-400 font-extrabold uppercase">
                  <th className="p-4 w-16 text-center">Cover</th>
                  <th className="p-4">Adventure Title</th>
                  <th className="p-4">Mountain / Spot</th>
                  <th className="p-4">Start Date</th>
                  <th className="p-4 text-right">Price</th>
                  <th className="p-4 text-center">Slots Remaining</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adventures.map((adv) => (
                  <tr key={adv._id} className="border-b border-green-50 dark:border-dark-border hover:bg-green-50/10 transition-colors">
                    <td className="p-4 text-center text-3xl select-none">{adv.image || '🏔️'}</td>
                    <td className="p-4 font-bold text-green-950 dark:text-green-100">{adv.title}</td>
                    <td className="p-4 text-gray-500">{adv.mountain || adv.location}</td>
                    <td className="p-4 whitespace-nowrap">{adv.startDate ? formatShortDate(adv.startDate) : 'Flexible'}</td>
                    <td className="p-4 text-right font-bold text-green-700 dark:text-green-400">{formatPrice(adv.price)}</td>
                    <td className="p-4 text-center font-bold">{adv.slotsRemaining} / {adv.maxSlots}</td>
                    <td className="p-4">
                      <span className={`badge ${
                        adv.status === 'active' ? 'badge-easy' : 'badge-outline'
                      } text-[9px] uppercase font-bold`}>
                        {adv.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/agency/listings/create?id=${adv._id}`}
                          className="btn btn-ghost p-1.5 hover:text-green-600 rounded"
                          title="Edit Listing"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(adv._id)}
                          className="btn btn-ghost p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-16 text-center max-w-md mx-auto space-y-4">
          <Mountain className="w-12 h-12 text-green-200 dark:text-green-800 mx-auto" />
          <h3 className="text-lg font-bold text-green-950 dark:text-green-100">No listings posted yet</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Publish your first adventure tour package and start accepting participant bookings.
          </p>
          <Link href="/agency/listings/create" className="btn btn-primary px-6 py-2.5">
            Create First Listing
          </Link>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <ConfirmModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Adventure Listing"
          message="Are you sure you want to delete this listing? Hikers will no longer be able to browse or book it. This action cannot be undone."
          confirmText="Yes, Delete Listing"
          cancelText="No, Keep It"
          loading={deleting}
        />
      )}
    </div>
  );
}
