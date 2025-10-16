import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Palette, 
  Plus, 
  Edit2, 
  Trash2, 
  Star,
  StarOff,
  Eye,
  Download
} from 'lucide-react'
import { getAllThemes, deleteTheme, setDefaultTheme } from '../../api/themes'
import { useTheme } from '../../contexts/ThemeContext'
import ThemeEditor from './ThemeEditor'
import type { Theme } from '../../api/themes'

// Default theme structure for fallbacks
const defaultThemeData = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#10b981',
    background: '#ffffff',
    cardBackground: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#d1d5db',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)'
  }
}

// Theme application function
const applyTheme = (theme: Theme) => {
  console.log('Applying theme:', theme.name)
  // TODO: Connect to ThemeContext when available
}

interface ThemeManagerProps {
  onThemeSelect?: (theme: Theme) => void;
}

const ThemeManager: React.FC<ThemeManagerProps> = ({ onThemeSelect }) => {
  const queryClient = useQueryClient();
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: themes = [], isLoading } = useQuery({
    queryKey: ['themes'],
    queryFn: getAllThemes
  });

  const createThemeMutation = useMutation({
    mutationFn: createTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      setShowCreateModal(false);
    }
  });

  const updateThemeMutation = useMutation({
    mutationFn: updateTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      setEditingTheme(null);
    }
  });

  const deleteThemeMutation = useMutation({
    mutationFn: deleteTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    }
  });

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    }
  });

  const handleCreateTheme = (data: CreateThemeData) => {
    createThemeMutation.mutate(data);
  };

  const handleUpdateTheme = (theme: Theme) => {
    updateThemeMutation.mutate({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      colors: theme.colors,
      typography: theme.typography,
      spacing: theme.spacing,
      borderRadius: theme.borderRadius,
      shadows: theme.shadows
    });
  };

  const handleDeleteTheme = (id: string) => {
    if (confirm('Are you sure you want to delete this theme?')) {
      deleteThemeMutation.mutate(id);
    }
  };

  const handlePreviewTheme = (theme: Theme) => {
    applyTheme(theme);
  };

  const handleApplyTheme = (theme: Theme) => {
    applyTheme(theme);
    setDefaultMutation.mutate(theme.id);
    if (onThemeSelect) {
      onThemeSelect(theme);
    }
  };

  const exportTheme = (theme: Theme) => {
    const dataStr = JSON.stringify(theme, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    link.click();
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeData = JSON.parse(e.target?.result as string);
        createThemeMutation.mutate({
          name: `${themeData.name} (Imported)`,
          description: themeData.description || 'Imported theme',
          colors: themeData.colors,
          typography: themeData.typography,
          spacing: themeData.spacing,
          borderRadius: themeData.borderRadius,
          shadows: themeData.shadows
        });
      } catch (error) {
        alert('Invalid theme file');
      }
    };
    reader.readAsText(file);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Theme Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Customize the appearance of your application</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Upload className="w-4 h-4" />
            Import Theme
            <input
              type="file"
              accept=".json"
              onChange={importTheme}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Theme
          </button>
        </div>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            onEdit={() => setEditingTheme(theme)}
            onDelete={() => handleDeleteTheme(theme.id)}
            onPreview={() => handlePreviewTheme(theme)}
            onApply={() => handleApplyTheme(theme)}
            onExport={() => exportTheme(theme)}
            isDefault={theme.is_default}
          />
        ))}
      </div>

      {/* Create Theme Modal */}
      {showCreateModal && (
        <ThemeEditor
          onSave={handleCreateTheme}
          onCancel={() => setShowCreateModal(false)}
          isCreating={createThemeMutation.isPending}
        />
      )}

      {/* Edit Theme Modal */}
      {editingTheme && (
        <ThemeEditor
          theme={editingTheme}
          onSave={(data) => handleUpdateTheme({ ...editingTheme, ...data })}
          onCancel={() => setEditingTheme(null)}
          isUpdating={updateThemeMutation.isPending}
        />
      )}
    </div>
  );
};

