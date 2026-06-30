'use client';

import React, { useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDays, Wallet, Clock, Mountain,
  Users, Car, ChevronRight, ShieldCheck,
  TrendingUp, TrendingDown, Minus, Star, CheckCircle2,
} from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { formatPrice, formatShortDate, statusBadgeClass } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';

const fetcher = (url) => axios.get(url).then(res => res.data);

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

function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-3 h-3 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700'}`} />
      ))}
      <span className="ml-1 text-[10px] font-bold text-gray-500">{rating > 0 ? rating : '—'}</span>
    </div>
  );
}

export default function AgencyDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'agency')) {
      router.push('/login?redirect=/agency/dashboard');
    }
  }, [user, authLoading, router]);

  const { data: stats, isLoading: statsLoading } = useSWR(user ? '/api/agency/stats' : null, fetcher);
  const { data: bookingsData, isLoading: bookingsLoading } = useSWR(user ? '/api/bookings' : null, fetcher);
  const { data: metrics, isLoading: metricsLoading } = useSWR(user ? '/api/agency/metrics' : null, fetcher);

  if (authLoading || statsLoading || bookingsLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[50vh]"><Spinner className="w-12 h-12" /></div>;
  }

  const bookings = bookingsData?.bookings || [];
  const incomingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').slice(0, 5);
  const m = metrics;

  return (
    <div className="w-full min-w-0 p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-green-950 dark:text-white">
          Welcome back, {stats?.orgName || 'Partner'}!
        </h1>
        <p className="text-xs text-gray-500">Here is how your adventures are performing today.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Bookings This Month', value: stats?.totalBookingsCount || 0,          icon: CalendarDays,  color: 'text-blue-600',   trend: m && <Trend current={m.kpis.bookingsThisMonth} previous={m.kpis.bookingsLastMonth} /> },
          { label: 'Revenue This Month',  value: formatPrice(stats?.revenueThisMonth || 0), icon: Wallet,        color: 'text-green-600',  trend: m && <Trend current={m.kpis.revenueThisMonth} previous={m.kpis.revenueLastMonth} /> },
          { label: 'Pending Bookings',    value: stats?.pendingBookingsCount || 0,          icon: Clock,         color: 'text-amber-500',  trend: null },
          { label: 'Active Listings',     value: stats?.activeListingsCount || 0,           icon: Mountain,      color: 'text-emerald-600', trend: null },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card p-5 border border-green-100 dark:border-dark-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400">{stat.label}</span>
                <div className={`w-9 h-9 rounded-full bg-green-50 dark:bg-dark-surface flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
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
          {/* Extra KPIs from metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Completion Rate</span>
              <p className="text-2xl font-black text-green-950 dark:text-white">{m.kpis.completionRate}%</p>
              <p className="text-[10px] text-gray-400">of all-time bookings completed</p>
            </div>
            <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Avg. Rating</span>
              <p className="text-2xl font-black text-green-950 dark:text-white">{m.kpis.avgRating > 0 ? m.kpis.avgRating : '—'}</p>
              <StarDisplay rating={m.kpis.avgRating} />
            </div>
          </div>

          {/* Bar charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Monthly Bookings (6 mo.)</p>
              <p className="text-lg font-black text-green-950 dark:text-white">{m.monthlyBookings.reduce((s, x) => s + x.value, 0)} total</p>
              <BarChart data={m.monthlyBookings} color="#16a34a" />
            </div>
            <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Monthly Revenue (6 mo.)</p>
              <p className="text-lg font-black text-green-950 dark:text-white">{formatPrice(m.monthlyRevenue.reduce((s, x) => s + x.value, 0))}</p>
              <BarChart data={m.monthlyRevenue} color="#2563eb" formatValue={v => formatPrice(v)} />
            </div>
          </div>

          {/* Status + Top adventures */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Booking Status Breakdown</p>
              <StatusBreakdown data={m.statusBreakdown} />
            </div>
            <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Top Adventures</p>
              {m.topAdventures.length > 0 ? (
                <div className="space-y-3">
                  {m.topAdventures.map((a, i) => {
                    const maxB = m.topAdventures[0]?.bookings || 1;
                    return (
                      <div key={i} className="space-y-0.5">
                        <div className="flex items-start justify-between text-xs gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                            <div className="min-w-0">
                              <p className="font-bold text-green-950 dark:text-white truncate">{a.title}</p>
                              <StarDisplay rating={a.rating} />
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-black text-green-700 dark:text-green-400">{formatPrice(a.revenue)}</p>
                            <p className="text-[10px] text-gray-400">{a.bookings} bookings</p>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-dark-surface overflow-hidden">
                          <div className="h-full rounded-full bg-green-500 transition-all duration-700" style={{ width: `${(a.bookings / maxB) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-xs text-gray-400 text-center py-6">No adventure data yet.</p>}
            </div>
          </div>
        </>
      )}

      {/* Main split: incoming bookings + quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase text-green-900 dark:text-green-100 tracking-wider">Incoming Bookings</h2>
            <Link href="/agency/bookings" className="text-xs font-bold text-green-600 dark:text-green-400 hover:underline">View all</Link>
          </div>
          <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden shadow-card">
            {incomingBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-green-50/50 dark:bg-dark-surface border-b border-green-100 dark:border-dark-border text-gray-400 font-extrabold uppercase">
                      <th className="p-4">Reference</th>
                      <th className="p-4">Adventure</th>
                      <th className="p-4">Hiker</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Pax</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomingBookings.map((b) => (
                      <tr key={b._id} className="border-b border-green-50 dark:border-dark-border hover:bg-green-50/10 transition-colors">
                        <td className="p-4 font-mono font-bold text-green-900 dark:text-green-400">{b.referenceNumber}</td>
                        <td className="p-4 font-semibold text-green-950 dark:text-green-100 truncate max-w-[120px]">{b.adventureId?.title}</td>
                        <td className="p-4">{b.hikerId?.name}</td>
                        <td className="p-4 whitespace-nowrap">{b.adventureId?.startDate ? formatShortDate(b.adventureId.startDate) : 'Flexible'}</td>
                        <td className="p-4 text-center font-bold">{b.paxCount}</td>
                        <td className="p-4 text-right font-bold">{formatPrice(b.totalAmount)}</td>
                        <td className="p-4"><span className={`badge ${statusBadgeClass(b.status)} text-[9px] uppercase font-bold`}>{b.status}</span></td>
                        <td className="p-4 text-center">
                          <Link href={`/agency/bookings/${b._id}`} className="btn btn-ghost btn-sm py-1 px-2.5">Manage</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center space-y-2 text-xs text-gray-400">
                <ShieldCheck className="w-8 h-8 mx-auto text-green-200" />
                <p className="font-bold text-green-950 dark:text-green-100">No incoming bookings</p>
                <p>New bookings will appear here.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-sm font-extrabold uppercase text-green-900 dark:text-green-100 tracking-wider">Quick Links</h2>
          <div className="space-y-4">
            {[
              { title: 'Create listing', desc: 'Publish a new adventure tour', href: '/agency/listings/create', icon: Mountain },
              { title: 'Add driver',    desc: 'Register a driver to your roster', href: '/agency/drivers',         icon: Users },
              { title: 'Add vehicle',   desc: 'Add a vehicle to your fleet',     href: '/agency/vehicles',        icon: Car },
            ].map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link key={idx} href={action.href}
                  className="card p-4 border border-green-100 dark:border-dark-border flex items-center justify-between no-underline text-inherit hover:border-green-300 dark:hover:border-green-600 group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-dark-surface flex items-center justify-center text-green-600 dark:text-green-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-green-950 dark:text-green-100">{action.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{action.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


