import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, Archive, Users } from 'lucide-react'
import { boardsApi } from '../api/boards'
import { useOrg } from '@/contexts/OrgContext';
import { userApi, type UserProfile } from '../api/users'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { UserManagement } from '../components/admin/UserManagement'
import type { CreateBoardData } from '../types'

export function Dashboard() {
  const navigate = useNavigate()
  const [showCreateBoard, setShowCreateBoard] = useState(false)
  const [newBoard, setNewBoard] = useState({ name: '', description: '' })
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [showUserManagement, setShowUserManagement] = useState(false)

  const { currentOrg } = useOrg();
  // Use the real workspace UUID or selected org
  const workspaceId = currentOrg?.id || 'afa0b21a-9585-4e62-9908-9c36ed9b0d25'

  const { data: boards = [], isLoading, refetch } = useQuery({
    queryKey: ['boards', workspaceId],
    queryFn: () => boardsApi.getBoards(workspaceId),
  })

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await userApi.getCurrentProfile()
        setCurrentUser(user)
      } catch (error) {
        console.error('Error loading current user:', error)
      }
    }
    loadCurrentUser()
  }, [])

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBoard.name.trim()) return

    try {
      const boardData: CreateBoardData = {
        name: newBoard.name.trim(),
        description: newBoard.description.trim() || undefined,
        workspace_id: workspaceId,
      }
      
      await boardsApi.createBoard(boardData)
      setNewBoard({ name: '', description: '' })
      setShowCreateBoard(false)
      refetch()
    } catch (error) {
      console.error('Failed to create board:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your project boards</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {currentUser?.is_admin && (
            <Button variant="secondary" onClick={() => setShowUserManagement(!showUserManagement)}>
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
          )}
          <Button variant="secondary">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </Button>
          <Button variant="secondary">
            <Archive className="w-4 h-4 mr-2" />
            Archive
          </Button>
          <Button onClick={() => setShowCreateBoard(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Board
          </Button>
        </div>
      </div>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {boards.map((board) => (
          <div
            key={board.id}
            className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer border border-gray-700"
            onClick={() => navigate(`/board/${board.id}`)}
          >
            <h3 className="text-lg font-semibold text-gray-100 mb-2">
              {board.name}
            </h3>
            {board.description && (
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {board.description}
              </p>
            )}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{board.lists?.length || 0} lists</span>
              <span>
                {board.lists?.reduce((acc, list) => acc + (list.cards?.length || 0), 0) || 0} cards
              </span>
            </div>
          </div>
        ))}
        
        {/* Create Board Card */}
        <div
          className="bg-gray-800 rounded-lg p-6 border-2 border-dashed border-gray-600 hover:border-gray-500 transition-colors cursor-pointer flex items-center justify-center min-h-[160px]"
          onClick={() => setShowCreateBoard(true)}
        >
          <div className="text-center">
            <Plus className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">Create New Board</p>
          </div>
        </div>
      </div>

      {/* User Management Section for Admins */}
      {showUserManagement && currentUser?.is_admin && (
        <div className="mt-8">
          <UserManagement />
        </div>
      )}

      {/* Create Board Modal */}
      <Modal
        isOpen={showCreateBoard}
        onClose={() => setShowCreateBoard(false)}
        title="Create New Board"
      >
        <form onSubmit={handleCreateBoard}>
          <div className="space-y-4">
            <Input
              label="Board Name"
              value={newBoard.name}
              onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
              placeholder="Enter board name..."
              autoFocus
              required
            />
            
            <Textarea
              label="Description (Optional)"
              value={newBoard.description}
              onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
              placeholder="Enter board description..."
              rows={3}
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-700 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreateBoard(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Board
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}