// Mock admin API - No database dependencies
export interface DatabaseStats {
  users: number;
  workspaces: number;
  boards: number;
  lists: number;
  cards: number;
  labels: number;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  email_confirmed_at: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: Record<string, string>;
  fields: Array<{ id: string; label: string; type: string; required: boolean }>;
  labels: Array<{ name: string; color: string }>;
  is_default: boolean;
  is_global: boolean;
  created_by: string;
  created_at: string;
}

export interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  updated_by: string;
  updated_at: string;
}

export interface ActivityLogEntry {
  id: string;
  admin_id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details: Record<string, any>;
  created_at: string;
}

// Database Statistics - Mock data only
export async function getDatabaseStats(): Promise<DatabaseStats> {
  return {
    users: 4,
    workspaces: 2,
    boards: 3,
    lists: 8,
    cards: 15,
    labels: 6
  };
}

// User Management - Mock data only
export async function getUsers(): Promise<AdminUser[]> {
  return [
    {
      id: 'ad146555-19f4-4eb7-8d22-9ccdedd6a917',
      email: 'admin@example.com',
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString()
    },
    {
      id: 'user-123',
      email: 'user1@example.com',
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString()
    },
    {
      id: 'user-456',
      email: 'user2@example.com',
      created_at: new Date().toISOString(),
      last_sign_in_at: 'Never',
      email_confirmed_at: 'Not confirmed'
    },
    {
      id: 'user-789',
      email: 'viewer@example.com',
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date(Date.now() - 86400000).toISOString(),
      email_confirmed_at: new Date().toISOString()
    }
  ];
}

export async function createUser(email: string, _role: string = 'user'): Promise<AdminUser> {
  console.log('Mock: Creating user:', email);
  const newUser: AdminUser = {
    id: `user-${Date.now()}`,
    email,
    created_at: new Date().toISOString(),
    last_sign_in_at: 'Never',
    email_confirmed_at: 'Not confirmed'
  };
  return newUser;
}

export async function deleteUser(userId: string): Promise<void> {
  console.log('Mock: Deleting user:', userId);
}

export async function updateUserRole(userId: string, role: string): Promise<void> {
  console.log('Mock: Updating user role:', userId, role);
}

export async function getActiveSqlQueries(): Promise<any[]> {
  return [
    {
      pid: '12345',
      usename: 'postgres',
      query: 'SELECT * FROM users WHERE active = true',
      duration: '0.025s',
      state: 'active'
    },
    {
      pid: '12346',
      usename: 'app_user',
      query: 'UPDATE cards SET position = ? WHERE id = ?',
      duration: '0.012s',
      state: 'idle'
    }
  ];
}

export async function getGlobalThemes(): Promise<ThemeConfig[]> {
  return [
    {
      id: 'theme-default',
      name: 'Default Theme',
      colors: { primary: '#3b82f6', secondary: '#10b981', background: '#ffffff' },
      fields: [],
      labels: [],
      is_default: true,
      is_global: true,
      created_by: 'system',
      created_at: new Date().toISOString()
    },
    {
      id: 'theme-dark',
      name: 'Dark Theme',
      colors: { primary: '#6366f1', secondary: '#8b5cf6', background: '#1f2937' },
      fields: [],
      labels: [],
      is_default: false,
      is_global: true,
      created_by: 'system',
      created_at: new Date().toISOString()
    }
  ];
}

export async function getAdminSettings(): Promise<AdminSetting[]> {
  return [
    {
      id: 'setting-1',
      setting_key: 'max_cards_per_list',
      setting_value: 50,
      description: 'Maximum cards per list',
      updated_by: 'admin',
      updated_at: new Date().toISOString()
    },
    {
      id: 'setting-2',
      setting_key: 'auto_archive_days',
      setting_value: 30,
      description: 'Auto archive completed cards after days',
      updated_by: 'admin',
      updated_at: new Date().toISOString()
    }
  ];
}

export async function updateAdminSetting(settingKey: string, settingValue: any): Promise<void> {
  console.log('Mock: Updating admin setting:', settingKey, settingValue);
}

export async function cleanupOldData(): Promise<void> {
  console.log('Mock: Cleaning up old data');
}

export async function exportAllData(): Promise<Blob> {
  const mockData = { users: [], boards: [], cards: [] };
  return new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/json' });
}

export async function logAdminActivity(action: string, details: Record<string, any>): Promise<void> {
  console.log('Mock: Logging admin activity:', action, details);
}

export async function getActivityLog(): Promise<ActivityLogEntry[]> {
  return [
    {
      id: 'activity-1',
      admin_id: 'admin-123',
      action: 'USER_CREATED',
      target_type: 'user',
      target_id: 'user-456',
      details: { email: 'newuser@example.com' },
      created_at: new Date().toISOString()
    },
    {
      id: 'activity-2',
      admin_id: 'admin-123',
      action: 'SETTING_UPDATED',
      target_type: 'setting',
      target_id: 'max_cards_per_list',
      details: { old_value: 40, new_value: 50 },
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ];
}

export async function getSystemHealth(): Promise<{ status: string; checks: any[] }> {
  return {
    status: 'healthy',
    checks: [
      { name: 'Database', status: 'ok', response_time: '5ms' },
      { name: 'Cache', status: 'ok', response_time: '2ms' },
      { name: 'Storage', status: 'ok', response_time: '8ms' }
    ]
  };
}