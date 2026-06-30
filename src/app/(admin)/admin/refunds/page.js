'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { Wallet, Check, X, ShieldAlert, Calendar } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatPrice, formatShortDate } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function AdminRefundsPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'resolved'
  const [selectedBooking, setSelectedBooking] = useState(null); // Booking object
  const [actionType, setActionType] = useState(''); // 'approve' | 'reject'
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login?redirect=/admin/refunds');
    }
  }, [user, authLoading]);

  // Fetch bookings (all for admin)
  const { data, error, isLoading: bookingsLoading, mutate } = useSWR(
    user ? '/api/bookings' : null,
    fetcher
  );

  if (authLoading || bookingsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  const bookings = data?.bookings || [];

  // Filter bookings that have a refund request
  const refundBookings = bookings.filter((b) => {
    if (!b.refundRequest || b.refundRequest.status === 'none') return false;
    
    if (activeTab === 'pending') {
      return b.refundRequest.status === 'pending';
    } else {
      return b.refundRequest.status === 'approved' || b.refundRequest.status === 'rejected';
    }
  });

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
      console.error(err);
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
        <h1 className="text-2xl font-black text-green-950 dark:text-green-100">Refund Requests</h1>
        <p className="text-xs text-gray-500">Moderate cancel-trip claims, examine reasons, and issue financial reversals.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-green-100 dark:border-dark-border select-none">
        {[
          { id: 'pending', label: 'Pending Approvals' },
          { id: 'resolved', label: 'Resolved Claims' },
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
      {refundBookings.length > 0 ? (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-green-50/50 dark:bg-dark-surface border-b border-green-100 dark:border-dark-border text-gray-400 font-extrabold uppercase">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Adventure Tour</th>
                  <th className="p-4">Hiker / Client</th>
                  <th className="p-4">Organized By</th>
                  <th className="p-4">Claim Amount</th>
                  <th className="p-4">Refund Reason</th>
                  {activeTab === 'resolved' && <th className="p-4">Outcome</th>}
                  {activeTab === 'pending' && <th className="p-4 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {refundBookings.map((b) => {
                  const adv = b.adventureId || {};
                  const hiker = b.hikerId || {};
                  const agency = b.agencyId || {};
                  const req = b.refundRequest || {};

                  return (
                    <tr key={b._id} className="border-b border-green-50 dark:border-dark-border hover:bg-green-50/10 transition-colors">
                      <td className="p-4 font-mono font-bold text-green-900 dark:text-green-400 select-all">{b.referenceNumber}</td>
                      <td className="p-4 font-semibold text-green-950 dark:text-green-100 truncate max-w-[150px]">{adv.title}</td>
                      <td className="p-4">
                        <p className="font-semibold">{hiker.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{hiker.phone || hiker.email}</p>
                      </td>
                      <td className="p-4 font-medium text-gray-600 dark:text-gray-450">{agency.orgName}</td>
                      <td className="p-4 font-bold text-green-700 dark:text-green-400">{formatPrice(req.amount)}</td>
                      <td className="p-4 text-gray-500 max-w-[200px] truncate" title={req.reason}>
                        {req.reason}
                      </td>
                      {activeTab === 'resolved' && (
                        <td className="p-4">
                          <span className={`badge ${getRefundStatusBadge(req.status)} text-[9px] uppercase font-bold`}>
                            {req.status}
                          </span>
                          {req.remarks && (
                            <p className="text-[10px] text-gray-400 italic mt-1 truncate max-w-[150px]" title={req.remarks}>
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
                              className="btn btn-ghost p-1 bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200"
                              title="Approve Refund"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleActionClick(b, 'reject')}
                              className="btn btn-ghost p-1 bg-red-50 hover:bg-red-100 text-red-700 rounded border border-red-200"
                              title="Reject Refund"
                            >
                              <X className="w-3.5 h-3.5" />
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
        <div className="w-full min-w-0 bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-6 sm:p-10 md:p-16 text-center max-w-md mx-auto space-y-4">
          <Wallet className="w-12 h-12 text-green-200 dark:text-green-800 mx-auto" />
          <h3 className="text-lg font-bold text-green-950 dark:text-green-100">No refund requests</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            There are no active hiker cancellation claims waiting in this tab.
          </p>
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedBooking && (
        <ConfirmModal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onConfirm={handleConfirmAction}
          title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Refund Claim`}
          message={`Are you sure you want to ${actionType} the refund of ${formatPrice(selectedBooking.refundRequest?.amount)} for client "${selectedBooking.hikerId?.name}"?`}
          confirmText={`Confirm ${actionType}`}
          cancelText="Cancel"
          loading={submitting}
        >
          <div className="mt-4 space-y-1.5 text-left text-xs">
            <label className="form-label block">Remarks / Refund Details</label>
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



