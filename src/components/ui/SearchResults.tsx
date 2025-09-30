import { Calendar, FileText, MessageSquare, Users } from 'lucide-react'
import type { Board, List, Card, Activity } from '../../types'

export interface SearchResult {
  type: 'board' | 'list' | 'card' | 'comment'
  id: string
  title: string
  description?: string
  boardTitle?: string
  listTitle?: string
  match: string
  item: Board | List | Card | Activity
}

interface SearchResultsProps {
  results: SearchResult[]
  onSelectResult: (result: SearchResult) => void
  isVisible: boolean
}

export function SearchResults({ results, onSelectResult, isVisible }: SearchResultsProps) {
  if (!isVisible) {
    return null
  }

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'board':
        return <Users className="w-4 h-4 text-blue-400" />
      case 'list':
        return <FileText className="w-4 h-4 text-green-400" />
      case 'card':
        return <Calendar className="w-4 h-4 text-purple-400" />
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-orange-400" />
    }
  }

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'board':
        return 'Board'
      case 'list':
        return 'List'
      case 'card':
        return 'Card'
      case 'comment':
        return 'Comment'
    }
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
      {results.length === 0 ? (
        <div className="p-4 text-gray-400 text-center">
          No results found
        </div>
      ) : (
        <div className="py-2">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => onSelectResult(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      {getTypeLabel(result.type)}
                    </span>
                    {result.boardTitle && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="text-xs text-gray-400">{result.boardTitle}</span>
                      </>
                    )}
                    {result.listTitle && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="text-xs text-gray-400">{result.listTitle}</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-100 mt-1">
                    {result.title}
                  </div>
                  {result.description && (
                    <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {result.description}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Match: "{result.match}"
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}