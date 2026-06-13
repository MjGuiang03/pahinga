'use client';

import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  Building2, ArrowLeft, Mail, Phone, Calendar, Wallet,
  Mountain, Hash, Car, BadgeCheck, AlertCircle, CheckCircle2,
  ShieldAlert, Check, X, Users, Star,
} from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatPrice, formatShortDate } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const fetcher = (url) => axios.get(url).then(res => res.data);

const STATUS_BADGE = {
  approved: 'badge-easy',
  pending:  'badge-moderate',
  rejected: 'badge-difficult',
};

const DRIVER_STATUS = {
  available: { label: 'Available', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  on_trip:   { label: 'On Trip',   cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  inactive:  { label: 'Inactive',  cls: 'bg-gray-100  text-gray-500  dark:bg-dark-surface dark:text-gray-400' },
};

function InfoRow({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="flex items-start gap-4 py-3.5 border-b border-green-50 dark:border-dark-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-dark-surface flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-green-600 dark:text-green-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
        <p className={`text-sm font-semibold text-green-950 dark:text-white mt-0.5 ${mono ? 'font-mono' : ''}`}>
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

export default function AgencyDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [actionType, setActionType]   = useState('');
  const [actionReason, setActionReason] = useState('');
  const [submitting, setSubmitting]   = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const { data, isLoading, mutate } = useSWR(
    user && id ? `/api/admin/agencies/${id}` : null,
    fetcher,
  );

  const handleConfirmAction = async () => {
    setSubmitting(true);
    try {
      await axios.post(`/api/admin/agencies/${id}/approve`, {
        action: actionType,
        reason: actionReason || undefined,
      });
      toast.success('Agency status updated.');
      setActionType('');
      mutate();
    } catch {
      toast.error('Failed to update agency status.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  if (!data?.agency) {
    return (
      <div className="p-8 text-center text-gray-400">
        <Building2 className="w-12 h-12 mx-auto mb-3 text-green-200 dark:text-green-800" />
        <p className="font-bold">Agency not found.</p>
        <Link href="/admin/agencies" className="text-xs text-green-600 hover:underline mt-2 inline-block">← Back to Agencies</Link>
      </div>
    );
  }

  const { agency, drivers, stats } = data;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">

      {/* Back + header */}
      <div className="space-y-4">
        <Link
          href="/admin/agencies"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors no-underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Agencies
        </Link>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-600 dark:bg-green-500 text-white flex items-center justify-center text-xl font-black shadow-sm">
              {agency.orgName?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-green-950 dark:text-white">{agency.orgName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${STATUS_BADGE[agency.status] || 'badge-moderate'} text-[10px] uppercase font-bold`}>
                  {agency.status}
                </span>
                {agency.approvedAt && (
                  <span className="text-[10px] text-gray-400">Approved {formatShortDate(agency.approvedAt)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            {agency.status === 'pending' && (
              <>
                <button onClick={() => { setActionReason(''); setActionType('approve'); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold border-none cursor-pointer transition-colors">
                  <Check className="w-4 h-4" /> Approve Agency
                </button>
                <button onClick={() => { setActionReason(''); setActionType('reject'); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold border-none cursor-pointer transition-colors">
                  <X className="w-4 h-4" /> Reject Agency
                </button>
              </>
            )}
            {agency.status === 'approved' && (
              <button onClick={() => { setActionReason(''); setActionType('suspend'); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold border-none cursor-pointer transition-colors">
                <ShieldAlert className="w-4 h-4" /> Suspend Agency
              </button>
            )}
            {agency.status === 'rejected' && (
              <button onClick={() => { setActionReason(''); setActionType('restore'); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold border-none cursor-pointer transition-colors">
                <Check className="w-4 h-4" /> Restore Agency
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rejection notice */}
      {agency.rejectedReason && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">Rejection Reason</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{agency.rejectedReason}</p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { icon: Mountain,      label: 'Listings',  value: stats.listings },
          { icon: Calendar,      label: 'Bookings',  value: stats.bookings },
          { icon: Wallet,        label: 'Revenue',   value: formatPrice(stats.totalRevenue) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-dark-surface flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xl font-black text-green-950 dark:text-white">{value}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Agency info */}
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-green-50 dark:border-dark-border bg-green-50/30 dark:bg-dark-surface/40">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Agency Information</p>
          </div>
          <div className="px-6">
            <InfoRow icon={Building2}  label="Organization Name" value={agency.orgName} />
            <InfoRow icon={BadgeCheck} label="Contact Person"    value={agency.contactPerson} />
            <InfoRow icon={Mail}       label="Email"             value={agency.userId?.email} mono />
            <InfoRow icon={Phone}      label="Phone"             value={agency.userId?.phone} />
            <InfoRow icon={Calendar}   label="Registered On"     value={agency.createdAt ? formatShortDate(agency.createdAt) : '—'} />
            {agency.description && (
              <div className="py-3.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Description</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{agency.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Drivers / Coordinators */}
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-green-50 dark:border-dark-border bg-green-50/30 dark:bg-dark-surface/40 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Drivers / Coordinators</p>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              {drivers.length} members
            </span>
          </div>

          {drivers.length > 0 ? (
            <div className="divide-y divide-green-50 dark:divide-dark-border">
              {drivers.map((d) => {
                const ds = DRIVER_STATUS[d.status] || DRIVER_STATUS.inactive;
                return (
                  <div key={d._id} className="flex items-center gap-4 px-6 py-4 hover:bg-green-50/30 dark:hover:bg-white/5 transition-colors">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center text-sm font-black shrink-0">
                      {d.name?.slice(0, 2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-sm font-bold text-green-950 dark:text-white">{d.name}</p>
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{d.licenseNumber}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{d.phone}</span>
                        {d.userId?.email && (
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{d.userId.email}</span>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${ds.cls}`}>
                      {ds.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Car className="w-12 h-12 text-green-200 dark:text-green-800" />
              <p className="text-sm font-bold text-green-950 dark:text-white">No drivers yet</p>
              <p className="text-xs text-gray-400 text-center max-w-xs">
                This agency hasn't registered any drivers on the platform yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm action modal */}
      {actionType && (
        <ConfirmModal
          isOpen={!!actionType}
          onClose={() => setActionType('')}
          onConfirm={handleConfirmAction}
          title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Agency`}
          message={`Are you sure you want to ${actionType} "${agency.orgName}"?`}
          confirmText={`Confirm ${actionType}`}
          cancelText="Cancel"
          loading={submitting}
        >
          {(actionType === 'reject' || actionType === 'suspend') && (
            <div className="mt-4 space-y-1.5 text-left text-xs">
              <label className="form-label block">Reason for {actionType}</label>
              <input
                type="text"
                placeholder="e.g. Unverifiable registration credentials"
                className="form-input"
                value={actionReason}
                onChange={e => setActionReason(e.target.value)}
              />
            </div>
          )}
        </ConfirmModal>
      )}
    </div>
  );
}
