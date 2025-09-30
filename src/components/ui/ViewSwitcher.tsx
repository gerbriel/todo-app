import { useState } from 'react'
import { LayoutDashboard, Calendar, MoreHorizontal, Archive } from 'lucide-react'

interface ViewSwitcherProps {
  currentView: 'dashboard' | 'calendar' | 'archive'
  onViewChange: (view: 'dashboard' | 'calendar' | 'archive') => void
  onCreateNew?: () => void
}

export function ViewSwitcher({ currentView, onViewChange, onCreateNew }: ViewSwitcherProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const views = [
    { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'calendar' as const, icon: Calendar, label: 'Calendar' },
    { id: 'archive' as const, icon: Archive, label: 'Archive' },
  ]

  const handleViewChange = (viewId: 'dashboard' | 'calendar' | 'archive') => {
    onViewChange(viewId)
    setIsExpanded(false)
  }

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* View Switcher Container */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        {/* Expanded View Options in Arch */}
        {isExpanded && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="flex items-end justify-center space-x-6 pb-2">
              {views.map((view, index) => {
                const Icon = view.icon
                const isActive = currentView === view.id
                
                // Create arch effect - center item higher
                const archStyles = index === 1 
                  ? 'mb-8 scale-110' 
                  : 'mb-2'
                
                return (
                  <div
                    key={view.id}
                    className={`flex flex-col items-center ${archStyles} animate-in slide-in-from-bottom-2 duration-300`}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <button
                      onClick={() => handleViewChange(view.id)}
                      className={`p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
                        isActive
                          ? 'bg-primary-600 text-white shadow-primary-500/30'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon size={20} />
                    </button>
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
                      {view.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 3 Dots Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 ${
            isExpanded
              ? 'bg-primary-600 text-white rotate-90'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <MoreHorizontal size={24} />
        </button>
      </div>
    </>
  )
}