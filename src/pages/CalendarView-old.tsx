import { useState, useRef } from 'react'
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

interface SpanningCardProps {
  card: Card
  startDate: Date
  endDate: Date
  row: number
  startCol: number
  span: number
  onResize?: (cardId: string, direction: 'start' | 'end', daysDelta: number) => void
}

function SpanningCard({ card, startDate, endDate, row, startCol, span, onResize }: SpanningCardProps) {
  const [isResizing, setIsResizing] = useState<'start' | 'end' | null>(null)
  const resizeStartX = useRef(0)
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { card, startDate, endDate }
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

  const handleMouseDown = (e: React.MouseEvent, direction: 'start' | 'end') => {
    e.stopPropagation()
    setIsResizing(direction)
    resizeStartX.current = e.clientX
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !onResize) return
    
    const deltaX = e.clientX - resizeStartX.current
    const cellWidth = 140 // Approximate cell width
    const daysDelta = Math.round(deltaX / cellWidth)
    
    if (Math.abs(daysDelta) >= 1) {
      onResize(card.id, isResizing, daysDelta)
      resizeStartX.current = e.clientX
    }
  }

  const handleMouseUp = () => {
    setIsResizing(null)
  }

  // Attach global mouse events for resizing
  if (isResizing) {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  } else {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    gridColumn: `${startCol + 1} / ${startCol + span + 1}`,
    gridRow: row + 2, // +2 to account for header rows
    zIndex: isDragging ? 1000 : 10,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`absolute m-1 rounded text-xs text-white font-medium cursor-pointer hover:opacity-80 transition-all border-2 ${getStatusColor(card.status)} ${
        isDragging ? 'opacity-50' : ''
      }`}
      title={`${card.title}\n${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
      {...attributes}
      {...listeners}
    >
      {/* Left resize handle */}
      <div
        className="absolute left-0 top-0 w-2 h-full cursor-ew-resize hover:bg-white/20"
        onMouseDown={(e) => handleMouseDown(e, 'start')}
        title="Drag to resize start date"
      />
      
      {/* Card content */}
      <div className="px-2 py-1 truncate pointer-events-none">
        {card.title}
        {card.labels && card.labels.length > 0 && (
          <div className="flex gap-1 mt-1">
            {card.labels.slice(0, 3).map((label) => (
              <span
                key={label.id}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: label.color }}
                title={label.name}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Right resize handle */}
      <div
        className="absolute right-0 top-0 w-2 h-full cursor-ew-resize hover:bg-white/20"
        onMouseDown={(e) => handleMouseDown(e, 'end')}
        title="Drag to resize end date"
      />
    </div>
  )
}

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

  const handleMouseDown = (e: React.MouseEvent, direction: 'start' | 'end') => {
    e.stopPropagation()
    setIsResizing(direction)
    resizeStartX.current = e.clientX
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !onResize) return
    
    const deltaX = e.clientX - resizeStartX.current
    const cellWidth = 140 // Approximate cell width
    const daysDelta = Math.round(deltaX / cellWidth)
    
    if (Math.abs(daysDelta) >= 1) {
      onResize(card.id, isResizing, daysDelta)
      resizeStartX.current = e.clientX
    }
  }

  const handleMouseUp = () => {
    setIsResizing(null)
  }

  // Attach global mouse events for resizing
  if (isResizing) {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  } else {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    gridColumn: `${startCol + 1} / ${startCol + span + 1}`,
    gridRow: row + 2, // +2 to account for header rows
    zIndex: isDragging ? 1000 : 10,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`absolute m-1 rounded text-xs text-white font-medium cursor-pointer hover:opacity-80 transition-all border-2 ${getStatusColor(card.status)} ${
        isDragging ? 'opacity-50' : ''
      }`}
      title={`${card.title}\n${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
      {...attributes}
      {...listeners}
    >
      {/* Left resize handle */}
      <div
        className="absolute left-0 top-0 w-2 h-full cursor-ew-resize hover:bg-white/20"
        onMouseDown={(e) => handleMouseDown(e, 'start')}
        title="Drag to resize start date"
      />
      
      {/* Card content */}
      <div className="px-2 py-1 truncate pointer-events-none">
        {card.title}
        {card.labels && card.labels.length > 0 && (
          <div className="flex gap-1 mt-1">
            {card.labels.slice(0, 3).map((label) => (
              <span
                key={label.id}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: label.color }}
                title={label.name}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Right resize handle */}
      <div
        className="absolute right-0 top-0 w-2 h-full cursor-ew-resize hover:bg-white/20"
        onMouseDown={(e) => handleMouseDown(e, 'end')}
        title="Drag to resize end date"
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
      className={`h-[120px] border-r border-b border-gray-700 last:border-r-0 relative ${
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

  // Filter cards with dates and organize by date
  const cardsWithDates = cards.filter(card => 
    card.date_start || card.date_end || card.due_date
  )

  // Create a map of date to cards for easy lookup
  const getCardsByDate = () => {
    const cardsByDate = new Map<string, Card[]>()
    
    cardsWithDates.forEach(card => {
      let cardStartDate: Date
      let cardEndDate: Date

      if (card.date_start && card.date_end) {
        cardStartDate = new Date(card.date_start)
        cardEndDate = new Date(card.date_end)
      } else if (card.due_date) {
        cardStartDate = new Date(card.due_date)
        cardEndDate = new Date(card.due_date)
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
        cardsByDate.get(dateKey)!.push({
          ...card,
          _isStart: current.toDateString() === cardStartDate.toDateString(),
          _isEnd: current.toDateString() === cardEndDate.toDateString(),
          _originalStartDate: cardStartDate,
          _originalEndDate: cardEndDate
        } as Card & { _isStart: boolean, _isEnd: boolean, _originalStartDate: Date, _originalEndDate: Date })
        current.setDate(current.getDate() + 1)
      }
    })
    
    return cardsByDate
  }

  const cardsByDate = getCardsByDate()

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
              {cards.length} cards
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-semibold text-gray-100 min-w-[200px] text-center">
              {monthNames[month]} {year}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => setCalendarWeeks(Math.max(4, calendarWeeks - 1))}
                className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
                title="Show fewer weeks"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-400">{calendarWeeks} weeks</span>
              <button
                onClick={() => setCalendarWeeks(Math.min(8, calendarWeeks + 1))}
                className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
                title="Show more weeks"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-gray-750">
            {dayNames.map(day => (
              <div key={day} className="p-4 text-center font-medium text-gray-300 border-r border-gray-700 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid Container */}
          <div className="grid grid-cols-7" style={{ gridTemplateRows: `repeat(${calendarWeeks}, 120px)` }}>
            {/* Calendar Days */}
            {days.map((date, index) => {
              const isCurrentMonthDay = isCurrentMonth(date)
              const isTodayDate = isToday(date)
              const dateKey = date.toDateString()
              const dayCards = cardsByDate.get(dateKey) || []

              return (
                <DroppableCalendarCell key={index} date={date}>
                  <div className={`
                    h-full p-2 overflow-hidden
                    ${isCurrentMonthDay ? 'bg-gray-800' : 'bg-gray-850'}
                    ${isTodayDate ? 'bg-blue-900/30 border-blue-500/50' : ''}
                  `}>
                    {/* Date Number */}
                    <div className="flex justify-between items-start mb-1">
                      <span className={`
                        text-sm font-medium
                        ${isCurrentMonthDay ? 'text-gray-100' : 'text-gray-500'}
                        ${isTodayDate ? 'text-blue-400' : ''}
                      `}>
                        {date.getDate()}
                      </span>
                      {isTodayDate && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      )}
                    </div>

                    {/* Cards for this day */}
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {dayCards.map((card, cardIndex) => (
                        <CompactCard
                          key={`${card.id}-${cardIndex}`}
                          card={card as Card & { _isStart: boolean, _isEnd: boolean, _originalStartDate: Date, _originalEndDate: Date }}
                          date={date}
                        />
                      ))}
                    </div>
                  </div>
                </DroppableCalendarCell>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center space-x-6 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Blocked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>On Hold</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>Not Started</span>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedCard ? (
          <div className="bg-blue-500 border-blue-600 border rounded px-2 h-6 text-xs text-white font-medium opacity-80">
            {draggedCard.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}