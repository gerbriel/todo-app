import type { ReactNode } from 'react'
import { useState } from 'react'
import { LogOut, Settings, User as UserIcon } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { User, Board } from '../../types'
import { Button } from '../ui/Button'
import { ViewSwitcher } from '../ui/ViewSwitcher'
import { SearchInput } from '../ui/SearchInput'
import { SearchResults, type SearchResult } from '../ui/SearchResults'
import { useSearch } from '../../hooks/useSearch'
import { signOut } from '../../lib/supabase'

interface LayoutProps {
  user: User
  children: ReactNode
  currentView?: 'dashboard' | 'calendar' | 'archive'
  onViewChange?: (view: 'dashboard' | 'calendar' | 'archive') => void
  showViewSwitcher?: boolean
  boards?: Board[]
  onSearchResultSelect?: (result: SearchResult) => void
  onOpenCustomFields?: () => void
}

export function Layout({ 
  user, 
  children, 
  currentView = 'dashboard', 
  onViewChange, 
  showViewSwitcher = false,
  boards = [],
  onSearchResultSelect,
  onOpenCustomFields
}: LayoutProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  const searchResults = useSearch(boards, searchQuery)
  
  // Check if we're on a specific board page
  const isOnBoardPage = location.pathname.startsWith('/board/')
  const isOnDashboard = currentView === 'dashboard' && !isOnBoardPage
  
  // Get current board info if on a board page
  const currentBoardId = isOnBoardPage ? location.pathname.split('/')[2] : null
  const currentBoard = currentBoardId ? boards.find(b => b.id === currentBoardId) : null

  const handleSignOut = async () => {
    await signOut()
  }

  const handleSearchResultSelect = (result: SearchResult) => {
    setSearchQuery('')
    setShowSearchResults(false)
    onSearchResultSelect?.(result)
  }

  const handleSearchFocus = () => {
    if (searchQuery.trim()) {
      setShowSearchResults(true)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setShowSearchResults(value.trim().length > 0)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Global Collapsible Sidebar */}
      <div className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-12'
      } flex-shrink-0`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              {sidebarOpen ? '✕' : '☰'}
            </div>
            {sidebarOpen && <span className="font-medium">Navigation</span>}
          </button>
        </div>

        {/* Sidebar Content */}
        {sidebarOpen && (
          <div className="p-2 space-y-1">
            {/* Dashboard */}
            <button
              onClick={() => {
                navigate('/')
                onViewChange?.('dashboard')
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                isOnDashboard ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">🏠</div>
              <span className="text-sm font-medium">Dashboard</span>
            </button>

            {/* Individual Boards */}
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => navigate(`/board/${board.id}`)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                  currentBoard?.id === board.id ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="w-4 h-4 bg-purple-500 rounded-sm flex-shrink-0"></div>
                <span className="text-sm font-medium truncate">{board.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Collapsed State Icons */}
        {!sidebarOpen && (
          <div className="p-2 space-y-2">
            <button
              onClick={() => {
                navigate('/')
                onViewChange?.('dashboard')
              }}
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
                isOnDashboard ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
              title="Dashboard"
            >
              🏠
            </button>
            {boards.slice(0, 8).map((board) => (
              <button
                key={board.id}
                onClick={() => navigate(`/board/${board.id}`)}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
                  currentBoard?.id === board.id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
                title={board.name}
              >
                <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-100">
                {currentBoard ? currentBoard.name : 'Project Manager'}
              </h1>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8 relative">
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
            
            <div className="flex items-center space-x-4">
              {/* User Menu */}
              <div className="flex items-center space-x-2 text-gray-300">
                <UserIcon className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onOpenCustomFields}
                title="Custom Fields"
              >
                <Settings className="w-4 h-4" />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={`flex-1 overflow-hidden ${showViewSwitcher ? 'pb-32' : ''}`}>
          {children}
        </main>

        {/* View Switcher */}
        {showViewSwitcher && onViewChange && (
          <ViewSwitcher
            currentView={currentView}
            onViewChange={onViewChange}
          />
        )}
      </div>
    </div>
  )
}