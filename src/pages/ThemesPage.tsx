import React, { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, X, Palette, Save } from 'lucide-react';

interface CardField {
  id: string;
  type: 'text' | 'textarea' | 'date' | 'select' | 'checkbox' | 'number' | 'url' | 'email';
  label: string;
  required: boolean;
  options?: string[];
  visible: boolean;
}

interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    cardBackground: string;
    text: string;
    border: string;
  };
  cardFields: CardField[];
  labels: string[];
  calendarSettings: {
    defaultView: 'month' | 'week' | 'day';
    startHour: number;
    endHour: number;
    showWeekends: boolean;
  };
}

const defaultTheme: Theme = {
  id: 'default',
  name: 'Default Theme',
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#10b981',
    background: '#ffffff',
    cardBackground: '#f9fafb',
    text: '#111827',
    border: '#d1d5db'
  },
  cardFields: [
    { id: 'title', type: 'text', label: 'Title', required: true, visible: true },
    { id: 'description', type: 'textarea', label: 'Description', required: false, visible: true },
    { id: 'due_date', type: 'date', label: 'Due Date', required: false, visible: true },
    { id: 'priority', type: 'select', label: 'Priority', required: false, visible: true, options: ['Low', 'Medium', 'High', 'Urgent'] },
    { id: 'assignee', type: 'text', label: 'Assignee', required: false, visible: true },
    { id: 'labels', type: 'select', label: 'Labels', required: false, visible: true },
  ],
  labels: ['Bug', 'Feature', 'Enhancement', 'Documentation', 'Research'],
  calendarSettings: {
    defaultView: 'month',
    startHour: 8,
    endHour: 18,
    showWeekends: true
  }
};

