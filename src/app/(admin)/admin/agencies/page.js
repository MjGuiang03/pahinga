'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Check, X, ShieldAlert, ChevronRight } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatPrice } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function AdminAgenciesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [actionAgency, setActionAgency] = useState(null);
  const [actionType, setActionType]     = useState('');
  const [actionReason, setActionReason] = useState('');
  const [submitting, setSubmitting]     = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login?redirect=/admin/agencies');
    }
  }, [user, authLoading, router]);

  const { data, isLoading, mutate } = useSWR(user ? '/api/admin/agencies' : null, fetcher);

  if (authLoading || isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[50vh]"><Spinner className="w-12 h-12" /></div>;
  }

  const agencies = data?.agencies || [];

  const handleActionClick = (e, agency, type) => {
    e.stopPropagation(); // don't navigate to detail page
    setActionAgency(agency);
    setActionType(type);
    setActionReason('');
  };

  const handleConfirmAction = async () => {
    if (!actionAgency || !actionType) return;
    setSubmitting(true);
    try {
      await axios.post(`/api/admin/agencies/${actionAgency._id}/approve`, {
        action: actionType,
        reason: actionReason || undefined,
      });
      toast.success('Agency status updated.');
      mutate();
      setActionAgency(null);
    } catch {
      toast.error('Failed to update agency status.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') return 'badge-easy';
    if (status === 'pending')  return 'badge-moderate';
    return 'badge-difficult';
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-green-950 dark:text-white">Agencies Moderation</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Approve or suspend outdoor operators. Click a row to view full agency profile and team.
        </p>
      </div>

      {agencies.length > 0 ? (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-green-50/50 dark:bg-dark-surface border-b border-green-100 dark:border-dark-border text-gray-400 font-extrabold uppercase">
                  <th className="p-4">Logo</th>
                  <th className="p-4">Agency Name</th>
                  <th className="p-4">Rep Name</th>
                  <th className="p-4">Business Email</th>
                  <th className="p-4 text-center">Hikes</th>
                  <th className="p-4 text-center">Bookings</th>
                  <th className="p-4 text-right">Revenue</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agencies.map((agency) => (
                  <tr
                    key={agency._id}
                    onClick={() => router.push(`/admin/agencies/${agency._id}`)}
                    className="border-b border-green-50 dark:border-dark-border hover:bg-green-50/30 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="p-4">
                      <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-dark-surface flex items-center justify-center font-bold text-xs text-green-600">
                        {agency.orgName?.slice(0, 2).toUpperCase()}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-extrabold text-green-950 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {agency.orgName}
                      </p>
                      {agency.businessNumber && (
                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Reg: {agency.businessNumber}</p>
                      )}
                    </td>
                    <td className="p-4 font-semibold">{agency.contactPerson || agency.userId?.name}</td>
                    <td className="p-4 font-mono text-gray-500 dark:text-gray-400">{agency.businessEmail || agency.userId?.email}</td>
                    <td className="p-4 text-center font-bold">{agency.listingCount}</td>
                    <td className="p-4 text-center font-bold">{agency.bookingCount}</td>
                    <td className="p-4 text-right font-bold text-green-700 dark:text-green-400">{formatPrice(agency.totalRevenue)}</td>
                    <td className="p-4">
                      <span className={`badge ${getStatusBadge(agency.status)} text-[9px] uppercase font-bold`}>
                        {agency.status}
                      </span>
                    </td>
                    <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-center items-center gap-1.5">
                        {agency.status === 'pending' && (
                          <>
                            <button onClick={e => handleActionClick(e, agency, 'approve')}
                              className="btn btn-ghost p-1 bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200" title="Approve">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={e => handleActionClick(e, agency, 'reject')}
                              className="btn btn-ghost p-1 bg-red-50 hover:bg-red-100 text-red-700 rounded border border-red-200" title="Reject">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {agency.status === 'approved' && (
                          <button onClick={e => handleActionClick(e, agency, 'suspend')}
                            className="btn btn-ghost p-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded border border-amber-200" title="Suspend">
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {agency.status === 'rejected' && (
                          <button onClick={e => handleActionClick(e, agency, 'restore')}
                            className="btn btn-ghost p-1 bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200" title="Restore">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <Link href={`/admin/agencies/${agency._id}`} onClick={e => e.stopPropagation()}
                          className="btn btn-ghost p-1 bg-gray-50 hover:bg-gray-100 dark:bg-dark-surface dark:hover:bg-dark-border text-gray-500 rounded border border-gray-200 dark:border-dark-border" title="View Details">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-4 py-2.5 text-[10px] text-gray-400 border-t border-green-50 dark:border-dark-border">
            Click any row to view full agency profile and team →
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-16 text-center max-w-md mx-auto space-y-4">
          <Building2 className="w-12 h-12 text-green-200 dark:text-green-800 mx-auto" />
          <h3 className="text-lg font-bold text-green-950 dark:text-white">No agencies registered</h3>
          <p className="text-xs text-gray-500">No local guide agencies have registered yet.</p>
        </div>
      )}

      {/* Confirm Modal */}
      {actionAgency && (
        <ConfirmModal
          isOpen={!!actionAgency}
          onClose={() => setActionAgency(null)}
          onConfirm={handleConfirmAction}
          title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Agency`}
          message={`Are you sure you want to ${actionType} "${actionAgency.orgName}"?`}
          confirmText={`Confirm ${actionType}`}
          cancelText="Cancel"
          loading={submitting}
        >
          {(actionType === 'reject' || actionType === 'suspend') && (
            <div className="mt-4 space-y-1.5 text-left text-xs">
              <label className="form-label block">Reason for {actionType}</label>
              <input type="text" placeholder="e.g. Unverifiable registration credentials"
                className="form-input" value={actionReason}
                onChange={e => setActionReason(e.target.value)} />
            </div>
          )}
        </ConfirmModal>
      )}
    </div>
  );
}
