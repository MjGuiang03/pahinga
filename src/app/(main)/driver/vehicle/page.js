'use client';

import React, { useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Car, Building2, Phone, Hash, ShieldCheck, AlertCircle } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { useAuth } from '@/frontend/hooks/useAuth';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function DriverVehiclePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'driver')) {
      router.push('/login?redirect=/driver/vehicle');
    }
  }, [user, authLoading, router]);

  const { data, isLoading } = useSWR(user ? '/api/drivers/me' : null, fetcher);

  if (authLoading || isLoading) {
    return <div className="flex-1 flex items-center justify-center py-24"><Spinner className="w-12 h-12" /></div>;
  }

  const driver = data?.driver || null;
  const vehicle = driver?.vehicleId || null; // populated if vehicle is linked

  const statusColor = {
    available: 'badge-easy',
    on_trip:   'badge-moderate',
    inactive:  'badge-difficult',
  };

  return (
    <div className="w-full min-w-0 p-4 md:p-8 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-green-950 dark:text-white">My Vehicle</h1>
        <p className="text-xs text-gray-500 mt-0.5">Vehicle and agency info assigned to your driver account.</p>
      </div>

      {/* Driver card */}
      {driver ? (
        <div className="space-y-4">
          {/* Driver info */}
          <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-green-50/50 dark:bg-dark-surface border-b border-green-100 dark:border-dark-border">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Driver Profile</p>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center text-lg font-black">
                    {driver.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-green-950 dark:text-white">{driver.name}</p>
                    <span className={`badge ${statusColor[driver.status] || 'badge-moderate'} text-[9px] uppercase font-bold`}>
                      {driver.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { icon: Hash,       label: 'License Number', value: driver.licenseNumber },
                  { icon: Phone,      label: 'Contact',        value: driver.phone },
                  { icon: Building2,  label: 'Agency',         value: driver.agencyId?.orgName || '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-surface">
                    <Icon className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{label}</p>
                      <p className="text-xs font-semibold text-green-950 dark:text-white mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vehicle info */}
          <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-green-50/50 dark:bg-dark-surface border-b border-green-100 dark:border-dark-border">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Assigned Vehicle</p>
            </div>
            {vehicle ? (
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-black text-green-950 dark:text-white">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-xs text-gray-400">{vehicle.year}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Plate Number', value: vehicle.plateNumber },
                    { label: 'Type',         value: vehicle.type },
                    { label: 'Color',        value: vehicle.color },
                    { label: 'Capacity',     value: vehicle.capacity ? `${vehicle.capacity} pax` : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 rounded-lg bg-gray-50 dark:bg-dark-surface">
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{label}</p>
                      <p className="text-xs font-semibold text-green-950 dark:text-white mt-0.5">{value || '—'}</p>
                    </div>
                  ))}
                </div>

                {vehicle.isActive === false && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                      This vehicle is currently marked as inactive. Contact your agency.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-10 text-center space-y-3">
                <Car className="w-10 h-10 text-green-200 dark:text-green-800 mx-auto" />
                <p className="text-sm font-bold text-green-950 dark:text-white">No vehicle assigned</p>
                <p className="text-xs text-gray-400">
                  Your agency hasn't assigned a vehicle to your account yet. Contact your agency administrator.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl p-6 sm:p-10 md:p-16 text-center space-y-3">
          <ShieldCheck className="w-10 h-10 text-green-200 dark:text-green-800 mx-auto" />
          <p className="text-sm font-bold text-green-950 dark:text-white">Driver profile not found</p>
          <p className="text-xs text-gray-400">
            Your account hasn't been linked to a driver profile yet. Contact your agency.
          </p>
        </div>
      )}
    </div>
  );
}



