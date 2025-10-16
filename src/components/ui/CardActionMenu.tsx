import { useState } from 'react'
import { MoreHorizontal, Edit2, Archive, Trash2, ArchiveRestore, MoveHorizontal, ChevronDown } from 'lucide-react'
import type { Board as BoardType } from '../../types'

interface CardActionMenuProps {
  isArchived?: boolean
  canDelete?: boolean
  onEdit?: () => void
  onArchive?: () => void
  onUnarchive?: () => void
  onDelete?: () => void
  onMoveToBoard?: (boardId: string, listId: string) => void
  availableBoards?: BoardType[]
  currentBoardId?: string
  position?: 'top' | 'bottom'
}

export function CardActionMenu({
  isArchived = false,
  canDelete = false,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  onMoveToBoard,
  availableBoards = [],
  currentBoardId,
  position = 'bottom'
}: CardActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showMoveMenu, setShowMoveMenu] = useState(false)

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
    setShowMoveMenu(false)
  }

  const handleMoveToBoard = (boardId: string, listId: string) => {
    if (onMoveToBoard) {
      onMoveToBoard(boardId, listId)
    }
    setIsOpen(false)
    setShowMoveMenu(false)
  }

  const menuClasses = position === 'top' 
    ? 'bottom-full mb-2' 
    : 'top-full mt-2'

  const otherBoards = availableBoards.filter(
    board => board.id !== currentBoardId
  )

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
            onClick={() => {
              setIsOpen(false)
              setShowMoveMenu(false)
            }}
          />
          
          {/* Main Menu */}
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
              
              {!isArchived && onMoveToBoard && otherBoards.length > 0 && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMoveMenu(!showMoveMenu)
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <MoveHorizontal className="w-4 h-4" />
                      <span>Move</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showMoveMenu ? 'rotate-180' : ''}`} />
                  </button>
                </div>
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

          {/* Move to Board Submenu */}
          {showMoveMenu && (
            <div className={`absolute right-48 ${menuClasses} w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-30 max-h-60 overflow-y-auto`}>
              <div className="py-1">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  Select Board
                </div>
                {otherBoards.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => handleMoveToBoard(board.id, 'first-list')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                  >
                    {board.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}