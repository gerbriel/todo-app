import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Move, Trash2, Archive, Edit } from 'lucide-react';
import { getBoards } from '@/api/boards';
import { moveListToBoard, deleteList } from '@/api/lists';
import { useAuth } from '@/contexts/AuthContext';
import { useOrg } from '@/contexts/OrgContext';
import type { ListRow, BoardRow } from '@/types/dto';

interface ListContextMenuProps {
  list: ListRow;
  onClose: () => void;
  isOpen: boolean;
}

export default function ListContextMenu({ list, onClose, isOpen }: ListContextMenuProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const { currentOrg } = useOrg();
  const boardsQuery = useQuery({
    queryKey: ['boards', currentOrg?.id || user?.id],
    queryFn: () => user?.id ? getBoards(currentOrg?.id || user.id) : Promise.resolve([]),
    enabled: isOpen && !!user?.id,
  });

  const moveListMutation = useMutation({
    mutationFn: ({ targetBoardId }: { targetBoardId: string }) => 
      moveListToBoard(list.id, targetBoardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      onClose();
    },
    onError: (error) => {
      console.error('Failed to move list:', error);
    }
  });

  const deleteListMutation = useMutation({
    mutationFn: () => deleteList(list.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', list.board_id] });
      onClose();
    },
    onError: (error) => {
      console.error('Failed to delete list:', error);
    }
  });

  const boards = (boardsQuery.data || []) as BoardRow[];
  const currentBoard = boards.find(b => b.id === list.board_id);
  const isArchiveBoard = currentBoard?.name === 'Archive';
  const archiveBoard = boards.find(b => b.name === 'Archive');
  const otherBoards = boards.filter(b => b.id !== list.board_id);

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-6 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-2 min-w-48">
      {/* Edit option */}
      <button
        onClick={() => {
          // TODO: Implement inline editing
          console.log('Edit list:', list.name);
          onClose();
        }}
        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
      >
        <Edit className="w-4 h-4" />
        Rename List
      </button>

      {/* Move to Board options */}
      {otherBoards.length > 0 && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-600 my-1" />
          <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Move to Board
          </div>
          {otherBoards.map((board) => (
            <button
              key={board.id}
              onClick={() => moveListMutation.mutate({ targetBoardId: board.id })}
              disabled={moveListMutation.isPending}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Move className="w-4 h-4" />
              {board.name}
            </button>
          ))}
        </>
      )}

      {/* Archive option (only if not already in archive) */}
      {!isArchiveBoard && archiveBoard && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-600 my-1" />
          <button
            onClick={() => moveListMutation.mutate({ targetBoardId: archiveBoard.id })}
            disabled={moveListMutation.isPending}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Archive className="w-4 h-4" />
            Archive List
          </button>
        </>
      )}

      {/* Delete option (only if in archive board) */}
      {isArchiveBoard && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-600 my-1" />
          <button
            onClick={() => deleteListMutation.mutate()}
            disabled={deleteListMutation.isPending}
            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Permanently
          </button>
        </>
      )}
    </div>
  );
}