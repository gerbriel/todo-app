import { useState, useEffect } from 'react'
import { userApi, type AllowedUser, type UserProfile } from '../../api/users'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { Plus, Trash2, Shield, User, Check, X } from 'lucide-react'

export function UserManagement() {
  const [allowedUsers, setAllowedUsers] = useState<AllowedUser[]>([])
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allowed, profiles, current] = await Promise.all([
        userApi.getAllowedUsers(),
        userApi.getAllProfiles(),
        userApi.getCurrentProfile()
      ])
      setAllowedUsers(allowed)
      setUserProfiles(profiles)
      setCurrentUser(current)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUserEmail.trim()) return

    try {
      await userApi.addAllowedUser(newUserEmail.trim(), newUserIsAdmin)
      setNewUserEmail('')
      setNewUserIsAdmin(false)
      setShowAddModal(false)
      loadData()
    } catch (error: any) {
      alert('Error adding user: ' + error.message)
    }
  }

  const handleRemoveUser = async (id: string) => {
    if (!confirm('Are you sure you want to remove this user?')) return

    try {
      await userApi.removeAllowedUser(id)
      loadData()
    } catch (error: any) {
      alert('Error removing user: ' + error.message)
    }
  }

  const handleToggleAdmin = async (email: string, currentIsAdmin: boolean) => {
    try {
      await userApi.updateUserAdminStatus(email, !currentIsAdmin)
      loadData()
    } catch (error: any) {
      alert('Error updating admin status: ' + error.message)
    }
  }

  const handleToggleApproval = async (userId: string, currentIsApproved: boolean) => {
    try {
      await userApi.updateUserApproval(userId, !currentIsApproved)
      loadData()
    } catch (error: any) {
      alert('Error updating approval status: ' + error.message)
    }
  }

  if (!currentUser?.is_admin) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">You don't have permission to manage users.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-100">User Management</h2>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Allowed Users */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-100 mb-4">Allowed Users</h3>
        <div className="space-y-3">
          {allowedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                {user.is_admin ? (
                  <Shield className="w-5 h-5 text-yellow-500" />
                ) : (
                  <User className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-gray-100">{user.email}</span>
                {user.is_admin && (
                  <span className="px-2 py-1 bg-yellow-500 text-black text-xs rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleAdmin(user.email, user.is_admin)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title={user.is_admin ? 'Remove admin' : 'Make admin'}
                >
                  <Shield className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  title="Remove user"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Profiles */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-100 mb-4">Registered Users</h3>
        <div className="space-y-3">
          {userProfiles.map((profile) => (
            <div key={profile.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                {profile.is_admin ? (
                  <Shield className="w-5 h-5 text-yellow-500" />
                ) : (
                  <User className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <span className="text-gray-100">{profile.email}</span>
                  {profile.name && (
                    <span className="text-gray-400 text-sm ml-2">({profile.name})</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  {profile.is_admin && (
                    <span className="px-2 py-1 bg-yellow-500 text-black text-xs rounded-full">
                      Admin
                    </span>
                  )}
                  {profile.is_approved ? (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                      Approved
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      Pending
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleApproval(profile.id, profile.is_approved)}
                  className={`p-2 transition-colors ${
                    profile.is_approved 
                      ? 'text-red-400 hover:text-red-300' 
                      : 'text-green-400 hover:text-green-300'
                  }`}
                  title={profile.is_approved ? 'Disapprove user' : 'Approve user'}
                >
                  {profile.is_approved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
      >
        <div className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            placeholder="user@example.com"
          />
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAdmin"
              checked={newUserIsAdmin}
              onChange={(e) => setNewUserIsAdmin(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isAdmin" className="text-sm text-gray-300">
              Grant admin privileges
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={!newUserEmail.trim()}>
              Add User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}