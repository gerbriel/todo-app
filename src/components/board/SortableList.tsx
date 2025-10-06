import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import type { List, Card, Board } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { ActionMenu } from '../ui/ActionMenu'
import SortableCard from '../SortableCard'

interface SortableListProps {
  list: List
  onUpdateList: (id: string, data: { name?: string; position?: number }) => void
  onCreateCard: (listId: string, title: string) => void
  onEditList?: (list: List) => void
  onArchiveList?: (listId: string) => void
  onUnarchiveList?: (listId: string) => void
  onDeleteList?: (listId: string) => void
  onEditCard?: (card: Card) => void
  onArchiveCard?: (cardId: string) => void
  onUnarchiveCard?: (cardId: string) => void
  onDeleteCard?: (cardId: string) => void
  onMoveCardToBoard?: (cardId: string, boardId: string, listId: string) => void
  onMoveListToBoard?: (listId: string, boardId: string) => void
  currentBoardId?: string
  allBoards?: Board[]
}

export function SortableList({
  list,
  onUpdateList,
  onCreateCard,
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
  currentBoardId,
  allBoards = [],
}: SortableListProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(list.name)
  const [showAddCard, setShowAddCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: 'list',
      list,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const cards = (list.cards || []).filter(card => !card.archived)
  const cardIds = cards.map(card => card.id)

  const handleSaveName = () => {
    if (editName.trim() && editName !== list.name) {
      onUpdateList(list.id, { name: editName.trim() })
    }
    setIsEditing(false)
  }

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onCreateCard(list.id, newCardTitle.trim())
      setNewCardTitle('')
      setShowAddCard(false)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-80 bg-gray-800 rounded-lg p-4 ${isDragging ? 'opacity-50' : ''} ${
        list.archived ? 'opacity-60 border border-gray-600' : ''
      }`}
    >
      {/* List Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {isEditing ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveName()
                  } else if (e.key === 'Escape') {
                    setEditName(list.name)
                    setIsEditing(false)
                  }
                }}
                className="text-sm font-medium"
                autoFocus
              />
            ) : (
              <>
                <h3
                  className="text-sm font-medium text-gray-100 cursor-pointer truncate"
                  onClick={() => setIsEditing(true)}
                >
                  {list.name}
                </h3>
                {list.archived && (
                  <span className="px-2 py-1 text-xs bg-gray-700 text-gray-400 rounded">
                    Archived
                  </span>
                )}
              </>
            )}
          </div>
          
          {!isEditing && (onEditList || onArchiveList || onUnarchiveList || onDeleteList) && (
            <ActionMenu
              isArchived={list.archived}
              canDelete={list.archived}
              onEdit={onEditList ? () => onEditList(list) : undefined}
              onArchive={onArchiveList ? () => onArchiveList(list.id) : undefined}
              onUnarchive={onUnarchiveList ? () => onUnarchiveList(list.id) : undefined}
              onDelete={onDeleteList ? () => onDeleteList(list.id) : undefined}
              showMoveOption={true}
              itemType="list"
              itemName={list.name}
              boards={allBoards}
              currentBoardId={currentBoardId}
              onMoveToBoard={(boardId) => onMoveListToBoard?.(list.id, boardId)}
            />
          )}
        </div>
        
        {/* Drag handle */}
        <div
          className="mt-2 h-1 bg-gray-700 rounded cursor-grab"
          {...attributes}
          {...listeners}
        />
      </div>

      {/* Cards */}
      <div className="space-y-3 mb-4">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onArchive={onArchiveCard}
              onUnarchive={onUnarchiveCard}
              onDelete={onDeleteCard}
              onMoveToBoard={onMoveCardToBoard}
              currentBoardId={currentBoardId}
              availableBoards={allBoards}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add Card */}
      {showAddCard ? (
        <div className="space-y-2">
          <Input
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="Enter card title..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddCard()
              } else if (e.key === 'Escape') {
                setNewCardTitle('')
                setShowAddCard(false)
              }
            }}
            autoFocus
          />
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleAddCard}>
              Add Card
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setNewCardTitle('')
                setShowAddCard(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-400"
          onClick={() => setShowAddCard(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add a card
        </Button>
      )}

      {/* Drop zone for cards */}
      <div
        className="min-h-[20px] mt-4"
        data-type="list"
        data-id={list.id}
      />
    </div>
  )
}