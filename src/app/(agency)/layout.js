'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AgencySidebar from '@/frontend/components/layout/AgencySidebar';

export default function AgencyLayout({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-bg">
      <AgencySidebar collapsed={collapsed} onToggle={toggleSidebar} />
      <main
        className="flex-1 min-h-screen overflow-y-auto transition-all duration-300"
        style={{ marginLeft: collapsed ? '64px' : '256px' }}
      >
        {children}
      </main>
    </div>
  );
}
