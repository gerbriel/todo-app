import { useState, useEffect } from 'react'
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
  onEditCard?: (card: Card) => void
}

interface SpanningCardProps {
  card: Card
  startDate: Date
  endDate: Date
  totalDays: number
  segmentStart: number
  segmentEnd: number
  row: number
  lane: number
  onResize?: (cardId: string, direction: 'start' | 'end', newDate: Date) => void
  onEditCard?: (card: Card) => void
}

function SpanningCard({ card, startDate, endDate, totalDays, segmentStart, segmentEnd, row, lane, onResize, onEditCard }: SpanningCardProps) {
  const [resizing, setResizing] = useState<'start' | 'end' | null>(null)
  const [startResizeDate, setStartResizeDate] = useState<Date | null>(null)
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${card.id}-${row}`,
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

  const handleResizeStart = (e: React.MouseEvent, direction: 'start' | 'end') => {
    e.stopPropagation()
    e.preventDefault()
    setResizing(direction)
    setStartResizeDate(direction === 'start' ? startDate : endDate)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onEditCard?.(card)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing || !onResize || !startResizeDate) return
      
      // Find the calendar cell element directly under the mouse
      const element = document.elementFromPoint(e.clientX, e.clientY)
      const calendarCell = element?.closest('[data-calendar-date]')
      
      if (calendarCell) {
        const dateString = calendarCell.getAttribute('data-calendar-date')
        if (dateString) {
          const targetDate = new Date(dateString)
          onResize(card.id, resizing, targetDate)
        }
      }
    }

    const handleMouseUp = () => {
      setResizing(null)
      setStartResizeDate(null)
    }

    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing, onResize, card.id, startResizeDate])

  const colStart = segmentStart + 1
  const colSpan = segmentEnd - segmentStart + 1
  const gridRow = row + 2 // +2 for header row
  const cardHeight = 26 // Height of each card including margins
  const safeLane = typeof lane === 'number' && !isNaN(lane) ? lane : 0
  const topOffset = safeLane * cardHeight // Position based on lane

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    gridColumn: `${colStart} / ${colStart + colSpan}`,
    gridRow: gridRow,
    marginTop: `${topOffset}px`,
    zIndex: isDragging ? 1000 : resizing ? 999 : 10 + safeLane,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative m-0.5 rounded text-xs text-white font-medium cursor-pointer hover:opacity-80 transition-all border-2 min-h-[24px] ${getStatusColor(card.status)} ${
        isDragging ? 'opacity-50' : ''
      } ${resizing ? 'ring-2 ring-white' : ''}`}
      title={`${card.title}\n${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
      onDoubleClick={handleDoubleClick}
      {...(resizing ? {} : attributes)}
      {...(resizing ? {} : listeners)}
    >
      {/* Left resize handle - only show on first segment */}
      {segmentStart === 0 && (
        <div
          className="absolute left-0 top-0 w-3 h-full cursor-ew-resize hover:bg-white/50 bg-white/20 z-20"
          onMouseDown={(e) => handleResizeStart(e, 'start')}
          title="Drag to change start date"
        />
      )}
      
      {/* Card content */}
      <div className="px-2 py-1 truncate pointer-events-none relative z-10">
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
      
      {/* Right resize handle - only show on last segment */}
      {segmentEnd === totalDays - 1 && (
        <div
          className="absolute right-0 top-0 w-3 h-full cursor-ew-resize hover:bg-white/50 bg-white/20 z-20"
          onMouseDown={(e) => handleResizeStart(e, 'end')}
          title="Drag to change end date"
        />
      )}
    </div>
  )
}

function DroppableCalendarCell({ 
  date, 
  children, 
  maxLanes = 1 
}: { 
  date: Date; 
  children: React.ReactNode;
  maxLanes?: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `calendar-cell-${date.toISOString()}`,
    data: { date }
  })

  const baseHeight = 60 // Base height for date number
  const laneHeight = 26 // Height per card lane
  const safeLanes = typeof maxLanes === 'number' && !isNaN(maxLanes) && maxLanes > 0 ? maxLanes : 1
  const totalHeight = baseHeight + (safeLanes * laneHeight)

  return (
    <div
      ref={setNodeRef}
      data-calendar-date={date.toISOString()}
      style={{ height: `${totalHeight}px` }}
      className={`border-r border-b border-gray-700 last:border-r-0 relative ${
        isOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      {children}
    </div>
  )
}

