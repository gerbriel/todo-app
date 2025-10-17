import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBoards, createBoard } from '@/api/boards';
import { useAuth } from '@/contexts/AuthContext';
import { Palette } from 'lucide-react';

export default function Topbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showBoardsMenu, setShowBoardsMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const workspaceId = user?.id || '2a8f10d6-4368-43db-ab1d-ab783ec6e935';
  const { data: boards } = useQuery({
    queryKey: ['boards', user?.id], 
    queryFn: () => getBoards(workspaceId),
    enabled: !!user?.id
  });

  const handleCreateBoard = async () => {
    const name = prompt('Enter board name:');
    if (!name?.trim()) return;

    try {
      const newBoard = await createBoard(workspaceId, name.trim());
      
      await queryClient.invalidateQueries({ queryKey: ['boards', user?.id] });
      navigate(`/b/${newBoard.id}/board`);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const testThemeToggle = () => {
    const root = document.documentElement;
    const isDark = root.style.getPropertyValue('--color-background') === '#1f2937';
    
    if (isDark) {
      // Apply light theme
      const lightColors = {
        primary: '#3b82f6',
        secondary: '#6b7280',
        background: '#ffffff',
        cardBackground: '#f8fafc',
        text: '#1f2937',
        textSecondary: '#6b7280',
        border: '#e5e7eb'
      };
      
      Object.entries(lightColors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#1f2937';
    } else {
      // Apply dark theme
      const darkColors = {
        primary: '#3b82f6',
        secondary: '#6b7280',
        background: '#1f2937',
        cardBackground: '#374151',
        text: '#f9fafb',
        textSecondary: '#d1d5db',
        border: '#4b5563'
      };
      
      Object.entries(darkColors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
      document.body.style.backgroundColor = '#1f2937';
      document.body.style.color = '#f9fafb';
    }
    
    // Dispatch custom event to trigger re-renders
    window.dispatchEvent(new CustomEvent('themeChanged'));
    console.log('Theme toggled!', isDark ? 'Light' : 'Dark');
  };

  return (
    <div className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <h1 
          className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer" 
          onClick={() => navigate('/')}
        >
          Todo
        </h1>
        
        {/* Boards dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowBoardsMenu(!showBoardsMenu)}
            className="flex items-center space-x-1 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span className="text-gray-700 dark:text-gray-300">Boards</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showBoardsMenu && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-2">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Your boards</div>
                <div className="space-y-1">
                  {boards && boards.length > 0 ? (
                    boards.map((board: any) => (
                      <button
                        key={board.id}
                        onClick={() => {
                          navigate(`/b/${board.id}/board`);
                          setShowBoardsMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        {board.name}
                      </button>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">No boards yet</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="flex items-center space-x-1 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span className="text-gray-700 dark:text-gray-300">Create</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          {showCreateMenu && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-2">
                <button
                  onClick={() => {
                    handleCreateBoard();
                    setShowCreateMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Create Board
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Test Button */}
        <button
          onClick={testThemeToggle}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Test Theme Toggle"
        >
          <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.email?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user.email}
              </span>
            </button>
            
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <button
                    onClick={() => {
                      navigate('/admin');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}