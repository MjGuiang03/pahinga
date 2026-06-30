'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/frontend/hooks/useAuth';
import HikerSidebar from '@/frontend/components/layout/HikerSidebar';
import DriverSidebar from '@/frontend/components/layout/DriverSidebar';
import DashboardMobileHeader from '@/frontend/components/layout/DashboardMobileHeader';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

export default function MainLayout({ children }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

  // Driver in Driver Portal
  if (!isLoading && user?.role === 'driver' && pathname.startsWith('/driver')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg overflow-x-hidden">
        <DriverSidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
        <main className="min-w-0 min-h-screen flex flex-col md:ml-64 transition-all duration-300">
          <DashboardMobileHeader onMenuClick={() => setMobileSidebarOpen(true)} />
          {children}
        </main>
      </div>
    );
  }

  // Hiker & Coordinator & Driver acting as hiker
  if (!isLoading && ['hiker', 'coordinator', 'driver'].includes(user?.role)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg overflow-x-hidden">
        <HikerSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={toggleSidebar} 
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <main
          className={`min-w-0 min-h-screen flex flex-col transition-all duration-300 ml-0 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}
        >
          <div className="md:hidden">
            <DashboardMobileHeader onMenuClick={() => setMobileSidebarOpen(true)} />
          </div>
          <div className="hidden md:block" style={{ display: 'none' }} />
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

