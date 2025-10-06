import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Link, useParams, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Archive, 
  Edit,
  Calendar,
  Home,
  Settings,
  Shield
} from 'lucide-react';
import { getBoards, createBoard, archiveBoard, updateBoardName } from '@/api/boards';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user } = useAuth();
  const { boardId } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [newBoardName, setNewBoardName] = useState('');
  const [showNewBoardForm, setShowNewBoardForm] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editBoardName, setEditBoardName] = useState('');

  const { data: boards = [], isLoading } = useQuery({
    queryKey: ['boards', user?.id],
    queryFn: () => user?.id ? getBoards(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  const createBoardMutation = useMutation({
    mutationFn: ({ name, userId }: { name: string; userId: string }) => 
      createBoard(userId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', user?.id] });
      setNewBoardName('');
      setShowNewBoardForm(false);
    },
  });

  const archiveBoardMutation = useMutation({
    mutationFn: (boardId: string) => archiveBoard(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', user?.id] });
    },
  });

  const updateBoardMutation = useMutation({
    mutationFn: ({ boardId, name }: { boardId: string; name: string }) => 
      updateBoardName(boardId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', user?.id] });
    },
  });

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim() && user?.id) {
      createBoardMutation.mutate({ name: newBoardName.trim(), userId: user.id });
    }
  };

  const handleEditBoard = (board: any) => {
    setEditingBoardId(board.id);
    setEditBoardName(board.name);
  };

  const handleSaveEdit = (boardId: string) => {
    if (editBoardName.trim()) {
      updateBoardMutation.mutate({ boardId, name: editBoardName.trim() });
      setEditingBoardId(null);
      setEditBoardName('');
    }
  };

  const handleArchiveBoard = (boardId: string) => {
    if (confirm('Are you sure you want to archive this board?')) {
      archiveBoardMutation.mutate(boardId);
    }
  };

  // Filter boards - separate archive board from regular boards
  const archiveBoardData = boards.find(board => board.name.toLowerCase().includes('archive'));
  const regularBoards = boards.filter(board => !board.name.toLowerCase().includes('archive'));

  if (isCollapsed) {
    return (
      <div className="w-16 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <button
          onClick={onToggle}
          className="p-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <div className="flex flex-col items-center space-y-3 mt-4">
          {regularBoards.slice(0, 3).map((board) => (
            <Link
              key={board.id}
              to={`/b/${board.id}/board`}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                boardId === board.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              title={board.name}
            >
              {board.name.charAt(0).toUpperCase()}
            </Link>
          ))}
          
          {archiveBoardData && (
            <Link
              to={`/b/${archiveBoardData.id}/board`}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                boardId === archiveBoardData.id
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
              }`}
              title="Archive"
            >
              <Archive className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 dark:text-white">Boards</h2>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="p-4 space-y-2 border-b border-gray-200 dark:border-gray-700">
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            location.pathname === '/'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </Link>
        
        <Link
          to="/calendar"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            location.pathname === '/calendar'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">Calendar</span>
        </Link>

        <Link
          to="/themes"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            location.pathname === '/themes'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Themes</span>
        </Link>

        {/* Admin Panel - Only show for admin users */}
        {(user?.email?.includes('admin') || user?.id === 'ad146555-19f4-4eb7-8d22-9ccdedd6a917') && (
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/admin'
                ? 'bg-red-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Admin</span>
          </Link>
        )}
      </div>

      {/* Boards List */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {isLoading ? (
          <div className="text-gray-500 dark:text-gray-400">Loading boards...</div>
        ) : (
          <>
            {/* Regular Boards */}
            <div className="space-y-1">
              {regularBoards.map((board) => (
                <div key={board.id} className="group relative">
                  {editingBoardId === board.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveEdit(board.id);
                      }}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="text"
                        value={editBoardName}
                        onChange={(e) => setEditBoardName(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingBoardId(null)}
                        className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <Link
                      to={`/b/${board.id}/board`}
                      className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                        boardId === board.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="flex-1 text-sm font-medium truncate">{board.name}</span>
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleEditBoard(board);
                          }}
                          className="p-1 hover:bg-white/20 rounded"
                          title="Edit board name"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleArchiveBoard(board.id);
                          }}
                          className="p-1 hover:bg-white/20 rounded"
                          title="Archive board"
                        >
                          <Archive className="w-3 h-3" />
                        </button>
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Archive Section */}
            {archiveBoardData && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Archive
                </h3>
                <Link
                  to={`/b/${archiveBoardData.id}/board`}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    boardId === archiveBoardData.id
                      ? 'bg-red-600 text-white'
                      : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                >
                  <Archive className="w-4 h-4 mr-3" />
                  <span className="text-sm font-medium">{archiveBoardData.name}</span>
                </Link>
              </div>
            )}
          </>
        )}

        {/* Create New Board */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {showNewBoardForm ? (
            <form onSubmit={handleCreateBoard} className="space-y-2">
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Board name"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={!newBoardName.trim() || createBoardMutation.isPending}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createBoardMutation.isPending ? 'Creating...' : 'Create Board'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewBoardForm(false);
                    setNewBoardName('');
                  }}
                  className="px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowNewBoardForm(true)}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create new board
            </button>
          )}
        </div>
      </div>
    </div>
  );
}