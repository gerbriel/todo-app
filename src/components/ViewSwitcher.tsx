import { useLocation, useNavigate, useParams } from 'react-router-dom';

interface ViewSwitcherProps {
  className?: string;
}

export default function ViewSwitcher({ className = '' }: ViewSwitcherProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const boardId = params.boardId;

  if (!boardId) return null;

  const views = [
    { id: 'board', name: 'Board', icon: '📋', path: `/b/${boardId}/board` },
    { id: 'table', name: 'Table', icon: '📊', path: `/b/${boardId}/table` },
    { id: 'calendar', name: 'Calendar', icon: '📅', path: `/b/${boardId}/calendar` },
    { id: 'dashboard', name: 'Dashboard', icon: '📈', path: `/b/${boardId}/dashboard` },
    { id: 'map', name: 'Map', icon: '🗺️', path: `/b/${boardId}/map` },
  ];

  const currentView = views.find(view => location.pathname === view.path);

  return (
    <div className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-center px-4 py-2">
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => navigate(view.path)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView?.id === view.id
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <span className="text-base">{view.icon}</span>
              <span className="hidden sm:block">{view.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}