import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Palette, 
  Download, 
  Upload, 
  Save, 
  RotateCcw, 
  Eye,
  EyeOff,
  Type,
  Layout
} from 'lucide-react'
import { getAllThemes, createTheme, updateTheme, defaultTheme } from '@/api/themes'
import { useTheme } from '@/contexts/ThemeContext'
import type { Theme, CreateThemeData } from '@/api/themes'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  description?: string
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, description }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}

interface ThemeEditorProps {
  isOpen: boolean
  onClose: () => void
}

const ThemeEditor: React.FC<ThemeEditorProps> = ({ isOpen, onClose }) => {
  const { currentTheme, setActiveTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'preview'>('colors')
  const [editingTheme, setEditingTheme] = useState<CreateThemeData | null>(null)
  const [themeName, setThemeName] = useState('')
  const [themeDescription, setThemeDescription] = useState('')
  const [previewMode, setPreviewMode] = useState(true) // Enable preview by default
  const [originalTheme, setOriginalTheme] = useState<CreateThemeData | null>(null) // Store original for restore

  const queryClient = useQueryClient()

  // Get all themes
  useQuery({
    queryKey: ['themes'],
    queryFn: getAllThemes
  })

  // Mutations
  const createThemeMutation = useMutation({
    mutationFn: createTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] })
    }
  })

  const updateThemeMutation = useMutation({
    mutationFn: updateTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] })
    }
  })

  // Initialize editing theme
  useEffect(() => {
    if (currentTheme && !editingTheme) {
      const themeData = {
        name: currentTheme.name,
        description: currentTheme.description || '',
        colors: { ...currentTheme.colors },
        typography: { ...currentTheme.typography },
        spacing: { ...currentTheme.spacing },
        borderRadius: { ...currentTheme.borderRadius },
        shadows: { ...currentTheme.shadows }
      }
      setEditingTheme(themeData)
      setOriginalTheme(themeData) // Save original for restore
      setThemeName(currentTheme.name)
      setThemeDescription(currentTheme.description || '')
    } else if (!currentTheme && !editingTheme) {
      // Use default theme as base
      const defaultData = {
        name: 'New Theme',
        description: 'Custom theme',
        colors: { ...defaultTheme.colors },
        typography: { ...defaultTheme.typography },
        spacing: { ...defaultTheme.spacing },
        borderRadius: { ...defaultTheme.borderRadius },
        shadows: { ...defaultTheme.shadows }
      }
      setEditingTheme(defaultData)
      setOriginalTheme(defaultData)
      setThemeName('New Theme')
      setThemeDescription('Custom theme')
    }
  }, [currentTheme, editingTheme])

  // Live preview effect - apply theme changes in real-time
  useEffect(() => {
    if (previewMode && editingTheme && isOpen) {
      // Apply CSS variables for live preview
      const root = document.documentElement
      Object.entries(editingTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value)
      })
    }
  }, [editingTheme, previewMode, isOpen])

  // Cleanup: restore original theme when closing without saving
  useEffect(() => {
    return () => {
      if (!isOpen && originalTheme) {
        const root = document.documentElement
        Object.entries(originalTheme.colors).forEach(([key, value]) => {
          root.style.setProperty(`--color-${key}`, value)
        })
      }
    }
  }, [isOpen, originalTheme])

  const handleColorChange = (colorKey: keyof Theme['colors'], value: string) => {
    if (editingTheme) {
      const newTheme = {
        ...editingTheme,
        colors: {
          ...editingTheme.colors,
          [colorKey]: value
        }
      }
      setEditingTheme(newTheme)
      
      // Instant live preview
      if (previewMode) {
        document.documentElement.style.setProperty(`--color-${colorKey}`, value)
      }
    }
  }

  const handleSaveTheme = async () => {
    if (!editingTheme) return

    try {
      const themeData = {
        ...editingTheme,
        name: themeName,
        description: themeDescription
      }

      if (currentTheme?.id) {
        await updateThemeMutation.mutateAsync({
          id: currentTheme.id,
          ...themeData
        })
      } else {
        const newTheme = await createThemeMutation.mutateAsync(themeData)
        if (newTheme?.id) {
          await setActiveTheme(newTheme.id)
        }
      }
      onClose()
    } catch (error) {
      console.error('Failed to save theme:', error)
    }
  }

  const handleResetToDefault = () => {
    setEditingTheme({
      name: 'Default Reset',
      description: 'Reset to default theme',
      colors: { ...defaultTheme.colors },
      typography: { ...defaultTheme.typography },
      spacing: { ...defaultTheme.spacing },
      borderRadius: { ...defaultTheme.borderRadius },
      shadows: { ...defaultTheme.shadows }
    })
    setThemeName('Default Reset')
    setThemeDescription('Reset to default theme')
  }

  const handleExportTheme = () => {
    if (editingTheme) {
      const dataStr = JSON.stringify(editingTheme, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${themeName.replace(/\s+/g, '-').toLowerCase()}-theme.json`
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string)
          setEditingTheme(imported)
          setThemeName(imported.name || 'Imported Theme')
          setThemeDescription(imported.description || 'Imported custom theme')
        } catch (error) {
          console.error('Failed to import theme:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  if (!isOpen || !editingTheme) return null

  const colorSections = [
    {
      title: 'Base Colors',
      colors: [
        { key: 'primary', label: 'Primary', description: 'Main brand color' },
        { key: 'secondary', label: 'Secondary', description: 'Secondary brand color' },
        { key: 'accent', label: 'Accent', description: 'Accent highlight color' },
        { key: 'background', label: 'Background', description: 'Main background color' },
        { key: 'cardBackground', label: 'Card Background', description: 'Background for cards' },
        { key: 'listBackground', label: 'List Background', description: 'Background for lists' }
      ]
    },
    {
      title: 'Text Colors',
      colors: [
        { key: 'text', label: 'Primary Text', description: 'Main text color' },
        { key: 'textSecondary', label: 'Secondary Text', description: 'Secondary text color' },
        { key: 'textMuted', label: 'Muted Text', description: 'Muted/disabled text' },
        { key: 'textInverted', label: 'Inverted Text', description: 'Text on dark backgrounds' },
        { key: 'cardText', label: 'Card Text', description: 'Text color in cards' },
        { key: 'cardTitle', label: 'Card Title', description: 'Title text in cards' },
        { key: 'cardSubtitle', label: 'Card Subtitle', description: 'Subtitle text in cards' },
        { key: 'listText', label: 'List Text', description: 'Text color in lists' },
        { key: 'listTitle', label: 'List Title', description: 'Title text in lists' },
        { key: 'boardText', label: 'Board Text', description: 'Text color on boards' },
        { key: 'boardTitle', label: 'Board Title', description: 'Title text on boards' },
        { key: 'navText', label: 'Navigation Text', description: 'Text in navigation' }
      ]
    },
    {
      title: 'Border Colors',
      colors: [
        { key: 'border', label: 'Border', description: 'Default border color' },
        { key: 'borderLight', label: 'Light Border', description: 'Light border variant' },
        { key: 'borderDark', label: 'Dark Border', description: 'Dark border variant' },
        { key: 'cardBorder', label: 'Card Border', description: 'Border color for cards' },
        { key: 'listBorder', label: 'List Border', description: 'Border color for lists' }
      ]
    },
    {
      title: 'State Colors',
      colors: [
        { key: 'success', label: 'Success', description: 'Success state color' },
        { key: 'warning', label: 'Warning', description: 'Warning state color' },
        { key: 'error', label: 'Error', description: 'Error state color' },
        { key: 'info', label: 'Info', description: 'Information state color' },
        { key: 'hover', label: 'Hover', description: 'Hover state color' },
        { key: 'focus', label: 'Focus', description: 'Focus state color' },
        { key: 'disabled', label: 'Disabled', description: 'Disabled state color' }
      ]
    },
    {
      title: 'Button Colors',
      colors: [
        { key: 'buttonPrimary', label: 'Primary Button', description: 'Primary button background' },
        { key: 'buttonPrimaryText', label: 'Primary Button Text', description: 'Primary button text' },
        { key: 'buttonSecondary', label: 'Secondary Button', description: 'Secondary button background' },
        { key: 'buttonSecondaryText', label: 'Secondary Button Text', description: 'Secondary button text' },
        { key: 'buttonDanger', label: 'Danger Button', description: 'Danger button background' },
        { key: 'buttonDangerText', label: 'Danger Button Text', description: 'Danger button text' }
      ]
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Palette className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Theme Editor</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-3 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                  previewMode 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={previewMode ? 'Disable live preview' : 'Enable live preview'}
              >
                {previewMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                <span className="text-sm font-medium">
                  {previewMode ? 'Preview On' : 'Preview Off'}
                </span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTheme}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Theme</span>
              </button>
            </div>
          </div>

          {/* Theme Name and Description */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme Name</label>
              <input
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter theme name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={themeDescription}
                onChange={(e) => setThemeDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter theme description"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'colors', label: 'Colors', icon: Palette },
              { id: 'typography', label: 'Typography', icon: Type },
              { id: 'spacing', label: 'Spacing', icon: Layout },
              { id: 'preview', label: 'Preview', icon: Eye }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'colors' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Color Customization</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleResetToDefault}
                    className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset to Default</span>
                  </button>
                  <button
                    onClick={handleExportTheme}
                    className="px-3 py-2 text-sm text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <label className="px-3 py-2 text-sm text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors flex items-center space-x-1 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Import</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportTheme}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {colorSections.map(section => (
                <div key={section.title} className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">{section.title}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.colors.map(({ key, label, description }) => (
                      <ColorPicker
                        key={key}
                        label={label}
                        value={editingTheme.colors[key as keyof Theme['colors']]}
                        onChange={(value) => handleColorChange(key as keyof Theme['colors'], value)}
                        description={description}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Theme Preview</h3>
              <div className="bg-gray-100 rounded-lg p-6">
                <div className="space-y-4">
                  {/* Sample Card */}
                  <div 
                    className="rounded-lg p-4 border"
                    style={{
                      backgroundColor: editingTheme.colors.cardBackground,
                      color: editingTheme.colors.cardText,
                      borderColor: editingTheme.colors.cardBorder
                    }}
                  >
                    <h4 style={{ color: editingTheme.colors.cardTitle }} className="font-semibold mb-2">
                      Sample Card Title
                    </h4>
                    <p style={{ color: editingTheme.colors.cardSubtitle }} className="text-sm mb-3">
                      This is a sample card subtitle
                    </p>
                    <p style={{ color: editingTheme.colors.cardText }}>
                      This is the main card text content. It demonstrates how your theme will look in practice.
                    </p>
                    <div className="flex space-x-2 mt-4">
                      <button
                        style={{
                          backgroundColor: editingTheme.colors.buttonPrimary,
                          color: editingTheme.colors.buttonPrimaryText
                        }}
                        className="px-3 py-1 rounded text-sm"
                      >
                        Primary Button
                      </button>
                      <button
                        style={{
                          backgroundColor: editingTheme.colors.buttonSecondary,
                          color: editingTheme.colors.buttonSecondaryText
                        }}
                        className="px-3 py-1 rounded text-sm"
                      >
                        Secondary Button
                      </button>
                    </div>
                  </div>

                  {/* Sample List */}
                  <div 
                    className="rounded-lg p-4 border"
                    style={{
                      backgroundColor: editingTheme.colors.listBackground,
                      borderColor: editingTheme.colors.listBorder
                    }}
                  >
                    <h4 style={{ color: editingTheme.colors.listTitle }} className="font-semibold mb-2">
                      Sample List
                    </h4>
                    <ul className="space-y-2">
                      <li style={{ color: editingTheme.colors.listText }}>First list item</li>
                      <li style={{ color: editingTheme.colors.listText }}>Second list item</li>
                      <li style={{ color: editingTheme.colors.listText }}>Third list item</li>
                    </ul>
                  </div>

                  {/* Sample Input */}
                  <input
                    type="text"
                    placeholder="Sample input field"
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      backgroundColor: editingTheme.colors.background,
                      color: editingTheme.colors.text,
                      borderColor: editingTheme.colors.border
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ThemeEditor