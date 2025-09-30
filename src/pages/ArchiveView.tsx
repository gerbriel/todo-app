import { useState } from 'react'
import { ArchiveRestore, Trash2, Archive as ArchiveIcon } from 'lucide-react'
import type { Board, List, Card } from '../types'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

interface ArchiveViewProps {
  boards: Board[]
  onUnarchiveBoard: (boardId: string) => void
  onDeleteBoard: (boardId: string) => void
  onUnarchiveList: (listId: string) => void
  onDeleteList: (listId: string) => void
  onUnarchiveCard: (cardId: string) => void
  onDeleteCard: (cardId: string) => void
}

export function ArchiveView({
  boards,
  onUnarchiveBoard,
  onDeleteBoard,
  onUnarchiveList,
  onDeleteList,
  onUnarchiveCard,
  onDeleteCard
}: ArchiveViewProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  // Get archived items
  const archivedBoards = boards.filter(board => board.archived)
  const archivedLists = boards.flatMap(board => 
    (board.lists || []).filter(list => list.archived)
  )
  const archivedCards = boards.flatMap(board => 
    (board.lists || []).flatMap(list => 
      (list.cards || []).filter(card => card.archived)
    )
  )

  const handleDelete = (type: string, id: string, name: string, deleteFunction: (id: string) => void) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete ${type} Permanently`,
      message: `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`,
      onConfirm: () => {
        deleteFunction(id)
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <ArchiveIcon className="w-6 h-6 text-gray-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Archive</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Manage archived items
        </span>
      </div>

      {/* Archived Boards */}
      {archivedBoards.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Archived Boards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedBoards.map((board) => (
              <div
                key={board.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{board.name}</h3>
                    {board.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {board.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onUnarchiveBoard(board.id)}
                    className="flex items-center space-x-1"
                  >
                    <ArchiveRestore className="w-4 h-4" />
                    <span>Restore</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete('Board', board.id, board.name, onDeleteBoard)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Archived Lists */}
      {archivedLists.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Archived Lists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedLists.map((list) => {
              const board = boards.find(b => b.id === list.board_id)
              return (
                <div
                  key={list.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">{list.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        from "{board?.name}"
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onUnarchiveList(list.id)}
                      className="flex items-center space-x-1"
                    >
                      <ArchiveRestore className="w-4 h-4" />
                      <span>Restore</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete('List', list.id, list.name, onDeleteList)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Archived Cards */}
      {archivedCards.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Archived Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedCards.map((card) => {
              const board = boards.find(b => 
                b.lists?.some(l => l.cards?.some(c => c.id === card.id))
              )
              const list = board?.lists?.find(l => l.cards?.some(c => c.id === card.id))
              
              return (
                <div
                  key={card.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">{card.title}</h3>
                      {card.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {card.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        from "{list?.name}" in "{board?.name}"
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onUnarchiveCard(card.id)}
                      className="flex items-center space-x-1"
                    >
                      <ArchiveRestore className="w-4 h-4" />
                      <span>Restore</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete('Card', card.id, card.title, onDeleteCard)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {archivedBoards.length === 0 && archivedLists.length === 0 && archivedCards.length === 0 && (
        <div className="text-center py-12">
          <ArchiveIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No archived items</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Archived boards, lists, and cards will appear here.
          </p>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete Permanently"
        confirmVariant="danger"
        isDestructive={true}
      />
    </div>
  )
}