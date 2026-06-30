'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AgencySidebar from '@/frontend/components/layout/AgencySidebar';
import DashboardMobileHeader from '@/frontend/components/layout/DashboardMobileHeader';

export default function AgencyLayout({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('agencySidebarCollapsed');
    if (saved !== null) setCollapsed(saved === 'true');
  }, []);

  const toggleSidebar = () => {
    setCollapsed(prev => {
      localStorage.setItem('agencySidebarCollapsed', String(!prev));
      return !prev;
    });
  };

  // Pending page gets a clean layout — no sidebar
  if (pathname === '/agency/pending') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg overflow-x-hidden">
      <AgencySidebar
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
