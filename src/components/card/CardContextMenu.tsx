import { useState } from 'react';
import { useOrg } from '@/contexts/OrgContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Move, Trash2, Archive, Edit, ChevronDown } from 'lucide-react';
import { getBoards } from '@/api/boards';
import { moveCardToBoard, deleteCard } from '@/api/cards';
import type { CardRow, BoardRow } from '@/types/dto';

interface CardContextMenuProps {
  card: CardRow;
  onClose: () => void;
  isOpen: boolean;
  onEdit?: () => void;
}

export default function CardContextMenu({ card, onClose, isOpen, onEdit }: CardContextMenuProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const queryClient = useQueryClient();
  
  const { currentOrg } = useOrg();
  const workspaceId = currentOrg?.id || card.workspace_id;

  const boardsQuery = useQuery({
    queryKey: ['boards', workspaceId],
    queryFn: () => getBoards(workspaceId),
    enabled: isOpen,
  });

  const moveCardMutation = useMutation({
    mutationFn: ({ targetBoardId }: { targetBoardId: string }) => 
      moveCardToBoard(card.id, targetBoardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      onClose();
    },
    onError: (error) => {
      console.error('Failed to move card:', error);
      alert('Failed to move card. Please try again.');
    }
  });

  const deleteCardMutation = useMutation({
    mutationFn: () => deleteCard(card.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
      onClose();
    },
    onError: (error) => {
      console.error('Failed to delete card:', error);
      alert('Failed to delete card. Please try again.');
    }
  });

  const boards = (boardsQuery.data || []) as BoardRow[];
  const currentBoard = boards.find(b => b.id === card.board_id);
  const isArchiveBoard = currentBoard?.name === 'Archive';
  const archiveBoard = boards.find(b => b.name === 'Archive');
  const otherBoards = boards.filter(b => b.id !== card.board_id);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => {
          setShowMoveMenu(false);
          onClose();
        }}
      />
      
      <div className="absolute right-0 top-6 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-2 min-w-48 relative">
        {/* Edit option */}
        {onEdit && (
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        )}

        {/* Move option */}
        {otherBoards.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowMoveMenu(!showMoveMenu)}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Move className="w-4 h-4" />
                Move
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showMoveMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Move submenu */}
            {showMoveMenu && (
              <div className="absolute left-0 top-full z-60 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 min-w-48 max-h-60 overflow-y-auto">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                  Select Board
                </div>
                {otherBoards.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => {
                      moveCardMutation.mutate({ targetBoardId: board.id });
                      setShowMoveMenu(false);
                      onClose();
                    }}
                    disabled={moveCardMutation.isPending}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 disabled:opacity-50"
                  >
                    {moveCardMutation.isPending ? 'Moving...' : board.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Archive option (only if not already in archive) */}
        {!isArchiveBoard && archiveBoard && (
          <button
            onClick={() => {
              moveCardMutation.mutate({ targetBoardId: archiveBoard.id });
              onClose();
            }}
            disabled={moveCardMutation.isPending}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Archive className="w-4 h-4" />
            {moveCardMutation.isPending ? 'Archiving...' : 'Archive'}
          </button>
        )}

        {/* Delete option (only if in archive board) */}
        {isArchiveBoard && (
          <button
            onClick={() => {
              deleteCardMutation.mutate();
              onClose();
            }}
            disabled={deleteCardMutation.isPending}
            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleteCardMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
          </button>
        )}
      </div>
    </>
  );
}