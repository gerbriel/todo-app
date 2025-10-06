import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import { customFieldsApi } from '../../api/customFields'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import type { CustomField, CreateCustomFieldData, CustomFieldType } from '../../types'

interface MinimalCustomFieldManagerProps {
  workspaceId: string
  isOpen: boolean
  onClose: () => void
}

interface MinimalFieldFormData {
  name: string
  field_type: CustomFieldType
}

const BASIC_FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'checkbox', label: 'Checkbox' }
]

export function MinimalCustomFieldManager({ workspaceId, isOpen, onClose }: MinimalCustomFieldManagerProps) {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState<MinimalFieldFormData>({
    name: '',
    field_type: 'text'
  })

  // Debug schema on first load
  useEffect(() => {
    if (isOpen) {
      customFieldsApi.checkTableSchema()
    }
  }, [isOpen])

  // Fetch custom fields
  const { data: customFields = [], isLoading } = useQuery({
    queryKey: ['customFields', workspaceId],
    queryFn: () => customFieldsApi.getCustomFields(workspaceId),
    enabled: isOpen
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateCustomFieldData) => customFieldsApi.createCustomField(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields', workspaceId] })
      resetForm()
      setIsFormOpen(false)
      console.log('Custom field created successfully')
    },
    onError: (error) => {
      console.error('Error creating custom field:', error)
      alert('Failed to create custom field: ' + error.message)
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      field_type: 'text'
    })
  }

  const openCreateForm = () => {
    resetForm()
    setIsFormOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name.trim()) {
      alert('Field name is required')
      return
    }
    
    console.log('Submitting minimal form data:', formData)
    
    createMutation.mutate({
      workspace_id: workspaceId,
      ...formData
    })
  }

  const updateFormData = (key: keyof MinimalFieldFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Manage Custom Fields (Minimal)</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-600">
                Create basic custom fields to capture additional information on your cards.
              </p>
            </div>
            <Button onClick={openCreateForm} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>

          {/* Custom Fields List */}
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : customFields.length > 0 ? (
            <div className="space-y-3">
              {customFields.map((field) => (
                <div key={field.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{field.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{field.field_type}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No custom fields yet. Create your first field to get started.
            </div>
          )}
        </div>

        {/* Create Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create Field</h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Field Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Field Name *
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Enter field name"
                    required
                  />
                </div>

                {/* Field Type */}
                <div>
                  <label htmlFor="field_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Field Type *
                  </label>
                  <select
                    id="field_type"
                    value={formData.field_type}
                    onChange={(e) => updateFormData('field_type', e.target.value as CustomFieldType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {BASIC_FIELD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create Field'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}