import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link, useParams } from 'react-router-dom';
import { Edit, Archive } from 'lucide-react';
import type { BoardRow } from '@/types/dto';

interface SortableBoardProps {
  board: BoardRow;
  isEditing: boolean;
  editName: string;
  onStartEdit: (board: BoardRow) => void;
  onSaveEdit: (boardId: string) => void;
  onEditNameChange: (name: string) => void;
  onArchiveBoard?: (boardId: string) => void;
}

export default function SortableBoard({
  board,
  isEditing,
  editName,
  onStartEdit,
  onSaveEdit,
  onEditNameChange,
  onArchiveBoard,
}: SortableBoardProps) {
  const { boardId } = useParams();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: board.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleCancelEdit = () => {
    onSaveEdit(board.id); // This will cancel the edit by checking if name is empty
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="group relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSaveEdit(board.id);
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            autoFocus
          />
          <button
            type="submit"
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <div
        className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
          boardId === board.id
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        <Link
          to={`/b/${board.id}/board`}
          className="flex-1 text-sm font-medium truncate"
          {...attributes}
          {...listeners}
        >
          {board.name}
        </Link>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 ml-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onStartEdit(board);
            }}
            className={`p-1 rounded ${
              boardId === board.id
                ? 'hover:bg-blue-700'
                : 'hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            title="Edit board name"
          >
            <Edit className="w-3 h-3" />
          </button>
          {onArchiveBoard && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Archive button clicked for board:', board.id);
                onArchiveBoard(board.id);
              }}
              className={`p-1 rounded hover:bg-amber-500 hover:text-white ${
                boardId === board.id
                  ? 'text-white hover:bg-amber-600'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
              title="Archive board"
            >
              <Archive className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}