interface ThemeCardProps {
  theme: Theme;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
  onApply: () => void;
  onExport: () => void;
  isDefault: boolean;
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
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">{theme.name}</h3>
            {isDefault && (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            )}
          </div>
          {theme.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{theme.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1 text-gray-500 hover:text-blue-600 rounded"
            title="Edit theme"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onExport}
            className="p-1 text-gray-500 hover:text-green-600 rounded"
            title="Export theme"
          >
            <Download className="w-4 h-4" />
          </button>
          {!isDefault && (
            <button
              onClick={onDelete}
              className="p-1 text-gray-500 hover:text-red-600 rounded"
              title="Delete theme"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Color Preview */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Colors
        </p>
        <div className="flex gap-2">
          <div
            className="w-8 h-8 rounded border-2 border-white shadow-sm"
            style={{ backgroundColor: theme.colors.primary }}
            title="Primary"
          />
          <div
            className="w-8 h-8 rounded border-2 border-white shadow-sm"
            style={{ backgroundColor: theme.colors.secondary }}
            title="Secondary"
          />
          <div
            className="w-8 h-8 rounded border-2 border-white shadow-sm"
            style={{ backgroundColor: theme.colors.accent }}
            title="Accent"
          />
          <div
            className="w-8 h-8 rounded border-2 border-gray-300"
            style={{ backgroundColor: theme.colors.background }}
            title="Background"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onPreview}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
        <button
          onClick={onApply}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <Check className="w-4 h-4" />
          Apply
        </button>
      </div>
    </div>
  );
};

interface ThemeEditorProps {
  theme?: Theme;
  onSave: (data: CreateThemeData) => void;
  onCancel: () => void;
  isCreating?: boolean;
  isUpdating?: boolean;
}

const ThemeEditor: React.FC<ThemeEditorProps> = ({
  theme,
  onSave,
  onCancel,
  isCreating,
  isUpdating
}) => {
  const [formData, setFormData] = useState<CreateThemeData>({
    name: theme?.name || '',
    description: theme?.description || '',
    colors: theme?.colors || defaultThemeData.colors,
    typography: theme?.typography || defaultThemeData.typography,
    spacing: theme?.spacing || defaultThemeData.spacing,
    borderRadius: theme?.borderRadius || defaultThemeData.borderRadius,
    shadows: theme?.shadows || defaultThemeData.shadows
  });

  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'effects'>('colors');

  const updateColors = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value }
    }));
  };

  const updateTypography = (category: string, key: string, value: string) => {
    setFormData(prev => {
      if (category === 'fontFamily') {
        return {
          ...prev,
          typography: { ...prev.typography, fontFamily: value }
        };
      } else if (category === 'fontSize') {
        return {
          ...prev,
          typography: {
            ...prev.typography,
            fontSize: { ...prev.typography.fontSize, [key]: value }
          }
        };
      } else if (category === 'fontWeight') {
        return {
          ...prev,
          typography: {
            ...prev.typography,
            fontWeight: { ...prev.typography.fontWeight, [key]: value }
          }
        };
      }
      return prev;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Edit2 },
    { id: 'spacing', label: 'Spacing', icon: Copy },
    { id: 'effects', label: 'Effects', icon: Star }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {theme ? 'Edit Theme' : 'Create New Theme'}
            </h3>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Basic Info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'colors' && (
              <ColorEditor colors={formData.colors} onChange={updateColors} />
            )}
            {activeTab === 'typography' && (
              <TypographyEditor 
                typography={formData.typography} 
                onChange={updateTypography} 
              />
            )}
            {activeTab === 'spacing' && (
              <SpacingEditor 
                spacing={formData.spacing}
                borderRadius={formData.borderRadius}
                onChange={(category, key, value) => {
                  if (category === 'spacing') {
                    setFormData(prev => ({
                      ...prev,
                      spacing: { ...prev.spacing, [key]: value }
                    }));
                  } else if (category === 'borderRadius') {
                    setFormData(prev => ({
                      ...prev,
                      borderRadius: { ...prev.borderRadius, [key]: value }
                    }));
                  }
                }}
              />
            )}
            {activeTab === 'effects' && (
              <EffectsEditor 
                shadows={formData.shadows}
                onChange={(key, value) => {
                  setFormData(prev => ({
                    ...prev,
                    shadows: { ...prev.shadows, [key]: value }
                  }));
                }}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isCreating || isUpdating ? 'Saving...' : 'Save Theme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sub-components for different editing sections
const ColorEditor: React.FC<{
  colors: Theme['colors'];
  onChange: (key: string, value: string) => void;
}> = ({ colors, onChange }) => {
  const colorFields = [
    { key: 'primary', label: 'Primary', description: 'Main brand color' },
    { key: 'secondary', label: 'Secondary', description: 'Secondary brand color' },
    { key: 'accent', label: 'Accent', description: 'Accent color for highlights' },
    { key: 'background', label: 'Background', description: 'Main background color' },
    { key: 'cardBackground', label: 'Card Background', description: 'Background for cards and panels' },
    { key: 'text', label: 'Text', description: 'Primary text color' },
    { key: 'textSecondary', label: 'Secondary Text', description: 'Secondary text color' },
    { key: 'border', label: 'Border', description: 'Border color' },
    { key: 'success', label: 'Success', description: 'Success state color' },
    { key: 'warning', label: 'Warning', description: 'Warning state color' },
    { key: 'error', label: 'Error', description: 'Error state color' },
    { key: 'info', label: 'Info', description: 'Info state color' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {colorFields.map((field) => (
        <div key={field.key} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {field.label}
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">{field.description}</p>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={colors[field.key as keyof typeof colors]}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
            <input
              type="text"
              value={colors[field.key as keyof typeof colors]}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const TypographyEditor: React.FC<{
  typography: Theme['typography'];
  onChange: (category: string, key: string, value: string) => void;
}> = ({ typography, onChange }) => {
  return (
    <div className="space-y-8">
      {/* Font Family */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Font Family</h4>
        <input
          type="text"
          value={typography.fontFamily}
          onChange={(e) => onChange('fontFamily', '', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Inter, system-ui, sans-serif"
        />
      </div>

      {/* Font Sizes */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Font Sizes</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(typography.fontSize).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {key}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange('fontSize', key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Font Weights */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Font Weights</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(typography.fontWeight).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {key}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange('fontWeight', key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SpacingEditor: React.FC<{
  spacing: Theme['spacing'];
  borderRadius: Theme['borderRadius'];
  onChange: (category: string, key: string, value: string) => void;
}> = ({ spacing, borderRadius, onChange }) => {
  return (
    <div className="space-y-8">
      {/* Spacing */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Spacing</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(spacing).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {key}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange('spacing', key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Border Radius</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(borderRadius).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {key}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange('borderRadius', key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EffectsEditor: React.FC<{
  shadows: Theme['shadows'];
  onChange: (key: string, value: string) => void;
}> = ({ shadows, onChange }) => {
  return (
    <div>
      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Box Shadows</h4>
      <div className="space-y-4">
        {Object.entries(shadows).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {key}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
            />
            <div 
              className="mt-2 w-20 h-20 bg-white border border-gray-200 rounded-lg"
              style={{ boxShadow: value }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeManager;