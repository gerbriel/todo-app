import { useState } from 'react'
import { X, Plus, GripVertical, Trash2, FileText, CheckSquare, Target } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import {
  CSS,
} from '@dnd-kit/utilities'

// Helper function to get icon for section type
const getSectionIcon = (type: string) => {
  switch (type) {
    case 'text':
      return <FileText className="w-3 h-3" />
    case 'checklist':
      return <CheckSquare className="w-3 h-3" />
    case 'notes':
      return <Target className="w-3 h-3" />
    default:
      return <FileText className="w-3 h-3" />
  }
}

// Simple types for our new card system
interface CardSection {
  id: string
  title: string
  content: string
  type: 'text' | 'checklist' | 'notes'
  position: number
}

interface SimpleCard {
  id: string
  title: string
  description: string
}

interface SimpleCardModalProps {
  card: SimpleCard
  isOpen: boolean
  onClose: () => void
  onSave: (card: SimpleCard, sections: CardSection[]) => void
}

// Draggable Section Component
function DraggableSection({ section, onUpdate, onDelete }: {
  section: CardSection
  onUpdate: (id: string, updates: Partial<CardSection>) => void
  onDelete: (id: string) => void
}) {
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
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-4 transition-all ${
        isDragging 
          ? 'shadow-2xl opacity-90 rotate-2 scale-105 border-blue-300 bg-blue-50' 
          : 'shadow-sm hover:shadow-md border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className={`text-gray-400 hover:text-blue-500 cursor-grab active:cursor-grabbing mt-1 p-1 rounded transition-colors ${
            isDragging ? 'text-blue-500 bg-blue-100' : ''
          }`}
          title="Drag to reorder"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Section Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-1 mr-2">
              <span className="text-gray-400 flex-shrink-0">
                {getSectionIcon(section.type)}
              </span>
              <input
                type="text"
                value={section.title}
                onChange={(e) => onUpdate(section.id, { title: e.target.value })}
                className="font-medium text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded flex-1"
                placeholder="Section title"
              />
            </div>
            <button
              onClick={() => onDelete(section.id)}
              className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
              title="Delete section"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <textarea
            value={section.content}
            onChange={(e) => onUpdate(section.id, { content: e.target.value })}
            className="w-full p-3 border border-gray-200 rounded-md resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            rows={4}
            placeholder="Add your content here..."
          />
          
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
              {getSectionIcon(section.type)}
              {section.type} • Position {section.position}
            </span>
            <span className="text-xs text-gray-400">
              {section.content.length} characters
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SimpleCardModal({ card, isOpen, onClose, onSave }: SimpleCardModalProps) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)
  const [sections, setSections] = useState<CardSection[]>([
    {
      id: '1',
      title: 'Getting Started',
      content: 'Welcome! This is a draggable section. Try dragging it using the ≡ handle on the left.',
      type: 'text',
      position: 1
    },
    {
      id: '2',
      title: 'Task List',
      content: 'You can create different types of sections:\n• Text sections for notes\n• Checklists for tasks\n• Notes for longer content',
      type: 'checklist',
      position: 2
    },
    {
      id: '3',
      title: 'Try This',
      content: 'Drag this section up or down to reorder it. The position updates in real-time!',
      type: 'notes',
      position: 3
    }
  ])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)
        
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Update positions
        return newItems.map((item, index) => ({
          ...item,
          position: index + 1
        }))
      })
    }
  }

  const addSection = () => {
    const newSection: CardSection = {
      id: Date.now().toString(),
      title: 'New Section',
      content: '',
      type: 'text',
      position: sections.length + 1
    }
    setSections([...sections, newSection])
  }

  const updateSection = (id: string, updates: Partial<CardSection>) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, ...updates } : section
    ))
  }

  const deleteSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id))
  }

  const handleSave = () => {
    onSave({ ...card, title, description }, sections)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Card</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Card Basic Info */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter card title"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              rows={3}
              placeholder="Enter card description"
            />
          </div>

          {/* Sections */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Card Sections</h3>
              <button
                onClick={addSection}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No sections yet. Click "Add Section" to create your first section.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {sections.map((section) => (
                      <DraggableSection
                        key={section.id}
                        section={section}
                        onUpdate={updateSection}
                        onDelete={deleteSection}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}