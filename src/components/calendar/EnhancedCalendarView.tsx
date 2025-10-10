import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getBoards } from '@/api/boards';
import { getCardsByBoard } from '@/api/cards';
import { useAuth } from '@/contexts/AuthContext';
import type { CardRow } from '@/types/dto';

interface CalendarCard extends CardRow {
  boardName: string;
  boardColor: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  cards: CalendarCard[];
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function EnhancedCalendarView() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBoardIds, setSelectedBoardIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch boards
  const boardsQuery = useQuery({
    queryKey: ['boards', user?.id],
    queryFn: () => user?.id ? getBoards(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  // Get board color (you can customize this)
  const getBoardColor = (boardId: string): string => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    const hash = boardId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Fetch cards for all boards
  const allCardsQuery = useQuery({
    queryKey: ['calendar-cards', boardsQuery.data?.map(b => b.id)],
    queryFn: async () => {
      const boards = boardsQuery.data || [];
      const cardPromises = boards.map(async (board) => {
        const cards = await getCardsByBoard(board.id);
        return cards.map((card): CalendarCard => ({
          ...card,
          boardName: board.name,
          boardColor: getBoardColor(board.id)
        }));
      });
      const cardArrays = await Promise.all(cardPromises);
      return cardArrays.flat();
    },
    enabled: !!boardsQuery.data?.length,
  });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayOfCalendar = new Date(firstDayOfMonth);
    firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - firstDayOfCalendar.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    const cards = allCardsQuery.data || [];
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const date = new Date(firstDayOfCalendar);
      date.setDate(date.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      
      // Filter cards for this date
      const dateString = date.toISOString().split('T')[0];
      const dayCards = cards.filter(card => {
        if (selectedBoardIds.length > 0 && !selectedBoardIds.includes(card.board_id)) {
          return false;
        }
        
        // Check if card has a date that matches this day
        const cardStartDate = card.date_start ? new Date(card.date_start).toISOString().split('T')[0] : null;
        const cardEndDate = card.date_end ? new Date(card.date_end).toISOString().split('T')[0] : null;
        
        return cardStartDate === dateString || cardEndDate === dateString;
      });
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        cards: dayCards
      });
    }
    
    return days;
  }, [currentDate, allCardsQuery.data, selectedBoardIds]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const toggleBoardFilter = (boardId: string) => {
    setSelectedBoardIds(prev => 
      prev.includes(boardId) 
        ? prev.filter(id => id !== boardId)
        : [...prev, boardId]
    );
  };

  const boards = boardsQuery.data || [];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h1>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Today
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Board Filters */}
          {boards.length > 0 && (
            <div className="flex items-center space-x-2">
              {boards.map(board => (
                <button
                  key={board.id}
                  onClick={() => toggleBoardFilter(board.id)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    selectedBoardIds.length === 0 || selectedBoardIds.includes(board.id)
                      ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {board.name}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-px mb-px">
            {DAYS.map(day => (
              <div
                key={day}
                className="bg-white dark:bg-gray-800 p-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-b border-gray-200 dark:border-gray-700"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-px h-full">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 min-h-32 overflow-hidden ${
                  !day.isCurrentMonth ? 'opacity-40' : ''
                } ${
                  day.isToday ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* Date */}
                <div className={`text-sm font-medium mb-2 ${
                  day.isToday 
                    ? 'bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center'
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {day.date.getDate()}
                </div>

                {/* Cards */}
                <div className="space-y-1">
                  {day.cards.slice(0, 3).map((card) => (
                    <div
                      key={card.id}
                      className="text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: card.boardColor }}
                      title={`${card.title} (${card.boardName})`}
                    >
                      {card.title}
                    </div>
                  ))}
                  
                  {day.cards.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{day.cards.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar - Only show if filters are enabled */}
      {showFilters && (
        <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg z-10">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Calendar Filters
            </h3>
            
            {/* Board Filters */}
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Boards
                </h4>
                {boards.map(board => (
                  <label key={board.id} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      checked={selectedBoardIds.length === 0 || selectedBoardIds.includes(board.id)}
                      onChange={() => toggleBoardFilter(board.id)}
                      className="rounded text-blue-500"
                    />
                    <span 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getBoardColor(board.id) }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {board.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}