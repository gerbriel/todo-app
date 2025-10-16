import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCardsByBoard } from '@/api/cards';
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
}

export default function CalendarView() {
  const { boardId } = useParams();

  // Fetch cards for the board
  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['cards', boardId],
    queryFn: () => boardId ? getCardsByBoard(boardId) : Promise.resolve([]),
    enabled: !!boardId,
  });

  // Convert cards and their checklist items to calendar events
  const events: CalendarEvent[] = [];
  
  cards.forEach(card => {
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
            });
          }
        });
      });
    }
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading calendar...</div>
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

  try {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 p-4">
          <h1 className="text-2xl font-bold mb-2">
            {boardId ? 'Board Calendar' : 'Master Calendar'}
          </h1>
          
          <div className="flex gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
              <span>Cards ({events.filter(e => e.type === 'card').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
              <span>Tasks ({events.filter(e => e.type === 'task').length})</span>
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
          <h2 className="text-red-800 font-bold">Calendar Error</h2>
          <p className="text-red-700">Error loading calendar: {String(error)}</p>
        </div>
      </div>
    );
  }
}