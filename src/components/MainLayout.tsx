import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import FloatingViewMenu from '@/components/FloatingViewMenu';

export default function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

        {/* Floating View Menu */}
        <FloatingViewMenu />
      </div>
    </div>
  );
}