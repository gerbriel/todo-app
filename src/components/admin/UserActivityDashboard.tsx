import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  X, 
  CheckSquare, 
  MessageCircle, 
  FileText, 
  Clock,
  TrendingUp,
  Activity,
  Target,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { getCardsByUser, getUserActivity } from '@/api/users';
import { getBoardsByUser } from '@/api/boards';
import type { CardRow } from '@/types/dto';

interface UserActivityDashboardProps {
  userId: string;
  userName: string;
  userEmail: string;
  onClose: () => void;
}

interface ActivityStats {
  totalCards: number;
  completedCards: number;
  overdueTasks: number;
  upcomingDueDates: number;
  totalComments: number;
  boardsCount: number;
  completionRate: number;
  weeklyActivity: number[];
}

interface TaskItem {
  id: string;
  title: string;
  boardName: string;
  listName: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'overdue';
  checklistItems?: Array<{
    id: string;
    text: string;
    done: boolean;
    due_date?: string;
  }>;
}

export default function UserActivityDashboard({ 
  userId, 
  userName, 
  userEmail, 
  onClose 
}: UserActivityDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'activity' | 'stats'>('overview');

  // Fetch user's cards
  const { data: userCards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['user-cards', userId],
    queryFn: () => getCardsByUser(userId),
    enabled: !!userId,
  });

  // Fetch user's boards
  const { data: userBoards = [], isLoading: boardsLoading } = useQuery({
    queryKey: ['user-boards', userId],
    queryFn: () => getBoardsByUser(userId),
    enabled: !!userId,
  });

  // Fetch user activity
  const { data: userActivity = [], isLoading: activityLoading } = useQuery({
    queryKey: ['user-activity', userId],
    queryFn: () => getUserActivity(userId),
    enabled: !!userId,
  });

  // Calculate stats
  const stats: ActivityStats = React.useMemo(() => {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const totalCards = userCards.length;
    const completedCards = userCards.filter((card: any) => card.status === 'completed').length;
    const overdueTasks = userCards.filter((card: any) => 
      card.date_end && new Date(card.date_end) < now && card.status !== 'completed'
    ).length;
    const upcomingDueDates = userCards.filter((card: any) =>
      card.date_end && 
      new Date(card.date_end) >= now && 
      new Date(card.date_end) <= oneWeekFromNow
    ).length;
    
    const completionRate = totalCards > 0 ? (completedCards / totalCards) * 100 : 0;
    
    // Mock weekly activity data - in real app, this would come from the API
    const weeklyActivity = [12, 19, 8, 15, 22, 18, 25];
    
    return {
      totalCards,
      completedCards,
      overdueTasks,
      upcomingDueDates,
      totalComments: userActivity.filter(a => a.action === 'comment').length,
      boardsCount: userBoards.length,
      completionRate,
      weeklyActivity,
    };
  }, [userCards, userBoards, userActivity]);

  // Get pending tasks with checklist items
  const pendingTasks: TaskItem[] = React.useMemo(() => {
    return userCards
      .filter((card: any) => card.status !== 'completed')
      .map((card: any) => ({
        id: card.id,
        title: card.title,
        boardName: card.board_name || 'Unknown Board',
        listName: card.list_name || 'Unknown List',
        dueDate: card.date_end,
        priority: card.priority as 'low' | 'medium' | 'high',
        status: card.date_end && new Date(card.date_end) < new Date() ? 'overdue' : 'pending',
        checklistItems: [], // This would come from the card's checklist data
      }));
  }, [userCards]);

  const upcomingTasks = pendingTasks
    .filter(task => task.dueDate && new Date(task.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const overdueTasks = pendingTasks.filter(task => task.status === 'overdue');

  if (cardsLoading || boardsLoading || activityLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{userName}</h2>
                <p className="text-gray-600">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'tasks', label: 'Tasks & Checklists', icon: CheckSquare },
                { id: 'activity', label: 'Recent Activity', icon: Activity },
                { id: 'stats', label: 'Performance', icon: TrendingUp },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Cards</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalCards}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Completed</p>
                      <p className="text-2xl font-bold text-green-900">{stats.completedCards}</p>
                    </div>
                    <CheckSquare className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">Overdue</p>
                      <p className="text-2xl font-bold text-red-900">{stats.overdueTasks}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Due This Week</p>
                      <p className="text-2xl font-bold text-yellow-900">{stats.upcomingDueDates}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Completion Rate</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${stats.completionRate}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {stats.completionRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Recent Activity Summary */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Upcoming Due Dates</h3>
                  <div className="space-y-3">
                    {upcomingTasks.length > 0 ? (
                      upcomingTasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{task.title}</p>
                            <p className="text-sm text-gray-600">{task.boardName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(task.dueDate!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No upcoming due dates</p>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Overdue Tasks</h3>
                  <div className="space-y-3">
                    {overdueTasks.length > 0 ? (
                      overdueTasks.slice(0, 5).map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <p className="font-medium text-red-900">{task.title}</p>
                            <p className="text-sm text-red-600">{task.boardName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-red-700">
                              {new Date(task.dueDate!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No overdue tasks</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Tasks & Checklist Items</h3>
              <div className="space-y-4">
                {pendingTasks.map(task => (
                  <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{task.boardName} • {task.listName}</p>
                        {task.dueDate && (
                          <p className={`text-sm mt-2 ${
                            task.status === 'overdue' 
                              ? 'text-red-600 font-medium' 
                              : 'text-gray-600'
                          }`}>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {task.priority && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            task.priority === 'high' 
                              ? 'bg-red-100 text-red-800'
                              : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          task.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <div className="space-y-3">
                {userActivity.length > 0 ? (
                  userActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        <MessageCircle className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.details}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No recent activity</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Performance Statistics</h3>
              
              {/* Weekly Activity Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium mb-4">Weekly Activity</h4>
                <div className="flex items-end space-x-2 h-32">
                  {stats.weeklyActivity.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${(value / Math.max(...stats.weeklyActivity)) * 100}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Boards</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.boardsCount}</p>
                    </div>
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Comments</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalComments}</p>
                    </div>
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Completion</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.completionRate.toFixed(0)}%</p>
                    </div>
                    <Target className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}