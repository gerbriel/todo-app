import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { getBoards } from '@/api/boards';
import { getCardsByBoard } from '@/api/cards';
import { useAuth } from '@/contexts/AuthContext';
import type { CardRow } from '@/types/dto';
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
  resource?: CardRow;
  type: 'card' | 'task';
  cardTitle?: string; // For tasks, store parent card title
  completed?: boolean; // For tasks
  boardName?: string; // Store board name for reference
}

export default function MasterCalendarView() {
  const { user } = useAuth();
  const userId = user?.id || 'guest-user';

  // Fetch all boards
  const { data: boards = [] } = useQuery({
    queryKey: ['boards', userId],
    queryFn: () => getBoards(userId),
  });

  // Fetch cards for all boards
  const { data: allCards = [], isLoading } = useQuery({
    queryKey: ['all-cards', boards.map(b => b.id)],
    queryFn: async () => {
      const cardPromises = boards.map(board => 
        getCardsByBoard(board.id).then(cards => 
          cards.map(card => ({ ...card, boardName: board.name }))
        )
      );
      const cardArrays = await Promise.all(cardPromises);
      return cardArrays.flat();
    },
    enabled: boards.length > 0,
  });

  // Convert cards and their checklist items to calendar events
  const events: CalendarEvent[] = [];
  
  allCards.forEach(card => {
    // Add card-level events (if card has dates)
    if (card.date_start || card.date_end) {
      const startDate = card.date_start ? new Date(card.date_start) : new Date();
      const endDate = card.date_end ? new Date(card.date_end) : startDate;
      
      events.push({
        id: `card-${card.id}`,
        title: `📋 ${card.title}`,
        start: startDate,
        end: endDate,
        resource: card,
        type: 'card',
        boardName: (card as any).boardName,
      });
    }
    
    // Add checklist item (task) events
    if (card.checklists) {
      card.checklists.forEach(checklist => {
        checklist.checklist_items?.forEach(item => {
          if (item.due_date || item.start_date) {
            const startDate = item.start_date ? new Date(item.start_date) : new Date(item.due_date!);
            const endDate = item.due_date ? new Date(item.due_date) : startDate;
            
            events.push({
              id: `task-${item.id}`,
              title: `${item.done ? '✓' : '☐'} ${item.text || 'Untitled Task'}`,
              start: startDate,
              end: endDate,
              resource: card,
              type: 'task',
              cardTitle: card.title,
              completed: item.done,
              boardName: (card as any).boardName,
            });
          }
        });
      });
    }
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading master calendar...</div>
      </div>
    );
  }

  // Custom event style based on type
  const eventStyleGetter = (event: CalendarEvent) => {
    const style: React.CSSProperties = {
      backgroundColor: event.type === 'card' ? '#3b82f6' : '#10b981',
      borderRadius: '4px',
      opacity: event.completed ? 0.6 : 1,
      color: 'white',
      border: 'none',
      display: 'block',
    };
    
    if (event.completed) {
      style.textDecoration = 'line-through';
    }
    
    return { style };
  };

  const cardCount = events.filter(e => e.type === 'card').length;
  const taskCount = events.filter(e => e.type === 'task').length;
  const completedTasks = events.filter(e => e.type === 'task' && e.completed).length;

  try {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 p-4">
          <h1 className="text-2xl font-bold mb-2">Master Calendar</h1>
          
          <div className="flex gap-6 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
              <span className="font-medium">Cards: {cardCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
              <span className="font-medium">Tasks: {taskCount}</span>
              <span className="text-gray-500">({completedTasks} completed)</span>
            </div>
          </div>
          
          <div className="bg-white border rounded" style={{ height: 'calc(100vh - 250px)' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              views={['month', 'week', 'day', 'agenda']}
              defaultView="month"
              eventPropGetter={eventStyleGetter}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="bg-red-100 border border-red-400 p-4 rounded">
          <h2 className="text-red-800 font-bold">Master Calendar Error</h2>
          <p className="text-red-700">Error loading calendar: {String(error)}</p>
        </div>
      </div>
    );
  }
}