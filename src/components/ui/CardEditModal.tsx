import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { Textarea } from './Textarea'
import { LabelSelector } from './LabelSelector'
import { CustomFieldInput } from './CustomFieldInput'
import { TimeTracker } from './TimeTracker'
import { Calendar, Flag, Settings, Clock } from 'lucide-react'
import { customFieldsApi } from '../../api/customFields'
import type { Card, Label } from '../../types'

interface CardEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (cardData: Partial<Card>) => void
  card: Card
  availableLabels?: Label[]
  onCreateLabel?: (name: string, color: string) => void
  workspaceId: string
}

export function CardEditModal({
  isOpen,
  onClose,
  onSave,
  card,
  availableLabels = [],
  onCreateLabel,
  workspaceId
}: CardEditModalProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [status, setStatus] = useState(card.status || 'not-started')
  const [priority, setPriority] = useState(card.priority || 'medium')
  const [dateStart, setDateStart] = useState(card.date_start ? card.date_start.split('T')[0] : '')
  const [dateEnd, setDateEnd] = useState(card.date_end ? card.date_end.split('T')[0] : '')
  const [selectedLabels, setSelectedLabels] = useState<Label[]>(card.labels || [])
  // Re-enable custom fields state
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | string[]>>({})

  // Load custom fields for workspace - Test with enabled query first
  const { data: customFields = [], error: customFieldsError } = useQuery({
    queryKey: ['customFields', workspaceId],
    queryFn: () => customFieldsApi.getCustomFields(workspaceId),
    enabled: isOpen && !!workspaceId,
    retry: false // Don't retry if table doesn't exist
  })

  // Load existing custom field values for this card - TEMPORARILY DISABLED
  const { data: existingValues = [], error: valuesError } = useQuery({
    queryKey: ['customFieldValues_v3', card.id], // Changed key again
    queryFn: () => customFieldsApi.getCustomFieldValues(card.id),
    enabled: false, // Completely disable this query for debugging
    retry: false // Don't retry if table doesn't exist
  })

  // Log errors for debugging
  if (customFieldsError) {
    console.log('Custom fields table not ready yet:', customFieldsError)
  }
  if (valuesError) {
    console.log('Custom field values table not ready yet:', valuesError)
  }

  // Initialize custom field values when data loads - re-enabled
  useEffect(() => {
    if (existingValues.length > 0) {
      const initialValues: Record<string, string | string[]> = {}
      existingValues.forEach(value => {
        if (value.custom_field_id && value.value) {
          // Parse array values for multi-select fields
          try {
            const parsed = JSON.parse(value.value as string)
            initialValues[value.custom_field_id] = Array.isArray(parsed) ? parsed : value.value
          } catch {
            initialValues[value.custom_field_id] = value.value
          }
        }
      })
      setCustomFieldValues(initialValues)
    }
  }, [existingValues.length, card.id])

  // Mutation for saving custom field values
  const saveCustomFieldMutation = useMutation({
    mutationFn: async (values: Record<string, string | string[]>) => {
      const promises = Object.entries(values).map(([fieldId, value]) => {
        if (value !== undefined && value !== '') {
          return customFieldsApi.setCustomFieldValue(card.id, fieldId, value)
        }
        return Promise.resolve()
      })
      return Promise.all(promises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFieldValues', card.id] })
    }
  })

  const handleSave = async () => {
    if (title.trim()) {
      const cardData = {
        title: title.trim(),
        // Convert date inputs (yyyy-MM-dd) to ISO strings or null
        date_start: dateStart ? new Date(dateStart).toISOString() : undefined,
        date_end: dateEnd ? new Date(dateEnd).toISOString() : undefined,
      }
      
      console.log('🟢 SIMPLE MODAL: Regular modal saving simple card data:', cardData)
      console.log('🟢 SIMPLE MODAL: CardEditModal.tsx is being used (NOT Enhanced)')
      
      // Save card data first (basic test)
      onSave(cardData)
      
      // Save custom field values - re-enabled
      if (Object.keys(customFieldValues).length > 0) {
        try {
          await saveCustomFieldMutation.mutateAsync(customFieldValues)
        } catch (error) {
          console.error('Error saving custom field values:', error)
        }
      }
    }
  }

  // Custom field change handler - re-enabled
  const handleCustomFieldChange = (fieldId: string, value: string | string[]) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleClose = () => {
    // Temporarily disable auto-save to prevent closing issues
    // Auto-save before closing if there are changes
    /*
    const hasChanges = title !== card.title || 
                      description !== (card.description || '') ||
                      // status !== (card.status || 'not-started') ||
                      // priority !== (card.priority || 'medium') ||
                      dateStart !== (card.date_start ? card.date_start.split('T')[0] : '') ||
                      dateEnd !== (card.date_end ? card.date_end.split('T')[0] : '') ||
                      JSON.stringify(selectedLabels) !== JSON.stringify(card.labels || [])
    
    if (hasChanges && title.trim()) {
      handleSave()
    } else {
    */
      // Reset form if no changes or no title
      setTitle(card.title)
      setDescription(card.description || '')
      setStatus(card.status || 'not-started')
      setPriority(card.priority || 'medium')
      setDateStart(card.date_start ? card.date_start.split('T')[0] : '')
      setDateEnd(card.date_end ? card.date_end.split('T')[0] : '')
      setSelectedLabels(card.labels || [])
      onClose()
    // }
  }

  // Temporarily disable auto-save on data changes
  /*
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const hasChanges = title !== card.title || 
                        description !== (card.description || '') ||
                        // status !== (card.status || 'not-started') ||
                        // priority !== (card.priority || 'medium') ||
                        dateStart !== (card.date_start ? card.date_start.split('T')[0] : '') ||
                        dateEnd !== (card.date_end ? card.date_end.split('T')[0] : '') ||
                        JSON.stringify(selectedLabels) !== JSON.stringify(card.labels || [])
      
      if (hasChanges && title.trim()) {
        handleSave()
      }
    }, 2000) // Auto-save after 2 seconds of no changes

    return () => clearTimeout(timeoutId)
  }, [title, description, status, priority, dateStart, dateEnd, selectedLabels])
  */

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
            onCreateLabel={onCreateLabel}
          />
        </div>

        {/* Custom Fields - Re-enabled for testing */}
        {customFields.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <Settings className="w-4 h-4 mr-1" />
              Custom Fields ({customFields.length})
            </h3>
            <div className="space-y-3">
              {customFields.map((field) => {
                const existingValue = existingValues.find(v => v.custom_field_id === field.id)
                return (
                  <CustomFieldInput
                    key={field.id}
                    field={field}
                    value={existingValue}
                    onChange={(value) => handleCustomFieldChange(field.id, value)}
                  />
                )
              })}
            </div>
          </div>
        )}
        
        {/* Show message when no custom fields but queries are working */}
        {customFields.length === 0 && !customFieldsError && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <Settings className="w-4 h-4 mr-1" />
              Custom Fields
            </h3>
            <p className="text-sm text-gray-500">
              No custom fields defined yet. Add some in workspace settings.
            </p>
          </div>
        )}

        {/* Time Tracking - Temporarily disabled until database tables are created */}
        {false && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Time Tracking
            </h3>
            <TimeTracker cardId={card.id} />
          </div>
        )}

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