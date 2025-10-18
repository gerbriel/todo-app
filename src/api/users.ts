import { supabase } from '@/app/supabaseClient';

export interface AppUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: 'admin' | 'user' | 'viewer';
  permissions: Permission[];
  is_active: boolean;
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  last_sign_in_at?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface UserPermissionUpdate {
  user_id: string;
  permissions: string[];
}

export interface UserRoleUpdate {
  user_id: string;
  role: 'admin' | 'user' | 'viewer';
}

// Default permissions
export const DEFAULT_PERMISSIONS: Permission[] = [
  {
    id: 'boards_read',
    name: 'Read Boards',
    description: 'Can view boards',
    resource: 'boards',
    action: 'read'
  },
  {
    id: 'boards_write',
    name: 'Write Boards',
    description: 'Can create and edit boards',
    resource: 'boards',
    action: 'write'
  },
  {
    id: 'boards_delete',
    name: 'Delete Boards',
    description: 'Can delete boards',
    resource: 'boards',
    action: 'delete'
  },
  {
    id: 'cards_read',
    name: 'Read Cards',
    description: 'Can view cards',
    resource: 'cards',
    action: 'read'
  },
  {
    id: 'cards_write',
    name: 'Write Cards',
    description: 'Can create and edit cards',
    resource: 'cards',
    action: 'write'
  },
  {
    id: 'cards_delete',
    name: 'Delete Cards',
    description: 'Can delete cards',
    resource: 'cards',
    action: 'delete'
  },
  {
    id: 'themes_read',
    name: 'Read Themes',
    description: 'Can view themes',
    resource: 'themes',
    action: 'read'
  },
  {
    id: 'themes_write',
    name: 'Write Themes',
    description: 'Can create and edit themes',
    resource: 'themes',
    action: 'write'
  },
  {
    id: 'users_read',
    name: 'Read Users',
    description: 'Can view user information',
    resource: 'users',
    action: 'read'
  },
  {
    id: 'users_write',
    name: 'Manage Users',
    description: 'Can create, edit and manage users',
    resource: 'users',
    action: 'write'
  }
];

// Backwards-compatible alias used in some pages
export const userApi = {
  // small subset of functions (pages expect some of these)
  async getUser(id: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    return data;
  }
};

// Role-based permissions
export const ROLE_PERMISSIONS = {
  admin: [
    'boards_read', 'boards_write', 'boards_delete',
    'cards_read', 'cards_write', 'cards_delete',
    'themes_read', 'themes_write',
    'users_read', 'users_write'
  ],
  user: [
    'boards_read', 'boards_write',
    'cards_read', 'cards_write',
    'themes_read', 'users_read'
  ],
  viewer: [
    'boards_read', 'cards_read', 'themes_read'
  ]
};

export const getAllUsers = async (): Promise<AppUser[]> => {
  try {
    // Check if we have admin permissions by getting current user first
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    // Try to get users from Supabase Auth (requires admin role)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError || !authUsers) {
      console.log('Admin API not available, using current user data');
      // Fallback to current user if admin API isn't available
      return [{
        id: currentUser.id,
        email: currentUser.email || '',
        name: currentUser.user_metadata?.name || 'Current User',
        avatar_url: currentUser.user_metadata?.avatar_url,
        role: 'admin' as const,
        permissions: ROLE_PERMISSIONS.admin.map(permId => 
          DEFAULT_PERMISSIONS.find(p => p.id === permId)!
        ).filter(Boolean),
        is_active: true,
        status: 'active' as const,
        last_login: currentUser.last_sign_in_at,
        last_sign_in_at: currentUser.last_sign_in_at,
        created_at: currentUser.created_at,
        updated_at: currentUser.updated_at || currentUser.created_at,
        metadata: currentUser.user_metadata
      }];
    }

    // Get additional user data from profiles table (if it exists)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*');
    
    return authUsers.users.map(user => {
      const profile = profiles?.find(p => p.id === user.id);
      const role = (profile?.role as 'admin' | 'user' | 'viewer') || 
                  (user.id === currentUser.id ? 'admin' : 'user');
      
      return {
        id: user.id,
        email: user.email || '',
        name: profile?.name || user.user_metadata?.name || 'Unnamed User',
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
        role,
        permissions: ROLE_PERMISSIONS[role].map(permId => 
          DEFAULT_PERMISSIONS.find(p => p.id === permId)!
        ).filter(Boolean),
        is_active: profile?.is_active !== false,
        status: profile?.is_active === false ? 'inactive' : 'active',
        last_login: user.last_sign_in_at,
        last_sign_in_at: user.last_sign_in_at,
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at,
        metadata: user.user_metadata
      };
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Fallback to current user as admin
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        return [{
          id: currentUser.id,
          email: currentUser.email || '',
          name: currentUser.user_metadata?.name || 'Administrator',
          avatar_url: currentUser.user_metadata?.avatar_url,
          role: 'admin' as const,
          permissions: ROLE_PERMISSIONS.admin.map(permId => 
            DEFAULT_PERMISSIONS.find(p => p.id === permId)!
          ).filter(Boolean),
          is_active: true,
          status: 'active' as const,
          last_login: currentUser.last_sign_in_at,
          last_sign_in_at: currentUser.last_sign_in_at,
          created_at: currentUser.created_at,
          updated_at: currentUser.updated_at || currentUser.created_at,
          metadata: currentUser.user_metadata
        }];
      }
    } catch (fallbackError) {
      console.error('Fallback user fetch failed:', fallbackError);
    }
    
    // Final fallback to empty array
    return [];
  }
};

