import React, { useState, useRef, useEffect } from 'react'
import { Search, Filter, X, Calendar, User, Tag, Paperclip, MessageCircle } from 'lucide-react'
import { useGlobalSearch } from '../../services/searchService'
import type { SearchResult, SearchFilters } from '../../services/searchService'

interface GlobalSearchProps {
  onResultSelect?: (result: SearchResult) => void
  className?: string
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ 
  onResultSelect,
  className = ""
}) => {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: results = [], isLoading } = useGlobalSearch(query, filters)

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          handleResultClick(results[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowResults(false)
        setQuery('')
        inputRef.current?.blur()
        break
    }
  }

  // Handle result selection
  const handleResultClick = (result: SearchResult) => {
    onResultSelect?.(result)
    setShowResults(false)
    setQuery('')
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setShowResults(value.length > 0)
    setSelectedIndex(0)
  }

  // Handle filter changes
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setShowFilters(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus management
  const handleFocus = () => {
    if (query.length > 0) {
      setShowResults(true)
    }
  }

  // Get icon for result type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'card': return <Tag className="w-4 h-4" />
      case 'board': return <Search className="w-4 h-4" />
      case 'list': return <Filter className="w-4 h-4" />
      case 'comment': return <MessageCircle className="w-4 h-4" />
      case 'attachment': return <Paperclip className="w-4 h-4" />
      default: return <Search className="w-4 h-4" />
    }
  }

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'card': return 'text-blue-600 bg-blue-50'
      case 'board': return 'text-green-600 bg-green-50'
      case 'list': return 'text-purple-600 bg-purple-50'
      case 'comment': return 'text-orange-600 bg-orange-50'
      case 'attachment': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== undefined
  )

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Search boards, cards, comments, attachments..."
          className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-2 py-1 mr-1 rounded transition-colors ${
              hasActiveFilters || showFilters
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Filters"
          >
            <Filter className="w-4 h-4" />
          </button>
          
          {/* Clear Button */}
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setShowResults(false)
                inputRef.current?.focus()
              }}
              className="px-2 py-1 mr-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                multiple
                value={filters.type || []}
                onChange={(e) => updateFilter('type', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                size={3}
              >
                <option value="card">Cards</option>
                <option value="board">Boards</option>
                <option value="list">Lists</option>
                <option value="comment">Comments</option>
                <option value="attachment">Attachments</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
              <select
                multiple
                value={filters.priority || []}
                onChange={(e) => updateFilter('priority', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                size={3}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                multiple
                value={filters.status || []}
                onChange={(e) => updateFilter('status', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                size={3}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Content Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Has</label>
              <div className="space-y-1">
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={filters.hasAttachments || false}
                    onChange={(e) => updateFilter('hasAttachments', e.target.checked || undefined)}
                    className="mr-1 text-xs"
                  />
                  Attachments
                </label>
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={filters.hasComments || false}
                    onChange={(e) => updateFilter('hasComments', e.target.checked || undefined)}
                    className="mr-1 text-xs"
                  />
                  Comments
                </label>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => setFilters({})}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-40">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No results found for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="p-2 border-b border-gray-100">
                <p className="text-xs text-gray-500">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className={`px-3 py-2 cursor-pointer border-b border-gray-50 last:border-b-0 ${
                      index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center ${getTypeColor(result.type)}`}>
                        {getTypeIcon(result.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </h3>
                          <span className={`px-1.5 py-0.5 text-xs rounded-full ${getTypeColor(result.type)}`}>
                            {result.type}
                          </span>
                        </div>
                        
                        {result.description && (
                          <p className="text-xs text-gray-600 truncate mt-1">
                            {result.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                          {result.boardName && (
                            <span>📋 {result.boardName}</span>
                          )}
                          {result.listName && (
                            <span>📝 {result.listName}</span>
                          )}
                          {result.priority && (
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              result.priority === 'high' || result.priority === 'urgent' 
                                ? 'bg-red-100 text-red-600'
                                : result.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-green-100 text-green-600'
                            }`}>
                              {result.priority}
                            </span>
                          )}
                          {result.assignedTo && result.assignedTo.length > 0 && (
                            <span>👤 {result.assignedTo.length}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default GlobalSearch