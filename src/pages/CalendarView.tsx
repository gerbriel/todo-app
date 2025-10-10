import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { getBoards } from '@/api/boards';
import { getCardsByBoard } from '@/api/cards';
import { useAuth } from '@/contexts/AuthContext';
import type { CardRow, BoardRow } from '@/types/dto';
import CalendarFilters from '@/components/calendar/CalendarFilters';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    card: CardRow;
    boardName: string;
    boardColor: string;
  };
}

export default function CalendarView() {
  const { boardId } = useParams();
  const { user } = useAuth();
  const [selectedBoardIds, setSelectedBoardIds] = React.useState<string[]>([]);
  const [showAllBoards, setShowAllBoards] = React.useState(true);

  // Fetch all boards (for master calendar view) or single board info
  const boardsQuery = useQuery({
    queryKey: ['boards', user?.id],
    queryFn: () => user?.id ? getBoards(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  const boards = (boardsQuery.data || []) as BoardRow[];
  
  // If we have a specific boardId, only show that board
  // Otherwise, show based on user's filter selection
  const boardsToShow = React.useMemo(() => {
    if (boardId) {
      // Board-specific calendar view
      return boards.filter(b => b.id === boardId);
    } else {
      // Master calendar view with filtering
      return showAllBoards ? boards : boards.filter(b => selectedBoardIds.includes(b.id));
    }
  }, [boardId, boards, showAllBoards, selectedBoardIds]);

  // Fetch cards for all relevant boards
  const allCardData = useQuery({
    queryKey: ['all-cards', boardsToShow.map(b => b.id)],
    queryFn: async () => {
      if (boardsToShow.length === 0) return [];
      
      const results = await Promise.all(
        boardsToShow.map(board => getCardsByBoard(board.id))
      );
      return results;
    },
    enabled: boardsToShow.length > 0,
  });

  // Get board color (you can customize this)
  const getBoardColor = (boardId: string): string => {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // emerald
      '#F59E0B', // amber
      '#EF4444', // red
      '#8B5CF6', // violet
      '#06B6D4', // cyan
      '#F97316', // orange
      '#84CC16', // lime
    ];
    
    const index = boards.findIndex(b => b.id === boardId);
    return colors[index % colors.length];
  };

  // Convert cards to calendar events
  const events: CalendarEvent[] = React.useMemo(() => {
    if (!allCardData.data) return [];
    
    const allEvents: CalendarEvent[] = [];
    
    boardsToShow.forEach((board, index) => {
      const cards = allCardData.data[index] || [];
      const boardColor = getBoardColor(board.id);
      
      cards.forEach(card => {
        // Add events for cards with due dates
        if (card.date_end) {
          allEvents.push({
            id: `${card.id}-end`,
            title: `📅 ${card.title}`,
            start: new Date(card.date_end),
            end: new Date(card.date_end),
            resource: {
              card,
              boardName: board.name,
              boardColor,
            },
          });
        }
        
        // Add events for cards with start dates
        if (card.date_start) {
          allEvents.push({
            id: `${card.id}-start`,
            title: `🚀 ${card.title}`,
            start: new Date(card.date_start),
            end: new Date(card.date_start),
            resource: {
              card,
              boardName: board.name,
              boardColor,
            },
          });
        }
        
        // Add events for date ranges
        if (card.date_start && card.date_end && card.date_start !== card.date_end) {
          allEvents.push({
            id: `${card.id}-range`,
            title: `📊 ${card.title}`,
            start: new Date(card.date_start),
            end: new Date(card.date_end),
            resource: {
              card,
              boardName: board.name,
              boardColor,
            },
          });
        }
      });
    });
    
    return allEvents;
  }, [boardsToShow, allCardData.data]);

  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.resource.boardColor,
        borderColor: event.resource.boardColor,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
      },
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    // TODO: Open card modal or navigate to card
    console.log('Selected event:', event);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    // TODO: Create new card with selected date range
    console.log('Selected slot:', { start, end });
  };

  if (boardsQuery.isLoading || allCardData.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading calendar...</div>
      </div>
    );
  }

  if (boardsQuery.error || allCardData.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">
          Failed to load calendar data. Please try again.
        </div>
      </div>
    );
  }

  const isAllBoardsView = !boardId;
  const currentBoard = boardId ? boards.find(b => b.id === boardId) : null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isAllBoardsView ? 'Master Calendar' : `${currentBoard?.name} Calendar`}
          </h1>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {events.length} events from {boardsToShow.length} board{boardsToShow.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {isAllBoardsView && (
          <CalendarFilters
            boards={boards}
            selectedBoardIds={selectedBoardIds}
            showAllBoards={showAllBoards}
            onSelectedBoardsChange={setSelectedBoardIds}
            onShowAllBoardsChange={setShowAllBoards}
          />
        )}
      </div>
      
      <div className="flex-1 p-4">
        <div className="calendar-container bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
            popup
            showMultiDayTimes
            step={60}
            timeslots={1}
            components={{
              event: ({ event }: { event: CalendarEvent }) => (
                <div className="flex items-center gap-1 text-xs">
                  <span className="truncate">{event.title}</span>
                  {isAllBoardsView && (
                    <span className="text-xs opacity-75">
                      ({event.resource.boardName})
                    </span>
                  )}
                </div>
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
}
