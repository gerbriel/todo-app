import type { ReactNode } from 'react'
import { useState } from 'react'
import { LogOut, Settings, User as UserIcon } from 'lucide-react'
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
}

export function Layout({ 
  user, 
  children, 
  currentView = 'dashboard', 
  onViewChange, 
  showViewSwitcher = false,
  boards = [],
  onSearchResultSelect
}: LayoutProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  
  const searchResults = useSearch(boards, searchQuery)

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
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-100">
              Project Manager
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
            
            <Button variant="ghost" size="sm">
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
  )
}