export const getUserById = async (userId: string): Promise<AppUser | null> => {
  try {
    const { data: user, error } = await supabase.auth.admin.getUserById(userId);
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const role = (profile?.role as 'admin' | 'user' | 'viewer') || 'user';

    return {
      id: user.user.id,
      email: user.user.email || '',
      name: profile?.name || user.user.user_metadata?.name,
      avatar_url: profile?.avatar_url || user.user.user_metadata?.avatar_url,
      role,
      permissions: ROLE_PERMISSIONS[role].map(permId => 
        DEFAULT_PERMISSIONS.find(p => p.id === permId)!
      ).filter(Boolean),
      is_active: profile?.is_active !== false,
      status: profile?.is_active === false ? 'inactive' : 'active',
      last_login: user.user.last_sign_in_at,
      last_sign_in_at: user.user.last_sign_in_at,
      created_at: user.user.created_at,
      updated_at: user.user.updated_at || user.user.created_at,
      metadata: user.user.user_metadata
    };
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
};

export const updateUserRole = async (userId: string, role: 'admin' | 'user' | 'viewer'): Promise<void> => {
  try {
    // Update user role in profiles table
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        role: role,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    // Log the activity
    await logUserActivity({
      user_id: userId,
      action: 'role_updated',
      resource_type: 'user',
      resource_id: userId,
      details: `User role updated to ${role}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const updateUserPermissions = async (data: UserPermissionUpdate): Promise<void> => {
  try {
    // Update user permissions in profiles table
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: data.user_id,
        permissions: data.permissions,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    // Log the activity
    await logUserActivity({
      user_id: data.user_id,
      action: 'permissions_updated',
      resource_type: 'user',
      resource_id: data.user_id,
      details: `User permissions updated: ${data.permissions.join(', ')}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    throw error;
  }
};

export const toggleUserStatus = async (userId: string): Promise<void> => {
  try {
    // Get current user status
    const user = await getUserById(userId);
    if (!user) throw new Error('User not found');

    const newStatus = user.is_active ? false : true;

    // Update user status in profiles table
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        is_active: newStatus,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    // Log the activity
    await logUserActivity({
      user_id: userId,
      action: newStatus ? 'user_activated' : 'user_deactivated',
      resource_type: 'user',
      resource_id: userId,
      details: `User ${newStatus ? 'activated' : 'deactivated'}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error;
  }
};

export const getUserActivity = async (userId: string, limit: number = 50): Promise<UserActivity[]> => {
  try {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user activity:', error);
    // Return mock activity data for development
    return [
      {
        id: '1',
        user_id: userId,
        action: 'login',
        resource_type: 'auth',
        details: 'User logged in',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        user_id: userId,
        action: 'card_created',
        resource_type: 'card',
        resource_id: 'card-123',
        details: 'Created new card "Important Task"',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        user_id: userId,
        action: 'board_updated',
        resource_type: 'board',
        resource_id: 'board-456',
        details: 'Updated board "Project Alpha"',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ];
  }
};

export const logUserActivity = async (activity: Omit<UserActivity, 'id'>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_activities')
      .insert([{
        ...activity,
        id: crypto.randomUUID()
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error logging user activity:', error);
    // In development, we might want to just log to console
    console.log('User Activity:', activity);
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;

    // Log the activity (this will be logged by the admin who performed the action)
    await logUserActivity({
      user_id: 'admin', // Replace with actual admin user ID
      action: 'user_deleted',
      resource_type: 'user',
      resource_id: userId,
      details: `User ${userId} was deleted`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Get cards assigned to a user
export const getCardsByUser = async (userId: string) => {
  try {
    // Since we're using localStorage, let's get cards from there
    const boards = JSON.parse(localStorage.getItem('boards') || '[]');
    const userCards = [];
    
    for (const board of boards) {
      if (board.lists) {
        for (const list of board.lists) {
          if (list.cards) {
            for (const card of list.cards) {
              // Check if user is assigned to this card (simplified check)
              if (card.assigned_to === userId || 
                  (card.assigned_members && card.assigned_members.includes(userId))) {
                userCards.push({
                  ...card,
                  board_name: board.name,
                  list_name: list.name
                });
              }
            }
          }
        }
      }
    }

    return userCards;
  } catch (error) {
    console.error('Error fetching user cards:', error);
    return [];
  }
};

// Get boards where user is a member
export const getBoardsByUser = async (userId: string) => {
  try {
    // Since we're using localStorage, get boards from there
    const boards = JSON.parse(localStorage.getItem('boards') || '[]');
    return boards.filter((board: any) => 
      board.owner_id === userId || 
      (board.members && board.members.includes(userId))
    );
  } catch (error) {
    console.error('Error fetching user boards:', error);
    return [];
  }
};

// API object for easier importing
export const usersApi = {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserPermissions,
  toggleUserStatus,
  getUserActivity,
  logUserActivity,
  deleteUser,
  getCardsByUser,
  getBoardsByUser
};