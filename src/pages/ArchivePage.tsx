import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { ArchiveRestore, Trash2, Archive as ArchiveIcon } from 'lucide-react';
import { getArchivedBoards, unarchiveBoard } from '@/api/boards';
import { useAuth } from '@/contexts/AuthContext';

export default function ArchivePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Get archived boards
  const { data: archivedBoards = [], isLoading } = useQuery({
    queryKey: ['archived-boards', user?.id],
    queryFn: () => user?.id ? getArchivedBoards(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  // Unarchive board mutation
  const unarchiveBoardMutation = useMutation({
    mutationFn: unarchiveBoard,
    onSuccess: () => {
      // Invalidate both archived and regular boards queries
      queryClient.invalidateQueries({ queryKey: ['archived-boards', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['boards', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['my-boards'] });
    },
  });

  const handleUnarchiveBoard = (boardId: string) => {
    unarchiveBoardMutation.mutate(boardId);
  };

  const handleDeleteBoard = (boardId: string) => {
    // For now, just show a message that permanent deletion is not implemented
    alert('Permanent deletion is not implemented yet. Use unarchive to restore the board.');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">Loading archive...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <ArchiveIcon className="w-6 h-6 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Archive</h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Manage archived items
          </span>
        </div>

        {/* Archived Boards */}
        {archivedBoards.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Archived Boards ({archivedBoards.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedBoards.map((board) => (
                <div
                  key={board.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {board.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Archived {board.updated_at ? new Date(board.updated_at).toLocaleDateString() : 'recently'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <button
                      onClick={() => handleUnarchiveBoard(board.id)}
                      disabled={unarchiveBoardMutation.isPending}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      <ArchiveRestore className="w-4 h-4" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => handleDeleteBoard(board.id)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <ArchiveIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No archived items
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              When you archive boards, lists, or cards, they will appear here.
            </p>
          </div>
        )}

        {/* Future: Archived Lists and Cards sections would go here */}
        {/* For now, focusing on boards since that's the immediate issue */}
      </div>
    </div>
  );
}