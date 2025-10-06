import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

interface DatePickerProps {
  selectedDate?: Date
  onDateSelect: (date: Date) => void
  onClose?: () => void
}

export function DatePicker({ selectedDate, onDateSelect, onClose }: DatePickerProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date())
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }
  
  const selectDate = (day: number) => {
    const selected = new Date(year, month, day)
    onDateSelect(selected)
    onClose?.()
  }
  
  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === month && 
           selectedDate.getFullYear() === year
  }
  
  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year
  }
  
  // Generate calendar days
  const calendarDays = []
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={previousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className="text-lg font-semibold text-gray-100">
          {monthNames[month]} {year}
        </h3>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={nextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div key={index} className="aspect-square">
            {day && (
              <button
                className={`
                  w-full h-full rounded-md text-sm font-medium transition-colors
                  ${isSelected(day) 
                    ? 'bg-primary-500 text-white' 
                    : isToday(day)
                    ? 'bg-gray-700 text-gray-100 border border-primary-500'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'
                  }
                `}
                onClick={() => selectDate(day)}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Today button */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => selectDate(new Date().getDate())}
        >
          Today
        </Button>
      </div>
    </div>
  )
}