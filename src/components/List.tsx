import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Plus, MoreHorizontal } from 'lucide-react';
import type { CardRow, ListRow } from '@/types/dto';
import SortableCard from './SortableCard';
import { createCardInList } from '@/api/cards';

interface ListProps {
  title: string;
  listId: string;
  list: ListRow;
  cards: CardRow[];
  highlighted?: boolean;
  dragListeners?: any;
  onUpdateList?: (id: string, data: { name?: string; position?: number }) => void;
  onCreateCard?: (listId: string, title: string) => void;
  onDeleteList?: (listId: string) => void;
}

export default function List({ 
  title, 
  listId, 
  cards, 
  highlighted, 
  dragListeners,
  onUpdateList,
  onCreateCard,
  onDeleteList
}: ListProps) {
  const { boardId } = useParams();
  const queryClient = useQueryClient();
  const [isAddingCard, setIsAddingCard] = React.useState(false);
  const [newCardTitle, setNewCardTitle] = React.useState('');
  const [showContextMenu, setShowContextMenu] = React.useState(false);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [editingTitle, setEditingTitle] = React.useState(title);

  const { setNodeRef } = useDroppable({ 
    id: listId, 
    data: { type: 'list', listId } 
  });

  const createCardMutation = useMutation({
    mutationFn: async (title: string) => {
      // Use parent handler if provided, otherwise use direct API call
      if (onCreateCard) {
        onCreateCard(listId, title);
        return;
      }
      await createCardInList(listId, title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', boardId] });
      setIsAddingCard(false);
      setNewCardTitle('');
    },
    onError: (error) => {
      console.error('Failed to create card:', error);
    }
  });

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      createCardMutation.mutate(newCardTitle.trim());
    }
  };

  const handleCardKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCard();
    } else if (e.key === 'Escape') {
      setIsAddingCard(false);
      setNewCardTitle('');
    }
  };

  const handleTitleSave = () => {
    if (editingTitle.trim() && editingTitle.trim() !== title && onUpdateList) {
      onUpdateList(listId, { name: editingTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditingTitle(title);
      setIsEditingTitle(false);
    }
  };

  const handleTitleDoubleClick = () => {
    setIsEditingTitle(true);
    setEditingTitle(title);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(!showContextMenu);
  };

  return (
    <div className={`w-80 bg-gray-100 dark:bg-gray-800 rounded-md border ${
      highlighted ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700'
    } flex flex-col group`}>
      <div 
        className="font-medium mb-2 p-3 flex items-center justify-between cursor-grab relative"
        {...dragListeners}
      >
        {isEditingTitle ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyPress}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white"
            autoFocus
          />
        ) : (
          <div 
            className="text-left flex-1 text-gray-900 dark:text-white"
            onDoubleClick={handleTitleDoubleClick}
          >
            {title}
          </div>
        )}
        
        <button
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleContextMenu}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </button>

        {showContextMenu && (
          <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10">
            <button
              onClick={() => {
                setIsEditingTitle(true);
                setEditingTitle(title);
                setShowContextMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Rename
            </button>
            <button
              onClick={() => {
                if (onDeleteList) onDeleteList(listId);
                setShowContextMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Delete
            </button>
            <button
              onClick={() => setShowContextMenu(false)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div 
        ref={setNodeRef}
        className="flex-1 px-3 pb-3 min-h-[1px]"
      >
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {cards.map((card) => (
              <SortableCard 
                key={card.id} 
                card={card}
              />
            ))}
          </div>
        </SortableContext>

        {isAddingCard ? (
          <div className="mt-2">
            <input
              type="text"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={handleCardKeyPress}
              onBlur={() => {
                if (!newCardTitle.trim()) {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }
              }}
              placeholder="Enter card title"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddCard}
                disabled={!newCardTitle.trim() || createCardMutation.isPending}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {createCardMutation.isPending ? 'Adding...' : 'Add card'}
              </button>
              <button
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }}
                className="px-3 py-1 text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full mt-2 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add a card
          </button>
        )}
      </div>
    </div>
  );
}