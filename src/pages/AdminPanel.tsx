import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Database, 
  Palette, 
  Settings, 
  Shield, 
  Trash2, 
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Clock,
  UserCheck,
  UserX,
  Terminal,
  Activity,
  Plus
} from 'lucide-react';

interface MockUser {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  permissions: string[];
  isActive: boolean;
  lastActivity?: string;
}

interface SqlExecutionHistory {
  id: string;
  query: string;
  timestamp: string;
  status: 'success' | 'error';
  result?: any;
  error?: string;
  executedBy: string;
}

interface ActiveQuery {
  pid?: string;
  usename?: string;
  query?: string;
  duration?: string;
  state?: string;
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [operationStatus, setOperationStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  const [users, setUsers] = useState<MockUser[]>([
    {
      id: '1',
      email: 'admin@example.com',
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'admin', 'sql_execute'],
      isActive: true,
      lastActivity: new Date().toISOString()
    },
    {
      id: '2',
      email: 'user@example.com',
      role: 'user',
      permissions: ['read', 'write'],
      isActive: true,
      lastActivity: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      email: 'viewer@example.com',
      role: 'viewer',
      permissions: ['read'],
      isActive: false,
      lastActivity: new Date(Date.now() - 172800000).toISOString()
    }
  ]);

  const [themes] = useState([
    { id: '1', name: 'Default', primary: '#3b82f6', secondary: '#10b981', background: '#ffffff' },
    { id: '2', name: 'Dark', primary: '#6366f1', secondary: '#8b5cf6', background: '#1f2937' },
    { id: '3', name: 'Ocean', primary: '#0891b2', secondary: '#06b6d4', background: '#f0f9ff' }
  ]);

  const [settings] = useState([
    { id: '1', setting_key: 'max_cards_per_list', setting_value: 50, description: 'Maximum cards per list' },
    { id: '2', setting_key: 'auto_archive_days', setting_value: 30, description: 'Auto archive completed cards after days' },
    { id: '3', setting_key: 'enable_notifications', setting_value: true, description: 'Enable email notifications' }
  ]);

  const [sqlQuery, setSqlQuery] = useState('');
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [sqlHistory, setSqlHistory] = useState<SqlExecutionHistory[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeQueries, setActiveQueries] = useState<ActiveQuery[]>([
    { pid: '12345', usename: 'postgres', query: 'SELECT * FROM boards WHERE created_at > NOW() - INTERVAL \'1 day\'', duration: '00:00:02', state: 'active' },
    { pid: '12346', usename: 'app_user', query: 'UPDATE cards SET status = \'completed\' WHERE id = \'abc123\'', duration: '00:00:01', state: 'active' }
  ]);

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user' | 'viewer'>('user');
  const [showAddUser, setShowAddUser] = useState(false);

  const isAdmin = user?.email?.includes('admin') || user?.id === 'ad146555-19f4-4eb7-8d22-9ccdedd6a917';

  useEffect(() => {
    if (!isAdmin) return;
    loadDashboardData();
  }, [isAdmin]);

