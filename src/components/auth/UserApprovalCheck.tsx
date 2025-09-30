import { useState, useEffect } from 'react'
import { userApi } from '../../api/users'
import { signOut } from '../../lib/supabase'

interface UserApprovalCheckProps {
  user: any
  children: React.ReactNode
}

export function UserApprovalCheck({ user, children }: UserApprovalCheckProps) {
  const [isApproved, setIsApproved] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkApproval = async () => {
      try {
        const approved = await userApi.isUserApproved()
        setIsApproved(approved)
      } catch (error) {
        console.error('Error checking user approval:', error)
        setIsApproved(false)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      checkApproval()
    } else {
      setLoading(false)
      setIsApproved(false)
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    )
  }

  if (!isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-6 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.73 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-100">Account Pending Approval</h1>
            <p className="text-gray-400 mt-2">
              Your account has been created but is waiting for administrator approval.
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Email: {user?.email}
            </p>
            <p className="text-sm text-gray-400">
              Please contact the administrator to approve your account access.
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Refresh Status
            </button>
            
            <button
              onClick={async () => {
                await signOut()
                window.location.reload()
              }}
              className="w-full text-gray-400 hover:text-gray-300 py-2 px-4 rounded-lg transition-colors border border-gray-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}