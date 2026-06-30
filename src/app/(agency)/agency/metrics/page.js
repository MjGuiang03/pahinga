'use client';

import React, { useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, TrendingDown, Minus,
  CalendarDays, Wallet, Star, CheckCircle2,
} from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { formatPrice } from '@/utils/formatters';
import { useAuth } from '@/frontend/hooks/useAuth';

const fetcher = (url) => axios.get(url).then(res => res.data);

function BarChart({ data, color = '#16a34a', formatValue = v => v }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-36 w-full pt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <span className="text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {formatValue(d.value)}
          </span>
          <div className="w-full rounded-t-md transition-all duration-500"
            style={{ height: `${Math.max((d.value / max) * 112, 4)}px`, background: color, opacity: d.value === 0 ? 0.15 : 1 }}
          />
          <span className="text-[10px] text-gray-400 font-medium">{d.label}</span>
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
      <Icon className="w-3 h-3" />
      {pct > 0 ? '+' : ''}{pct}% vs last month
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
    <div className="space-y-2.5">
      {data.map(d => {
        const pct = Math.round((d.value / total) * 100);
        const c = STATUS_COLORS[d.label] || { bar: 'bg-gray-400', text: 'text-gray-500' };
        return (
          <div key={d.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className={`capitalize font-bold ${c.text}`}>{d.label}</span>
              <span className="font-black text-green-950 dark:text-white">{d.value} <span className="text-gray-400 font-normal">({pct}%)</span></span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-dark-surface overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${c.bar}`} style={{ width: `${pct}%` }} />
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

export default function AgencyMetricsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'agency')) {
      router.push('/login?redirect=/agency/metrics');
    }
  }, [user, authLoading, router]);

  const { data, isLoading } = useSWR(user ? '/api/agency/metrics' : null, fetcher);

  if (authLoading || isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[50vh]"><Spinner className="w-12 h-12" /></div>;
  }

  if (!data) return null;
  const { monthlyBookings, monthlyRevenue, statusBreakdown, topAdventures, kpis } = data;

  return (
    <div className="w-full min-w-0 p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-green-950 dark:text-white">Performance Metrics</h1>
        <p className="text-xs text-gray-500 mt-0.5">Track your agency's booking trends, revenue, and top adventures over time.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: CalendarDays, label: 'Bookings this month', iconColor: 'bg-blue-500',
            value: kpis.bookingsThisMonth,
            trend: <Trend current={kpis.bookingsThisMonth} previous={kpis.bookingsLastMonth} />,
          },
          {
            icon: Wallet, label: 'Revenue this month', iconColor: 'bg-green-600',
            value: formatPrice(kpis.revenueThisMonth),
            trend: <Trend current={kpis.revenueThisMonth} previous={kpis.revenueLastMonth} />,
          },
          {
            icon: CheckCircle2, label: 'Completion rate', iconColor: 'bg-emerald-500',
            value: `${kpis.completionRate}%`,
            trend: <span className="text-[10px] text-gray-400">of all bookings completed</span>,
          },
          {
            icon: Star, label: 'Avg. rating', iconColor: 'bg-amber-500',
            value: kpis.avgRating > 0 ? kpis.avgRating : '—',
            trend: <StarDisplay rating={kpis.avgRating} />,
          },
        ].map((k, i) => (
          <div key={i} className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{k.label}</span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.iconColor}`}>
                <k.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-black text-green-950 dark:text-white">{k.value}</p>
            {k.trend}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 space-y-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Monthly Bookings</p>
            <p className="text-lg font-black text-green-950 dark:text-white mt-0.5">
              {monthlyBookings.reduce((s, m) => s + m.value, 0)} total (6 months)
            </p>
          </div>
          <BarChart data={monthlyBookings} color="#16a34a" />
        </div>

        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 space-y-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Monthly Revenue</p>
            <p className="text-lg font-black text-green-950 dark:text-white mt-0.5">
              {formatPrice(monthlyRevenue.reduce((s, m) => s + m.value, 0))} (6 months)
            </p>
          </div>
          <BarChart data={monthlyRevenue} color="#2563eb" formatValue={v => formatPrice(v)} />
        </div>
      </div>

      {/* Status breakdown + Top adventures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Booking Status Breakdown</p>
          <StatusBreakdown data={statusBreakdown} />
        </div>

        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-5 space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Top Adventures</p>
          {topAdventures.length > 0 ? (
            <div className="space-y-3">
              {topAdventures.map((a, i) => {
                const maxB = topAdventures[0]?.bookings || 1;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-start justify-between text-xs gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
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
                      <div className="h-full rounded-full bg-green-500 transition-all duration-700"
                        style={{ width: `${(a.bookings / maxB) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-8 text-center">No adventure data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}


