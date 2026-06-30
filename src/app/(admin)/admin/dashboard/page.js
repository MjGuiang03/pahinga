'use client';

import React, { useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users, Building2, CalendarDays, Wallet, AlertCircle,
  ShieldCheck, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { formatPrice, formatShortDate, statusBadgeClass } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';

const fetcher = (url) => axios.get(url).then(res => res.data);

// ── Shared chart components ───────────────────────────────────────────────────
function BarChart({ data, color = '#16a34a', formatValue = v => v }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-28 w-full pt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <span className="text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {formatValue(d.value)}
          </span>
          <div className="w-full rounded-t-sm transition-all duration-500"
            style={{ height: `${Math.max((d.value / max) * 88, 3)}px`, background: color, opacity: d.value === 0 ? 0.15 : 1 }}
          />
          <span className="text-[9px] text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function Trend({ current, previous }) {
  if (previous === 0 && current === 0) return <span className="text-[10px] text-gray-400">No data</span>;
  const pct = previous === 0 ? 100 : Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  const Icon = pct === 0 ? Minus : up ? TrendingUp : TrendingDown;
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-bold ${up ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
      <Icon className="w-3 h-3" />{pct > 0 ? '+' : ''}{pct}% vs last month
    </span>
  );
}

const STATUS_COLORS = {
  pending:   { bar: 'bg-amber-400', text: 'text-amber-600 dark:text-amber-400' },
  confirmed: { bar: 'bg-blue-500',  text: 'text-blue-600 dark:text-blue-400' },
  completed: { bar: 'bg-green-500', text: 'text-green-600 dark:text-green-400' },
  cancelled: { bar: 'bg-red-400',   text: 'text-red-600 dark:text-red-400' },
};

function StatusBreakdown({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="space-y-2">
      {data.map(d => {
        const pct = Math.round((d.value / total) * 100);
        const c = STATUS_COLORS[d.label] || { bar: 'bg-gray-400', text: 'text-gray-500' };
        return (
          <div key={d.label} className="space-y-0.5">
            <div className="flex items-center justify-between text-xs">
              <span className={`capitalize font-bold ${c.text}`}>{d.label}</span>
              <span className="font-black text-green-950 dark:text-white text-[11px]">{d.value} <span className="text-gray-400 font-normal">({pct}%)</span></span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-dark-surface overflow-hidden">
              <div className={`h-full rounded-full ${c.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login?redirect=/admin/dashboard');
    }
  }, [user, authLoading, router]);

  const { data: stats, error, isLoading: statsLoading } = useSWR(user ? '/api/admin/stats' : null, fetcher);
  const { data: metrics, isLoading: metricsLoading } = useSWR(user ? '/api/admin/metrics' : null, fetcher);

  if (authLoading || statsLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[50vh]"><Spinner className="w-12 h-12" /></div>;
  }

  if (error || !stats) {
    return <div className="p-8 text-center text-red-500 font-bold">Failed to load admin stats.</div>;
  }

  const recentBookings = stats.recentBookings || [];
  const m = metrics;

  return (
    <div className="w-full min-w-0 p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-green-950 dark:text-white">Admin Control Center</h1>
        <p className="text-xs text-gray-500">Monitor community activations, transaction volume, and service reliability.</p>
      </div>

      {/* Action alert */}
      {(stats.pendingAgencies > 0 || stats.openRefunds > 0) && (
        <div className="bg-amber-50/20 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-extrabold">Action required:</p>
              <p className="mt-0.5">
                You have <span className="font-extrabold underline">{stats.pendingAgencies} agency approvals</span> and{' '}
                <span className="font-extrabold underline">{stats.openRefunds} refund requests</span> pending.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {stats.pendingAgencies > 0 && <Link href="/admin/agencies" className="btn btn-sm bg-amber-500 hover:bg-amber-600 text-white font-extrabold border-none">Moderate Agencies</Link>}
            {stats.openRefunds > 0 && <Link href="/admin/refunds" className="btn btn-sm bg-amber-500 hover:bg-amber-600 text-white font-extrabold border-none">Moderate Refunds</Link>}
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Users',       value: stats.totalUsers,              icon: Users,       color: 'text-blue-600',    trend: m && <Trend current={m.kpis.usersThisMonth} previous={m.kpis.usersLastMonth} /> },
          { label: 'Approved Agencies', value: stats.totalAgencies,           icon: Building2,   color: 'text-emerald-600', trend: null },
          { label: 'Total Bookings',    value: stats.totalBookings,           icon: CalendarDays, color: 'text-purple-600', trend: m && <Trend current={m.kpis.bookingsThisMonth} previous={m.kpis.bookingsLastMonth} /> },
          { label: 'Platform Volume',   value: formatPrice(stats.totalRevenue), icon: Wallet,    color: 'text-green-600',   trend: m && <Trend current={m.kpis.revenueThisMonth} previous={m.kpis.revenueLastMonth} /> },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card p-5 border border-green-100 dark:border-dark-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400">{stat.label}</span>
                <div className="w-9 h-9 rounded-full bg-green-50 dark:bg-dark-surface flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xl font-black text-green-950 dark:text-white">{stat.value}</p>
              {stat.trend}
            </div>
          );
        })}
      </div>

      {/* ── Metrics section ── */}
      {metricsLoading && <div className="flex justify-center py-4"><Spinner className="w-8 h-8" /></div>}
      {m && (
        <>
          {/* Bar charts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Monthly Bookings</p>
              <p className="text-lg font-black text-green-950 dark:text-white">{m.monthlyBookings.reduce((s, x) => s + x.value, 0)}</p>
              <BarChart data={m.monthlyBookings} color="#16a34a" />
            </div>
            <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Monthly Revenue</p>
              <p className="text-lg font-black text-green-950 dark:text-white">{formatPrice(m.monthlyRevenue.reduce((s, x) => s + x.value, 0))}</p>
              <BarChart data={m.monthlyRevenue} color="#2563eb" formatValue={v => formatPrice(v)} />
            </div>
            <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">New Users</p>
              <p className="text-lg font-black text-green-950 dark:text-white">{m.monthlyUsers.reduce((s, x) => s + x.value, 0)}</p>
              <BarChart data={m.monthlyUsers} color="#9333ea" />
            </div>
          </div>

          {/* Status + Top agencies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Booking Status Breakdown</p>
              <StatusBreakdown data={m.statusBreakdown} />
            </div>
            <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Top Agencies by Revenue</p>
              {m.topAgencies.length > 0 ? (
                <div className="space-y-3">
                  {m.topAgencies.map((a, i) => {
                    const maxRev = m.topAgencies[0]?.revenue || 1;
                    return (
                      <div key={i} className="space-y-0.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                            <span className="font-bold text-green-950 dark:text-white truncate max-w-[150px]">{a.name}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-black text-green-700 dark:text-green-400">{formatPrice(a.revenue)}</p>
                            <p className="text-[10px] text-gray-400">{a.bookings} bookings</p>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-dark-surface overflow-hidden">
                          <div className="h-full rounded-full bg-green-500 transition-all duration-700" style={{ width: `${(a.revenue / maxRev) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-xs text-gray-400 text-center py-6">No agency revenue data yet.</p>}
            </div>
          </div>
        </>
      )}

      {/* Recent bookings table */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold uppercase text-green-900 dark:text-green-100 tracking-wider">Recent Platform Bookings</h2>
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden shadow-card">
          {recentBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-green-50/50 dark:bg-dark-surface border-b border-green-100 dark:border-dark-border text-gray-400 font-extrabold uppercase">
                    <th className="p-4">Reference</th>
                    <th className="p-4">Adventure Tour</th>
                    <th className="p-4">Hiker</th>
                    <th className="p-4">Agency Partner</th>
                    <th className="p-4">Trip Date</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b._id} className="border-b border-green-50 dark:border-dark-border hover:bg-green-50/10 transition-colors">
                      <td className="p-4 font-mono font-bold text-green-900 dark:text-green-400 select-all">{b.referenceNumber}</td>
                      <td className="p-4 font-semibold text-green-950 dark:text-green-100 truncate max-w-[150px]">{b.adventureId?.title}</td>
                      <td className="p-4">
                        <p className="font-medium">{b.hikerId?.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{b.hikerId?.email}</p>
                      </td>
                      <td className="p-4 font-semibold">{b.agencyId?.orgName}</td>
                      <td className="p-4 whitespace-nowrap">{b.adventureId?.startDate ? formatShortDate(b.adventureId.startDate) : 'Flexible'}</td>
                      <td className="p-4 text-right font-bold">{formatPrice(b.totalAmount)}</td>
                      <td className="p-4">
                        <span className={`badge ${statusBadgeClass(b.status)} text-[9px] uppercase font-bold`}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-gray-400">
              <ShieldCheck className="w-8 h-8 mx-auto text-green-200 mb-2" />
              <p className="font-bold text-green-950 dark:text-green-100">No Bookings Placed Yet</p>
              <p>Platform transactions will populate once placed by travelers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


