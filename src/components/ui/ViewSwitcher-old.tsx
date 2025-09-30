import { useState } from 'react'
import { Calendar, Layout, Home, Plus } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ViewSwitcherProps {
  currentView: 'dashboard' | 'kanban' | 'calendar'
  onViewChange: (view: 'dashboard' | 'kanban' | 'calendar') => void
  onCreateNew?: () => void
}

export function ViewSwitcher({ currentView, onViewChange, onCreateNew }: ViewSwitcherProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const views = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: Home,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500',
    },
    {
      id: 'kanban' as const,
      label: 'Kanban',
      icon: Layout,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500',
    },
    {
      id: 'calendar' as const,
      label: 'Calendar',
      icon: Calendar,
      color: 'text-green-400',
      bgColor: 'bg-green-500',
    },
  ]

  const currentViewData = views.find(view => view.id === currentView)

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50">
      {/* Expanded View Selector */}
      <div className={cn(
        'transition-all duration-300 ease-out mb-4',
        isExpanded 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
      )}>
        <div className="bg-gray-800/95 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl p-2">
          <div className="flex space-x-2">
            {views.map((view) => {
              const Icon = view.icon
              const isActive = currentView === view.id
              
              return (
                <button
                  key={view.id}
                  onClick={() => {
                    onViewChange(view.id)
                    setIsExpanded(false)
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200',
                    'hover:bg-gray-700/50 min-w-[80px]',
                    isActive 
                      ? `${view.bgColor} text-white shadow-lg scale-110` 
                      : `text-gray-400 hover:${view.color}`
                  )}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{view.label}</span>
                </button>
              )
            })}
            
            {/* Create New Button */}
            {onCreateNew && (
              <button
                onClick={() => {
                  onCreateNew()
                  setIsExpanded(false)
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 hover:bg-gray-700/50 min-w-[80px] text-gray-400 hover:text-yellow-400"
              >
                <Plus className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">New</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Floating Button */}
      <div className="relative">
        {/* Arched Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-gray-800/80 to-transparent rounded-t-[3rem] transform scale-110 blur-xl opacity-60" />
        
        {/* Main Container */}
        <div className="relative bg-gray-800/95 backdrop-blur-lg rounded-t-[3rem] border-t border-l border-r border-gray-700/50 shadow-2xl">
          <div className="px-8 pt-6 pb-8">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                'relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300',
                'shadow-lg hover:shadow-xl transform hover:scale-105',
                currentViewData?.bgColor || 'bg-gray-700',
                'text-white'
              )}
            >
              {/* Current View Icon */}
              {currentViewData && (
                <>
                  <currentViewData.icon className="w-7 h-7 mb-1" />
                  <span className="text-xs font-medium">{currentViewData.label}</span>
                </>
              )}
              
              {/* Expansion Indicator */}
              <div className={cn(
                'absolute -top-1 -right-1 w-3 h-3 rounded-full transition-all duration-200',
                'bg-white text-gray-800 flex items-center justify-center',
                isExpanded ? 'rotate-45' : 'rotate-0'
              )}>
                <Plus className="w-2 h-2" />
              </div>
            </button>
            
            {/* Current View Label */}
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-400 font-medium">
                {currentViewData?.label}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  )
}