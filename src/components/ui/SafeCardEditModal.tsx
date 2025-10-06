import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { Textarea } from './Textarea'
import { LabelSelector } from './LabelSelector'
import { CustomFieldInput } from './CustomFieldInput'
import { 
  Calendar, 
  Flag, 
  Settings, 
  Clock, 
  Plus,
  Type,
  CheckSquare,
  MapPin,
  FileText,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Trash2
} from 'lucide-react'
import { sectionsApi } from '../../api/sections'
import { customFieldsApi } from '../../api/customFields'
import type { Card, Label, CardSection, Address } from '../../types'

interface SafeCardEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (cardData: Partial<Card>) => void
  card: Card
  availableLabels?: Label[]
  onCreateLabel?: (name: string, color: string) => void
  workspaceId: string
}

const SECTION_TEMPLATES = [
  { type: 'text' as const, label: 'Text Block', icon: Type },
  { type: 'notes' as const, label: 'Notes', icon: FileText },
  { type: 'checklist' as const, label: 'Checklist', icon: CheckSquare },
  { type: 'address' as const, label: 'Address & Map', icon: MapPin },
  { type: 'timeline' as const, label: 'Timeline', icon: Clock },
  { type: 'attachments' as const, label: 'Attachments', icon: FileText },
]

// Draggable Section Component
function DraggableSection({ section, onUpdate, onDelete }: {
  section: CardSection
  onUpdate: (sectionId: string, updates: Partial<CardSection>) => void
  onDelete: (sectionId: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(section.collapsed || false)
  const [tempTitle, setTempTitle] = useState(section.title)
  const [tempContent, setTempContent] = useState(section.content || '')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleSave = () => {
    onUpdate(section.id, { 
      title: tempTitle, 
      content: tempContent,
      collapsed: isCollapsed
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempTitle(section.title)
    setTempContent(section.content || '')
    setIsEditing(false)
  }

  const toggleCollapsed = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    onUpdate(section.id, { collapsed: newCollapsed })
  }

  const getIcon = () => {
    switch (section.section_type) {
      case 'text': return Type
      case 'notes': return FileText
      case 'checklist': return CheckSquare
      case 'address': return MapPin
      case 'timeline': return Clock
      case 'attachments': return FileText
      default: return FileText
    }
  }

  const Icon = getIcon()

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-700 rounded-lg border border-gray-600 mb-2"
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-600">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-gray-300 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <button
            onClick={toggleCollapsed}
            className="text-gray-400 hover:text-gray-300"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <Icon className="w-4 h-4 text-blue-400" />
          {isEditing ? (
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') handleCancel()
              }}
            />
          ) : (
            <span className="text-white font-medium">{section.title}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="secondary" onClick={handleCancel}>Cancel</Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onDelete(section.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="p-3">
          {isEditing ? (
            <div className="space-y-3">
              {section.section_type === 'address' ? (
                <Input
                  value={tempContent ? (() => {
                    try {
                      return JSON.parse(tempContent).full_address || ''
                    } catch {
                      return tempContent
                    }
                  })() : ''}
                  onChange={(e) => {
                    const address: Address = { full_address: e.target.value }
                    setTempContent(JSON.stringify(address))
                  }}
                  placeholder="Enter address..."
                />
              ) : (
                <Textarea
                  value={tempContent}
                  onChange={(e) => setTempContent(e.target.value)}
                  placeholder="Section content..."
                  rows={4}
                />
              )}
            </div>
          ) : (
            <div className="text-gray-300">
              {section.section_type === 'address' && section.content ? (
                <div>
                  {(() => {
                    try {
                      const address = JSON.parse(section.content) as Address
                      return <div className="text-sm">{address.full_address}</div>
                    } catch {
                      return <div className="text-sm text-gray-500">Invalid address data</div>
                    }
                  })()}
                </div>
              ) : (
                <div className="text-sm whitespace-pre-wrap">
                  {section.content || 'No content'}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function SafeCardEditModal({
  isOpen,
  onClose,
  onSave,
  card,
  availableLabels = [],
  onCreateLabel,
  workspaceId
}: SafeCardEditModalProps) {
  const queryClient = useQueryClient()
  
  // Basic card fields
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [status, setStatus] = useState(card.status || 'not-started')
  const [priority, setPriority] = useState(card.priority || 'medium')
  const [dateStart, setDateStart] = useState(card.date_start ? card.date_start.split('T')[0] : '')
  const [dateEnd, setDateEnd] = useState(card.date_end ? card.date_end.split('T')[0] : '')
  const [selectedLabels, setSelectedLabels] = useState<Label[]>(card.labels || [])
  const [showAddSectionMenu, setShowAddSectionMenu] = useState(false)

  // Custom fields
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | string[]>>({})

  // Load sections
  const { data: sections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ['cardSections', card.id],
    queryFn: () => sectionsApi.getSections(card.id),
    enabled: isOpen && !!card.id,
  })

  // Load custom fields
  const { data: customFields = [] } = useQuery({
    queryKey: ['customFields', workspaceId],
    queryFn: () => customFieldsApi.getCustomFields(workspaceId),
    enabled: isOpen && !!workspaceId,
    retry: false
  })

  // Load custom field values
  const { data: fieldValues = [] } = useQuery({
    queryKey: ['cardCustomFieldValues', card.id],
    queryFn: () => customFieldsApi.getCustomFieldValues(card.id),
    enabled: isOpen && !!card.id,
    retry: false
  })

  // Set up custom field values when data loads
  useEffect(() => {
    if (fieldValues.length > 0) {
      const values: Record<string, string | string[]> = {}
      fieldValues.forEach(fv => {
        // Find the field to check type
        const field = customFields.find(f => f.id === fv.custom_field_id)
        if (field?.field_type === 'multi-select' && typeof fv.value === 'string') {
          try {
            values[fv.custom_field_id] = JSON.parse(fv.value)
          } catch {
            values[fv.custom_field_id] = [fv.value]
          }
        } else {
          values[fv.custom_field_id] = Array.isArray(fv.value) ? fv.value : (fv.value || '')
        }
      })
      setCustomFieldValues(values)
    }
  }, [fieldValues, customFields])

  // Drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Mutations
  const createSectionMutation = useMutation({
    mutationFn: (sectionData: { title: string; section_type: CardSection['section_type']; position: number }) =>
      sectionsApi.createSection(card.id, sectionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardSections', card.id] })
      setShowAddSectionMenu(false)
    },
  })

  const updateSectionMutation = useMutation({
    mutationFn: ({ sectionId, updates }: { sectionId: string; updates: Partial<CardSection> }) =>
      sectionsApi.updateSection(sectionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardSections', card.id] })
    },
  })

  const deleteSectionMutation = useMutation({
    mutationFn: (sectionId: string) => sectionsApi.deleteSection(sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardSections', card.id] })
    },
  })

  const reorderSectionsMutation = useMutation({
    mutationFn: (sectionIds: string[]) => sectionsApi.reorderSections(card.id, sectionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardSections', card.id] })
    },
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex(section => section.id === active.id)
      const newIndex = sections.findIndex(section => section.id === over?.id)

      const newSections = arrayMove(sections, oldIndex, newIndex)
      const sectionIds = newSections.map(section => section.id)
      
      reorderSectionsMutation.mutate(sectionIds)
    }
  }

  const addSection = (sectionType: CardSection['section_type']) => {
    const templates: Record<CardSection['section_type'], string> = {
      text: 'Text Block',
      notes: 'Notes',
      checklist: 'Checklist',
      address: 'Address',
      timeline: 'Timeline',
      attachments: 'Attachments',
      custom_fields: 'Custom Fields'
    }

    createSectionMutation.mutate({
      title: templates[sectionType] || 'New Section',
      section_type: sectionType,
      position: sections.length
    })
  }

  const handleSave = () => {
    // Save basic card data without sections (they're saved separately)
    const cardData: Partial<Card> = {
      title,
      description,
      status,
      priority,
      date_start: dateStart ? new Date(dateStart).toISOString() : undefined,
      date_end: dateEnd ? new Date(dateEnd).toISOString() : undefined,
      labels: selectedLabels
    }

    console.log('💾 Saving card with basic data only:', cardData)
    onSave(cardData)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Card" size="lg">
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Basic Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Card Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter card description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Flag className="w-4 h-4" />
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Flag className="w-4 h-4" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </label>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Labels</label>
            <LabelSelector
              availableLabels={availableLabels}
              selectedLabels={selectedLabels}
              onLabelsChange={setSelectedLabels}
              onCreateLabel={onCreateLabel}
            />
          </div>

          {/* Custom Fields */}
          {customFields.length > 0 && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Settings className="w-4 h-4" />
                Custom Fields
              </label>
              {customFields.map(field => (
                <CustomFieldInput
                  key={field.id}
                  field={field}
                  value={
                    fieldValues.find(fv => fv.custom_field_id === field.id) || 
                    { card_id: card.id, custom_field_id: field.id, value: customFieldValues[field.id] || '' }
                  }
                  onChange={(value) => setCustomFieldValues(prev => ({ ...prev, [field.id]: value }))}
                />
              ))}
            </div>
          )}
        </div>

        {/* Draggable Sections */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Sections</h3>
            <div className="relative">
              <Button
                onClick={() => setShowAddSectionMenu(!showAddSectionMenu)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </Button>
              
              {showAddSectionMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    {SECTION_TEMPLATES.map(template => (
                      <button
                        key={template.type}
                        onClick={() => addSection(template.type)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-white hover:bg-gray-600 rounded"
                      >
                        <template.icon className="w-4 h-4 text-blue-400" />
                        {template.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {sectionsLoading ? (
            <div className="text-center py-4 text-gray-400">Loading sections...</div>
          ) : sections.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Type className="w-8 h-8 mx-auto mb-2" />
              <p>No sections yet. Add a section to get started!</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {sections.map(section => (
                    <DraggableSection
                      key={section.id}
                      section={section}
                      onUpdate={(sectionId, updates) => updateSectionMutation.mutate({ sectionId, updates })}
                      onDelete={(sectionId) => deleteSectionMutation.mutate(sectionId)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-600">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </Modal>
  )
}