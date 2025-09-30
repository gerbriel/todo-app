import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, Clock, MessageSquare, AlertCircle, User } from 'lucide-react'
import type { Card, Board as BoardType } from '../../types'
import { CardActionMenu } from '../ui/CardActionMenu'

interface SortableCardProps {
  card: Card
  isDragging?: boolean
  onEdit?: (card: Card) => void
  onArchive?: (cardId: string) => void
  onUnarchive?: (cardId: string) => void
  onDelete?: (cardId: string) => void
  onMoveToBoard?: (cardId: string, boardId: string, listId: string) => void
  availableBoards?: BoardType[]
  currentBoardId?: string
}

export function SortableCard({ 
  card, 
  isDragging: externalIsDragging,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  onMoveToBoard,
  availableBoards = [],
  currentBoardId
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
    },
  })

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onEdit?.(card)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isActuallyDragging = isDragging || externalIsDragging

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-400'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false
    return new Date(dateString) < new Date()
  }

  const commentsCount = card.activity?.filter(a => a.action === 'comment').length || 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
        isActuallyDragging ? 'opacity-50 scale-95' : ''
      } ${card.archived ? 'opacity-60 border-gray-300 dark:border-gray-600' : ''}`}
      onDoubleClick={handleDoubleClick}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Priority indicator */}
          {card.priority && (
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(card.priority)}`} />
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {card.priority} priority
              </span>
            </div>
          )}

          {/* Title and status */}
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate flex-1">
              {card.title}
            </h3>
            {card.archived && (
              <span className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                Archived
              </span>
            )}
          </div>

          {/* Status badge */}
          {card.status && (
            <div className="mb-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(card.status)}`}>
                {card.status.replace('-', ' ')}
              </span>
            </div>
          )}

          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.labels.slice(0, 3).map((label) => (
                <span
                  key={label.id}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: label.color + '20', 
                    color: label.color,
                    border: `1px solid ${label.color}40`
                  }}
                >
                  {label.name}
                </span>
              ))}
              {card.labels.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{card.labels.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {card.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
              {card.description}
            </p>
          )}

          {/* Dates and metadata */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
              {/* Due date */}
              {card.due_date && (
                <div className={`flex items-center space-x-1 ${
                  isOverdue(card.due_date) ? 'text-red-600 dark:text-red-400' : ''
                }`}>
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(card.due_date)}</span>
                  {isOverdue(card.due_date) && <AlertCircle className="w-3 h-3" />}
                </div>
              )}

              {/* Date range */}
              {(card.date_start || card.date_end) && !card.due_date && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {formatDate(card.date_start)} {card.date_end && '- ' + formatDate(card.date_end)}
                  </span>
                </div>
              )}

              {/* Comments */}
              {commentsCount > 0 && (
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{commentsCount}</span>
                </div>
              )}

              {/* Members */}
              {card.members && card.members.length > 0 && (
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{card.members.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {(onEdit || onArchive || onUnarchive || onDelete || onMoveToBoard) && (
          <div className="ml-2">
            <CardActionMenu
              isArchived={card.archived}
              canDelete={card.archived}
              onEdit={onEdit ? () => onEdit(card) : undefined}
              onArchive={onArchive ? () => onArchive(card.id) : undefined}
              onUnarchive={onUnarchive ? () => onUnarchive(card.id) : undefined}
              onDelete={onDelete ? () => onDelete(card.id) : undefined}
              onMoveToBoard={onMoveToBoard ? (boardId: string, listId: string) => onMoveToBoard(card.id, boardId, listId) : undefined}
              availableBoards={availableBoards}
              currentBoardId={currentBoardId}
            />
          </div>
        )}
      </div>
    </div>
  )
}
