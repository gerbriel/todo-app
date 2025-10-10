import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import ViewSwitcher from '@/components/ViewSwitcher';
import ViewsPanel from '@/components/ViewsPanel';

export default function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showViewsPanel, setShowViewsPanel] = useState(false);
  const location = useLocation();
  
  // Check if we're on a board page that should show the view switcher
  const isBoardPage = /^\/b\/.+\/(board|table|calendar|dashboard|map)$/.test(location.pathname);

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onToggleViews={() => setShowViewsPanel(!showViewsPanel)} />
        
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
        
        {isBoardPage && (
          <ViewSwitcher />
        )}
      </div>
      
      <ViewsPanel 
        isOpen={showViewsPanel} 
        onClose={() => setShowViewsPanel(false)} 
      />
    </div>
  );
}