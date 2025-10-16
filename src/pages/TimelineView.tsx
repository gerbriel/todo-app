import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getBoard } from '@/api/boards';
import { getListsByBoard } from '@/api/lists';
import { getCardsByBoard } from '@/api/cards';
import type { CardRow } from '@/types/dto';

interface TimelineItem {
  id: string;
  type: 'card' | 'task';
  title: string;
  cardTitle?: string; // For tasks
  listName: string;
  dateStart?: string;
  dateEnd?: string;
  description?: string | null;
  completed?: boolean; // For tasks
  priority?: 'low' | 'medium' | 'high' | null; // For tasks
  labels?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  card?: CardRow; // Reference to parent card
}

export default function TimelineView() {
  const { boardId } = useParams<{ boardId: string }>();

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

  const getListName = (listId: string) => {
    const list = lists.find(l => l.id === listId);
    return list?.name || 'Unknown List';
  };

  // Convert cards and tasks to timeline items
  const timelineItems: TimelineItem[] = [];
  
  cards.forEach(card => {
    // Add card-level items
    if (card.date_start || card.date_end) {
      timelineItems.push({
        id: `card-${card.id}`,
        type: 'card',
        title: card.title,
        listName: getListName(card.list_id),
        dateStart: card.date_start || undefined,
        dateEnd: card.date_end || undefined,
        description: typeof card.description === 'string' ? card.description : null,
        labels: card.card_labels?.filter(cl => cl.labels).map(cl => cl.labels!),
        card,
      });
    }
    
    // Add checklist items (tasks)
    if (card.checklists) {
      card.checklists.forEach(checklist => {
        checklist.checklist_items?.forEach(item => {
          if (item.due_date || item.start_date) {
            timelineItems.push({
              id: `task-${item.id}`,
              type: 'task',
              title: item.text || 'Untitled Task',
              cardTitle: card.title,
              listName: getListName(card.list_id),
              dateStart: item.start_date || undefined,
              dateEnd: item.due_date || undefined,
              completed: item.done,
              priority: item.priority,
              labels: item.labels,
              card,
            });
          }
        });
      });
    }
  });

  // Sort timeline items chronologically
  const sortedItems = timelineItems.sort((a, b) => {
    const dateA = new Date(a.dateStart || a.dateEnd || 0);
    const dateB = new Date(b.dateStart || b.dateEnd || 0);
    return dateA.getTime() - dateB.getTime();
  });

  // Group by month/year
  const groupedItems = sortedItems.reduce((acc, item) => {
    const date = new Date(item.dateStart || item.dateEnd || 0);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(item);
    return acc;
  }, {} as Record<string, TimelineItem[]>);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMonthYear = (monthYear: string) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const cardCount = timelineItems.filter(item => item.type === 'card').length;
  const taskCount = timelineItems.filter(item => item.type === 'task').length;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {board?.name} - Timeline View
        </h1>
        <div className="flex gap-6 mt-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-300">
              {cardCount} Card{cardCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-300">
              {taskCount} Task{taskCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto p-6">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Timeline Events
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Add dates to your cards and tasks to see them in the timeline view.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
              
              {Object.entries(groupedItems).map(([monthYear, monthItems]) => (
                <div key={monthYear} className="relative mb-12">
                  {/* Month marker */}
                  <div className="flex items-center mb-6">
                    <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-900 shadow-lg z-10 relative"></div>
                    <div className="ml-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatMonthYear(monthYear)}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {monthItems.length} item{monthItems.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Items in this month */}
                  <div className="ml-10 space-y-4">
                    {monthItems.map((item, itemIndex) => (
                      <div 
                        key={item.id}
                        className={`rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow ${
                          item.type === 'card'
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                            : item.completed
                            ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-75'
                            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">
                                {item.type === 'card' ? '📋' : item.completed ? '✓' : '☐'}
                              </span>
                              <h3 className={`font-medium text-gray-900 dark:text-white ${
                                item.completed ? 'line-through' : ''
                              }`}>
                                {item.title}
                              </h3>
                            </div>
                            
                            {item.type === 'task' && item.cardTitle && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 ml-7 mb-1">
                                From card: {item.cardTitle}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 ml-7">
                              <span className="flex items-center gap-1">
                                � {item.listName}
                              </span>
                              {item.dateStart && (
                                <span className="flex items-center gap-1">
                                  🚀 {formatDate(item.dateStart)}
                                </span>
                              )}
                              {item.dateEnd && (
                                <span className="flex items-center gap-1">
                                  🏁 {formatDate(item.dateEnd)}
                                </span>
                              )}
                              {item.priority && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  item.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}>
                                  {item.priority}
                                </span>
                              )}
                            </div>
                            
                            {item.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 ml-7 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                          
                          {/* Type indicator */}
                          <div className="ml-4 flex flex-col items-end gap-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.type === 'card'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {item.type === 'card' ? '📋 Card' : '☐ Task'}
                            </span>
                            
                            <div className="text-xs text-gray-400">
                              #{itemIndex + 1}
                            </div>
                          </div>
                        </div>

                        {/* Labels */}
                        {item.labels && item.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3 ml-7">
                            {item.labels.map((label, labelIndex) => (
                              <span
                                key={labelIndex}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: label.color + '20',
                                  color: label.color,
                                  border: `1px solid ${label.color}40`
                                }}
                              >
                                {label.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}