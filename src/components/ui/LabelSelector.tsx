import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { Label } from '../../types'

interface LabelSelectorProps {
  availableLabels: Label[]
  selectedLabels: Label[]
  onLabelsChange: (labels: Label[]) => void
  className?: string
}

export function LabelSelector({ availableLabels, selectedLabels, onLabelsChange, className = '' }: LabelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

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
            <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-20 max-h-64 overflow-y-auto">
              {availableLabels.length === 0 ? (
                <div className="p-3 text-sm text-gray-400 text-center">
                  No labels available
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