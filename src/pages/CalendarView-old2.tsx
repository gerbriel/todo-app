import { useState, useRef, useEffect } from 'react'
import { 
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Minus } from 'lucide-react'
import type { Card } from '../types'

interface CalendarViewProps {
  cards?: Card[]
  onUpdateCardDates?: (cardId: string, startDate: string, endDate: string) => void
}

interface CalendarCardProps {
  card: Card
  onResize?: (cardId: string, direction: 'start' | 'end', days: number) => void
}

function CalendarCard({ card, onResize }: CalendarCardProps) {
  const [resizing, setResizing] = useState<'start' | 'end' | null>(null)
  const resizeStartX = useRef(0)
  const resizeStartValue = useRef(0)
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { card }
  })

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-600'
      case 'in-progress':
        return 'bg-blue-500 border-blue-600'
      case 'blocked':
        return 'bg-red-500 border-red-600'
      case 'on-hold':
        return 'bg-yellow-500 border-yellow-600'
      default:
        return 'bg-purple-500 border-purple-600'
    }
  }

  const handleResizeStart = (e: React.MouseEvent, direction: 'start' | 'end') => {
    e.stopPropagation()
    e.preventDefault()
    setResizing(direction)
    resizeStartX.current = e.clientX
    resizeStartValue.current = 0
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing || !onResize) return
      
      const deltaX = e.clientX - resizeStartX.current
      const cellWidth = 180 // Approximate cell width
      const days = Math.round(deltaX / cellWidth)
      
      if (days !== resizeStartValue.current) {
        const change = days - resizeStartValue.current
        onResize(card.id, resizing, change)
        resizeStartValue.current = days
      }
    }

    const handleMouseUp = () => {
      setResizing(null)
      resizeStartValue.current = 0
    }

    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing, onResize, card.id])

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 1000 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative text-xs text-white font-medium cursor-pointer hover:opacity-80 transition-all border rounded px-2 py-1 mb-1 ${getStatusColor(card.status)} ${
        isDragging ? 'opacity-50' : ''
      } ${resizing ? 'cursor-ew-resize' : ''}`}
      title={card.title}
      {...(resizing ? {} : attributes)}
      {...(resizing ? {} : listeners)}
    >
      {/* Left resize handle */}
      <div
        className="absolute left-0 top-0 w-1 h-full cursor-ew-resize hover:bg-white/30"
        onMouseDown={(e) => handleResizeStart(e, 'start')}
        title="Drag to change start date"
      />
      
      {/* Card content */}
      <div className="truncate pointer-events-none relative z-10">
        {card.title}
        {card.labels && card.labels.length > 0 && (
          <div className="flex gap-1 mt-0.5">
            {card.labels.slice(0, 3).map((label) => (
              <span
                key={label.id}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: label.color }}
                title={label.name}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Right resize handle */}
      <div
        className="absolute right-0 top-0 w-1 h-full cursor-ew-resize hover:bg-white/30"
        onMouseDown={(e) => handleResizeStart(e, 'end')}
        title="Drag to change end date"
      />
    </div>
  )
}

function DroppableCalendarCell({ date, children }: { date: Date; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `calendar-cell-${date.toISOString()}`,
    data: { date }
  })

  return (
    <div
      ref={setNodeRef}
      className={`h-[120px] border-r border-b border-gray-700 last:border-r-0 relative p-1 ${
        isOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      {children}
    </div>
  )
}

export function CalendarView({ cards = [], onUpdateCardDates }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [draggedCard, setDraggedCard] = useState<Card | null>(null)
  const [calendarWeeks, setCalendarWeeks] = useState(6) // Allow extending calendar

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Get current month info
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  // Generate calendar days (configurable weeks)
  const days: Date[] = []
  const current = new Date(startDate)
  for (let i = 0; i < calendarWeeks * 7; i++) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  // Group cards by date for easy lookup
  const getCardsByDate = () => {
    const cardsByDate = new Map<string, Card[]>()
    
    const cardsWithDates = cards.filter(card => 
      card.date_start || card.date_end
    )

    cardsWithDates.forEach(card => {
      let cardStartDate: Date
      let cardEndDate: Date

      if (card.date_start && card.date_end) {
        cardStartDate = new Date(card.date_start)
        cardEndDate = new Date(card.date_end)
      } else if (card.date_start) {
        cardStartDate = new Date(card.date_start)
        cardEndDate = new Date(card.date_start)
      } else if (card.date_end) {
        cardStartDate = new Date(card.date_end)
        cardEndDate = new Date(card.date_end)
      } else {
        return
      }

      // Add card to each date it spans
      const current = new Date(cardStartDate)
      while (current <= cardEndDate) {
        const dateKey = current.toDateString()
        if (!cardsByDate.has(dateKey)) {
          cardsByDate.set(dateKey, [])
        }
        cardsByDate.get(dateKey)!.push(card)
        current.setDate(current.getDate() + 1)
      }
    })
    
    return cardsByDate
  }

  const cardsByDate = getCardsByDate()

  const handleCardResize = (cardId: string, direction: 'start' | 'end', daysDelta: number) => {
    if (!onUpdateCardDates || daysDelta === 0) return

    const card = cards.find(c => c.id === cardId)
    if (!card) return

    let startDate: Date
    let endDate: Date

    if (card.date_start && card.date_end) {
      startDate = new Date(card.date_start)
      endDate = new Date(card.date_end)
    } else if (card.date_start) {
      startDate = new Date(card.date_start)
      endDate = new Date(card.date_start)
    } else if (card.date_end) {
      startDate = new Date(card.date_end)
      endDate = new Date(card.date_end)
    } else {
      return
    }

    if (direction === 'start') {
      startDate.setDate(startDate.getDate() + daysDelta)
      // Ensure start date doesn't go past end date
      if (startDate > endDate) {
        startDate = new Date(endDate)
      }
    } else {
      endDate.setDate(endDate.getDate() + daysDelta)
      // Ensure end date doesn't go before start date
      if (endDate < startDate) {
        endDate = new Date(startDate)
      }
    }

    onUpdateCardDates(cardId, startDate.toISOString(), endDate.toISOString())
  }

  const handleDragStart = (event: DragStartEvent) => {
    const cardData = event.active.data.current
    if (cardData && cardData.card) {
      setDraggedCard(cardData.card)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedCard(null)

    if (!over || !onUpdateCardDates) return

    const cardData = active.data.current
    const dropData = over.data.current
    
    if (cardData && cardData.card && dropData && dropData.date) {
      const card = cardData.card as Card
      const newDate = dropData.date as Date
      
      // Update the card's date based on what type of date it has
      let startDate = newDate.toISOString()
      let endDate = newDate.toISOString()

      if (card.date_start && card.date_end) {
        // If card has a date range, maintain the duration
        const originalStart = new Date(card.date_start)
        const originalEnd = new Date(card.date_end)
        const duration = originalEnd.getTime() - originalStart.getTime()
        
        startDate = newDate.toISOString()
        endDate = new Date(newDate.getTime() + duration).toISOString()
      }

      onUpdateCardDates(card.id, startDate, endDate)
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-6 h-full">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-100 flex items-center space-x-2">
              <CalendarIcon className="w-6 h-6" />
              <span>Calendar View</span>
            </h1>
            <div className="text-gray-400">
              {monthNames[month]} {year}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Calendar Extension Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCalendarWeeks(Math.max(4, calendarWeeks - 1))}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Show fewer weeks"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-400">{calendarWeeks} weeks</span>
              <button
                onClick={() => setCalendarWeeks(Math.min(8, calendarWeeks + 1))}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Show more weeks"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Month Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-l border-t border-gray-700">
          {/* Day Headers */}
          {dayNames.map((day) => (
            <div
              key={day}
              className="border-r border-b border-gray-700 bg-gray-800 p-3 text-center text-sm font-medium text-gray-300"
            >
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {days.map((date) => (
            <DroppableCalendarCell key={date.toISOString()} date={date}>
              <div className={`text-sm ${!isCurrentMonth(date) ? 'text-gray-600' : 'text-gray-300'} mb-2`}>
                <div className={`${isToday(date) ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                  {date.getDate()}
                </div>
              </div>
              
              {/* Cards for this date */}
              <div className="space-y-1 overflow-y-auto max-h-[90px]">
                {(cardsByDate.get(date.toDateString()) || []).map((card) => (
                  <CalendarCard
                    key={`${card.id}-${date.toDateString()}`}
                    card={card}
                    onResize={handleCardResize}
                  />
                ))}
              </div>
            </DroppableCalendarCell>
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedCard ? (
            <div className="bg-blue-500 border-blue-600 border rounded text-xs text-white font-medium px-2 py-1">
              {draggedCard.title}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}