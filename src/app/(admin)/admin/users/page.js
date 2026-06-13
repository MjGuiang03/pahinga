'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users, UserX, UserCheck, Mountain, Building2,
  Car, ShieldAlert, Search, X, Mail, Phone,
  Calendar, BookOpen, ShieldCheck, Hash,
} from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatShortDate } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const fetcher = (url) => axios.get(url).then(res => res.data);

const TABS = [
  { key: 'hiker',  label: 'Hikers',   icon: Mountain,    color: 'text-green-600  dark:text-green-400'  },
  { key: 'agency', label: 'Agencies', icon: Building2,   color: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'driver', label: 'Drivers',  icon: Car,         color: 'text-blue-600   dark:text-blue-400'   },
  { key: 'admin',  label: 'Admins',   icon: ShieldAlert, color: 'text-purple-600 dark:text-purple-400' },
];

const getRoleBadge = (role) => {
  if (role === 'admin')  return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
  if (role === 'agency') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (role === 'driver') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
};

/** Drivers section inside the drawer — only shown for agency users */
function AgencyDrivers({ agencyUserId }) {
  const { data, isLoading } = useSWR(
    agencyUserId ? `/api/admin/users/${agencyUserId}/agency-members` : null,
    fetcher,
  );

  const driverStatusColor = {
    available: 'text-green-600 dark:text-green-400',
    on_trip:   'text-amber-500 dark:text-amber-400',
    inactive:  'text-gray-400',
  };

  if (isLoading) return <div className="flex justify-center py-4"><Spinner className="w-6 h-6" /></div>;

  const drivers = data?.drivers || [];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Drivers / Coordinators</p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          {drivers.length} members
        </span>
      </div>
      {drivers.length > 0 ? (
        <div className="rounded-xl border border-green-100 dark:border-dark-border overflow-hidden divide-y divide-green-50 dark:divide-dark-border">
          {drivers.map(d => (
            <div key={d._id} className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center text-xs font-black shrink-0">
                {d.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-green-950 dark:text-white">{d.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-0.5"><Hash className="w-3 h-3" />{d.licenseNumber}</span>
                  <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" />{d.phone}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold capitalize shrink-0 ${driverStatusColor[d.status] || 'text-gray-400'}`}>
                {d.status?.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-green-100 dark:border-dark-border p-6 text-center">
          <Car className="w-7 h-7 mx-auto text-green-200 dark:text-green-800 mb-1" />
          <p className="text-xs text-gray-400">No drivers registered under this agency yet.</p>
        </div>
      )}
    </div>
  );
}

/** Slide-over drawer showing full user details */
function UserDetailDrawer({ user: u, onClose, onToggle, submitting }) {
  if (!u) return null;

  const initials = u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const fields = [
    { icon: Mail,      label: 'Email',       value: u.email },
    { icon: Phone,     label: 'Phone',       value: u.phone || '—' },
    { icon: Calendar,  label: 'Registered',  value: u.createdAt ? formatShortDate(u.createdAt) : '—' },
    { icon: BookOpen,  label: 'Bookings',    value: u.bookingCount ?? '—' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer — wider for agencies to fit coordinators */}
      <div className={`fixed right-0 top-0 h-full z-50 bg-white dark:bg-dark-card border-l border-green-100 dark:border-dark-border shadow-2xl flex flex-col ${u.role === 'agency' ? 'w-96' : 'w-80'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-green-100 dark:border-dark-border shrink-0">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">User Profile</p>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-surface transition-all cursor-pointer border-none bg-transparent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="px-5 py-5 flex flex-col items-center gap-3 border-b border-green-50 dark:border-dark-border bg-green-50/30 dark:bg-dark-surface/30 shrink-0">
          {u.avatar ? (
            <img src={u.avatar} alt={u.name} className="w-16 h-16 rounded-full object-cover border-2 border-green-200 dark:border-green-700" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center text-xl font-black select-none">
              {initials}
            </div>
          )}
          <div className="text-center">
            <p className="text-base font-black text-green-950 dark:text-white">{u.name}</p>
            <span className={`inline-block mt-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getRoleBadge(u.role)}`}>
              {u.role}
            </span>
          </div>
          <span className={`badge ${u.isActive ? 'badge-easy' : 'badge-difficult'} text-[9px] uppercase font-bold`}>
            {u.isActive ? '● Active' : '● Suspended'}
          </span>
        </div>

        {/* Info fields */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-surface">
              <Icon className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{label}</p>
                <p className="text-xs font-semibold text-green-950 dark:text-white mt-0.5 break-all">{value}</p>
              </div>
            </div>
          ))}

          {/* Agency org name */}
          {u.role === 'agency' && u.orgName && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-surface">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Organization</p>
                <p className="text-xs font-semibold text-green-950 dark:text-white mt-0.5">{u.orgName}</p>
              </div>
            </div>
          )}

          {/* ── Drivers / Coordinators (agency only) ── */}
          {u.role === 'agency' && (
            <AgencyDrivers agencyUserId={u._id} />
          )}

          {/* Admin security note */}
          {u.role === 'admin' && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/40">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold leading-relaxed">
                This is an administrator account. Suspension is restricted for security.
              </p>
            </div>
          )}
        </div>

        {/* Footer action */}
        {u.role !== 'admin' && (
          <div className="px-5 py-4 border-t border-green-100 dark:border-dark-border shrink-0">
            <button
              onClick={() => onToggle(u)}
              disabled={submitting}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-extrabold border transition-all cursor-pointer disabled:opacity-50 ${
                u.isActive
                  ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800/40'
                  : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-800/40'
              }`}
            >
              {u.isActive
                ? <><UserX className="w-4 h-4" /> Suspend Account</>
                : <><UserCheck className="w-4 h-4" /> Activate Account</>
              }
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function AdminUsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('hiker');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [toggleUser, setToggleUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login?redirect=/admin/users');
    }
  }, [user, authLoading, router]);

  const { data, isLoading: usersLoading, mutate } = useSWR(
    user ? '/api/admin/users' : null, fetcher
  );

  if (authLoading || usersLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  const allUsers = data?.users || [];

  const counts = TABS.reduce((acc, t) => {
    acc[t.key] = allUsers.filter(u => u.role === t.key).length;
    return acc;
  }, {});

  const tabUsers = allUsers
    .filter(u => u.role === activeTab)
    .filter(u =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    );

  const handleToggleClick = (u) => {
    setToggleUser(u);
  };

  const handleConfirmToggle = async () => {
    if (!toggleUser) return;
    setSubmitting(true);
    try {
      const nextActive = !toggleUser.isActive;
      await axios.post('/api/admin/users', { userId: toggleUser._id, isActive: nextActive });
      toast.success(`User account ${nextActive ? 'activated' : 'suspended'} successfully.`);
      mutate();
      setToggleUser(null);
      // Update selected user state if drawer is open
      if (selectedUser?._id === toggleUser._id) {
        setSelectedUser(prev => ({ ...prev, isActive: nextActive }));
      }
    } catch (err) {
      toast.error('Failed to toggle user status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-green-950 dark:text-white">User Accounts</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Manage login access across all roles — {allUsers.length} total accounts.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-green-100 dark:border-dark-border">
        {TABS.map(({ key, label, icon: Icon, color }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSearch(''); setSelectedUser(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer bg-transparent -mb-px ${
                active
                  ? 'border-green-600 dark:border-green-400 text-green-700 dark:text-green-400'
                  : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? color : ''}`} />
              {label}
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                active
                  ? 'bg-green-600 dark:bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-dark-surface text-gray-400'
              }`}>
                {counts[key]}
              </span>
            </button>
          );
        })}

        {/* Search */}
        <div className="ml-auto flex items-center gap-2 pb-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${TABS.find(t => t.key === activeTab)?.label}…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-green-100 dark:border-dark-border bg-white dark:bg-dark-surface text-green-950 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all w-52"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {tabUsers.length > 0 ? (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-green-50/50 dark:bg-dark-surface border-b border-green-100 dark:border-dark-border text-gray-400 font-extrabold uppercase tracking-wider">
                  <th className="p-4 w-12 text-center">Avatar</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Registered</th>
                  {activeTab === 'hiker' && <th className="p-4 text-center">Bookings</th>}
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {tabUsers.map((u) => {
                  const isSelected = selectedUser?._id === u._id;
                  return (
                    <tr
                      key={u._id}
                      onClick={() => {
                        if (u.role === 'agency') {
                          // agency users go to full detail page
                          router.push(`/admin/agencies/${u.agencyId || u._id}`);
                        } else {
                          setSelectedUser(isSelected ? null : u);
                        }
                      }}
                      className={`border-b border-green-50 dark:border-dark-border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-green-50 dark:bg-green-900/10'
                          : 'hover:bg-green-50/40 dark:hover:bg-white/5'
                      }`}
                    >
                      <td className="p-4 text-center">
                        <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-dark-surface flex items-center justify-center font-bold text-xs text-green-600 dark:text-green-400 mx-auto">
                          {u.name?.slice(0, 2).toUpperCase()}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-green-950 dark:text-white">{u.name}</td>
                      <td className="p-4 font-mono text-gray-500 dark:text-gray-400">{u.email}</td>
                      <td className="p-4 font-mono text-gray-500 dark:text-gray-400">{u.phone || '—'}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {u.createdAt ? formatShortDate(u.createdAt) : '—'}
                      </td>
                      {activeTab === 'hiker' && (
                        <td className="p-4 text-center font-bold text-green-950 dark:text-white">
                          {u.bookingCount || 0}
                        </td>
                      )}
                      <td className="p-4">
                        <span className={`badge ${u.isActive ? 'badge-easy' : 'badge-difficult'} text-[9px] uppercase font-bold`}>
                          {u.isActive ? 'active' : 'suspended'}
                        </span>
                      </td>
                      <td
                        className="p-4 text-center"
                        onClick={e => e.stopPropagation()} // prevent row click when clicking button
                      >
                        {u.role !== 'admin' ? (
                          <button
                            onClick={() => handleToggleClick(u)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              u.isActive
                                ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:text-red-400 dark:border-red-800/40'
                                : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/10 dark:hover:bg-green-900/20 dark:text-green-400 dark:border-green-800/40'
                            }`}
                          >
                            {u.isActive
                              ? <><UserX className="w-3 h-3" /> Suspend</>
                              : <><UserCheck className="w-3 h-3" /> Activate</>
                            }
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-300 dark:text-gray-600 italic">Protected</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="px-4 py-2 text-[10px] text-gray-400 border-t border-green-50 dark:border-dark-border">
            Click any row to view full profile details →
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-16 text-center space-y-3">
          <Users className="w-10 h-10 text-green-200 dark:text-green-800 mx-auto" />
          <p className="text-sm font-bold text-green-950 dark:text-white">
            No {TABS.find(t => t.key === activeTab)?.label} found
          </p>
          <p className="text-xs text-gray-400">
            {search ? `No results for "${search}"` : `No ${activeTab} accounts registered yet.`}
          </p>
        </div>
      )}

      {/* Detail Drawer */}
      <UserDetailDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onToggle={handleToggleClick}
        submitting={submitting}
      />

      {/* Confirm Toggle Modal */}
      {toggleUser && (
        <ConfirmModal
          isOpen={!!toggleUser}
          onClose={() => setToggleUser(null)}
          onConfirm={handleConfirmToggle}
          title={toggleUser.isActive ? 'Suspend User Account' : 'Activate User Account'}
          message={`Are you sure you want to ${toggleUser.isActive ? 'suspend' : 'activate'} "${toggleUser.name}" (${toggleUser.email})?`}
          confirmText={toggleUser.isActive ? 'Yes, Suspend' : 'Yes, Activate'}
          cancelText="Cancel"
          loading={submitting}
        />
      )}
    </div>
  );
}
