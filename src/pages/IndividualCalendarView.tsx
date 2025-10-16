import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { getBoard } from '@/api/boards';
import { getCardsByBoard } from '@/api/cards';
import { ChevronLeft, ChevronRight, Filter, Eye, Calendar as CalendarIcon } from 'lucide-react';
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
  allDay?: boolean;
  resource: {
    card: any;
    type: 'start' | 'due' | 'range' | 'task-start' | 'task-due';
    priority?: string;
    status?: string;
  };
}

export default function IndividualCalendarView() {
  const { boardId } = useParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    showCards: true,
    showTasks: true,
    showStartDates: true,
    showDueDates: true,
    priority: 'all',
    status: 'all',
  });

  // Fetch board data
  const { data: board, isLoading: boardLoading } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => getBoard(boardId!),
    enabled: !!boardId,
  });

  // Fetch cards
  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['cards', boardId],
    queryFn: () => getCardsByBoard(boardId!),
    enabled: !!boardId,
  });

  if (boardLoading || cardsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading calendar...</div>
      </div>
    );
  }

  // Convert cards and tasks to calendar events
  const events: CalendarEvent[] = React.useMemo(() => {
    const allEvents: CalendarEvent[] = [];
    
    cards.forEach((card: any) => {
      // Card start dates
      if (card.date_start && filterOptions.showCards && filterOptions.showStartDates) {
        allEvents.push({
          id: `${card.id}-start`,
          title: `🚀 ${card.title}`,
          start: new Date(card.date_start),
          end: new Date(card.date_start),
          allDay: true,
          resource: {
            card,
            type: 'start',
            priority: card.priority,
            status: card.status,
          },
        });
      }
      
      // Card due dates
      if (card.date_end && filterOptions.showCards && filterOptions.showDueDates) {
        allEvents.push({
          id: `${card.id}-due`,
          title: `📅 ${card.title}`,
          start: new Date(card.date_end),
          end: new Date(card.date_end),
          allDay: true,
          resource: {
            card,
            type: 'due',
            priority: card.priority,
            status: card.status,
          },
        });
      }
      
      // Card date ranges
      if (card.date_start && card.date_end && card.date_start !== card.date_end && filterOptions.showCards) {
        allEvents.push({
          id: `${card.id}-range`,
          title: `📊 ${card.title}`,
          start: new Date(card.date_start),
          end: new Date(card.date_end),
          allDay: true,
          resource: {
            card,
            type: 'range',
            priority: card.priority,
            status: card.status,
          },
        });
      }

      // Task/Checklist items
      if (card.checklists && filterOptions.showTasks) {
        card.checklists.forEach((checklist: any) => {
          if (checklist.checklist_items) {
            checklist.checklist_items.forEach((task: any) => {
              // Task start dates
              if (task.start_date && filterOptions.showStartDates) {
                allEvents.push({
                  id: `${task.id}-start`,
                  title: `🎯 ${task.text}`,
                  start: new Date(task.start_date),
                  end: new Date(task.start_date),
                  allDay: true,
                  resource: {
                    card: { ...card, task },
                    type: 'task-start',
                    priority: task.priority,
                    status: task.done ? 'completed' : 'active',
                  },
                });
              }

              // Task due dates
              if (task.due_date && filterOptions.showDueDates) {
                allEvents.push({
                  id: `${task.id}-due`,
                  title: `✅ ${task.text}`,
                  start: new Date(task.due_date),
                  end: new Date(task.due_date),
                  allDay: true,
                  resource: {
                    card: { ...card, task },
                    type: 'task-due',
                    priority: task.priority,
                    status: task.done ? 'completed' : 'active',
                  },
                });
              }
            });
          }
        });
      }
    });

    // Apply filters
    return allEvents.filter(event => {
      const { priority, status } = event.resource;
      
      if (filterOptions.priority !== 'all' && priority !== filterOptions.priority) {
        return false;
      }
      
      if (filterOptions.status !== 'all' && status !== filterOptions.status) {
        return false;
      }
      
      return true;
    });
  }, [cards, filterOptions]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const { type, priority, status } = event.resource;
    
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';
    
    // Color by type
    switch (type) {
      case 'start':
      case 'task-start':
        backgroundColor = '#10b981'; // green
        borderColor = '#059669';
        break;
      case 'due':
      case 'task-due':
        backgroundColor = '#f59e0b'; // amber
        borderColor = '#d97706';
        break;
      case 'range':
        backgroundColor = '#6366f1'; // indigo
        borderColor = '#4f46e5';
        break;
    }
    
    // Modify by priority
    if (priority === 'high') {
      backgroundColor = '#ef4444'; // red
      borderColor = '#dc2626';
    } else if (priority === 'low') {
      backgroundColor = '#6b7280'; // gray
      borderColor = '#4b5563';
    }
    
    // Modify by status
    if (status === 'completed') {
      backgroundColor = '#22c55e'; // green
      borderColor = '#16a34a';
    } else if (status === 'overdue') {
      backgroundColor = '#dc2626'; // red
      borderColor = '#b91c1c';
    }
    
    return {
      style: {
        backgroundColor,
        borderColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '4px',
        color: 'white',
        fontSize: '12px',
        padding: '2px 4px',
      }
    };
  };

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY' | Date) => {
    if (action === 'PREV') {
      setCurrentDate(prev => subMonths(prev, 1));
    } else if (action === 'NEXT') {
      setCurrentDate(prev => addMonths(prev, 1));
    } else if (action === 'TODAY') {
      setCurrentDate(new Date());
    } else {
      setCurrentDate(action);
    }
  };

  const CustomToolbar = ({ date, view, onNavigate, onView }: any) => (
    <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('PREV')}
            className="p-2 rounded hover:bg-gray-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('TODAY')}
            className="px-3 py-2 text-sm font-medium bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Today
          </button>
          <button
            onClick={() => onNavigate('NEXT')}
            className="p-2 rounded hover:bg-gray-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <h2 className="text-lg font-semibold text-gray-900">
          {format(date, 'MMMM yyyy')}
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['month', 'week', 'day'].map(v => (
            <button
              key={v}
              onClick={() => onView(v)}
              className={`px-3 py-1 text-sm font-medium rounded capitalize ${
                view === v
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Calendar View</h1>
          </div>
          {board && (
            <p className="text-gray-600">{board.name}</p>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Options</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Show/Hide Options */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Show Items</h4>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filterOptions.showCards}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, showCards: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Cards</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filterOptions.showTasks}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, showTasks: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Tasks</span>
                </label>
              </div>

              {/* Date Types */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Date Types</h4>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filterOptions.showStartDates}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, showStartDates: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Start Dates</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filterOptions.showDueDates}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, showDueDates: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Due Dates</span>
                </label>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Priority</h4>
                <select
                  value={filterOptions.priority}
                  onChange={(e) => setFilterOptions(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Status</h4>
                <select
                  value={filterOptions.status}
                  onChange={(e) => setFilterOptions(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>

            {/* Event Legend */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Legend</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Start Dates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-500 rounded"></div>
                  <span>Due Dates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                  <span>Date Ranges</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>High Priority</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
                  <span>Completed</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={['month', 'week', 'day']}
            view={calendarView}
            onView={(view: any) => setCalendarView(view as 'month' | 'week' | 'day')}
            date={currentDate}
            onNavigate={handleNavigate}
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: CustomToolbar,
            }}
            onSelectEvent={(event) => {
              // Handle event click - could open a modal with details
              console.log('Event clicked:', event);
            }}
            popup
            popupOffset={30}
            step={60}
            timeslots={1}
            formats={{
              eventTimeRangeFormat: () => '', // Hide time for all-day events
            }}
          />
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Card Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => ['start', 'due', 'range'].includes(e.resource.type)).length}
                </p>
              </div>
              <CalendarIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Task Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => ['task-start', 'task-due'].includes(e.resource.type)).length}
                </p>
              </div>
              <CalendarIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.resource.priority === 'high').length}
                </p>
              </div>
              <CalendarIcon className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}