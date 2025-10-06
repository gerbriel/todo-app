import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  GripVertical, 
  ChevronDown, 
  ChevronRight, 
  Type, 
  CheckSquare, 
  MapPin, 
  Clock, 
  FileText,
  Settings,
  Trash2,
  Plus
} from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { Textarea } from './Textarea'
import { AddressInput } from './AddressInput'
import type { CardSection, Address } from '../../types'

interface DraggableCardSectionProps {
  section: CardSection
  onUpdate: (sectionId: string, updates: Partial<CardSection>) => void
  onDelete: (sectionId: string) => void
}

const SECTION_ICONS = {
  text: Type,
  checklist: CheckSquare,
  custom_fields: Settings,
  attachments: FileText,
  address: MapPin,
  timeline: Clock,
  notes: FileText
}

const SECTION_LABELS = {
  text: 'Text Block',
  checklist: 'Checklist',
  custom_fields: 'Custom Fields',
  attachments: 'Attachments',
  address: 'Address & Map',
  timeline: 'Timeline',
  notes: 'Notes'
}

export function DraggableCardSection({ section, onUpdate, onDelete }: DraggableCardSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempTitle, setTempTitle] = useState(section.title)
  const [tempContent, setTempContent] = useState(section.content || '')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const IconComponent = SECTION_ICONS[section.section_type]

  const handleSave = () => {
    onUpdate(section.id, {
      title: tempTitle,
      content: tempContent
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempTitle(section.title)
    setTempContent(section.content || '')
    setIsEditing(false)
  }

  const toggleCollapsed = () => {
    onUpdate(section.id, { collapsed: !section.collapsed })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg mb-3 ${
        isDragging ? 'shadow-lg' : 'shadow-sm'
      }`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={toggleCollapsed}
            className="text-gray-400 hover:text-gray-600"
          >
            {section.collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {/* Section Icon & Title */}
          <div className="flex items-center space-x-2">
            <IconComponent className="w-4 h-4 text-gray-500" />
            {isEditing ? (
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="text-sm font-medium"
                autoFocus
              />
            ) : (
              <h3 className="text-sm font-medium text-gray-900">{section.title}</h3>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="secondary" onClick={handleCancel}>Cancel</Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(section.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Section Content */}
      {!section.collapsed && (
        <div className="p-4">
          {renderSectionContent()}
        </div>
      )}
    </div>
  )

  function renderSectionContent() {
    if (isEditing && (section.section_type === 'text' || section.section_type === 'notes')) {
      return (
        <Textarea
          value={tempContent}
          onChange={(e) => setTempContent(e.target.value)}
          placeholder={`Enter ${SECTION_LABELS[section.section_type].toLowerCase()} content...`}
          rows={4}
        />
      )
    }

    switch (section.section_type) {
      case 'text':
      case 'notes':
        return (
          <div className="prose prose-sm max-w-none">
            {section.content ? (
              <div className="whitespace-pre-wrap text-gray-700">{section.content}</div>
            ) : (
              <div className="text-gray-500 italic">No content yet. Click Edit to add.</div>
            )}
          </div>
        )

      case 'address':
        let addressData
        try {
          addressData = section.content ? JSON.parse(section.content) : undefined
        } catch {
          addressData = undefined
        }
        return (
          <AddressInput 
            cardId={section.card_id} 
            initialAddress={addressData}
            onAddressChange={(address: Address) => {
              console.log('Address changed in section:', section.id, address)
              onUpdate(section.id, { 
                content: JSON.stringify(address) 
              })
            }}
          />
        )

      case 'checklist':
        return (
          <div className="space-y-2">
            <div className="text-sm text-gray-500">Checklist functionality coming soon...</div>
            <Button size="sm" variant="ghost">
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>
        )

      case 'custom_fields':
        return (
          <div className="text-sm text-gray-500">
            Custom fields will be integrated here...
          </div>
        )

      case 'attachments':
        return (
          <div className="space-y-2">
            <div className="text-sm text-gray-500">Attachments functionality coming soon...</div>
            <Button size="sm" variant="ghost">
              <Plus className="w-4 h-4 mr-1" />
              Add Attachment
            </Button>
          </div>
        )

      case 'timeline':
        return (
          <div className="text-sm text-gray-500">
            Timeline view functionality coming soon...
          </div>
        )

      default:
        return (
          <div className="text-sm text-gray-500">
            Unknown section type: {section.section_type}
          </div>
        )
    }
  }
}