export function CalendarView({ cards = [], onUpdateCardDates, onEditCard }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [draggedCard, setDraggedCard] = useState<Card | null>(null)
  const [calendarWeeks, setCalendarWeeks] = useState(6)

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

  // Generate calendar days
  const days: Date[] = []
  const current = new Date(startDate)
  for (let i = 0; i < calendarWeeks * 7; i++) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  // Create spanning cards that break across rows and assign lanes to avoid overlap
  const getSpanningCards = () => {
    const spanningCards: Array<{
      card: Card
      startDate: Date
      endDate: Date
      totalDays: number
      segmentStart: number
      segmentEnd: number
      row: number
      lane: number
    }> = []

    const cardsWithDates = cards.filter(card => 
      card.date_start || card.date_end
    )

    // Create a map to track which lanes are occupied for each day
    const dayLaneMap: Map<string, boolean[]> = new Map()
    
    // Initialize lane tracking for all days
    days.forEach(day => {
      dayLaneMap.set(day.toDateString(), [])
    })

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

      // Find start and end day indices
      const startDayIndex = days.findIndex(day => 
        day.toDateString() === cardStartDate.toDateString()
      )
      const endDayIndex = days.findIndex(day => 
        day.toDateString() === cardEndDate.toDateString()
      )

      if (startDayIndex === -1) return // Card starts outside visible range

      const actualEndDayIndex = endDayIndex === -1 ? days.length - 1 : endDayIndex
      const totalCardDays = actualEndDayIndex - startDayIndex + 1
      
      // Find an available lane for this card across all its days
      let assignedLane = 0
      let laneAvailable = false
      
      while (!laneAvailable) {
        laneAvailable = true
        
        // Check if this lane is available for all days the card spans
        for (let dayIndex = startDayIndex; dayIndex <= actualEndDayIndex; dayIndex++) {
          const dayKey = days[dayIndex].toDateString()
          const dayLanes = dayLaneMap.get(dayKey) || []
          
          if (dayLanes[assignedLane]) {
            laneAvailable = false
            break
          }
        }
        
        if (!laneAvailable) {
          assignedLane++
        }
      }
      
      // Mark this lane as occupied for all days the card spans
      for (let dayIndex = startDayIndex; dayIndex <= actualEndDayIndex; dayIndex++) {
        const dayKey = days[dayIndex].toDateString()
        const dayLanes = dayLaneMap.get(dayKey) || []
        dayLanes[assignedLane] = true
        dayLaneMap.set(dayKey, dayLanes)
      }
      
      // Create one segment per row
      let currentDayIndex = startDayIndex
      while (currentDayIndex <= actualEndDayIndex) {
        const currentRow = Math.floor(currentDayIndex / 7)
        const rowEndIndex = Math.min((currentRow + 1) * 7 - 1, actualEndDayIndex)
        
        const segmentStart = currentDayIndex % 7
        const segmentEnd = rowEndIndex % 7
        
        spanningCards.push({
          card,
          startDate: cardStartDate,
          endDate: cardEndDate,
          totalDays: totalCardDays,
          segmentStart,
          segmentEnd,
          row: currentRow,
          lane: assignedLane
        })
        
        currentDayIndex = rowEndIndex + 1
      }
    })

    return { spanningCards, dayLaneMap }
  }

  const { spanningCards, dayLaneMap } = getSpanningCards()

  // Calculate maximum lanes needed per row
  const getMaxLanesPerRow = () => {
    const rowMaxLanes: number[] = []
    
    // Initialize each row with 1 lane minimum
    for (let row = 0; row < calendarWeeks; row++) {
      rowMaxLanes[row] = 1
    }
    
    // Calculate max lanes needed for each row
    days.forEach((day, index) => {
      const rowIndex = Math.floor(index / 7)
      if (rowIndex >= 0 && rowIndex < calendarWeeks) {
        const dayKey = day.toDateString()
        const dayLanes = dayLaneMap.get(dayKey) || []
        const maxLaneForDay = dayLanes.length > 0 ? dayLanes.length : 1
        
        if (typeof maxLaneForDay === 'number' && !isNaN(maxLaneForDay) && maxLaneForDay > rowMaxLanes[rowIndex]) {
          rowMaxLanes[rowIndex] = maxLaneForDay
        }
      }
    })
    
    return rowMaxLanes
  }

  const maxLanesPerRow = getMaxLanesPerRow()

  const handleCardResize = (cardId: string, direction: 'start' | 'end', newDate: Date) => {
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
      startDate = newDate
      if (startDate > endDate) {
        startDate = new Date(endDate)
      }
    } else {
      endDate = newDate
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
      
      let startDate = newDate.toISOString()
      let endDate = newDate.toISOString()

      if (card.date_start && card.date_end) {
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
            className="calendar-grid grid grid-cols-7 border-l border-t border-gray-700"
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
            {days.map((date, index) => {
              const rowIndex = Math.floor(index / 7)
              const maxLanes = maxLanesPerRow[rowIndex] || 1
              return (
                <DroppableCalendarCell 
                  key={date.toISOString()} 
                  date={date}
                  maxLanes={maxLanes}
                >
                  <div className={`p-2 h-full ${!isCurrentMonth(date) ? 'text-gray-600' : 'text-gray-300'}`}>
                    <div className={`text-sm ${isToday(date) ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                      {date.getDate()}
                    </div>
                  </div>
                </DroppableCalendarCell>
              )
            })}
          </div>
          
          {/* Spanning Cards Layer */}
          <div 
            className="absolute inset-0 grid grid-cols-7 pointer-events-none"
            style={{ gridTemplateRows: `repeat(${calendarWeeks + 1}, minmax(0, 1fr))` }}
          >
            {spanningCards.map((spanCard, index) => (
              <SpanningCard
                key={`${spanCard.card.id}-${spanCard.row}-${index}`}
                card={spanCard.card}
                startDate={spanCard.startDate}
                endDate={spanCard.endDate}
                totalDays={spanCard.totalDays}
                segmentStart={spanCard.segmentStart}
                segmentEnd={spanCard.segmentEnd}
                row={spanCard.row}
                lane={spanCard.lane}
                onResize={handleCardResize}
                onEditCard={onEditCard}
              />
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