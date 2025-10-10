import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBoards, createBoard } from '@/api/boards';
import { useAuth } from '@/contexts/AuthContext';

interface TopbarProps {
  onToggleViews?: () => void;
}

export default function Topbar({ onToggleViews }: TopbarProps) {
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
      // Invalidate both possible query keys to ensure all components update
      await queryClient.invalidateQueries({ queryKey: ['boards', user?.id] });
      await queryClient.invalidateQueries({ queryKey: ['my-boards'] });
      navigate(`/b/${newBoard.id}/board`);
      setShowCreateMenu(false);
    } catch (e) {
      console.error('Failed to create board', e);
      alert('Failed to create board. Check console for details.');
    }
  };

  return (
    <div className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-4">
      <div className="relative">
        <button
          onClick={() => setShowBoardsMenu(!showBoardsMenu)}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <span className="font-semibold text-gray-900 dark:text-white">
            Project Management App
          </span>
          <span className="text-gray-400">▼</span>
        </button>
        
        {showBoardsMenu && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
            {boards && boards.length > 0 ? (
              boards.map(board => (
                <button
                  key={board.id}
                  onClick={() => {
                    navigate(`/b/${board.id}/board`);
                    setShowBoardsMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {board.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                No boards found
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
              <button
                onClick={() => {
                  navigate('/');
                  setShowBoardsMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                🏠 All Boards
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 max-w-md">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm"
        />
      </div>
      
      {onToggleViews && (
        <button
          onClick={onToggleViews}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Toggle Views Panel"
        >
          <span>📊</span>
          <span className="hidden md:block">Views</span>
        </button>
      )}
      
      <button
        onClick={handleCreateBoard}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
      >
        <span>+</span>
        <span className="hidden md:block">Create Board</span>
      </button>
      
      {user && (
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 hidden md:block">
              {user.email}
            </span>
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <button
                onClick={signOut}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
