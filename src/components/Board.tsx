import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { getListsByBoard, createList, renameList, updateListPosition, deleteList } from '@/api/lists';
import { getCardsByBoard, updateCardPosition, createCardInList } from '@/api/cards';
import SortableList from './SortableList';
import { 
  DndContext, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { getSupabase } from '@/app/supabaseClient';
import type { CardRow, ListRow } from '@/types/dto';

type CardDragData = { type: 'card'; cardId: string; listId: string };
type ListDragData = { type: 'list'; listId: string };

export default function Board() {
  const { boardId } = useParams();

  const listsQuery = useQuery({
    queryKey: ['lists', boardId],
    queryFn: () => getListsByBoard(boardId!),
    enabled: !!boardId,
  });

  const cardsQuery = useQuery({
    queryKey: ['cards', boardId],
    queryFn: () => getCardsByBoard(boardId!),
    enabled: !!boardId,
  });

  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  
  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  const [activeDrag, setActiveDrag] = React.useState<null | { type: 'card' | 'list'; id: string }>(null);
  const [dropHighlightListId, setDropHighlightListId] = React.useState<string | null>(null);
  const [isAddingList, setIsAddingList] = React.useState(false);
  const [newListName, setNewListName] = React.useState('');
  
  const rawCards = (cardsQuery.data ?? []) as CardRow[];
  const cards = rawCards; // TODO: Add filtering

  const createListMutation = useMutation({
    mutationFn: (name: string) => createList(boardId!, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', boardId] });
      setIsAddingList(false);
      setNewListName('');
    },
    onError: (error) => {
      console.error('Failed to create list:', error);
    }
  });

  const updateListMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; position?: number } }) => {
      if (data.name !== undefined) {
        return renameList(id, data.name);
      } else if (data.position !== undefined) {
        return updateListPosition(id, data.position);
      }
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', boardId] });
    },
    onError: (error) => {
      console.error('Failed to update list:', error);
    }
  });

  const deleteListMutation = useMutation({
    mutationFn: (listId: string) => deleteList(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', boardId] });
      queryClient.invalidateQueries({ queryKey: ['cards', boardId] });
    },
    onError: (error) => {
      console.error('Failed to delete list:', error);
    }
  });

  const createCardMutation = useMutation({
    mutationFn: ({ listId, title }: { listId: string; title: string }) => 
      createCardInList(listId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', boardId] });
    },
    onError: (error) => {
      console.error('Failed to create card:', error);
    }
  });

  React.useEffect(() => {
    const onToggle = (e: Event) => setModalOpen(Boolean((e as CustomEvent).detail));
    window.addEventListener('card-modal-toggle', onToggle as any);
    return () => window.removeEventListener('card-modal-toggle', onToggle as any);
  }, []);

  React.useEffect(() => {
    if (!modalOpen) return;
    setActiveDrag(null);
    setDropHighlightListId(null);
  }, [modalOpen]);

  React.useEffect(() => {
    if (!boardId) return;
    const supabase = getSupabase();
    const channel = supabase
      .channel(`board-${boardId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lists', filter: `board_id=eq.${boardId}` },
        () => queryClient.invalidateQueries({ queryKey: ['lists', boardId] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cards', filter: `board_id=eq.${boardId}` },
        () => queryClient.invalidateQueries({ queryKey: ['cards', boardId] })
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [boardId, queryClient]);

  if (listsQuery.isLoading || cardsQuery.isLoading) {
    return <div className="p-4 text-gray-500 dark:text-gray-400">Loading board…</div>;
  }
  if (listsQuery.error || cardsQuery.error) {
    return <div className="p-4 text-red-500">Failed to load board.</div>;
  }

  const lists = (listsQuery.data ?? []) as ListRow[];

  const onDragStart = (evt: any) => {
    const t = (evt.active.data.current as any)?.type as 'card' | 'list' | undefined;
    if (t) setActiveDrag({ type: t, id: String(evt.active.id) });
  };

  const onDragOver = () => {
    // Handle visual feedback during drag
  };

  const handleAddList = () => {
    if (newListName.trim()) {
      createListMutation.mutate(newListName.trim());
    }
  };

  const handleListKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddList();
    } else if (e.key === 'Escape') {
      setIsAddingList(false);
      setNewListName('');
    }
  };

  const handleUpdateList = (id: string, data: { name?: string; position?: number }) => {
    updateListMutation.mutate({ id, data });
  };

  const handleCreateCard = (listId: string, title: string) => {
    createCardMutation.mutate({ listId, title });
  };

  const handleDeleteList = (listId: string) => {
    deleteListMutation.mutate(listId);
  };

  const onDragEnd = async (evt: any) => {
    const { active, over } = evt;
    if (!over) return;
    if (active.id === over.id) return;

    const activeData = active.data.current as CardDragData | ListDragData | undefined;
    const overData = over.data.current as CardDragData | ListDragData | undefined;

    const activeType = (activeData as any)?.type as 'card' | 'list' | undefined;
    
    if (activeType === 'card') {
      const sourceListId: string | undefined = activeData?.listId;
      let targetListId: string | undefined = overData?.listId;
      if (!targetListId && (overData as CardDragData | undefined)?.cardId)
        targetListId = (overData as CardDragData).listId;

      if (!targetListId || !sourceListId) return;

      const allCards = (queryClient.getQueryData(['cards', boardId]) as CardRow[]) ?? [];
      const targetCards = allCards.filter((c) => c.list_id === targetListId);
      const overIndex = targetCards.findIndex((c) => c.id === over.id);
      const insertIndex = overData?.type === 'card' && overIndex !== -1 ? overIndex : targetCards.length;

      const prev = targetCards[insertIndex - 1]?.position ?? 0;
      const next = targetCards[insertIndex]?.position ?? (prev + 2000);
      const newPosition = (prev + next) / 2;

      try {
        await updateCardPosition(String(active.id), targetListId, newPosition);
        await queryClient.invalidateQueries({ queryKey: ['cards', boardId] });
      } catch (error) {
        console.error('Failed to move card:', error);
      }
    } else if (activeType === 'list') {
      // Handle list reordering
      const allLists = (queryClient.getQueryData(['lists', boardId]) as ListRow[]) ?? [];
      const overIndex = allLists.findIndex((l) => l.id === over.id);
      const activeIndex = allLists.findIndex((l) => l.id === active.id);
      
      if (overIndex === -1 || activeIndex === -1) return;

      // Calculate new position for the moved list
      let newPosition: number;
      if (overIndex === 0) {
        // Moving to first position
        newPosition = (allLists[0]?.position ?? 1000) / 2;
      } else if (overIndex === allLists.length - 1) {
        // Moving to last position
        newPosition = (allLists[allLists.length - 1]?.position ?? 0) + 1000;
      } else {
        // Moving between lists
        const prev = overIndex > activeIndex ? allLists[overIndex]?.position : allLists[overIndex - 1]?.position;
        const next = overIndex > activeIndex ? allLists[overIndex + 1]?.position : allLists[overIndex]?.position;
        newPosition = ((prev ?? 0) + (next ?? (prev ?? 0) + 2000)) / 2;
      }

      try {
        await updateListPosition(String(active.id), newPosition);
        await queryClient.invalidateQueries({ queryKey: ['lists', boardId] });
      } catch (error) {
        console.error('Failed to move list:', error);
      }
    }
  };

  const onDragCancel = () => {
    setActiveDrag(null);
    setDropHighlightListId(null);
  };

  return (
    <div className="p-4 h-[calc(100vh-3rem)] overflow-auto">
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
        <SortableContext items={lists.map((l) => l.id)} strategy={horizontalListSortingStrategy}>
          <div className={`flex gap-4 min-w-max items-stretch relative ${modalOpen ? 'pointer-events-none select-none' : ''}`}>
            {lists.map((l) => (
              <SortableList 
                key={l.id}
                list={l} 
                cards={cards.filter((c: CardRow) => c.list_id === l.id)} 
                highlighted={dropHighlightListId === l.id}
                onUpdateList={handleUpdateList}
                onCreateCard={handleCreateCard}
                onDeleteList={handleDeleteList}
              />
            ))}
            
            {/* Add List Button */}
            {isAddingList ? (
              <div className="w-80 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 p-3">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={handleListKeyPress}
                  onBlur={() => {
                    if (!newListName.trim()) {
                      setIsAddingList(false);
                      setNewListName('');
                    }
                  }}
                  placeholder="Enter list title"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleAddList}
                    disabled={!newListName.trim() || createListMutation.isPending}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createListMutation.isPending ? 'Adding...' : 'Add list'}
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingList(false);
                      setNewListName('');
                    }}
                    className="px-3 py-1 text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className="w-80 bg-gray-50 dark:bg-gray-900 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add another list
              </button>
            )}
          </div>
        </SortableContext>
        
        <DragOverlay>
          {activeDrag?.type === 'card' ? (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 rotate-3 transform">
              <div className="font-medium text-gray-900 dark:text-white">Moving card...</div>
            </div>
          ) : activeDrag?.type === 'list' ? (
            <div className="w-80 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-3 rotate-3 transform">
              <div className="font-medium text-gray-900 dark:text-white">Moving list...</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
