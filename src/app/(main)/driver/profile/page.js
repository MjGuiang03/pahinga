'use client';

import React, { useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { User, Shield, Phone, Mail, Award, LogOut } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { useAuth } from '@/frontend/hooks/useAuth';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function DriverProfilePage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/driver/profile');
    } else if (user && user.role !== 'driver') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const { data, error, isLoading: profileLoading } = useSWR(
    user ? '/api/drivers/me' : null,
    fetcher
  );

  if (authLoading || profileLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  const driver = data?.driver || {};
  const agency = driver.agencyId || {};

  return (
    <div className="max-w-[500px] mx-auto px-6 py-12 w-full flex-1 flex flex-col justify-center">
      <div className="card border border-green-100 dark:border-dark-border p-6 space-y-6 bg-white dark:bg-dark-card">
        
        {/* Profile Avatar Card Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-green-600 text-green-50 dark:bg-green-400 dark:text-dark-bg flex items-center justify-center font-black text-2xl mx-auto shadow-md">
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-black text-green-950 dark:text-green-100">{user?.name}</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-0.5">Driver Partner</p>
          </div>
        </div>

        <hr className="divider" />

        {/* Profile Details List */}
        <div className="space-y-4 text-xs">
          {/* License */}
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">License Number</p>
              <p className="font-semibold text-green-950 dark:text-green-100 mt-0.5">
                {driver.licenseNumber || 'Not provided'}
              </p>
            </div>
          </div>

          {/* Affiliated Agency */}
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Affiliated Agency</p>
              <p className="font-semibold text-green-950 dark:text-green-100 mt-0.5">
                {agency.orgName || 'Independent'}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Contact Number</p>
              <p className="font-semibold text-green-950 dark:text-green-100 mt-0.5">
                {driver.phone || user?.phone || 'Not provided'}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Email Address</p>
              <p className="font-semibold text-green-950 dark:text-green-100 mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* Logout button */}
        <button
          onClick={logout}
          className="btn btn-secondary w-full py-3 flex items-center justify-center gap-2 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 font-bold"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>

      </div>
    </div>
  );
}
