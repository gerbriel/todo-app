import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { signIn, signUp } from '../lib/supabase'

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-100">
            Project Manager
          </h1>
          <p className="text-gray-400 mt-2">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />

          {error && (
            <div className="text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary-400 hover:text-primary-300 text-sm block w-full"
            disabled={loading}
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
          
          <button
            type="button"
            onClick={() => window.location.href = '/demo'}
            className="text-gray-400 hover:text-gray-300 text-sm block w-full border border-gray-600 rounded-lg py-2"
            disabled={loading}
          >
            🚀 View Demo (No Account Required)
          </button>
        </div>
      </div>
    </div>
  )
}