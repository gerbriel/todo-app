import { useQuery } from '@tanstack/react-query';
import { getBoards } from '@/api/boards';
import { useAuth } from '@/contexts/AuthContext';

export default function MasterCalendarView() {
  const { user } = useAuth();
  const workspaceId = user?.id || '2a8f10d6-4368-43db-ab1d-ab783ec6e935';
  
  // Get all boards
  const { data: boards = [], isLoading: boardsLoading } = useQuery({
    queryKey: ['boards', user?.id],
    queryFn: () => getBoards(workspaceId),
    enabled: !!user?.id
  });

  if (boardsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Master Calendar</h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {boards.length} boards
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Master Calendar View
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              This will show all cards with dates from all your boards
            </p>
            <div className="mt-4">
              <p className="text-sm text-gray-400">
                Boards found: {boards.map(b => b.name).join(', ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}