import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { LayoutGrid, Table, Calendar, Clock, MapPin, MoreHorizontal } from 'lucide-react';

export default function FloatingViewMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const boardId = params.boardId;

  const views = [
    { 
      id: 'board', 
      name: 'Board', 
      icon: LayoutGrid, 
      path: boardId ? `/b/${boardId}/board` : '/',
      angle: -60 // Left
    },
    { 
      id: 'table', 
      name: 'Table', 
      icon: Table, 
      path: boardId ? `/b/${boardId}/table` : '/table',
      angle: -30
    },
    { 
      id: 'calendar', 
      name: 'Calendar', 
      icon: Calendar, 
      path: boardId ? `/b/${boardId}/calendar` : '/calendar',
      angle: 0 // Center
    },
    { 
      id: 'timeline', 
      name: 'Timeline', 
      icon: Clock, 
      path: boardId ? `/b/${boardId}/timeline` : '/timeline',
      angle: 30
    },
    { 
      id: 'map', 
      name: 'Map', 
      icon: MapPin, 
      path: boardId ? `/b/${boardId}/map` : '/map',
      angle: 60 // Right
    },
  ];

  const currentView = views.find(view => location.pathname === view.path);

  const handleViewSelect = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const getButtonPosition = (angle: number, distance: number = 100) => {
    const radians = (angle * Math.PI) / 180;
    const x = Math.sin(radians) * distance;
    const y = -Math.cos(radians) * distance;
    return { x, y };
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      {/* View Buttons - Fan out in half arc */}
      {isOpen && views.map((view, index) => {
        const Icon = view.icon;
        const position = getButtonPosition(view.angle, 100);
        const isActive = currentView?.id === view.id;
        
        return (
          <button
            key={view.id}
            onClick={() => handleViewSelect(view.path)}
            className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${
              isActive 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            } rounded-full p-3 shadow-xl border border-gray-200 dark:border-gray-700 group`}
            style={{
              transform: isOpen 
                ? `translate(calc(-50% + ${position.x}px), ${position.y}px)` 
                : 'translate(-50%, 0)',
              opacity: isOpen ? 1 : 0,
              pointerEvents: isOpen ? 'auto' : 'none',
              transitionDelay: `${index * 30}ms`
            }}
            title={view.name}
          >
            <Icon className="w-5 h-5" />
            
            {/* Tooltip */}
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {view.name}
            </span>
          </button>
        );
      })}

      {/* Center Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110"
        title="Toggle Views"
      >
        <MoreHorizontal 
          className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
        />
        
        {/* Current View Indicator */}
        {currentView && !isOpen && (
          <span className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-full p-1 shadow-md">
            {React.createElement(currentView.icon, { className: 'w-3 h-3' })}
          </span>
        )}
      </button>

      {/* Overlay to close menu */}
      {isOpen && (
        <div 
          className="fixed inset-0 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
