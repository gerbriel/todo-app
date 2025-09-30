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

  useEffect(() => {
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

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, onResize, card.id])

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
      className={`relative m-0.5 rounded text-xs text-white font-medium cursor-pointer hover:opacity-80 transition-all border-2 min-h-[24px] ${getStatusColor(card.status)} ${
        isDragging ? 'opacity-50' : ''
      }`}
      title={`${card.title}\n${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
      {...attributes}
      {...listeners}
    >
      {/* Left resize handle */}
      <div
        className="absolute left-0 top-0 w-2 h-full cursor-ew-resize hover:bg-white/20 z-20"
        onMouseDown={(e) => handleMouseDown(e, 'start')}
        title="Drag to resize start date"
      />
      
      {/* Card content */}
      <div className="px-2 py-1 truncate pointer-events-none relative z-10">
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
        className="absolute right-0 top-0 w-2 h-full cursor-ew-resize hover:bg-white/20 z-20"
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
      className={`h-[100px] border-r border-b border-gray-700 last:border-r-0 relative ${
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

  // Create spanning cards data
  const getSpanningCards = () => {
    const spanningCards: Array<{
      card: Card
      startDate: Date
      endDate: Date
      row: number
      startCol: number
      span: number
    }> = []

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

      // Find grid position
      const startDayIndex = days.findIndex(day => 
        day.toDateString() === cardStartDate.toDateString()
      )
      const endDayIndex = days.findIndex(day => 
        day.toDateString() === cardEndDate.toDateString()
      )

      if (startDayIndex === -1) return // Card starts outside visible range

      const actualEndDayIndex = endDayIndex === -1 ? days.length - 1 : endDayIndex
      
      const startRow = Math.floor(startDayIndex / 7)
      const endRow = Math.floor(actualEndDayIndex / 7)
      
      // If card spans multiple rows, create separate segments
      let currentRowStart = startDayIndex
      for (let row = startRow; row <= endRow; row++) {
        const rowStartIndex = row * 7
        const rowEndIndex = Math.min((row + 1) * 7 - 1, actualEndDayIndex)
        
        const segmentStart = Math.max(currentRowStart, rowStartIndex)
        const segmentEnd = rowEndIndex
        
        if (segmentStart <= segmentEnd) {
          spanningCards.push({
            card,
            startDate: cardStartDate,
            endDate: cardEndDate,
            row,
            startCol: segmentStart % 7,
            span: segmentEnd - segmentStart + 1
          })
        }
        
        currentRowStart = rowEndIndex + 1
      }
    })

    return spanningCards
  }

  const spanningCards = getSpanningCards()

  const handleCardResize = (cardId: string, direction: 'start' | 'end', daysDelta: number) => {
    if (!onUpdateCardDates) return

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
        <div className="relative">
          <div 
            className="grid grid-cols-7 border-l border-t border-gray-700"
            style={{ gridTemplateRows: `repeat(${calendarWeeks + 1}, minmax(0, 1fr))` }}
          >
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
                <div className={`p-2 h-full ${!isCurrentMonth(date) ? 'text-gray-600' : 'text-gray-300'}`}>
                  <div className={`text-sm ${isToday(date) ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                    {date.getDate()}
                  </div>
                </div>
              </DroppableCalendarCell>
            ))}
          </div>
          
          {/* Spanning Cards Layer */}
          <div 
            className="absolute inset-0 grid grid-cols-7 pointer-events-none"
            style={{ gridTemplateRows: `repeat(${calendarWeeks + 1}, minmax(0, 1fr))` }}
          >
            {spanningCards.map((spanCard, index) => (
              <div
                key={`${spanCard.card.id}-${index}`}
                className="pointer-events-auto"
                style={{
                  gridColumn: `${spanCard.startCol + 1} / ${spanCard.startCol + spanCard.span + 1}`,
                  gridRow: spanCard.row + 2, // +2 to account for header row
                }}
              >
                <SpanningCard
                  card={spanCard.card}
                  startDate={spanCard.startDate}
                  endDate={spanCard.endDate}
                  row={spanCard.row}
                  startCol={spanCard.startCol}
                  span={spanCard.span}
                  onResize={handleCardResize}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedCard ? (
            <div className="bg-blue-500 border-blue-600 border-2 rounded text-xs text-white font-medium px-2 py-1">
              {draggedCard.title}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}