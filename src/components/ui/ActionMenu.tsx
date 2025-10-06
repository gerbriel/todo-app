import { useState } from 'react'
import { MoreHorizontal, Edit2, Archive, Trash2, ArchiveRestore } from 'lucide-react'
import { BoardSelector } from './BoardSelector'
import type { Board } from '../../types'

interface ActionMenuProps {
  isArchived?: boolean
  canDelete?: boolean
  onEdit?: () => void
  onArchive?: () => void
  onUnarchive?: () => void
  onDelete?: () => void
  position?: 'top' | 'bottom'
  // Move functionality
  showMoveOption?: boolean
  itemType?: 'card' | 'list'
  itemName?: string
  boards?: Board[]
  currentBoardId?: string
  onMoveToBoard?: (boardId: string, listId?: string) => void
}

export function ActionMenu({
  isArchived = false,
  canDelete = false,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  position = 'bottom',
  // Move props
  showMoveOption = false,
  itemType = 'card',
  itemName = '',
  boards = [],
  currentBoardId = '',
  onMoveToBoard,
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  const menuClasses = position === 'top' 
    ? 'bottom-full mb-2' 
    : 'top-full mt-2'

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className={`absolute right-0 ${menuClasses} w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20`}>
            <div className="py-1">
              {onEdit && (
                <button
                  onClick={() => handleAction(onEdit)}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
              
              {showMoveOption && !isArchived && onMoveToBoard && (
                <BoardSelector
                  boards={boards}
                  currentBoardId={currentBoardId}
                  onMoveToBoard={onMoveToBoard}
                  itemType={itemType}
                  itemName={itemName}
                />
              )}
              
              {(onEdit || (showMoveOption && !isArchived)) && (onArchive || onUnarchive) && (
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              )}
              
              {!isArchived && onArchive && (
                <button
                  onClick={() => handleAction(onArchive)}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Archive className="w-4 h-4" />
                  <span>Archive</span>
                </button>
              )}
              
              {isArchived && onUnarchive && (
                <button
                  onClick={() => handleAction(onUnarchive)}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ArchiveRestore className="w-4 h-4" />
                  <span>Unarchive</span>
                </button>
              )}
              
              {isArchived && canDelete && onDelete && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  <button
                    onClick={() => handleAction(onDelete)}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Permanently</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}