import { useState } from 'react'
import { 
  DndContext,
  DragOverlay, 
  PointerSensor,
  useSensor,
  useSensors 
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Tags } from 'lucide-react'
import type { Board as BoardType, Card } from '../../types'
import { Button } from '../ui/Button'
import { SortableList } from './SortableList'
import SortableCard from '../SortableCard'
import { CreateListForm } from './CreateListForm'

interface BoardProps {
  board: BoardType
  onCreateList: (name: string) => void
  onUpdateList: (id: string, data: { name?: string; position?: number }) => void
  onCreateCard: (listId: string, title: string) => void
  onMoveCard: (cardId: string, listId: string, position: number) => void
  onReorderLists: (listIds: string[]) => void
  onEditList?: (list: any) => void
  onArchiveList?: (listId: string) => void
  onUnarchiveList?: (listId: string) => void
  onDeleteList?: (listId: string) => void
  onEditCard?: (card: any) => void
  onArchiveCard?: (cardId: string) => void
  onUnarchiveCard?: (cardId: string) => void
  onDeleteCard?: (cardId: string) => void
  onMoveCardToBoard?: (cardId: string, boardId: string, listId: string) => void
  onMoveListToBoard?: (listId: string, boardId: string) => void
  onOpenLabelManager?: () => void
  // Props for move functionality
  allBoards?: BoardType[]
}

export function Board({
  board,
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
  onOpenLabelManager,
  allBoards = []
}: BoardProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [showCreateList, setShowCreateList] = useState(false)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const lists = board.lists || []
  const listIds = lists.map(list => list.id)

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    
    if (active.data.current?.type === 'card') {
      setActiveCard(active.data.current.card)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    if (!over) return

    const activeType = active.data.current?.type
    const overType = over.data.current?.type

    // Moving cards
    if (activeType === 'card') {
      const activeCard = active.data.current?.card as Card
      
      if (overType === 'list') {
        // Moving card to empty list
        const targetListId = over.id as string
        if (activeCard.list_id !== targetListId) {
          onMoveCard(activeCard.id, targetListId, 0)
        }
      } else if (overType === 'card') {
        // Moving card to position of another card
        const overCard = over.data.current?.card as Card
        const targetList = lists.find(list => 
          list.cards?.some(card => card.id === overCard.id)
        )
        
        if (targetList) {
          const targetCards = targetList.cards || []
          const overIndex = targetCards.findIndex(card => card.id === overCard.id)
          
          onMoveCard(activeCard.id, targetList.id, overIndex)
        }
      }
    }
    
    // Moving lists
    if (activeType === 'list' && overType === 'list') {
      const activeIndex = listIds.indexOf(active.id as string)
      const overIndex = listIds.indexOf(over.id as string)
      
      if (activeIndex !== overIndex) {
        const newListIds = [...listIds]
        newListIds.splice(activeIndex, 1)
        newListIds.splice(overIndex, 0, active.id as string)
        onReorderLists(newListIds)
      }
    }

    setActiveCard(null)
  }

  return (
    <div className="h-full p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{board.name}</h1>
          {board.description && (
            <p className="text-gray-400 mt-1">{board.description}</p>
          )}
        </div>
        <Button
          onClick={onOpenLabelManager}
          variant="secondary"
          size="sm"
          className="flex items-center gap-2"
        >
          <Tags className="h-4 w-4" />
          Manage Labels
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 overflow-x-auto pb-6">
          <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
            {lists.map((list) => (
              <SortableList
                key={list.id}
                list={list}
                onUpdateList={onUpdateList}
                onCreateCard={onCreateCard}
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
                currentBoardId={board.id}
                allBoards={allBoards}
              />
            ))}
          </SortableContext>

          {/* Add List Button */}
          <div className="flex-shrink-0 w-80">
            {showCreateList ? (
              <CreateListForm
                onSubmit={(name: string) => {
                  onCreateList(name)
                  setShowCreateList(false)
                }}
                onCancel={() => setShowCreateList(false)}
              />
            ) : (
              <Button
                variant="secondary"
                className="w-full h-12"
                onClick={() => setShowCreateList(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add List
              </Button>
            )}
          </div>
        </div>

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
  )
}