import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import type { Label } from '../../types'

interface LabelManagerProps {
  isOpen: boolean
  onClose: () => void
  labels: Label[]
  onAddLabel: (name: string, color: string) => void
  onUpdateLabel: (id: string, name: string, color: string) => void
  onDeleteLabel: (id: string) => void
}

interface LabelFormProps {
  label?: Label
  onSave: (name: string, color: string) => void
  onCancel: () => void
}

function LabelForm({ label, onSave, onCancel }: LabelFormProps) {
  const [name, setName] = useState(label?.name || '')
  const [color, setColor] = useState(label?.color || '#3B82F6')

  const predefinedColors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#06B6D4', '#0EA5E9', '#3B82F6',
    '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
    '#F43F5E', '#64748B', '#374151', '#1F2937', '#111827'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSave(name.trim(), color)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Label Name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter label name"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Color
        </label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded border border-gray-600 bg-gray-700"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
          
          <div className="grid grid-cols-10 gap-2">
            {predefinedColors.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onClick={() => setColor(presetColor)}
                className={`w-6 h-6 rounded border-2 ${
                  color === presetColor ? 'border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: presetColor }}
                title={presetColor}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button type="submit" variant="primary">
          {label ? 'Update' : 'Create'} Label
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function LabelManager({ isOpen, onClose, labels, onAddLabel, onUpdateLabel, onDeleteLabel }: LabelManagerProps) {
  const [editingLabel, setEditingLabel] = useState<Label | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleAddLabel = (name: string, color: string) => {
    onAddLabel(name, color)
    setShowForm(false)
  }

  const handleUpdateLabel = (name: string, color: string) => {
    if (editingLabel) {
      onUpdateLabel(editingLabel.id, name, color)
      setEditingLabel(null)
    }
  }

  const handleDeleteLabel = (label: Label) => {
    if (confirm(`Are you sure you want to delete the label "${label.name}"?`)) {
      onDeleteLabel(label.id)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Labels">
      <div className="space-y-4">
        {/* Add Label Button */}
        {!showForm && !editingLabel && (
          <Button
            onClick={() => setShowForm(true)}
            variant="primary"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Label
          </Button>
        )}

        {/* Add Label Form */}
        {showForm && !editingLabel && (
          <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
            <h3 className="text-lg font-medium text-white mb-4">Create New Label</h3>
            <LabelForm
              onSave={handleAddLabel}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Edit Label Form */}
        {editingLabel && (
          <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
            <h3 className="text-lg font-medium text-white mb-4">Edit Label</h3>
            <LabelForm
              label={editingLabel}
              onSave={handleUpdateLabel}
              onCancel={() => setEditingLabel(null)}
            />
          </div>
        )}

        {/* Labels List */}
        {labels.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">Existing Labels</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {labels.map((label) => (
                <div
                  key={label.id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-600"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="text-white font-medium">{label.name}</span>
                    <span className="text-xs text-gray-400">{label.color}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingLabel(label)}
                      className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Edit label"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLabel(label)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete label"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {labels.length === 0 && !showForm && !editingLabel && (
          <div className="text-center py-8 text-gray-400">
            <p>No labels created yet.</p>
            <p className="text-sm">Click "Add New Label" to create your first label.</p>
          </div>
        )}
      </div>
    </Modal>
  )
}