import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
// ...existing imports
import { getBoards, createBoard } from '@/api/boards';
import orgsApi from '@/api/orgs';
import { useOrg } from '@/contexts/OrgContext';
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
  const [orgs, setOrgs] = useState<Array<{id: string; name: string; slug?: string}>>([]);
  const { currentOrg, setCurrentOrg } = useOrg();
  const { data: boards } = useQuery({
    queryKey: ['boards', currentOrg?.id || user?.id], 
    queryFn: () => getBoards(currentOrg?.id || workspaceId),
    enabled: !!user?.id
  });

  // fetch orgs for user
  const orgsQuery = useQuery({
    queryKey: ['orgs', user?.id],
    queryFn: () => user?.id ? orgsApi.getOrgsForUser(user.id) : Promise.resolve([]),
    enabled: !!user?.id
  });

  // keep local state in sync with query
  useEffect(() => {
    if (orgsQuery.data) {
      setOrgs(orgsQuery.data as any[]);
      // If OrgContext has no currentOrg, default to the first org the user is a member of
      if (!currentOrg && (orgsQuery.data as any[]).length > 0) {
        // OrgProvider will persist the selection; setCurrentOrg is safe to call
        setCurrentOrg((orgsQuery.data as any[])[0]);
      }
    }
  }, [orgsQuery.data]);

  const handleCreateBoard = async () => {
    const name = prompt('Enter board name:');
    if (!name?.trim()) return;

    try {
      // use currentOrg if available, otherwise fallback to workspaceId
      const orgId = currentOrg?.id || null;
      let newBoard: any;
      if (orgId) {
        const id = await orgsApi.createBoardWithAdmin(name.trim(), orgId);
        newBoard = { id };
      } else {
        newBoard = await createBoard(workspaceId, name.trim());
      }
      
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
          className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer flex items-center space-x-2" 
          onClick={() => navigate('/')}
        >
          <span>Todo</span>
          {/* show current org name next to app title */}
          {currentOrg ? (
            <div className="flex items-center ml-3">
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">{currentOrg.name}</span>
              <button
                onClick={() => setShowBoardsMenu(!showBoardsMenu)}
                className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Switch organization"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          ) : (
            <span className="ml-3 text-gray-500">Boards</span>
          )}
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
                {/* Org switcher at top of menu */}
                {orgs && orgs.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 mb-1">Organizations</div>
                    <div className="space-y-1">
                      {orgs.map(org => (
                        <button
                          key={org.id}
                            onClick={async () => {
                              // set global current org (OrgProvider handles persistence)
                              await setCurrentOrg(org);
                              setShowBoardsMenu(false);
                            }}
                          className={`w-full text-left px-3 py-1 text-sm ${currentOrg?.id === org.id ? 'font-semibold' : ''} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded`}
                        >
                          {org.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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