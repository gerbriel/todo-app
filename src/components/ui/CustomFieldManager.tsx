import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, GripVertical, X } from 'lucide-react'
import { customFieldsApi } from '../../api/customFields'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Modal } from '../ui/Modal'
import type { CustomField, CreateCustomFieldData, UpdateCustomFieldData, CustomFieldType } from '../../types'

interface CustomFieldManagerProps {
  workspaceId: string
  isOpen: boolean
  onClose: () => void
}

interface FieldFormData {
  name: string
  field_type: CustomFieldType
  options: string[]
  required: boolean
  default_value: string
  placeholder: string
  help_text: string
}

const FIELD_TYPES: { value: CustomFieldType; label: string; description: string }[] = [
  { value: 'text', label: 'Text', description: 'Single line text input' },
  { value: 'textarea', label: 'Long Text', description: 'Multi-line text area' },
  { value: 'number', label: 'Number', description: 'Numeric input' },
  { value: 'currency', label: 'Currency', description: 'Money amount with $ symbol' },
  { value: 'date', label: 'Date', description: 'Date picker' },
  { value: 'email', label: 'Email', description: 'Email address input' },
  { value: 'phone', label: 'Phone', description: 'Phone number input' },
  { value: 'url', label: 'URL', description: 'Website URL input' },
  { value: 'checkbox', label: 'Checkbox', description: 'True/false checkbox' },
  { value: 'select', label: 'Dropdown', description: 'Single selection from options' },
  { value: 'multi-select', label: 'Multi-Select', description: 'Multiple selections from options' }
]

export function CustomFieldManager({ workspaceId, isOpen, onClose }: CustomFieldManagerProps) {
  const queryClient = useQueryClient()
  const [editingField, setEditingField] = useState<CustomField | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState<FieldFormData>({
    name: '',
    field_type: 'text',
    options: [],
    required: false,
    default_value: '',
    placeholder: '',
    help_text: ''
  })

  // Debug schema on first load
  useEffect(() => {
    if (isOpen) {
      customFieldsApi.checkTableSchema()
    }
  }, [isOpen])

  const { data: customFields = [], isLoading } = useQuery({
    queryKey: ['customFields', workspaceId],
    queryFn: () => customFieldsApi.getCustomFields(workspaceId),
    enabled: isOpen && !!workspaceId
  })

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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomFieldData }) => 
      customFieldsApi.updateCustomField(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields', workspaceId] })
      resetForm()
      setEditingField(null)
      setIsFormOpen(false)
      console.log('Custom field updated successfully')
    },
    onError: (error) => {
      console.error('Error updating custom field:', error)
      alert('Failed to update custom field: ' + error.message)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customFieldsApi.deleteCustomField(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields', workspaceId] })
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      field_type: 'text',
      options: [],
      required: false,
      default_value: '',
      placeholder: '',
      help_text: ''
    })
  }

  const openCreateForm = () => {
    resetForm()
    setEditingField(null)
    setIsFormOpen(true)
  }

  const openEditForm = (field: CustomField) => {
    setFormData({
      name: field.name,
      field_type: field.field_type,
      options: field.options || [],
      required: field.required || false,
      default_value: field.default_value || '',
      placeholder: field.placeholder || '',
      help_text: field.help_text || ''
    })
    setEditingField(field)
    setIsFormOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name.trim()) {
      alert('Field name is required')
      return
    }
    
    console.log('Submitting form data:', formData)
    
    if (editingField) {
      updateMutation.mutate({
        id: editingField.id,
        data: formData
      })
    } else {
      createMutation.mutate({
        workspace_id: workspaceId,
        ...formData
      })
    }
  }

  const handleDeleteField = (field: CustomField) => {
    if (confirm(`Are you sure you want to delete the "${field.name}" field? This will remove all data for this field from all cards.`)) {
      deleteMutation.mutate(field.id)
    }
  }

  const updateFormData = (key: keyof FieldFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const needsOptions = formData.field_type === 'select' || formData.field_type === 'multi-select'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Custom Fields">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Create custom fields to capture additional information on your cards.
          </p>
          <Button onClick={openCreateForm} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </div>

        {/* Fields List */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading fields...</div>
        ) : customFields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No custom fields yet. Create your first field to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {customFields.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium">{field.name}</div>
                    <div className="text-sm text-gray-500">
                      {FIELD_TYPES.find(t => t.value === field.field_type)?.label}
                      {field.required && ' • Required'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditForm(field)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteField(field)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {editingField ? 'Edit Field' : 'Create Field'}
                  </h3>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      placeholder="e.g., Budget, Priority, Client"
                      required
                    />
                  </div>

                  {/* Field Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field Type *
                    </label>
                    <select
                      value={formData.field_type}
                      onChange={(e) => updateFormData('field_type', e.target.value as CustomFieldType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {FIELD_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {FIELD_TYPES.find(t => t.value === formData.field_type)?.description}
                    </p>
                  </div>

                  {/* Options for select fields */}
                  {needsOptions && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Options *
                      </label>
                      <div className="space-y-2">
                        {formData.options.map((option, index) => (
                          <div key={index} className="flex space-x-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="p-2 text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={addOption}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Placeholder */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Placeholder Text
                    </label>
                    <Input
                      value={formData.placeholder}
                      onChange={(e) => updateFormData('placeholder', e.target.value)}
                      placeholder="Hint text for users"
                    />
                  </div>

                  {/* Help Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Help Text
                    </label>
                    <Textarea
                      value={formData.help_text}
                      onChange={(e) => updateFormData('help_text', e.target.value)}
                      placeholder="Additional guidance for users"
                      rows={2}
                    />
                  </div>

                  {/* Default Value */}
                  {formData.field_type !== 'checkbox' && !needsOptions && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Value
                      </label>
                      <Input
                        value={formData.default_value}
                        onChange={(e) => updateFormData('default_value', e.target.value)}
                        placeholder="Optional default value"
                      />
                    </div>
                  )}

                  {/* Required */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="required"
                      checked={formData.required}
                      onChange={(e) => updateFormData('required', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="required" className="text-sm text-gray-700">
                      Make this field required
                    </label>
                  </div>

                  {/* Form Actions */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingField ? 'Update Field' : 'Create Field')}
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
          </div>
        )}
      </div>
    </Modal>
  )
}