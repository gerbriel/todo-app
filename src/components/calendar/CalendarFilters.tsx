import React from 'react';
import { Check, Filter } from 'lucide-react';
import type { BoardRow } from '@/types/dto';

interface CalendarFiltersProps {
  boards: BoardRow[];
  selectedBoardIds: string[];
  showAllBoards: boolean;
  onSelectedBoardsChange: (boardIds: string[]) => void;
  onShowAllBoardsChange: (showAll: boolean) => void;
}

export default function CalendarFilters({
  boards,
  selectedBoardIds,
  showAllBoards,
  onSelectedBoardsChange,
  onShowAllBoardsChange,
}: CalendarFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleToggleBoard = (boardId: string) => {
    if (selectedBoardIds.includes(boardId)) {
      onSelectedBoardsChange(selectedBoardIds.filter(id => id !== boardId));
    } else {
      onSelectedBoardsChange([...selectedBoardIds, boardId]);
    }
  };

  const handleSelectAll = () => {
    onShowAllBoardsChange(true);
    onSelectedBoardsChange([]);
  };

  const handleSelectNone = () => {
    onShowAllBoardsChange(false);
    onSelectedBoardsChange([]);
  };

  const getBoardColor = (boardId: string): string => {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // emerald
      '#F59E0B', // amber
      '#EF4444', // red
      '#8B5CF6', // violet
      '#06B6D4', // cyan
      '#F97316', // orange
      '#84CC16', // lime
    ];
    
    const index = boards.findIndex(b => b.id === boardId);
    return colors[index % colors.length];
  };

  const activeBoardsCount = showAllBoards ? boards.length : selectedBoardIds.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">
          {activeBoardsCount === boards.length 
            ? 'All Boards' 
            : `${activeBoardsCount} of ${boards.length} Boards`
          }
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg min-w-64">
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Filter Boards
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    All
                  </button>
                  <button
                    onClick={handleSelectNone}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                  >
                    None
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {boards.map((board) => {
                  const isSelected = showAllBoards || selectedBoardIds.includes(board.id);
                  const boardColor = getBoardColor(board.id);
                  
                  return (
                    <label
                      key={board.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (showAllBoards) {
                              // Switch to selective mode
                              onShowAllBoardsChange(false);
                              onSelectedBoardsChange(boards.map(b => b.id).filter(id => id !== board.id));
                            } else {
                              handleToggleBoard(board.id);
                            }
                          }}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                      
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: boardColor }}
                      />
                      
                      <span className="text-sm text-gray-900 dark:text-white flex-1">
                        {board.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}