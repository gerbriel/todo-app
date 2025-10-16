import { useQuery } from '@tanstack/react-query'

export interface SearchResult {
  id: string
  type: 'board' | 'list' | 'card' | 'comment' | 'attachment'
  title: string
  description?: string
  content?: string
  boardId?: string
  listId?: string
  cardId?: string
  boardName?: string
  listName?: string
  cardName?: string
  email?: string
  tags?: string[]
  priority?: string
  status?: string
  dueDate?: string
  assignedTo?: string[]
  labels?: string[]
  lastModified?: string
  createdAt?: string
  createdBy?: string
}

export interface SearchFilters {
  type?: string[]
  boards?: string[]
  priority?: string[]
  status?: string[]
  hasAttachments?: boolean
  hasComments?: boolean
}

export const useGlobalSearch = (query: string, filters?: SearchFilters) => {
  return useQuery({
    queryKey: ['globalSearch', query, filters],
    queryFn: () => performGlobalSearch(query, filters),
    enabled: query.length > 0,
    staleTime: 30000 // Cache for 30 seconds
  })
}

export const performGlobalSearch = async (
  query: string, 
  filters?: SearchFilters
): Promise<SearchResult[]> => {
  try {
    const results: SearchResult[] = []
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0)

    // Mock search results for development
    if (searchTerms.length > 0) {
      // Card results
      results.push({
        id: 'mock-card-1',
        type: 'card',
        title: `Task containing "${query}"`,
        description: `This is a mock task that matches your search for "${query}"`,
        content: `Task description with keyword ${query}`,
        boardId: 'board-1',
        listId: 'list-1',
        cardId: 'card-1',
        boardName: 'Development Board',
        listName: 'In Progress',
        cardName: `Task with ${query}`,
        priority: 'high',
        status: 'in-progress',
        labels: ['bug', 'urgent'],
        assignedTo: ['john@example.com'],
        lastModified: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString()
      })

      // Board results
      results.push({
        id: 'mock-board-1',
        type: 'board',
        title: `${query} Project Board`,
        description: `Project board for ${query} related tasks`,
        boardId: 'board-1',
        boardName: `${query} Project Board`,
        lastModified: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
      })

      // Comment results
      results.push({
        id: 'mock-comment-1',
        type: 'comment',
        title: `Comment mentioning ${query}`,
        content: `This comment discusses ${query} in detail`,
        boardId: 'board-1',
        listId: 'list-1', 
        cardId: 'card-1',
        boardName: 'Development Board',
        listName: 'In Progress',
        cardName: 'Main Task',
        email: 'jane@example.com',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        createdBy: 'jane@example.com'
      })
    }

    return sortSearchResults(results, searchTerms)
  } catch (error) {
    console.error('Global search error:', error)
    return []
  }
}

// Helper functions
function matchesSearch(text: string | undefined | null, searchTerms: string[]): boolean {
  if (!text) return false
  const lowerText = text.toLowerCase()
  return searchTerms.some(term => lowerText.includes(term))
}

function sortSearchResults(results: SearchResult[], searchTerms: string[]): SearchResult[] {
  return results.sort((a, b) => {
    // Calculate relevance score
    const scoreA = calculateRelevanceScore(a, searchTerms)
    const scoreB = calculateRelevanceScore(b, searchTerms)
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA // Higher score first
    }
    
    // Secondary sort by type priority
    const typePriority = { card: 4, comment: 3, list: 2, board: 1, attachment: 0 }
    const priorityA = typePriority[a.type] || 0
    const priorityB = typePriority[b.type] || 0
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA
    }
    
    // Tertiary sort by recency
    const dateA = new Date(a.lastModified || a.createdAt || 0)
    const dateB = new Date(b.lastModified || b.createdAt || 0)
    return dateB.getTime() - dateA.getTime()
  })
}

function calculateRelevanceScore(result: SearchResult, searchTerms: string[]): number {
  let score = 0
  const text = `${result.title} ${result.description || ''} ${result.content || ''}`.toLowerCase()
  
  searchTerms.forEach(term => {
    // Title match gets highest score
    if (result.title.toLowerCase().includes(term)) {
      score += 10
    }
    // Description match gets medium score
    if (result.description?.toLowerCase().includes(term)) {
      score += 5
    }
    // Content match gets lower score
    if (result.content?.toLowerCase().includes(term)) {
      score += 3
    }
    // Exact word match gets bonus
    if (text.split(' ').includes(term)) {
      score += 2
    }
  })
  
  return score
}