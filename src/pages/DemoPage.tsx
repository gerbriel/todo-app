import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Board } from '../components/board/Board'
import { ViewSwitcher } from '../components/ui/ViewSwitcher'
import { CalendarView } from './CalendarView'
import { ArchiveView } from './ArchiveView'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Button } from '../components/ui/Button'
import { SearchInput } from '../components/ui/SearchInput'
import { SearchResults, type SearchResult } from '../components/ui/SearchResults'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EditItemModal } from '../components/ui/EditItemModal'
import { CardEditModal } from '../components/ui/CardEditModal'
import { LabelManager } from '../components/ui/LabelManager'
import { ActionMenu } from '../components/ui/ActionMenu'
import { useSearch } from '../hooks/useSearch'
import { cardsApi } from '../api/cards'
import { Plus, Save, X, Tags } from 'lucide-react'
import type { Board as BoardType, List, Card, Label } from '../types'

interface BoardEditFormProps {
  board: BoardType
  onSave: (name: string, description: string) => void
  onCancel: () => void
}

function BoardEditForm({ board, onSave, onCancel }: BoardEditFormProps) {
  const [name, setName] = useState(board.name)
  const [description, setDescription] = useState(board.description || '')

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), description.trim())
    }
  }

  return (
    <div className="space-y-3">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Board name"
        className="text-sm"
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Board description"
        className="text-sm resize-none"
        rows={2}
      />
      <div className="flex items-center space-x-2">
        <Button
          onClick={handleSave}
          size="sm"
          className="flex items-center space-x-1"
        >
          <Save size={14} />
          <span>Save</span>
        </Button>
        <Button
          onClick={onCancel}
          variant="secondary"
          size="sm"
          className="flex items-center space-x-1"
        >
          <X size={14} />
          <span>Cancel</span>
        </Button>
      </div>
    </div>
  )
}

