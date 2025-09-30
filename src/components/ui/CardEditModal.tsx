import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { Textarea } from './Textarea'
import { LabelSelector } from './LabelSelector'
import { Calendar, Flag } from 'lucide-react'
import type { Card, Label } from '../../types'

interface CardEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (cardData: Partial<Card>) => void
  card: Card
  availableLabels?: Label[]
}

export function CardEditModal({
  isOpen,
  onClose,
  onSave,
  card,
  availableLabels = []
}: CardEditModalProps) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [status, setStatus] = useState(card.status || 'not-started')
  const [priority, setPriority] = useState(card.priority || 'medium')
  const [dateStart, setDateStart] = useState(card.date_start ? card.date_start.split('T')[0] : '')
  const [dateEnd, setDateEnd] = useState(card.date_end ? card.date_end.split('T')[0] : '')
  const [selectedLabels, setSelectedLabels] = useState<Label[]>(card.labels || [])

  const handleSave = () => {
    if (title.trim()) {
      onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        status: status as Card['status'],
        priority: priority as Card['priority'],
        date_start: dateStart ? new Date(dateStart).toISOString() : undefined,
        date_end: dateEnd ? new Date(dateEnd).toISOString() : undefined,
        labels: selectedLabels,
        updated_at: new Date().toISOString()
      })
      onClose()
    }
  }

  const handleClose = () => {
    setTitle(card.title)
    setDescription(card.description || '')
    setStatus(card.status || 'not-started')
    setPriority(card.priority || 'medium')
    setDateStart(card.date_start ? card.date_start.split('T')[0] : '')
    setDateEnd(card.date_end ? card.date_end.split('T')[0] : '')
    setSelectedLabels(card.labels || [])
    onClose()
  }

  const statusOptions = [
    { value: 'not-started', label: 'Not Started', color: 'bg-gray-500' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
    { value: 'completed', label: 'Completed', color: 'bg-green-500' },
    { value: 'blocked', label: 'Blocked', color: 'bg-red-500' },
    { value: 'on-hold', label: 'On Hold', color: 'bg-yellow-500' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500' }
  ]

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Card">
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Card Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter card description"
              rows={3}
            />
          </div>
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Flag className="w-4 h-4 mr-1" />
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as NonNullable<Card['status']>)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Flag className="w-4 h-4 mr-1" />
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as NonNullable<Card['priority']>)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Dates
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Labels
          </label>
          <LabelSelector
            availableLabels={availableLabels}
            selectedLabels={selectedLabels}
            onLabelsChange={setSelectedLabels}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  )
}