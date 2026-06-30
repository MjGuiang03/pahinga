'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/frontend/components/layout/AdminSidebar';
import DashboardMobileHeader from '@/frontend/components/layout/DashboardMobileHeader';

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    if (saved !== null) setCollapsed(saved === 'true');
  }, []);

  const toggleSidebar = () => {
    setCollapsed(prev => {
      localStorage.setItem('adminSidebarCollapsed', String(!prev));
      return !prev;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg overflow-x-hidden">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <main className={`min-h-screen flex flex-col overflow-y-auto transition-all duration-300 ml-0 ${collapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <DashboardMobileHeader onMenuClick={() => setMobileSidebarOpen(true)} />
        {children}
      </main>
    </div>
  );
}
