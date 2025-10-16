import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

interface ViewsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewsPanel({ isOpen, onClose }: ViewsPanelProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const boardId = params.boardId;

  const views = [
    { id: 'board', name: 'Board', icon: '📋', path: boardId ? `/b/${boardId}/board` : '/' },
    { id: 'table', name: 'Table', icon: '📊', path: boardId ? `/b/${boardId}/table` : '/table' },
    { id: 'calendar', name: 'Calendar', icon: '📅', path: boardId ? `/b/${boardId}/calendar` : '/calendar' },
    { id: 'timeline', name: 'Timeline', icon: '⏰', path: boardId ? `/b/${boardId}/timeline` : '/timeline' },
    { id: 'map', name: 'Map', icon: '🗺️', path: boardId ? `/b/${boardId}/map` : '/map' },
  ];

  const masterViews = [
    { id: 'master-calendar', name: 'Master Calendar', icon: '📅', path: '/master-calendar', description: 'View all boards in one calendar' },
    { id: 'all-maps', name: 'All Maps', icon: '�️', path: '/all-maps', description: 'View all pinned locations from all boards' },
  ];

  const currentView = views.find(view => location.pathname === view.path) || 
                    masterViews.find(view => location.pathname === view.path);

  const handleViewSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Views Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Views</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Board Views */}
          {boardId && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Board Views
              </h3>
              <div className="space-y-1">
                {views.map((view) => (
                  <button
                    key={view.id}
                    onClick={() => handleViewSelect(view.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      currentView?.id === view.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-lg">{view.icon}</span>
                    <span className="font-medium">{view.name}</span>
                    {currentView?.id === view.id && (
                      <span className="ml-auto text-blue-500">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Master Views */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Workspace Views
            </h3>
            <div className="space-y-1">
              {masterViews.map((view) => (
                <button
                  key={view.id}
                  onClick={() => handleViewSelect(view.path)}
                  className={`w-full flex items-start gap-3 px-3 py-3 rounded-md text-left transition-colors ${
                    currentView?.id === view.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg mt-0.5">{view.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{view.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{view.description}</div>
                  </div>
                  {currentView?.id === view.id && (
                    <span className="text-blue-500 mt-1">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}