const demoBoards: BoardType[] = [
  {
    id: 'demo-board-1',
  workspace_id: 'afa0b21a-9585-4e62-9908-9c36ed9b0d25',
    name: 'Demo Project Board',
    description: 'Welcome to your project management demo!',
    position: 0,
    archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lists: [
      {
        id: 'demo-list-1',
        board_id: 'demo-board-1',
        name: 'To Do',
        position: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        cards: [
          {
            id: 'demo-card-1',
            list_id: 'demo-list-1',
            title: 'Design new landing page',
            description: 'Create a modern, responsive design that showcases our products and services with an intuitive user experience.',
            position: 0,
            date_start: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            date_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'not-started',
            priority: 'high',
            archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            labels: [{
              id: 'label-1',
              workspace_id: 'demo-workspace',
              name: 'Design',
              color: '#3b82f6',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, {
              id: 'label-2',
              workspace_id: 'demo-workspace',
              name: 'Frontend',
              color: '#10b981',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }],
            activity: [
              {
                id: 'activity-1',
                card_id: 'demo-card-1',
                user_id: 'demo-user',
                action: 'comment',
                details: 'Added wireframe mockups to the shared folder',
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              },
              {
                id: 'activity-2',
                card_id: 'demo-card-1',
                user_id: 'demo-user',
                action: 'comment',
                details: 'Need to review brand guidelines before finalizing',
                created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              }
            ]
          },
          {
            id: 'demo-card-1b',
            list_id: 'demo-list-1',
            title: 'Set up project repository',
            description: 'Initialize Git repository with proper folder structure and documentation.',
            position: 1,
            due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Overdue
            status: 'in-progress',
            priority: 'urgent',
            archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            labels: [{
              id: 'label-3',
              workspace_id: 'demo-workspace',
              name: 'Development',
              color: '#8b5cf6',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }],
            activity: [
              {
                id: 'activity-3',
                card_id: 'demo-card-1b',
                user_id: 'demo-user',
                action: 'comment',
                details: 'Repository created, setting up CI/CD next',
                created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'demo-board-2',
    workspace_id: 'demo-workspace',
    name: 'Marketing Campaign',
    description: 'Q4 marketing planning',
    position: 1,
    archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lists: [
      {
        id: 'demo-list-2',
        board_id: 'demo-board-2',
        name: 'Planning',
        position: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        cards: [
          {
            id: 'demo-card-2',
            list_id: 'demo-list-2',
            title: 'Define target audience',
            description: 'Research and analyze our target market demographics, preferences, and behavior patterns to create effective marketing strategies.',
            position: 0,
            date_start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            date_end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            priority: 'medium',
            archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            labels: [{
              id: 'label-4',
              workspace_id: 'demo-workspace',
              name: 'Research',
              color: '#f59e0b',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, {
              id: 'label-5',
              workspace_id: 'demo-workspace',
              name: 'Marketing',
              color: '#ef4444',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }],
            members: [{
              id: 'demo-user-1',
              email: 'sarah@example.com',
              name: 'Sarah Johnson',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }]
          }
        ]
      }
    ]
  }
]

export function DemoPage() {
  const queryClient = useQueryClient()
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar' | 'archive'>('dashboard')
  const [selectedBoardId, setSelectedBoardId] = useState<string>('demo-board-1')
  const [boards, setBoards] = useState<BoardType[]>(demoBoards)
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [newBoardDescription, setNewBoardDescription] = useState('')
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  
  // Modal states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    isDestructive?: boolean
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })
  
  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    type: 'board' | 'list' | 'card'
    item: BoardType | List | Card | null
  }>({
    isOpen: false,
    type: 'board',
    item: null
  })

  const [cardEditModal, setCardEditModal] = useState<{
    isOpen: boolean
    card: Card | null
  }>({
    isOpen: false,
    card: null
  })

  // App-wide labels state
  const [labels, setLabels] = useState<Label[]>([
    { id: 'label-1', workspace_id: 'demo-workspace', name: 'Bug', color: '#EF4444', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'label-2', workspace_id: 'demo-workspace', name: 'Feature', color: '#3B82F6', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'label-3', workspace_id: 'demo-workspace', name: 'Enhancement', color: '#10B981', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'label-4', workspace_id: 'demo-workspace', name: 'Documentation', color: '#F59E0B', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'label-5', workspace_id: 'demo-workspace', name: 'Urgent', color: '#DC2626', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ])
  
  const [labelManager, setLabelManager] = useState({
    isOpen: false
  })

  const searchResults = useSearch(boards, searchQuery)
  const selectedBoard = boards.find(board => board.id === selectedBoardId) || boards[0]
  const allCards = boards.flatMap(board => 
    board.lists?.flatMap(list => list.cards || []) || []
  )
  const selectedBoardCards = selectedBoard.lists?.flatMap(list => list.cards || []) || []

  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      const newBoard: BoardType = {
        id: `demo-board-${Date.now()}`,
        workspace_id: 'demo-workspace',
        name: newBoardName.trim(),
        description: newBoardDescription.trim(),
        position: boards.length,
        archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        lists: []
      }
      setBoards([...boards, newBoard])
      setNewBoardName('')
      setNewBoardDescription('')
      setIsCreateBoardOpen(false)
    }
  }

  const handleRenameBoard = (boardId: string, newName: string, newDescription: string) => {
    setBoards(boards.map(board => 
      board.id === boardId 
        ? { ...board, name: newName, description: newDescription, updated_at: new Date().toISOString() }
        : board
    ))
    setEditingBoardId(null)
  }

  const handleCreateList = (name: string) => {
    const newList = {
      id: `demo-list-${Date.now()}`,
      board_id: selectedBoard.id,
      name: name,
      position: selectedBoard.lists?.length || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cards: []
    }

    setBoards(boards.map(board => 
      board.id === selectedBoard.id
        ? { ...board, lists: [...(board.lists || []), newList], updated_at: new Date().toISOString() }
        : board
    ))
  }

  const handleUpdateList = (id: string, data: { name?: string; position?: number }) => {
    setBoards(boards.map(board => ({
      ...board,
      lists: board.lists?.map(list => 
        list.id === id ? { ...list, ...data, updated_at: new Date().toISOString() } : list
      )
    })))
  }

  const handleCreateCard = (listId: string, title: string) => {
    const newCard = {
      id: `demo-card-${Date.now()}`,
      list_id: listId,
      title: title,
      description: '',
      position: 0,
      archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      labels: []
    }

    setBoards(boards.map(board => ({
      ...board,
      lists: board.lists?.map(list => 
        list.id === listId 
          ? { ...list, cards: [...(list.cards || []), newCard], updated_at: new Date().toISOString() }
          : list
      )
    })))
  }

  const handleMoveCard = (cardId: string, listId: string, position: number) => {
    // Find the card first
    let cardToMove = null
    for (const board of boards) {
      for (const list of board.lists || []) {
        const card = list.cards?.find(c => c.id === cardId)
        if (card) {
          cardToMove = card
          break
        }
      }
      if (cardToMove) break
    }

    if (!cardToMove) return

    // Remove card from old position and add to new position
    setBoards(boards.map(board => ({
      ...board,
      lists: board.lists?.map(list => {
        if (list.id === listId) {
          // Add card to new list
          const updatedCard = { ...cardToMove, list_id: listId, position }
          return { ...list, cards: [...(list.cards || []), updatedCard] }
        } else {
          // Remove card from old list
          return { ...list, cards: list.cards?.filter(c => c.id !== cardId) || [] }
        }
      })
    })))
  }

  const handleReorderLists = (listIds: string[]) => {
    setBoards(boards.map(board => 
      board.id === selectedBoard.id
        ? {
            ...board,
            lists: board.lists?.sort((a, b) => {
              const aIndex = listIds.indexOf(a.id)
              const bIndex = listIds.indexOf(b.id)
              return aIndex - bIndex
            }).map((list, index) => ({ ...list, position: index }))
          }
        : board
    ))
  }

  // Enhanced CRUD Operations
  
  // Board operations
  const handleEditBoard = (board: BoardType) => {
    setEditModal({
      isOpen: true,
      type: 'board',
      item: board
    })
  }

  const handleArchiveBoard = (boardId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Archive Board',
      message: 'Are you sure you want to archive this board? All lists and cards will also be archived.',
      onConfirm: () => {
        setBoards(boards.map(board => 
          board.id === boardId 
            ? { ...board, archived: true, updated_at: new Date().toISOString() }
            : board
        ))
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      }
    })
  }

  const handleUnarchiveBoard = (boardId: string) => {
    setBoards(boards.map(board => 
      board.id === boardId 
        ? { ...board, archived: false, updated_at: new Date().toISOString() }
        : board
    ))
  }

  const handleDeleteBoard = (boardId: string) => {
    const board = boards.find(b => b.id === boardId)
    if (!board?.archived) {
      alert('Board must be archived before it can be deleted.')
      return
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Board Permanently',
      message: 'This action cannot be undone. All lists, cards, and data will be permanently deleted.',
      onConfirm: () => {
        setBoards(boards.filter(board => board.id !== boardId))
        if (selectedBoardId === boardId) {
          setSelectedBoardId(boards.find(b => b.id !== boardId)?.id || '')
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      },
      isDestructive: true
    })
  }

  // List operations
  const handleEditList = (list: List) => {
    setEditModal({
      isOpen: true,
      type: 'list',
      item: list
    })
  }

  const handleArchiveList = (listId: string) => {
    setBoards(boards.map(board => ({
      ...board,
      lists: board.lists?.map(list => 
        list.id === listId 
          ? { ...list, archived: true, updated_at: new Date().toISOString() }
          : list
      )
    })))
  }

  const handleUnarchiveList = (listId: string) => {
    setBoards(boards.map(board => ({
      ...board,
      lists: board.lists?.map(list => 
        list.id === listId 
          ? { ...list, archived: false, updated_at: new Date().toISOString() }
          : list
      )
    })))
  }

  const handleDeleteList = (listId: string) => {
    const list = boards.flatMap(b => b.lists || []).find(l => l.id === listId)
    if (!list?.archived) {
      alert('List must be archived before it can be deleted.')
      return
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Delete List Permanently',
      message: 'This action cannot be undone. All cards in this list will be permanently deleted.',
      onConfirm: () => {
        setBoards(boards.map(board => ({
          ...board,
          lists: board.lists?.filter(list => list.id !== listId)
        })))
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      },
      isDestructive: true
    })
  }

  // Card operations
  const handleEditCard = (card: Card) => {
    setCardEditModal({
      isOpen: true,
      card: card
    })
  }

  const handleArchiveCard = (cardId: string) => {
    setBoards(boards.map(board => ({
      ...board,
      lists: board.lists?.map(list => ({
        ...list,
        cards: list.cards?.map(card => 
          card.id === cardId 
            ? { ...card, archived: true, updated_at: new Date().toISOString() }
            : card
        )
      }))
    })))
  }

  const handleUnarchiveCard = (cardId: string) => {
    setBoards(boards.map(board => ({
      ...board,
      lists: board.lists?.map(list => ({
        ...list,
        cards: list.cards?.map(card => 
          card.id === cardId 
            ? { ...card, archived: false, updated_at: new Date().toISOString() }
            : card
        )
      }))
    })))
  }

  const handleDeleteCard = (cardId: string) => {
    const card = boards.flatMap(b => b.lists || []).flatMap(l => l.cards || []).find(c => c.id === cardId)
    if (!card?.archived) {
      alert('Card must be archived before it can be deleted.')
      return
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Card Permanently',
      message: 'This action cannot be undone. All card data including comments will be permanently deleted.',
      onConfirm: () => {
        setBoards(boards.map(board => ({
          ...board,
          lists: board.lists?.map(list => ({
            ...list,
            cards: list.cards?.filter(card => card.id !== cardId)
          }))
        })))
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      },
      isDestructive: true
    })
  }

  const handleUpdateCardDates = async (cardId: string, startDate: string, endDate: string) => {
    try {
      // Update the card in Supabase
      await cardsApi.updateCard(cardId, {
        date_start: startDate,
        date_end: endDate
      })

      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['boards'] })
    } catch (error) {
      console.error('Failed to update card dates:', error)
      // Optionally show an error message to the user
    }
  }

  const handleMoveCardToBoard = (cardId: string, targetBoardId: string, targetListId: string) => {
    // Find the card and its current location
    let cardToMove: Card | null = null
    let sourceBoardId = ''
    let sourceListId = ''

    // Find the card in all boards
    for (const board of boards) {
      for (const list of board.lists || []) {
        const foundCard = list.cards?.find(c => c.id === cardId)
        if (foundCard) {
          cardToMove = foundCard
          sourceBoardId = board.id
          sourceListId = list.id
          break
        }
      }
      if (cardToMove) break
    }

    if (!cardToMove) return

    // Remove card from source location
    const updatedBoards = boards.map(board => {
      if (board.id === sourceBoardId) {
        return {
          ...board,
          lists: board.lists?.map(list => {
            if (list.id === sourceListId) {
              return {
                ...list,
                cards: list.cards?.filter(c => c.id !== cardId)
              }
            }
            return list
          })
        }
      }
      return board
    })

    // Add card to target location
    const finalBoards = updatedBoards.map(board => {
      if (board.id === targetBoardId) {
        return {
          ...board,
          lists: board.lists?.map(list => {
            if (list.id === targetListId) {
              const newPosition = list.cards?.length || 0
              return {
                ...list,
                cards: [
                  ...(list.cards || []),
                  { ...cardToMove!, position: newPosition, updated_at: new Date().toISOString() }
                ]
              }
            }
            return list
          })
        }
      }
      return board
    })

    setBoards(finalBoards)
  }

  // Modal handlers
  const handleEditModalSave = (data: { name: string; description?: string }) => {
    if (!editModal.item) return

    switch (editModal.type) {
      case 'board':
        const board = editModal.item as BoardType
        setBoards(boards.map(b => 
          b.id === board.id 
            ? { ...b, name: data.name, description: data.description || '', updated_at: new Date().toISOString() }
            : b
        ))
        break
        
      case 'list':
        const list = editModal.item as List
        setBoards(boards.map(board => ({
          ...board,
          lists: board.lists?.map(l => 
            l.id === list.id 
              ? { ...l, name: data.name, updated_at: new Date().toISOString() }
              : l
          )
        })))
        break
    }
    
    setEditModal({ ...editModal, isOpen: false })
  }

  const handleCardEditSave = (cardData: Partial<Card>) => {
    if (!cardEditModal.card) return

    setBoards(boards.map(board => ({
      ...board,
      lists: board.lists?.map(list => ({
        ...list,
        cards: list.cards?.map(card => 
          card.id === cardEditModal.card!.id 
            ? { ...card, ...cardData }
            : card
        )
      }))
    })))
    
    setCardEditModal({ isOpen: false, card: null })
  }

  // Label management functions
  const handleAddLabel = (name: string, color: string) => {
    const newLabel: Label = {
      id: `label-${Date.now()}`,
      workspace_id: 'demo-workspace',
      name,
      color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setLabels([...labels, newLabel])
  }

  const handleUpdateLabel = (id: string, name: string, color: string) => {
    setLabels(labels.map(label => 
      label.id === id 
        ? { ...label, name, color, updated_at: new Date().toISOString() }
        : label
    ))
  }

  const handleDeleteLabel = (id: string) => {
    setLabels(labels.filter(label => label.id !== id))
    
    // Remove the label from all cards
    setBoards(boards.map(board => ({
      ...board,
      lists: board.lists?.map(list => ({
        ...list,
        cards: list.cards?.map(card => ({
          ...card,
          labels: card.labels?.filter(label => label.id !== id)
        }))
      }))
    })))
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setShowSearchResults(value.trim().length > 0)
  }

  const handleSearchResultSelect = (result: SearchResult) => {
    setSearchQuery('')
    setShowSearchResults(false)
    
    // Handle navigation based on search result type
    switch (result.type) {
      case 'board':
        setSelectedBoardId(result.id)
        setCurrentView('dashboard')
        break
      case 'list':
        // Find the board containing this list
        const boardWithList = boards.find(board => 
          board.lists?.some(list => list.id === result.id)
        )
        if (boardWithList) {
          setSelectedBoardId(boardWithList.id)
          setCurrentView('dashboard')
        }
        break
      case 'card':
        // Find the board containing this card
        const boardWithCard = boards.find(board => 
          board.lists?.some(list => 
            list.cards?.some(card => card.id === result.id)
          )
        )
        if (boardWithCard) {
          setSelectedBoardId(boardWithCard.id)
          setCurrentView('dashboard')
        }
        break
      case 'comment':
        // Navigate to the card with the comment
        const boardWithComment = boards.find(board => 
          board.lists?.some(list => 
            list.cards?.some(card => 
              card.activity?.some(activity => activity.id === result.id)
            )
          )
        )
        if (boardWithComment) {
          setSelectedBoardId(boardWithComment.id)
          setCurrentView('dashboard')
        }
        break
    }
  }

  const handleSearchFocus = () => {
    if (searchQuery.trim()) {
      setShowSearchResults(true)
    }
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select Board</h2>
                <Button
                  onClick={() => setIsCreateBoardOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add Board</span>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {boards.map((board) => (
                  <div
                    key={board.id}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      selectedBoardId === board.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {editingBoardId === board.id ? (
                      <BoardEditForm
                        board={board}
                        onSave={(name, description) => handleRenameBoard(board.id, name, description)}
                        onCancel={() => setEditingBoardId(null)}
                      />
                    ) : (
                      <div onClick={() => setSelectedBoardId(board.id)} className="cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">{board.name}</h3>
                              {board.archived && (
                                <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                  Archived
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{board.description}</p>
                          </div>
                          <ActionMenu
                            isArchived={board.archived}
                            canDelete={board.archived}
                            onEdit={() => handleEditBoard(board)}
                            onArchive={() => handleArchiveBoard(board.id)}
                            onUnarchive={() => handleUnarchiveBoard(board.id)}
                            onDelete={() => handleDeleteBoard(board.id)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Board 
              board={selectedBoard}
              onCreateList={handleCreateList}
              onUpdateList={handleUpdateList}
              onCreateCard={handleCreateCard}
              onMoveCard={handleMoveCard}
              onReorderLists={handleReorderLists}
              onEditList={handleEditList}
              onArchiveList={handleArchiveList}
              onUnarchiveList={handleUnarchiveList}
              onDeleteList={handleDeleteList}
              onEditCard={handleEditCard}
              onArchiveCard={handleArchiveCard}
              onUnarchiveCard={handleUnarchiveCard}
              onDeleteCard={handleDeleteCard}
              onMoveCardToBoard={handleMoveCardToBoard}
            />
          </div>
        )
      case 'calendar':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Calendar View</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedBoardId('all-boards')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      selectedBoardId === 'all-boards'
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    All Boards
                  </button>
                  {boards.map((board) => (
                    <button
                      key={board.id}
                      onClick={() => setSelectedBoardId(board.id)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        selectedBoardId === board.id
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {board.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <CalendarView 
              cards={selectedBoardId === 'all-boards' ? allCards : selectedBoardCards}
              onUpdateCardDates={handleUpdateCardDates}
              onEditCard={handleEditCard}
            />
          </div>
        )
      case 'archive':
        return (
          <ArchiveView
            boards={boards}
            onUnarchiveBoard={handleUnarchiveBoard}
            onDeleteBoard={handleDeleteBoard}
            onUnarchiveList={handleUnarchiveList}
            onDeleteList={handleDeleteList}
            onUnarchiveCard={handleUnarchiveCard}
            onDeleteCard={handleDeleteCard}
          />
        )
      default:
        return <Board 
          board={selectedBoard}
          onCreateList={handleCreateList}
          onUpdateList={handleUpdateList}
          onCreateCard={handleCreateCard}
          onMoveCard={handleMoveCard}
          onReorderLists={handleReorderLists}
          onEditList={handleEditList}
          onArchiveList={handleArchiveList}
          onUnarchiveList={handleUnarchiveList}
          onDeleteList={handleDeleteList}
          onEditCard={handleEditCard}
          onArchiveCard={handleArchiveCard}
          onUnarchiveCard={handleUnarchiveCard}
          onDeleteCard={handleDeleteCard}
          onMoveCardToBoard={handleMoveCardToBoard}
        />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Project Management Demo
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                🚀 Switch between multiple boards and views!
              </p>
            </div>
            
            {/* Search Bar */}
            <div 
              className="flex-1 max-w-md mx-8 relative"
              onBlur={(e) => {
                // Close search results if clicking outside the search area
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setTimeout(() => setShowSearchResults(false), 200)
                }
              }}
            >
              <SearchInput
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search boards, lists, cards, comments..."
                onFocus={handleSearchFocus}
              />
              <SearchResults
                results={searchResults}
                onSelectResult={handleSearchResultSelect}
                isVisible={showSearchResults}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setLabelManager({ isOpen: true })}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                title="Manage Labels"
              >
                <Tags className="w-4 h-4 mr-2" />
                Labels
              </button>
              
              <button
                onClick={() => window.location.href = '/auth'}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Set Up Authentication
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        {renderCurrentView()}
      </main>

      <ViewSwitcher
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Create Board Modal */}
      <Modal
        isOpen={isCreateBoardOpen}
        onClose={() => setIsCreateBoardOpen(false)}
        title="Create New Board"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Board Name
            </label>
            <Input
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="Enter board name"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <Textarea
              value={newBoardDescription}
              onChange={(e) => setNewBoardDescription(e.target.value)}
              placeholder="Enter board description"
              className="w-full resize-none"
              rows={3}
            />
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              onClick={() => setIsCreateBoardOpen(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBoard}
              disabled={!newBoardName.trim()}
            >
              Create Board
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={editModal.isOpen && editModal.type !== 'card'}
        onClose={() => setEditModal({ ...editModal, isOpen: false })}
        onSave={handleEditModalSave}
        title={`Edit ${editModal.type === 'board' ? 'Board' : 'List'}`}
        itemName={
          editModal.type === 'board' ? (editModal.item as BoardType)?.name || '' :
          (editModal.item as List)?.name || ''
        }
        itemDescription={
          editModal.type === 'board' ? (editModal.item as BoardType)?.description : undefined
        }
        nameLabel="Name"
        showDescription={editModal.type === 'board'}
      />

      {/* Card Edit Modal */}
      {cardEditModal.card && (
        <CardEditModal
          isOpen={cardEditModal.isOpen}
          onClose={() => setCardEditModal({ isOpen: false, card: null })}
          onSave={handleCardEditSave}
          card={cardEditModal.card}
          availableLabels={labels}
          workspaceId="demo-workspace"
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.isDestructive ? 'Delete Permanently' : 'Confirm'}
        confirmVariant={confirmDialog.isDestructive ? 'danger' : 'primary'}
        isDestructive={confirmDialog.isDestructive}
      />

      {/* Label Manager */}
      <LabelManager
        isOpen={labelManager.isOpen}
        onClose={() => setLabelManager({ isOpen: false })}
        labels={labels}
        onAddLabel={handleAddLabel}
        onUpdateLabel={handleUpdateLabel}
        onDeleteLabel={handleDeleteLabel}
      />
    </div>
  )
}