  const showStatus = (type: 'success' | 'error' | 'info', message: string) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), 5000);
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      showStatus('info', 'Dashboard data loaded (mock data)');
    } catch (error) {
      showStatus('error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveQueries = async () => {
    try {
      setActiveQueries([
        { pid: '12347', usename: 'postgres', query: 'SELECT COUNT(*) FROM users', duration: '00:00:00.5', state: 'active' },
        { pid: '12348', usename: 'app_user', query: 'INSERT INTO boards (name, workspace_id) VALUES (\'New Board\', \'user123\')', duration: '00:00:01.2', state: 'active' }
      ]);
      showStatus('success', 'Active queries refreshed');
    } catch (error) {
      showStatus('error', 'Failed to fetch active queries');
    }
  };

  const executeSqlQuery = async () => {
    if (!sqlQuery.trim()) return;

    setIsExecuting(true);
    setSqlError(null);
    setSqlResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResult = {
        rows: [
          { id: 1, name: 'Sample Board', created_at: new Date().toISOString() },
          { id: 2, name: 'Another Board', created_at: new Date().toISOString() }
        ],
        rowCount: 2
      };

      setSqlResult(mockResult);
      
      const execution: SqlExecutionHistory = {
        id: Date.now().toString(),
        query: sqlQuery,
        timestamp: new Date().toISOString(),
        status: 'success',
        result: mockResult,
        executedBy: user?.email || 'admin'
      };
      
      setSqlHistory(prev => [execution, ...prev.slice(0, 9)]);
      showStatus('success', 'Query executed successfully');
    } catch (error) {
      const errorMessage = 'Mock execution error';
      setSqlError(errorMessage);
      
      const execution: SqlExecutionHistory = {
        id: Date.now().toString(),
        query: sqlQuery,
        timestamp: new Date().toISOString(),
        status: 'error',
        error: errorMessage,
        executedBy: user?.email || 'admin'
      };
      
      setSqlHistory(prev => [execution, ...prev.slice(0, 9)]);
      showStatus('error', 'Query execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const addNewUser = () => {
    if (!newUserEmail.trim()) return;

    const newUser: MockUser = {
      id: Date.now().toString(),
      email: newUserEmail,
      role: newUserRole,
      permissions: newUserRole === 'admin' 
        ? ['read', 'write', 'delete', 'admin', 'sql_execute']
        : newUserRole === 'user'
        ? ['read', 'write']
        : ['read'],
      isActive: true,
      lastActivity: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    setNewUserEmail('');
    setNewUserRole('user');
    setShowAddUser(false);
    showStatus('success', `User ${newUserEmail} created successfully`);
  };

  const deleteUser = (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    setUsers(prev => prev.filter(user => user.id !== userId));
    showStatus('success', 'User deleted successfully');
  };

  const updateUserRole = (userId: string, role: 'admin' | 'user' | 'viewer') => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? {
            ...user,
            role,
            permissions: role === 'admin' 
              ? ['read', 'write', 'delete', 'admin', 'sql_execute']
              : role === 'user'
              ? ['read', 'write']
              : ['read']
          }
        : user
    ));
    showStatus('success', `User role updated to ${role}`);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
    showStatus('success', 'User status updated');
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your application settings and data</p>
        </div>

        {operationStatus && (
          <div className={`mb-6 p-4 rounded-lg ${
            operationStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            operationStatus.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <div className="flex items-center">
              {operationStatus.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
              {operationStatus.type === 'error' && <XCircle className="w-5 h-5 mr-2" />}
              {operationStatus.type === 'info' && <AlertTriangle className="w-5 h-5 mr-2" />}
              {operationStatus.message}
            </div>
          </div>
        )}

        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Database },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'themes', label: 'Themes', icon: Palette },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'sql', label: 'SQL Console', icon: Terminal }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{users.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Database className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Queries</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{activeQueries.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Palette className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Themes</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{themes.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Settings className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Settings</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{settings.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
              <button
                onClick={() => setShowAddUser(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </button>
            </div>

            {showAddUser && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Add New User</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'user' | 'viewer')}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={addNewUser}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddUser(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Permissions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Last active: {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as 'admin' | 'user' | 'viewer')}
                          className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="admin">Admin</option>
                          <option value="user">User</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.map((permission) => (
                            <span
                              key={permission}
                              className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className={`${
                              user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'themes' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <div key={theme.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">{theme.name}</h4>
                  <div className="mt-2 flex space-x-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.primary }}></div>
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.secondary }}></div>
                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: theme.background }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Settings</h3>
            <div className="space-y-6">
              {settings.map((setting) => (
                <div key={setting.id} className="border-b border-gray-200 dark:border-gray-600 pb-4 last:border-b-0">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{setting.description}</p>
                  {typeof setting.setting_value === 'boolean' ? (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={setting.setting_value}
                        readOnly
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">
                        {setting.setting_value ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  ) : (
                    <input
                      type="number"
                      value={setting.setting_value}
                      readOnly
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sql' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Currently Running Queries
                <button
                  onClick={fetchActiveQueries}
                  className="ml-auto px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Refresh
                </button>
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">PID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Query</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">State</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                    {activeQueries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                          No active queries found
                        </td>
                      </tr>
                    ) : (
                      activeQueries.map((query, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {query.pid || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {query.usename || 'N/A'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate font-mono">
                            {query.query || 'No query data'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {query.duration || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              query.state === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : query.state === 'idle'
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {query.state || 'unknown'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Terminal className="w-5 h-5 mr-2" />
                    SQL Console
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        SQL Query
                      </label>
                      <textarea
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        placeholder="SELECT * FROM boards LIMIT 10;"
                        className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={executeSqlQuery}
                        disabled={isExecuting || !sqlQuery.trim()}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {isExecuting ? 'Executing...' : 'Execute Query'}
                      </button>
                      <button
                        onClick={() => {
                          setSqlQuery('');
                          setSqlResult(null);
                          setSqlError(null);
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>

                {sqlError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <h4 className="text-red-800 font-medium mb-2">Error</h4>
                    <pre className="text-red-700 text-sm whitespace-pre-wrap">{sqlError}</pre>
                  </div>
                )}

                {sqlResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <h4 className="text-green-800 font-medium mb-2">Result</h4>
                    <pre className="text-green-700 text-sm whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(sqlResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Execution History
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {sqlHistory.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No queries executed yet</p>
                    ) : (
                      sqlHistory.map((execution) => (
                        <div key={execution.id} className="border border-gray-200 dark:border-gray-600 rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              execution.status === 'success' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {execution.status}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(execution.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded">
                            {execution.query.length > 60 
                              ? `${execution.query.substring(0, 60)}...` 
                              : execution.query}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            by {execution.executedBy}
                          </div>
                          {execution.error && (
                            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                              Error: {execution.error.substring(0, 100)}...
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;