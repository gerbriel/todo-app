import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { QueryProvider } from './lib/query-client'
import type { User } from './types'
import { AuthPage } from './pages/AuthPage'
import { BoardPage } from './pages/BoardPage'
import { Dashboard } from './pages/Dashboard'
import { DemoPage } from './pages/DemoPage'
import { Layout } from './components/layout/Layout'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user as User || null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user as User || null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    )
  }

  return (
    <QueryProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          {user ? (
            <Layout user={user}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/board/:id" element={<BoardPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          ) : (
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/demo" element={<DemoPage />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          )}
        </div>
      </Router>
    </QueryProvider>
  )
}

export default App
