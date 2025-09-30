import { useMemo } from 'react'
import type { Board, Activity } from '../types'
import type { SearchResult } from '../components/ui/SearchResults'

export function useSearch(
  boards: Board[],
  searchQuery: string,
  options: {
    searchBoards?: boolean
    searchLists?: boolean
    searchCards?: boolean
    searchComments?: boolean
  } = {}
) {
  const {
    searchBoards = true,
    searchLists = true,
    searchCards = true,
    searchComments = true
  } = options

  const results = useMemo(() => {
    if (!searchQuery.trim()) {
      return []
    }

    const query = searchQuery.toLowerCase()
    const searchResults: SearchResult[] = []

    boards.forEach((board) => {
      // Search boards
      if (searchBoards) {
        if (
          board.name.toLowerCase().includes(query) ||
          board.description?.toLowerCase().includes(query)
        ) {
          searchResults.push({
            type: 'board',
            id: board.id,
            title: board.name,
            description: board.description,
            match: getMatchText(board.name, board.description, query),
            item: board
          })
        }
      }

      // Search lists
      if (searchLists && board.lists) {
        board.lists.forEach((list) => {
          if (list.name.toLowerCase().includes(query)) {
            searchResults.push({
              type: 'list',
              id: list.id,
              title: list.name,
              boardTitle: board.name,
              match: getMatchText(list.name, undefined, query),
              item: list
            })
          }
        })
      }

      // Search cards
      if (searchCards && board.lists) {
        board.lists.forEach((list) => {
          if (list.cards) {
            list.cards.forEach((card) => {
              if (
                card.title.toLowerCase().includes(query) ||
                card.description?.toLowerCase().includes(query)
              ) {
                searchResults.push({
                  type: 'card',
                  id: card.id,
                  title: card.title,
                  description: card.description,
                  boardTitle: board.name,
                  listTitle: list.name,
                  match: getMatchText(card.title, card.description, query),
                  item: card
                })
              }
            })
          }
        })
      }

      // Search comments
      if (searchComments && board.lists) {
        board.lists.forEach((list) => {
          if (list.cards) {
            list.cards.forEach((card) => {
              card.activity?.forEach((activity: Activity) => {
                if (
                  activity.action === 'comment' &&
                  activity.details?.toLowerCase().includes(query)
                ) {
                  searchResults.push({
                    type: 'comment',
                    id: activity.id,
                    title: `Comment on "${card.title}"`,
                    description: activity.details,
                    boardTitle: board.name,
                    listTitle: list.name,
                    match: getMatchText(activity.details || '', undefined, query),
                    item: activity
                  })
                }
              })
            })
          }
        })
      }
    })

    // Sort results by relevance (exact matches first, then partial matches)
    return searchResults.sort((a, b) => {
      const aExact = a.title.toLowerCase() === query
      const bExact = b.title.toLowerCase() === query
      
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      
      const aStartsWith = a.title.toLowerCase().startsWith(query)
      const bStartsWith = b.title.toLowerCase().startsWith(query)
      
      if (aStartsWith && !bStartsWith) return -1
      if (!aStartsWith && bStartsWith) return 1
      
      return a.title.localeCompare(b.title)
    })
  }, [boards, searchQuery, searchBoards, searchLists, searchCards, searchComments])

  return results
}

function getMatchText(title: string, description: string | undefined, query: string): string {
  const titleMatch = title.toLowerCase().includes(query.toLowerCase())
  const descMatch = description?.toLowerCase().includes(query.toLowerCase())
  
  if (titleMatch) {
    const index = title.toLowerCase().indexOf(query.toLowerCase())
    const start = Math.max(0, index - 10)
    const end = Math.min(title.length, index + query.length + 10)
    return title.substring(start, end)
  }
  
  if (descMatch && description) {
    const index = description.toLowerCase().indexOf(query.toLowerCase())
    const start = Math.max(0, index - 15)
    const end = Math.min(description.length, index + query.length + 15)
    return description.substring(start, end)
  }
  
  return title.substring(0, 30)
}