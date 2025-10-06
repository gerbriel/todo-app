import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import type { Label } from '../../types'

interface LabelSelectorProps {
  availableLabels: Label[]
  selectedLabels: Label[]
  onLabelsChange: (labels: Label[]) => void
  onCreateLabel?: (name: string, color: string) => void
  className?: string
}

export function LabelSelector({ 
  availableLabels, 
  selectedLabels, 
  onLabelsChange, 
  onCreateLabel,
  className = '' 
}: LabelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('#3B82F6')

  const predefinedColors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#06B6D4', '#0EA5E9', '#3B82F6',
    '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
    '#F43F5E', '#64748B', '#374151', '#1F2937', '#111827'
  ]

  const toggleLabel = (label: Label) => {
    const isSelected = selectedLabels.some(l => l.id === label.id)
    
    if (isSelected) {
      onLabelsChange(selectedLabels.filter(l => l.id !== label.id))
    } else {
      onLabelsChange([...selectedLabels, label])
    }
  }

  const removeLabel = (labelId: string) => {
    onLabelsChange(selectedLabels.filter(l => l.id !== labelId))
  }

  const handleCreateLabel = async () => {
    if (!newLabelName.trim() || !onCreateLabel) return
    
    try {
      await onCreateLabel(newLabelName.trim(), newLabelColor)
      setNewLabelName('')
      setNewLabelColor('#3B82F6')
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating label:', error)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Selected Labels */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedLabels.map((label) => (
          <span
            key={label.id}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: label.color }}
          >
            {label.name}
            <button
              onClick={() => removeLabel(label.id)}
              className="ml-1 text-white/70 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Add Label Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-3 py-1.5 text-sm border border-gray-600 rounded-md text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Label
        </button>

        {/* Label Dropdown */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-20 max-h-80 overflow-y-auto">
              {/* Create New Label Section */}
              {onCreateLabel && (
                <div className="border-b border-gray-600 p-3">
                  {showCreateForm ? (
                    <div className="space-y-3">
                      <Input
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                        placeholder="Label name"
                        className="text-sm"
                      />
                      
                      {/* Color Picker */}
                      <div>
                        <div className="text-xs text-gray-400 mb-2">Color</div>
                        <div className="grid grid-cols-10 gap-1">
                          {predefinedColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => setNewLabelColor(color)}
                              className={`w-5 h-5 rounded-full border-2 ${
                                newLabelColor === color 
                                  ? 'border-white scale-110' 
                                  : 'border-gray-600 hover:border-gray-400'
                              } transition-all`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCreateLabel}
                          disabled={!newLabelName.trim()}
                          size="sm"
                          className="flex-1"
                        >
                          Create
                        </Button>
                        <Button
                          onClick={() => {
                            setShowCreateForm(false)
                            setNewLabelName('')
                            setNewLabelColor('#3B82F6')
                          }}
                          variant="secondary"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="w-full flex items-center px-2 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create new label
                    </button>
                  )}
                </div>
              )}

              {/* Existing Labels */}
              {availableLabels.length === 0 ? (
                <div className="p-3 text-sm text-gray-400 text-center">
                  {onCreateLabel ? 'No labels yet. Create your first one above!' : 'No labels available'}
                </div>
              ) : (
                availableLabels.map((label) => {
                  const isSelected = selectedLabels.some(l => l.id === label.id)
                  
                  return (
                    <button
                      key={label.id}
                      onClick={() => toggleLabel(label)}
                      className={`w-full flex items-center px-3 py-2 text-sm hover:bg-gray-700 transition-colors ${
                        isSelected ? 'bg-gray-700' : ''
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-white flex-1 text-left">{label.name}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center">
                          <div className="w-2 h-2 rounded bg-white" />
                        </div>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}