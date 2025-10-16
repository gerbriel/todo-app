import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllThemes, setDefaultTheme, defaultTheme } from '../api/themes'
import type { Theme } from '../api/themes'

interface ThemeContextType {
  currentTheme: Theme | null
  setActiveTheme: (themeId: string) => Promise<void>
  isLoading: boolean
  appliedTheme: Theme | null
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [appliedTheme, setAppliedTheme] = useState<Theme | null>(null)

  // Get all themes and find the active one
  const { data: themes = [], isLoading } = useQuery({
    queryKey: ['themes'],
    queryFn: getAllThemes
  })

  const currentTheme = (themes as Theme[]).find(theme => theme.is_default) || (themes as Theme[])[0] || null

  // Apply CSS variables when theme changes or on initial load
  useEffect(() => {
    if (currentTheme) {
      applyThemeToDOM(currentTheme)
      setAppliedTheme(currentTheme)
    } else if (!isLoading && themes.length === 0) {
      // Apply default theme if no themes are available
      const fallbackTheme = {
        ...defaultTheme,
        id: 'default',
        created_by: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      applyThemeToDOM(fallbackTheme)
      setAppliedTheme(fallbackTheme)
    }
  }, [currentTheme, isLoading, themes.length])

  // Apply default theme immediately on mount
  useEffect(() => {
    const fallbackTheme = {
      ...defaultTheme,
      id: 'default',
      created_by: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    applyThemeToDOM(fallbackTheme)
  }, [])

  const setActiveTheme = async (themeId: string) => {
    try {
      await setDefaultTheme(themeId)
      const updatedTheme = (themes as Theme[]).find(t => t.id === themeId)
      if (updatedTheme) {
        applyThemeToDOM(updatedTheme)
        setAppliedTheme(updatedTheme)
      }
    } catch (error) {
      console.error('Failed to set active theme:', error)
    }
  }

  const value: ThemeContextType = {
    currentTheme,
    setActiveTheme,
    isLoading,
    appliedTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Apply theme to DOM using CSS custom properties
function applyThemeToDOM(theme: Theme) {
  const root = document.documentElement

  // Apply colors - direct properties, not nested objects
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value as string)
    })
  }

  // Apply typography
  if (theme.typography) {
    // Apply font family directly
    if (theme.typography.fontFamily) {
      root.style.setProperty('--typography-fontFamily', theme.typography.fontFamily)
      document.body.style.fontFamily = theme.typography.fontFamily
    }
    
    // Apply font sizes
    if (theme.typography.fontSize) {
      Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
        root.style.setProperty(`--typography-fontSize-${key}`, value)
      })
    }
    
    // Apply font weights
    if (theme.typography.fontWeight) {
      Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
        root.style.setProperty(`--typography-fontWeight-${key}`, value)
      })
    }
  }

  // Apply spacing
  if (theme.spacing) {
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value as string)
    })
  }

  // Apply border radius
  if (theme.borderRadius) {
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value as string)
    })
  }

  // Apply shadows
  if (theme.shadows) {
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value as string)
    })
  }

  // Apply theme to body for immediate effect
  document.body.style.backgroundColor = theme.colors.background
  document.body.style.color = theme.colors.text
  document.body.style.fontFamily = theme.typography.fontFamily

  // Force re-render by triggering a style recalculation
  const tempDiv = document.createElement('div')
  tempDiv.style.display = 'none'
  document.body.appendChild(tempDiv)
  document.body.removeChild(tempDiv)

  // Store theme info for debugging
  root.setAttribute('data-theme', theme.name)
  root.setAttribute('data-theme-id', theme.id)

  // Dispatch a custom event to notify components of theme change
  window.dispatchEvent(new CustomEvent('themeChanged', { 
    detail: { theme } 
  }))
}