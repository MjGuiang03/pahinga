'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/frontend/components/layout/AdminSidebar';

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

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
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-bg">
      <AdminSidebar collapsed={collapsed} onToggle={toggleSidebar} />
      <main
        className="flex-1 min-h-screen overflow-y-auto transition-all duration-300"
        style={{ marginLeft: collapsed ? '64px' : '256px' }}
      >
        {children}
      </main>
    </div>
  );
}
