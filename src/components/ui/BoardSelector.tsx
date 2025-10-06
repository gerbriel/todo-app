import { useState } from 'react'
import { ChevronDown, ArrowRight } from 'lucide-react'
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
  onMoveToBoard, 
  itemType,
  itemName 
}: BoardSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedBoardId, setSelectedBoardId] = useState<string>('')
  const [selectedListId, setSelectedListId] = useState<string>('')

  // Filter out the current board
  const availableBoards = boards.filter(board => 
    board.id !== currentBoardId && !board.archived
  )

  const selectedBoard = availableBoards.find(board => board.id === selectedBoardId)

  const handleBoardSelect = (boardId: string) => {
    setSelectedBoardId(boardId)
    if (itemType === 'list') {
      // For lists, we can move immediately
      handleMove(boardId)
    }
    // For cards, wait for list selection
  }

  const handleListSelect = (listId: string) => {
    setSelectedListId(listId)
    if (selectedBoardId && itemType === 'card') {
      handleMove(selectedBoardId, listId)
    }
  }

  const handleMove = (boardId: string, listId?: string) => {
    onMoveToBoard(boardId, listId)
    setIsOpen(false)
    setSelectedBoardId('')
    setSelectedListId('')
  }

  if (availableBoards.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-2">
        No other boards available
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md w-full text-left"
      >
        <ArrowRight className="w-4 h-4" />
        <span>Move {itemType}</span>
        <ChevronDown className="w-4 h-4 ml-auto" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-20" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">
                Move "{itemName}" to:
              </h3>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {!selectedBoardId ? (
                // Board selection
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2 px-2">
                    Select Board:
                  </div>
                  {availableBoards.map(board => (
                    <button
                      key={board.id}
                      onClick={() => handleBoardSelect(board.id)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center justify-between"
                    >
                      <span>{board.name}</span>
                      <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                    </button>
                  ))}
                </div>
              ) : (
                // List selection (for cards only)
                itemType === 'card' && selectedBoard && (
                  <div className="p-2">
                    <div className="flex items-center justify-between px-2 mb-2">
                      <div>
                        <div className="text-xs font-medium text-gray-500">
                          Board: {selectedBoard.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          Select List:
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedBoardId('')}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Back
                      </button>
                    </div>
                    
                    {selectedBoard.lists?.filter(list => !list.archived).map(list => (
                      <button
                        key={list.id}
                        onClick={() => handleListSelect(list.id)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        {list.name}
                      </button>
                    )) || (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No lists available in this board
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}