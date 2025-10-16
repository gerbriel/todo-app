import { useState } from 'react'
import { MoveHorizontal, ChevronDown } from 'lucide-react'
import type { Board } from '../../types'

interface BoardSelectorProps {
  boards: Board[]
  currentBoardId: string
  onMoveToBoard: (boardId: string, listId?: string) => void
  itemType: 'card' | 'list'
  itemName: string
}

export function BoardSelector({ 
  boards, 
  currentBoardId, 
  onMoveToBoard
}: BoardSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Filter out the current board
  const availableBoards = boards.filter(board => 
    board.id !== currentBoardId
  )

  const handleBoardSelect = (boardId: string) => {
    // For now, move immediately when a board is selected
    // TODO: For cards, we might need to add list selection later
    onMoveToBoard(boardId)
    setIsOpen(false)
  }

  if (availableBoards.length === 0) {
    return null // Don't show move option if no boards available
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md w-full text-left justify-between"
      >
        <div className="flex items-center space-x-2">
          <MoveHorizontal className="w-4 h-4" />
          <span>Move</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-20" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute left-0 top-full mt-1 w-full min-w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-30 max-h-60 overflow-y-auto">
            {availableBoards.map(board => (
              <button
                key={board.id}
                onClick={() => handleBoardSelect(board.id)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
              >
                {board.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}