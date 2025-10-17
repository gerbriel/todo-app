import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Key, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Send,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/app/supabaseClient';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'pending' | 'suspended';
  created_at: string;
  last_sign_in?: string;
  email_confirmed: boolean;
}

const UserManagerEnhanced: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'user' | 'viewer'>('user');
  const [isInviting, setIsInviting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Send invitation email using Supabase Auth
  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      // Supabase will automatically send an invitation email
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail, {
        data: {
          role: inviteRole
        },
        redirectTo: `${window.location.origin}/login`
      });

      if (error) throw error;

      showStatus('success', `Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('user');
      setShowInviteModal(false);
      
      // Reload users list
      loadUsers();
    } catch (error: any) {
      showStatus('error', error.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  // Admin password reset (sends reset email)
  const handlePasswordReset = async (userEmail: string) => {
    if (!confirm(`Send password reset email to ${userEmail}?`)) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      showStatus('success', `Password reset email sent to ${userEmail}`);
    } catch (error: any) {
      showStatus('error', error.message || 'Failed to send password reset email');
    }
  };

  // Load users from Supabase
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;

      const formattedUsers: User[] = (data.users || []).map(u => ({
        id: u.id,
        email: u.email || '',
        role: u.user_metadata?.role || 'user',
        status: u.email_confirmed_at ? 'active' : 'pending',
        created_at: u.created_at,
        last_sign_in: u.last_sign_in_at,
        email_confirmed: !!u.email_confirmed_at
      }));

      setUsers(formattedUsers);
    } catch (error: any) {
      showStatus('error', error.message || 'Failed to load users');
    }
  };

  // Update user role
  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'user' | 'viewer') => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { role: newRole }
      });

      if (error) throw error;

      showStatus('success', `User role updated to ${newRole}`);
      loadUsers();
    } catch (error: any) {
      showStatus('error', error.message || 'Failed to update user role');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Delete user ${userEmail}? This action cannot be undone.`)) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      showStatus('success', `User ${userEmail} deleted`);
      loadUsers();
    } catch (error: any) {
      showStatus('error', error.message || 'Failed to delete user');
    }
  };

  // Resend invitation email
  const handleResendInvitation = async (userEmail: string) => {
    try {
      const { error } = await supabase.auth.admin.inviteUserByEmail(userEmail, {
        redirectTo: `${window.location.origin}/login`
      });

      if (error) throw error;

      showStatus('success', `Invitation resent to ${userEmail}`);
    } catch (error: any) {
      showStatus('error', error.message || 'Failed to resend invitation');
    }
  };

  React.useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage users, send invitations, and reset passwords
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Invite User
        </button>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`mb-6 p-4 rounded-md ${
          statusMessage.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mr-2" />
            )}
            <p className={`text-sm font-medium ${
              statusMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {statusMessage.message}
            </p>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Sign In
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">
                        {user.email_confirmed ? (
                          <span className="inline-flex items-center text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-gray-500">
                            <XCircle className="w-3 h-3 mr-1" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value as any)}
                    className="text-sm border-gray-300 rounded-md"
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : user.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.last_sign_in 
                    ? new Date(user.last_sign_in).toLocaleDateString()
                    : 'Never'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {user.status === 'pending' && (
                      <button
                        onClick={() => handleResendInvitation(user.email)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Resend Invitation"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handlePasswordReset(user.email)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Send Password Reset"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete User"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by inviting a user.</p>
          </div>
        )}
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="viewer">Viewer (Read-only)</option>
                  <option value="user">User (Can edit)</option>
                  <option value="admin">Admin (Full access)</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  An invitation email will be sent to this address with instructions to set up their account.
                </p>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleInviteUser}
                disabled={isInviting || !inviteEmail.trim()}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail className="w-4 h-4 mr-2" />
                {isInviting ? 'Sending...' : 'Send Invitation'}
              </button>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInviteRole('user');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagerEnhanced;
