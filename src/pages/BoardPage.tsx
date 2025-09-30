import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { boardsApi, listsApi } from '../api/boards'
import { cardsApi } from '../api/cards'
import { Board } from '../components/board/Board'
import type { CreateListData, CreateCardData } from '../types'

export function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: board, isLoading } = useQuery({
    queryKey: ['board', id],
    queryFn: () => boardsApi.getBoard(id!),
    enabled: !!id,
  })

  // Mutations
  const createListMutation = useMutation({
    mutationFn: (data: CreateListData) => listsApi.createList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', id] })
    },
  })

  const updateListMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      listsApi.updateList(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', id] })
    },
  })

  const createCardMutation = useMutation({
    mutationFn: (data: CreateCardData) => cardsApi.createCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', id] })
    },
  })

  const moveCardMutation = useMutation({
    mutationFn: ({ cardId, listId, position }: { cardId: string; listId: string; position: number }) =>
      cardsApi.moveCard(cardId, listId, position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', id] })
    },
  })

  const reorderListsMutation = useMutation({
    mutationFn: (listIds: string[]) => listsApi.reorderLists(id!, listIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', id] })
    },
  })

  // Handlers
  const handleCreateList = (name: string) => {
    if (!board) return
    
    const listData: CreateListData = {
      name,
      board_id: board.id,
      position: (board.lists?.length || 0),
    }
    
    createListMutation.mutate(listData)
  }

  const handleUpdateList = (listId: string, data: { name?: string; position?: number }) => {
    updateListMutation.mutate({ id: listId, data })
  }

  const handleCreateCard = (listId: string, title: string) => {
    const list = board?.lists?.find(l => l.id === listId)
    if (!list) return
    
    const cardData: CreateCardData = {
      title,
      list_id: listId,
      position: (list.cards?.length || 0),
    }
    
    createCardMutation.mutate(cardData)
  }

  const handleMoveCard = (cardId: string, listId: string, position: number) => {
    moveCardMutation.mutate({ cardId, listId, position })
  }

  const handleReorderLists = (listIds: string[]) => {
    reorderListsMutation.mutate(listIds)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    )
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-100 mb-2">Board not found</h2>
          <p className="text-gray-400">The board you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <Board
      board={board}
      onCreateList={handleCreateList}
      onUpdateList={handleUpdateList}
      onCreateCard={handleCreateCard}
      onMoveCard={handleMoveCard}
      onReorderLists={handleReorderLists}
    />
  )
}