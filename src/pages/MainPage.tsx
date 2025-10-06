import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { boardsApi } from '../api/boards'
import { Dashboard } from './Dashboard'
import { CalendarView } from './CalendarView'

export function MainPage() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar' | 'archive'>('dashboard')

  // Use the real workspace UUID
  const workspaceId = 'afa0b21a-9585-4e62-9908-9c36ed9b0d25'

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
      case 'archive':
        return <div className="p-6"><h1 className="text-2xl font-bold text-gray-100">Archive View</h1><p className="text-gray-400">Archive functionality coming soon...</p></div>
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