function SortableField({ field, onUpdate, onDelete }: { field: CardField; onUpdate: (field: CardField) => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState(field);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    onUpdate(editField);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="bg-white border rounded-lg p-4 mb-2">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Label</label>
            <input
              type="text"
              value={editField.label}
              onChange={(e) => setEditField({ ...editField, label: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={editField.type}
              onChange={(e) => setEditField({ ...editField, type: e.target.value as any })}
              className="w-full p-2 border rounded"
            >
              <option value="text">Text</option>
              <option value="textarea">Textarea</option>
              <option value="date">Date</option>
              <option value="select">Select</option>
              <option value="checkbox">Checkbox</option>
              <option value="number">Number</option>
              <option value="url">URL</option>
              <option value="email">Email</option>
            </select>
          </div>
          {editField.type === 'select' && (
            <div>
              <label className="block text-sm font-medium mb-1">Options (comma separated)</label>
              <input
                type="text"
                value={editField.options?.join(', ') || ''}
                onChange={(e) => setEditField({ ...editField, options: e.target.value.split(', ').filter(Boolean) })}
                className="w-full p-2 border rounded"
                placeholder="Option 1, Option 2, Option 3"
              />
            </div>
          )}
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editField.required}
                onChange={(e) => setEditField({ ...editField, required: e.target.checked })}
                className="mr-2"
              />
              Required
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editField.visible}
                onChange={(e) => setEditField({ ...editField, visible: e.target.checked })}
                className="mr-2"
              />
              Visible
            </label>
          </div>
          <div className="flex space-x-2">
            <button onClick={handleSave} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">Save</button>
            <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-500 text-white rounded text-sm">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="bg-white border rounded-lg p-3 mb-2 flex items-center space-x-3">
      <div {...listeners} className="cursor-grab">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <div className="flex-1">
        <span className="font-medium">{field.label}</span>
        <span className="text-sm text-gray-500 ml-2">({field.type})</span>
        {field.required && <span className="text-red-500 ml-1">*</span>}
        {!field.visible && <span className="text-gray-400 ml-1">(hidden)</span>}
      </div>
      <button onClick={() => setIsEditing(true)} className="px-2 py-1 text-blue-500 text-sm">Edit</button>
      <button onClick={onDelete} className="p-1 text-red-500">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ThemesPage() {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [activeTab, setActiveTab] = useState<'colors' | 'fields' | 'labels' | 'calendar'>('colors');
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = theme.cardFields.findIndex(field => field.id === active.id);
      const newIndex = theme.cardFields.findIndex(field => field.id === over.id);
      setTheme({
        ...theme,
        cardFields: arrayMove(theme.cardFields, oldIndex, newIndex)
      });
    }
  };

  const addField = () => {
    const newField: CardField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false,
      visible: true
    };
    setTheme({
      ...theme,
      cardFields: [...theme.cardFields, newField]
    });
  };

  const updateField = (fieldId: string, updatedField: CardField) => {
    setTheme({
      ...theme,
      cardFields: theme.cardFields.map(f => f.id === fieldId ? updatedField : f)
    });
  };

  const deleteField = (fieldId: string) => {
    setTheme({
      ...theme,
      cardFields: theme.cardFields.filter(f => f.id !== fieldId)
    });
  };

  const addLabel = () => {
    setTheme({
      ...theme,
      labels: [...theme.labels, 'New Label']
    });
  };

  const updateLabel = (index: number, value: string) => {
    const newLabels = [...theme.labels];
    newLabels[index] = value;
    setTheme({
      ...theme,
      labels: newLabels
    });
  };

  const deleteLabel = (index: number) => {
    setTheme({
      ...theme,
      labels: theme.labels.filter((_, i) => i !== index)
    });
  };

  const saveTheme = () => {
    localStorage.setItem('theme', JSON.stringify(theme));
    alert('Theme saved successfully!');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Theme Settings</h1>
        <button onClick={saveTheme} className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
          <Save className="w-4 h-4" />
          <span>Save Theme</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {(['colors', 'fields', 'labels', 'calendar'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'fields' ? 'Card Fields' : tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Color Settings
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(theme.colors).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => setTheme({
                          ...theme,
                          colors: { ...theme.colors, [key]: e.target.value }
                        })}
                        className="w-12 h-10 border rounded"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setTheme({
                          ...theme,
                          colors: { ...theme.colors, [key]: e.target.value }
                        })}
                        className="flex-1 p-2 border rounded font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'fields' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Card Field Structure</h2>
                <button onClick={addField} className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded">
                  <Plus className="w-4 h-4" />
                  <span>Add Field</span>
                </button>
              </div>
              <p className="text-gray-600">Drag and drop to reorder fields. This will determine the structure of all cards.</p>
              
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={theme.cardFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  {theme.cardFields.map((field) => (
                    <SortableField
                      key={field.id}
                      field={field}
                      onUpdate={(updatedField) => updateField(field.id, updatedField)}
                      onDelete={() => deleteField(field.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}

          {activeTab === 'labels' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Default Labels</h2>
                <button onClick={addLabel} className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded">
                  <Plus className="w-4 h-4" />
                  <span>Add Label</span>
                </button>
              </div>
              <div className="space-y-2">
                {theme.labels.map((label, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => updateLabel(index, e.target.value)}
                      className="flex-1 p-2 border rounded"
                    />
                    <button onClick={() => deleteLabel(index)} className="p-2 text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Calendar Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Default View</label>
                  <select
                    value={theme.calendarSettings.defaultView}
                    onChange={(e) => setTheme({
                      ...theme,
                      calendarSettings: { ...theme.calendarSettings, defaultView: e.target.value as any }
                    })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="month">Month</option>
                    <option value="week">Week</option>
                    <option value="day">Day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Start Hour</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={theme.calendarSettings.startHour}
                    onChange={(e) => setTheme({
                      ...theme,
                      calendarSettings: { ...theme.calendarSettings, startHour: parseInt(e.target.value) }
                    })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Hour</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={theme.calendarSettings.endHour}
                    onChange={(e) => setTheme({
                      ...theme,
                      calendarSettings: { ...theme.calendarSettings, endHour: parseInt(e.target.value) }
                    })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={theme.calendarSettings.showWeekends}
                      onChange={(e) => setTheme({
                        ...theme,
                        calendarSettings: { ...theme.calendarSettings, showWeekends: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    Show Weekends
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}