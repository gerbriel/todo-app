import { useState } from 'react'
import { 
  DndContext,
  DragOverlay, 
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { Archive, PinIcon } from 'lucide-react'
import type { Card, List } from '../../types'
import { Board } from '../board/Board'
import SortableCard from '../SortableCard'

// Extended types with cards and description like in DemoPage
interface ExtendedCard extends Card {
  // Add any additional card properties needed
}

interface ExtendedList extends List {
  cards?: ExtendedCard[]
}

interface ExtendedBoard {
  id: string
  workspace_id: string
  name: string
  description?: string
  position: number
  archived: boolean
  created_at: string
  updated_at: string
  lists?: ExtendedList[]
}

interface MultiBoardWorkspaceProps {
  boards: ExtendedBoard[]
  archiveBoard: ExtendedBoard
  selectedBoardId: string
  onSelectBoard: (boardId: string) => void
  onCreateList: (boardId: string, name: string) => void
  onUpdateList: (id: string, data: { name?: string; position?: number }) => void
  onCreateCard: (listId: string, title: string) => void
  onMoveCard: (cardId: string, listId: string, position: number) => void
  onReorderLists: (boardId: string, listIds: string[]) => void
  onEditList?: (list: List) => void
  onArchiveList?: (listId: string) => void
  onUnarchiveList?: (listId: string) => void
  onDeleteList?: (listId: string) => void
  onEditCard?: (card: Card) => void
  onArchiveCard?: (cardId: string) => void
  onUnarchiveCard?: (cardId: string) => void
  onDeleteCard?: (cardId: string) => void
  onMoveCardToBoard?: (cardId: string, targetBoardId: string, targetListId: string) => void
  onMoveListToBoard?: (listId: string, targetBoardId: string) => void
  onOpenLabelManager?: () => void
}

export function MultiBoardWorkspace({
  boards,
  archiveBoard,
  selectedBoardId,
  onSelectBoard,
  onCreateList,
  onUpdateList,
  onCreateCard,
  onMoveCard,
  onReorderLists,
  onEditList,
  onArchiveList,
  onUnarchiveList,
  onDeleteList,
  onEditCard,
  onArchiveCard,
  onUnarchiveCard,
  onDeleteCard,
  onMoveCardToBoard,
  onMoveListToBoard,
  onOpenLabelManager
}: MultiBoardWorkspaceProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const allBoards = [...boards, archiveBoard]
  const selectedBoard = allBoards.find(board => board.id === selectedBoardId) || boards[0]

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    
    if (active.data.current?.type === 'card') {
      setActiveCard(active.data.current.card)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    if (!over) {
      setActiveCard(null)
      return
    }

    const activeType = active.data.current?.type
    const overType = over.data.current?.type

    // Handle card drops
    if (activeType === 'card') {
      const activeCard = active.data.current?.card as Card
      
      // Cross-board drop support
      if (over.id === 'archive-drop-zone') {
        onMoveCardToBoard?.(activeCard.id, 'archive-board', 'archive-list-1')
      } else if (overType === 'board') {
        // Dropped on a different board - move to first list
        const targetBoardId = over.id as string
        const targetBoard = allBoards.find(b => b.id === targetBoardId)
        const firstListId = targetBoard?.lists?.[0]?.id
        if (firstListId) {
          onMoveCardToBoard?.(activeCard.id, targetBoardId, firstListId)
        }
      } else if (overType === 'list') {
        // Dropped on a list - same board or cross-board
        const targetListId = over.id as string
        const targetList = allBoards.flatMap(b => b.lists || []).find(l => l.id === targetListId)
        if (targetList && targetList.board_id !== activeCard.board_id) {
          // Cross-board move
          onMoveCardToBoard?.(activeCard.id, targetList.board_id, targetListId)
        } else {
          // Same board move
          onMoveCard(activeCard.id, targetListId, 0)
        }
      } else if (overType === 'card') {
        // Dropped on another card
        const overCard = over.data.current?.card as Card
        const targetList = allBoards.flatMap(b => b.lists || []).find(l => 
          l.cards?.some(card => card.id === overCard.id)
        )
        
        if (targetList) {
          const targetCards = targetList.cards || []
          const overIndex = targetCards.findIndex(card => card.id === overCard.id)
          
          if (targetList.board_id !== activeCard.board_id) {
            // Cross-board move
            onMoveCardToBoard?.(activeCard.id, targetList.board_id, targetList.id)
          } else {
            // Same board move
            onMoveCard(activeCard.id, targetList.id, overIndex)
          }
        }
      }
    }

    // Handle list drops for reordering
    if (activeType === 'list' && overType === 'list') {
      const activeListId = active.id as string
      const overListId = over.id as string
      
      // Find which board the lists belong to
      const activeList = allBoards.flatMap(b => b.lists || []).find(l => l.id === activeListId)
      const overList = allBoards.flatMap(b => b.lists || []).find(l => l.id === overListId)
      
      if (activeList && overList && activeList.board_id === overList.board_id) {
        // Same board reordering
        const board = allBoards.find(b => b.id === activeList.board_id)
        if (board?.lists) {
          const listIds = board.lists.map(l => l.id)
          const activeIndex = listIds.indexOf(activeListId)
          const overIndex = listIds.indexOf(overListId)
          
          if (activeIndex !== overIndex) {
            const newListIds = [...listIds]
            newListIds.splice(activeIndex, 1)
            newListIds.splice(overIndex, 0, activeListId)
            onReorderLists(board.id, newListIds)
          }
        }
      } else if (activeList && overList && activeList.board_id !== overList.board_id) {
        // Cross-board list move
        onMoveListToBoard?.(activeListId, overList.board_id)
      }
    }

    setActiveCard(null)
  }

  return (
    <div className="h-full flex">
      {/* Sidebar with boards */}
      <div className="w-80 bg-gray-900 border-r border-gray-700 p-4 flex flex-col">
        {/* Archive Board - Pinned at top */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <PinIcon className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Pinned</span>
          </div>
          <button
            onClick={() => onSelectBoard('archive-board')}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              selectedBoardId === 'archive-board'
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-gray-700 hover:border-gray-600 bg-gray-800'
            }`}
            data-type="board"
            data-id="archive-board"
          >
            <div className="flex items-center space-x-3">
              <Archive className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <h3 className="font-medium text-amber-100">Archive</h3>
                <p className="text-xs text-amber-300/70">Archived items</p>
              </div>
            </div>
          </button>
        </div>

        {/* Regular Boards */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Boards</h3>
          <div className="space-y-2">
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => onSelectBoard(board.id)}
                className={`w-full p-3 rounded-lg transition-all text-left ${
                  selectedBoardId === board.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                }`}
                data-type="board"
                data-id={board.id}
              >
                <h3 className="font-medium truncate">{board.name}</h3>
                {board.description && (
                  <p className="text-xs opacity-70 truncate mt-1">{board.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Archive Drop Zone */}
        <div
          className="mt-4 p-4 border-2 border-dashed border-gray-600 rounded-lg transition-colors hover:border-amber-400"
          data-type="archive-drop"
          id="archive-drop-zone"
        >
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <Archive className="w-4 h-4" />
            <span className="text-sm">Drop to Archive</span>
          </div>
        </div>
      </div>

      {/* Main Board Area */}
      <div className="flex-1">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Board
            board={selectedBoard}
            onCreateList={(name) => onCreateList(selectedBoardId, name)}
            onUpdateList={onUpdateList}
            onCreateCard={onCreateCard}
            onMoveCard={onMoveCard}
            onReorderLists={(listIds) => onReorderLists(selectedBoardId, listIds)}
            onEditList={onEditList}
            onArchiveList={onArchiveList}
            onUnarchiveList={onUnarchiveList}
            onDeleteList={onDeleteList}
            onEditCard={onEditCard}
            onArchiveCard={onArchiveCard}
            onUnarchiveCard={onUnarchiveCard}
            onDeleteCard={onDeleteCard}
            onMoveCardToBoard={onMoveCardToBoard}
            onMoveListToBoard={onMoveListToBoard}
            onOpenLabelManager={onOpenLabelManager}
            allBoards={allBoards}
          />

          <DragOverlay>
            {activeCard ? (
              <div className="rotate-3 scale-105">
                <SortableCard
                  card={activeCard}
                  isDragging
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}