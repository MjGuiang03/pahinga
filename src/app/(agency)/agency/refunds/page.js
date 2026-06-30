'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Wallet, Check, X } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatPrice, formatShortDate } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function AgencyRefundsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionType, setActionType] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'agency')) {
      router.push('/login?redirect=/agency/refunds');
    }
  }, [user, authLoading, router]);

  // Agency only sees their own bookings
  const { data, isLoading: bookingsLoading, mutate } = useSWR(
    user ? '/api/bookings' : null, fetcher
  );

  if (authLoading || bookingsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  const bookings = data?.bookings || [];

  const refundBookings = bookings.filter((b) => {
    if (!b.refundRequest || b.refundRequest.status === 'none') return false;
    if (activeTab === 'pending') return b.refundRequest.status === 'pending';
    return b.refundRequest.status === 'approved' || b.refundRequest.status === 'rejected';
  });

  const pendingCount = bookings.filter(b => b.refundRequest?.status === 'pending').length;

  const handleActionClick = (booking, type) => {
    setSelectedBooking(booking);
    setActionType(type);
    setRemarks('');
  };

  const handleConfirmAction = async () => {
    if (!selectedBooking || !actionType) return;
    setSubmitting(true);
    try {
      await axios.post(`/api/bookings/${selectedBooking._id}/refund`, {
        action: actionType,
        remarks: remarks || undefined,
      });
      toast.success(`Refund request ${actionType}d successfully.`);
      mutate();
      setSelectedBooking(null);
    } catch (err) {
      toast.error('Failed to process refund request.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRefundStatusBadge = (status) => {
    if (status === 'approved') return 'badge-easy';
    if (status === 'pending') return 'badge-moderate';
    return 'badge-difficult';
  };

  return (
    <div className="w-full min-w-0 p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-green-950 dark:text-white">Refund Requests</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Review cancellation claims from hikers on your adventures.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-green-100 dark:border-dark-border select-none">
        {[
          { id: 'pending', label: 'Pending Approvals', count: pendingCount },
          { id: 'resolved', label: 'Resolved Claims', count: null },
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
              <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {refundBookings.length > 0 ? (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-green-50/50 dark:bg-dark-surface border-b border-green-100 dark:border-dark-border text-gray-400 font-extrabold uppercase tracking-wider">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Adventure</th>
                  <th className="p-4">Hiker</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Requested</th>
                  {activeTab === 'resolved' && <th className="p-4">Outcome</th>}
                  {activeTab === 'pending' && <th className="p-4 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {refundBookings.map((b) => {
                  const adv = b.adventureId || {};
                  const hiker = b.hikerId || {};
                  const req = b.refundRequest || {};
                  return (
                    <tr key={b._id} className="border-b border-green-50 dark:border-dark-border hover:bg-green-50/10 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono font-bold text-green-900 dark:text-green-400 select-all">
                        {b.referenceNumber}
                      </td>
                      <td className="p-4 font-semibold text-green-950 dark:text-white truncate max-w-[150px]">
                        {adv.title}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold dark:text-white">{hiker.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{hiker.email}</p>
                      </td>
                      <td className="p-4 font-bold text-green-700 dark:text-green-400">
                        {formatPrice(req.amount)}
                      </td>
                      <td className="p-4 text-gray-500 max-w-[180px] truncate" title={req.reason}>
                        {req.reason}
                      </td>
                      <td className="p-4 whitespace-nowrap text-gray-400">
                        {req.requestedAt ? formatShortDate(req.requestedAt) : '—'}
                      </td>
                      {activeTab === 'resolved' && (
                        <td className="p-4">
                          <span className={`badge ${getRefundStatusBadge(req.status)} text-[9px] uppercase font-bold`}>
                            {req.status}
                          </span>
                          {req.remarks && (
                            <p className="text-[10px] text-gray-400 italic mt-1 truncate max-w-[140px]" title={req.remarks}>
                              &ldquo;{req.remarks}&rdquo;
                            </p>
                          )}
                        </td>
                      )}
                      {activeTab === 'pending' && (
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => handleActionClick(b, 'approve')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-800/40 cursor-pointer"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => handleActionClick(b, 'reject')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800/40 cursor-pointer"
                            >
                              <X className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-6 sm:p-10 md:p-16 text-center space-y-3">
          <Wallet className="w-10 h-10 text-green-200 dark:text-green-800 mx-auto" />
          <p className="text-sm font-bold text-green-950 dark:text-white">No refund requests</p>
          <p className="text-xs text-gray-400">
            {activeTab === 'pending' ? 'No pending claims from hikers.' : 'No resolved refund requests yet.'}
          </p>
        </div>
      )}

      {/* Confirm Modal */}
      {selectedBooking && (
        <ConfirmModal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onConfirm={handleConfirmAction}
          title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Refund Claim`}
          message={`Are you sure you want to ${actionType} the refund of ${formatPrice(selectedBooking.refundRequest?.amount)} for "${selectedBooking.hikerId?.name}"?`}
          confirmText={`Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
          cancelText="Cancel"
          loading={submitting}
        >
          <div className="mt-4 space-y-1.5 text-left text-xs">
            <label className="form-label block">Remarks</label>
            <input
              type="text"
              placeholder="e.g. Returned to GCash balance"
              className="form-input"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}



