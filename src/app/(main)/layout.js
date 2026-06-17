'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/frontend/hooks/useAuth';
import HikerSidebar from '@/frontend/components/layout/HikerSidebar';
import DriverSidebar from '@/frontend/components/layout/DriverSidebar';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

export default function MainLayout({ children }) {
  const { user, isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) setSidebarCollapsed(saved === 'true');
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      localStorage.setItem('sidebarCollapsed', String(!prev));
      return !prev;
    });
  };

  // Hiker & Coordinator — collapsible sidebar
  if (!isLoading && ['hiker', 'coordinator'].includes(user?.role)) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-dark-bg">
        <HikerSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <main
          className="flex-1 min-w-0 min-h-screen transition-all duration-300"
          style={{ marginLeft: sidebarCollapsed ? '64px' : '256px' }}
        >
          {children}
        </main>
      </div>
    );
  }

  // Driver — fixed sidebar (no collapse)
  if (!isLoading && user?.role === 'driver') {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-dark-bg">
        <DriverSidebar />
        <main className="flex-1 min-w-0 min-h-screen ml-64">
          {children}
        </main>
      </div>
    );
  }

  // Public (guest, agency handled by agency layout)
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

