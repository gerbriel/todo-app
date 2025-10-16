import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getBoard } from '@/api/boards';
import { getListsByBoard } from '@/api/lists';
import { getCardsByBoard } from '@/api/cards';
import { Calendar, CheckSquare, FileText, Clock, Filter, Users } from 'lucide-react';
import type { CardRow } from '@/types/dto';

interface TimelineItem {
  id: string;
  type: 'card' | 'task';
  title: string;
  description?: string;
  date: Date;
  boardName: string;
  listName?: string;
  cardTitle?: string; // For tasks that belong to a card
  priority?: 'low' | 'medium' | 'high';
  status?: string;
  assignees?: string[];
  labels?: Array<{ id: string; name: string; color: string; }>;
}

export default function EnhancedTimelineView() {
  const { boardId } = useParams<{ boardId: string }>();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'card' | 'task'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');

  // Fetch board data
  const { data: board, isLoading: boardLoading } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => getBoard(boardId!),
    enabled: !!boardId,
  });

  // Fetch lists
  const { data: lists = [], isLoading: listsLoading } = useQuery({
    queryKey: ['lists', boardId],
    queryFn: () => getListsByBoard(boardId!),
    enabled: !!boardId,
  });

  // Fetch cards
  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['cards', boardId],
    queryFn: () => getCardsByBoard(boardId!),
    enabled: !!boardId,
  });

  if (boardLoading || listsLoading || cardsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading timeline...</div>
      </div>
    );
  }

  // Process cards and tasks into timeline items
  const timelineItems: TimelineItem[] = React.useMemo(() => {
    const items: TimelineItem[] = [];

    cards.forEach((card: any) => {
      // Add card events
      if (card.date_start || card.date_end) {
        if (card.date_start) {
          items.push({
            id: `${card.id}-start`,
            type: 'card',
            title: `Start: ${card.title}`,
            description: card.description,
            date: new Date(card.date_start),
            boardName: board?.name || 'Unknown Board',
            listName: card.list_name,
            priority: card.priority,
            status: card.status || 'active',
            assignees: card.assigned_members || [],
            labels: card.labels || [],
          });
        }

        if (card.date_end) {
          items.push({
            id: `${card.id}-end`,
            type: 'card',
            title: `Due: ${card.title}`,
            description: card.description,
            date: new Date(card.date_end),
            boardName: board?.name || 'Unknown Board',
            listName: card.list_name,
            priority: card.priority,
            status: card.status || 'active',
            assignees: card.assigned_members || [],
            labels: card.labels || [],
          });
        }
      }

      // Add checklist/task items
      if (card.checklists) {
        card.checklists.forEach((checklist: any) => {
          if (checklist.checklist_items) {
            checklist.checklist_items.forEach((item: any) => {
              if (item.start_date || item.due_date) {
                if (item.start_date) {
                  items.push({
                    id: `${item.id}-start`,
                    type: 'task',
                    title: `Task Start: ${item.text}`,
                    date: new Date(item.start_date),
                    boardName: board?.name || 'Unknown Board',
                    listName: card.list_name,
                    cardTitle: card.title,
                    priority: item.priority,
                    status: item.done ? 'completed' : 'active',
                    assignees: item.assigned_to ? [item.assigned_to] : [],
                    labels: item.labels || [],
                  });
                }

                if (item.due_date) {
                  items.push({
                    id: `${item.id}-due`,
                    type: 'task',
                    title: `Task Due: ${item.text}`,
                    date: new Date(item.due_date),
                    boardName: board?.name || 'Unknown Board',
                    listName: card.list_name,
                    cardTitle: card.title,
                    priority: item.priority,
                    status: item.done ? 'completed' : 'active',
                    assignees: item.assigned_to ? [item.assigned_to] : [],
                    labels: item.labels || [],
                  });
                }
              }
            });
          }
        });
      }
    });

    return items;
  }, [cards, board]);

  // Filter and sort timeline items
  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = timelineItems;

    // Apply filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(item => item.type === selectedFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return a.date.getTime() - b.date.getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          return bPriority - aPriority;
        case 'status':
          return a.status?.localeCompare(b.status || '') || 0;
        default:
          return 0;
      }
    });

    return filtered;
  }, [timelineItems, selectedFilter, sortBy]);

  // Group items by date
  const groupedItems = React.useMemo(() => {
    const grouped: { [key: string]: TimelineItem[] } = {};
    
    filteredAndSortedItems.forEach(item => {
      const dateKey = item.date.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });

    return grouped;
  }, [filteredAndSortedItems]);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="h-full p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Timeline View
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {board?.name} - Track cards and tasks chronologically
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{Object.keys(groupedItems).length} dates with items</span>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-4">
              {/* Filter by type */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show:</span>
                <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                  {[
                    { id: 'all', label: 'All Items', icon: Clock },
                    { id: 'card', label: 'Cards Only', icon: FileText },
                    { id: 'task', label: 'Tasks Only', icon: CheckSquare },
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedFilter(filter.id as any)}
                      className={`px-3 py-2 text-sm font-medium flex items-center space-x-1 transition-colors ${
                        selectedFilter === filter.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <filter.icon className="w-3 h-3" />
                      <span>{filter.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort by */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <option value="date">By Date</option>
                  <option value="priority">By Priority</option>
                  <option value="status">By Status</option>
                </select>
              </div>

              {/* Stats */}
              <div className="ml-auto flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>{timelineItems.filter(i => i.type === 'card').length} cards</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckSquare className="w-4 h-4" />
                  <span>{timelineItems.filter(i => i.type === 'task').length} tasks</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {Object.keys(groupedItems).length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No timeline items found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add dates to your cards or checklist items to see them in the timeline.
              </p>
            </div>
          ) : (
            Object.entries(groupedItems)
              .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
              .map(([dateKey, items]) => (
                <div key={dateKey} className="relative">
                  {/* Date Header */}
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900 rounded-lg px-4 py-2">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                        {new Date(dateKey).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                    </div>
                    <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 ml-4"></div>
                    <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Timeline Items */}
                  <div className="space-y-4 ml-4">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className="relative flex items-start space-x-4 pb-4"
                      >
                        {/* Timeline line */}
                        {index < items.length - 1 && (
                          <div className="absolute left-3 top-8 w-px h-full bg-gray-300 dark:bg-gray-600"></div>
                        )}

                        {/* Icon */}
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          item.type === 'card' ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                          {item.type === 'card' ? (
                            <FileText className="w-3 h-3 text-white" />
                          ) : (
                            <CheckSquare className="w-3 h-3 text-white" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {item.title}
                              </h4>
                              {item.cardTitle && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  Card: {item.cardTitle}
                                </p>
                              )}
                              {item.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                  {item.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>{item.boardName}</span>
                                {item.listName && (
                                  <>
                                    <span>•</span>
                                    <span>{item.listName}</span>
                                  </>
                                )}
                                <span>•</span>
                                <span>{item.date.toLocaleTimeString()}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end space-y-2">
                              {/* Type badge */}
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                item.type === 'card' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              }`}>
                                {item.type}
                              </span>

                              {/* Priority and status */}
                              <div className="flex space-x-1">
                                {item.priority && (
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                                    {item.priority}
                                  </span>
                                )}
                                {item.status && (
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                                    {item.status}
                                  </span>
                                )}
                              </div>

                              {/* Assignees */}
                              {item.assignees && item.assignees.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Users className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {item.assignees.length} assigned
                                  </span>
                                </div>
                              )}

                              {/* Labels */}
                              {item.labels && item.labels.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {item.labels.slice(0, 3).map(label => (
                                    <span
                                      key={label.id}
                                      className="px-1 py-0.5 text-xs rounded text-white"
                                      style={{ backgroundColor: label.color }}
                                    >
                                      {label.name}
                                    </span>
                                  ))}
                                  {item.labels.length > 3 && (
                                    <span className="px-1 py-0.5 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                                      +{item.labels.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}