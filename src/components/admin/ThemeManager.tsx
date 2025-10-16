import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Palette, 
  Plus, 
  Edit2, 
  Trash2, 
  Star,
  Eye,
  Download,
  AlertTriangle
} from 'lucide-react'
import { getAllThemes, deleteTheme, setDefaultTheme } from '../../api/themes'
import { useTheme } from '../../contexts/ThemeContext'
import ThemeEditor from './ThemeEditor'
import type { Theme } from '../../api/themes'

interface ThemeCardProps {
  theme: Theme
  onEdit: () => void
  onDelete: () => void
  onPreview: () => void
  onApply: () => void
  onExport: () => void
  isDefault: boolean
}

const ThemeCard: React.FC<ThemeCardProps> = ({
  theme,
  onEdit,
  onDelete,
  onPreview,
  onApply,
  onExport,
  isDefault
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900">{theme.name}</h3>
            {isDefault && (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            )}
          </div>
          <p className="text-sm text-gray-600">{theme.description || 'No description'}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit Theme"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onPreview}
            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
            title="Preview Theme"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onExport}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
            title="Export Theme"
          >
            <Download className="w-4 h-4" />
          </button>
          {!isDefault && (
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete Theme"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Color Preview */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Color Preview</p>
        <div className="flex space-x-1">
          {[
            theme.colors.primary,
            theme.colors.secondary,
            theme.colors.accent,
            theme.colors.success,
            theme.colors.warning,
            theme.colors.error
          ].map((color, index) => (
            <div
              key={index}
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="flex space-x-2">
        {!isDefault && (
          <button
            onClick={onApply}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Set as Default
          </button>
        )}
        <button
          onClick={onPreview}
          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Preview
        </button>
      </div>
    </div>
  )
}

interface ThemeManagerProps {
  onThemeSelect?: (theme: Theme) => void
}

const ThemeManager: React.FC<ThemeManagerProps> = ({ onThemeSelect }) => {
  const { setActiveTheme } = useTheme()
  const queryClient = useQueryClient()
  const [showThemeEditor, setShowThemeEditor] = useState(false)
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null)

  const { data: themes = [], isLoading } = useQuery({
    queryKey: ['themes'],
    queryFn: getAllThemes
  })

  const deleteThemeMutation = useMutation({
    mutationFn: deleteTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] })
    }
  })

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] })
    }
  })

  const handleDeleteTheme = (themeId: string) => {
    if (confirm('Are you sure you want to delete this theme?')) {
      deleteThemeMutation.mutate(themeId)
    }
  }

  const handleApplyTheme = async (theme: Theme) => {
    try {
      await setDefaultMutation.mutateAsync(theme.id)
      await setActiveTheme(theme.id)
      if (onThemeSelect) {
        onThemeSelect(theme)
      }
    } catch (error) {
      console.error('Failed to apply theme:', error)
    }
  }

  const handlePreviewTheme = (theme: Theme) => {
    // Apply theme temporarily for preview
    setActiveTheme(theme.id)
    if (onThemeSelect) {
      onThemeSelect(theme)
    }
  }

  const handleEditTheme = (theme?: Theme) => {
    setEditingTheme(theme || null)
    setShowThemeEditor(true)
  }

  const exportTheme = (theme: Theme) => {
    const exportData = {
      name: theme.name,
      description: theme.description,
      colors: theme.colors,
      typography: theme.typography,
      spacing: theme.spacing,
      borderRadius: theme.borderRadius,
      shadows: theme.shadows
    }
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${theme.name.replace(/\s+/g, '-').toLowerCase()}-theme.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Palette className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Theme Management</h2>
        </div>
        <button
          onClick={() => handleEditTheme()}
          className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Theme</span>
        </button>
      </div>

      {/* Theme Testing Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Theme Testing
        </h3>
        <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
          Test different themes to see how they affect the entire application. Changes apply globally.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => {
              const root = document.documentElement;
              const lightColors = {
                primary: '#3b82f6', secondary: '#6b7280', background: '#ffffff',
                cardBackground: '#f8fafc', text: '#1f2937', textSecondary: '#6b7280',
                border: '#e5e7eb', listBackground: '#f1f5f9', boardBackground: '#f9fafb'
              };
              Object.entries(lightColors).forEach(([key, value]) => {
                root.style.setProperty(`--color-${key}`, value);
              });
              document.body.style.backgroundColor = '#ffffff';
              window.dispatchEvent(new CustomEvent('themeChanged'));
              console.log('Light theme applied via admin panel');
            }}
            className="px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded hover:bg-gray-50 text-sm"
          >
            Light
          </button>
          <button
            onClick={() => {
              const root = document.documentElement;
              const darkColors = {
                primary: '#3b82f6', secondary: '#6b7280', background: '#1f2937',
                cardBackground: '#374151', text: '#f9fafb', textSecondary: '#d1d5db',
                border: '#4b5563', listBackground: '#4b5563', boardBackground: '#1f2937'
              };
              Object.entries(darkColors).forEach(([key, value]) => {
                root.style.setProperty(`--color-${key}`, value);
              });
              document.body.style.backgroundColor = '#1f2937';
              window.dispatchEvent(new CustomEvent('themeChanged'));
              console.log('Dark theme applied via admin panel');
            }}
            className="px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded hover:bg-gray-700 text-sm"
          >
            Dark
          </button>
          <button
            onClick={() => {
              const root = document.documentElement;
              const blueColors = {
                primary: '#1e40af', secondary: '#3b82f6', background: '#eff6ff',
                cardBackground: '#dbeafe', text: '#1e3a8a', textSecondary: '#3730a3',
                border: '#93c5fd', listBackground: '#bfdbfe', boardBackground: '#eff6ff'
              };
              Object.entries(blueColors).forEach(([key, value]) => {
                root.style.setProperty(`--color-${key}`, value);
              });
              document.body.style.backgroundColor = '#eff6ff';
              window.dispatchEvent(new CustomEvent('themeChanged'));
              console.log('Blue theme applied via admin panel');
            }}
            className="px-3 py-2 bg-blue-600 text-white border border-blue-500 rounded hover:bg-blue-700 text-sm"
          >
            Blue
          </button>
          <button
            onClick={() => {
              const root = document.documentElement;
              const greenColors = {
                primary: '#059669', secondary: '#10b981', background: '#f0fdf4',
                cardBackground: '#dcfce7', text: '#064e3b', textSecondary: '#065f46',
                border: '#86efac', listBackground: '#bbf7d0', boardBackground: '#f0fdf4'
              };
              Object.entries(greenColors).forEach(([key, value]) => {
                root.style.setProperty(`--color-${key}`, value);
              });
              document.body.style.backgroundColor = '#f0fdf4';
              window.dispatchEvent(new CustomEvent('themeChanged'));
              console.log('Green theme applied via admin panel');
            }}
            className="px-3 py-2 bg-green-600 text-white border border-green-500 rounded hover:bg-green-700 text-sm"
          >
            Green
          </button>
        </div>
      </div>

      {themes.length === 0 && (
        <div className="text-center py-12">
          <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No themes found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first custom theme.</p>
          <button
            onClick={() => handleEditTheme()}
            className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
          >
            Create Your First Theme
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            onEdit={() => handleEditTheme(theme)}
            onDelete={() => handleDeleteTheme(theme.id)}
            onPreview={() => handlePreviewTheme(theme)}
            onApply={() => handleApplyTheme(theme)}
            onExport={() => exportTheme(theme)}
            isDefault={theme.is_default}
          />
        ))}
      </div>

      {/* Theme Editor Modal */}
      {showThemeEditor && (
        <ThemeEditor
          isOpen={showThemeEditor}
          onClose={() => {
            setShowThemeEditor(false)
            setEditingTheme(null)
          }}
        />
      )}

      {/* Loading States */}
      {(deleteThemeMutation.isPending || setDefaultMutation.isPending) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-900">
              {deleteThemeMutation.isPending ? 'Deleting theme...' : 'Applying theme...'}
            </span>
          </div>
        </div>
      )}

      {/* Error States */}
      {(deleteThemeMutation.isError || setDefaultMutation.isError) && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span>
            {deleteThemeMutation.isError ? 'Failed to delete theme' : 'Failed to apply theme'}
          </span>
        </div>
      )}
    </div>
  )
}

export default ThemeManager