import React from 'react';
import { Outlet } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar';
import AppSidebar from '../components/AppSidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-stone-900 flex flex-col selection:bg-amber-400 selection:text-black">
      {/* Top Persistent Navigation */}
      <AppNavbar />

      {/* Main Split Layout: Left Sidebar + Scrollable Content */}
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
