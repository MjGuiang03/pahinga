'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  Shield, Check, AlertCircle, BarChart3,
  Building2, Users as UsersIcon, Mountain, Wallet,
  Sun, Moon, Palette,
} from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';

const fetcher = (url) => axios.get(url).then(res => res.data);

export default function AdminSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [memberSince, setMemberSince] = useState('');

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Appearance
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    }
  };

  // Platform overview data
  const { data: usersData } = useSWR(user ? '/api/admin/users' : null, fetcher);
  const { data: agenciesData } = useSWR(user ? '/api/admin/agencies' : null, fetcher);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      axios.get('/api/auth/settings')
        .then(res => {
          const u = res.data.user;
          setName(u.name || '');
          setEmail(u.email || '');
          setPhone(u.phone || '');
          setMemberSince(u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '');
        })
        .catch(() => toast.error('Failed to load settings.'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/auth/settings', { name, phone });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.'); return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.'); return;
    }
    setSaving(true);
    try {
      await axios.put('/api/auth/settings', { currentPassword, newPassword });
      toast.success('Password changed!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div className="flex-1 flex items-center justify-center min-h-[60vh]"><Spinner className="w-12 h-12" /></div>;
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'platform', label: 'Platform', icon: BarChart3 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  // Platform stats
  const allUsers = usersData?.users || [];
  const allAgencies = agenciesData?.agencies || [];
  const platformStats = [
    { label: 'Total Users', value: allUsers.length, icon: UsersIcon, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
    { label: 'Hikers', value: allUsers.filter(u => u.role === 'hiker').length, icon: Mountain, color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' },
    { label: 'Agencies', value: allAgencies.length, icon: Building2, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400' },
    { label: 'Approved', value: allAgencies.filter(a => a.status === 'approved').length, icon: Check, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' },
    { label: 'Pending', value: allAgencies.filter(a => a.status === 'pending').length, icon: AlertCircle, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400' },
  ];

  return (
    <div className="w-full min-w-0 p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-green-950 dark:text-white">Admin Settings</h1>
        <p className="text-xs text-gray-400 mt-0.5">Manage your admin account, platform overview, and security.</p>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 dark:from-green-700 dark:to-green-900 rounded-2xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-white/20 text-white flex items-center justify-center text-xl font-black select-none">
          {userInitials}
        </div>
        <div>
          <p className="text-lg font-black text-white">{user?.name}</p>
          <p className="text-xs text-green-200 mt-0.5">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase">
              Administrator
            </span>
            <span className="text-[10px] text-green-300">Since {memberSince}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-green-100 dark:border-dark-border select-none">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-colors -mb-[2px] cursor-pointer bg-transparent ${
              activeTab === tab.id
                ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                : 'border-transparent text-gray-400 hover:text-green-600 hover:border-green-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSave} className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-green-50 dark:border-dark-border bg-green-50/30 dark:bg-dark-surface/40">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Admin Account</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="form-label block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="form-input pl-10" placeholder="Your full name" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="form-label block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} readOnly disabled
                  className="form-input pl-10 opacity-60 cursor-not-allowed" />
              </div>
              <p className="text-[10px] text-gray-400">Email cannot be changed.</p>
            </div>

            <div className="space-y-1.5">
              <label className="form-label block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  className="form-input pl-10" placeholder="e.g. 09171234567" />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={saving} className="btn btn-primary px-8 py-2.5 flex items-center gap-2">
                {saving ? <Spinner className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── Platform Tab ── */}
      {activeTab === 'platform' && (
        <div className="space-y-6">
          {/* Platform stats */}
          <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-green-50 dark:border-dark-border bg-green-50/30 dark:bg-dark-surface/40">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Platform Overview</p>
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {platformStats.map(stat => (
                <div key={stat.label} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-dark-surface border border-green-50 dark:border-dark-border">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-green-950 dark:text-white">{stat.value}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Breakdown */}
          <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-green-50 dark:border-dark-border bg-green-50/30 dark:bg-dark-surface/40">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">User Roles Breakdown</p>
            </div>
            <div className="p-6">
              {['hiker', 'agency', 'driver', 'coordinator', 'admin'].map(role => {
                const count = allUsers.filter(u => u.role === role).length;
                const pct = allUsers.length > 0 ? (count / allUsers.length * 100) : 0;
                return (
                  <div key={role} className="flex items-center gap-4 py-3 border-b border-green-50 dark:border-dark-border last:border-0">
                    <span className="text-xs font-bold text-green-950 dark:text-white capitalize w-24">{role}</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-dark-surface overflow-hidden">
                      <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-500 w-10 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Security Tab ── */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordSave} className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-green-50 dark:border-dark-border bg-green-50/30 dark:bg-dark-surface/40">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Change Password</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="form-label block">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showCurrent ? 'text' : 'password'} required
                  value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  className="form-input pl-10 pr-10" placeholder="Enter current password" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 border-none bg-transparent cursor-pointer p-0">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="form-label block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showNew ? 'text' : 'password'} required
                  value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="form-input pl-10 pr-10" placeholder="At least 6 characters" />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 border-none bg-transparent cursor-pointer p-0">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="form-label block">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" required
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="form-input pl-10" placeholder="Re-enter new password" />
              </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-[10px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Passwords do not match.
                </p>
              )}
            </div>

            <div className="pt-2">
              <button type="submit" disabled={saving} className="btn btn-primary px-8 py-2.5 flex items-center gap-2">
                {saving ? <Spinner className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                Update Password
              </button>
            </div>
          </div>
        </form>
      )}
      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="bg-white dark:bg-dark-card border border-green-100 dark:border-dark-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-green-50 dark:border-dark-border bg-green-50/30 dark:bg-dark-surface/40">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Theme Preferences</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => toggleTheme(false)}
                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all bg-transparent cursor-pointer ${
                  !isDark
                    ? 'border-green-600 bg-green-50 text-green-700 dark:bg-transparent dark:text-green-500'
                    : 'border-gray-100 dark:border-dark-border text-gray-500 hover:border-green-200 hover:bg-green-50/50 dark:hover:border-green-900/50'
                }`}
              >
                <Sun className={`w-8 h-8 mb-3 ${!isDark ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="font-bold">Light Mode</span>
              </button>
              
              <button
                type="button"
                onClick={() => toggleTheme(true)}
                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all bg-transparent cursor-pointer ${
                  isDark
                    ? 'border-green-600 bg-green-900/10 text-green-400'
                    : 'border-gray-100 dark:border-dark-border text-gray-500 hover:border-gray-300'
                }`}
              >
                <Moon className={`w-8 h-8 mb-3 ${isDark ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="font-bold">Dark Mode</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

