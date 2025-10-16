import { useState, useEffect, useRef } from 'react';
import { ChevronDown, User, X } from 'lucide-react';
import { supabase } from '@/app/supabaseClient';

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    name?: string;
  };
  created_at: string;
}

interface UserDropdownProps {
  selectedUsers?: Array<{
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  }>;
  onUsersChange: (users: Array<{
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  }>) => void;
  placeholder?: string;
  maxUsers?: number;
  compact?: boolean;
}

export default function UserDropdown({
  selectedUsers = [],
  onUsersChange,
  placeholder = "Select users...",
  maxUsers = 10,
  compact = false
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<SupabaseUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // For this demo app, we'll use a simple user management system
        // In production, you'd fetch from your user management system
        
        // Try to get authenticated user info if available
        const { data: { user } } = await supabase.auth.getUser();
        
        let mockUsers: SupabaseUser[] = [
          {
            id: 'user-1',
            email: 'john.doe@example.com',
            user_metadata: { full_name: 'John Doe', avatar_url: '' },
            created_at: new Date().toISOString()
          },
          {
            id: 'user-2', 
            email: 'jane.smith@example.com',
            user_metadata: { full_name: 'Jane Smith', avatar_url: '' },
            created_at: new Date().toISOString()
          },
          {
            id: 'user-3',
            email: 'mike.wilson@example.com', 
            user_metadata: { full_name: 'Mike Wilson', avatar_url: '' },
            created_at: new Date().toISOString()
          },
          {
            id: 'user-4',
            email: 'sarah.brown@example.com',
            user_metadata: { full_name: 'Sarah Brown', avatar_url: '' },
            created_at: new Date().toISOString()
          },
          {
            id: 'user-5',
            email: 'david.clark@example.com',
            user_metadata: { full_name: 'David Clark', avatar_url: '' },
            created_at: new Date().toISOString()
          }
        ];
        
        // If user is authenticated, add them to the list
        if (user) {
          const existingUserIndex = mockUsers.findIndex(u => u.id === user.id);
          if (existingUserIndex === -1) {
            mockUsers.unshift({
              id: user.id,
              email: user.email || '',
              user_metadata: { 
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Current User',
                avatar_url: user.user_metadata?.avatar_url || ''
              },
              created_at: user.created_at || new Date().toISOString()
            });
          }
        }
        
        setAllUsers(mockUsers);
      } catch (err) {
        console.error('Error in user management:', err);
        setError('Failed to load users');
        // Fall back to basic mock users
        setAllUsers([
          {
            id: 'user-1',
            email: 'john.doe@example.com',
            user_metadata: { full_name: 'John Doe', avatar_url: '' },
            created_at: new Date().toISOString()
          },
          {
            id: 'user-2', 
            email: 'jane.smith@example.com',
            user_metadata: { full_name: 'Jane Smith', avatar_url: '' },
            created_at: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Filter users based on search term
  const filteredUsers = allUsers.filter(user => {
    const name = user.user_metadata?.full_name || user.user_metadata?.name || '';
    const email = user.email || '';
    const searchLower = searchTerm.toLowerCase();
    
    return (
      name.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower)
    );
  });

  // Check if user is already selected
  const isUserSelected = (userId: string) => {
    return selectedUsers.some(user => user.id === userId);
  };

  // Add user to selection
  const handleUserSelect = (user: SupabaseUser) => {
    if (isUserSelected(user.id) || selectedUsers.length >= maxUsers) return;

    const newUser = {
      id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown User',
      email: user.email,
      avatar: user.user_metadata?.avatar_url
    };

    onUsersChange([...selectedUsers, newUser]);
    setSearchTerm('');
    if (!compact) setIsOpen(false);
  };

  // Remove user from selection
  const handleUserRemove = (userId: string) => {
    onUsersChange(selectedUsers.filter(user => user.id !== userId));
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Selected Users Display */}
      {selectedUsers.length > 0 && (
        <div className={`flex flex-wrap gap-1 mb-2 ${compact ? 'max-w-32' : ''}`}>
          {selectedUsers.map((user) => (
            <div
              key={user.id}
              className={`flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs ${
                compact ? 'max-w-20' : ''
              }`}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-4 h-4 rounded-full"
                />
              ) : (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                  {getUserInitials(user.name)}
                </div>
              )}
              <span className={`truncate ${compact ? 'max-w-12' : ''}`}>
                {compact ? user.name.split(' ')[0] : user.name}
              </span>
              <button
                onClick={() => handleUserRemove(user.id)}
                className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown Trigger */}
      <div
        className={`flex items-center justify-between p-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700 ${
          compact ? 'text-xs' : 'text-sm'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 flex-1">
          <User className={`text-gray-400 ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedUsers.length === 0 ? placeholder : "Add more users..."}
            className={`flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 ${
              compact ? 'text-xs' : 'text-sm'
            }`}
          />
        </div>
        <ChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''} ${
          compact ? 'w-3 h-3' : 'w-4 h-4'
        }`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto ${
          compact ? 'text-xs' : 'text-sm'
        }`}>
          {loading && (
            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
              Loading users...
            </div>
          )}

          {error && (
            <div className="p-3 text-center text-red-500">
              {error}
            </div>
          )}

          {!loading && !error && filteredUsers.length === 0 && (
            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No users found' : 'No users available'}
            </div>
          )}

          {!loading && !error && filteredUsers.map((user) => {
            const isSelected = isUserSelected(user.id);
            const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown User';
            
            return (
              <div
                key={user.id}
                className={`flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer ${
                  isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'
                }`}
                onClick={() => handleUserSelect(user)}
              >
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={userName}
                    className={`rounded-full ${compact ? 'w-6 h-6' : 'w-8 h-8'}`}
                  />
                ) : (
                  <div className={`bg-gray-500 rounded-full flex items-center justify-center text-white font-medium ${
                    compact ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
                  }`}>
                    {getUserInitials(userName)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                    {userName}
                  </div>
                  {user.email && (
                    <div className={`text-gray-500 dark:text-gray-400 truncate ${compact ? 'text-xs' : 'text-xs'}`}>
                      {user.email}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <div className="text-blue-500">
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}