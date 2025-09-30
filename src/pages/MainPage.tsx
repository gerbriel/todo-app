import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { boardsApi } from '../api/boards'
import { Dashboard } from './Dashboard'
import { CalendarView } from './CalendarView'

export function MainPage() {
  const [currentView] = useState<'dashboard' | 'calendar'>('dashboard')

  // For now, using a mock workspace ID
  const workspaceId = 'mock-workspace-id'

  const { data: boards = [] } = useQuery({
    queryKey: ['boards', workspaceId],
    queryFn: () => boardsApi.getBoards(workspaceId),
  })

  // Get all cards for calendar view
  const allCards = boards.flatMap(board => 
    board.lists?.flatMap(list => list.cards || []) || []
  )

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'calendar':
        return <CalendarView cards={allCards} />
      default:
        return <Dashboard />
    }
  }

  return (
    <>
      {renderCurrentView()}
    </>
  )
}