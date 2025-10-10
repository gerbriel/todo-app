import { useState } from 'react';
import { format } from 'date-fns';

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  position: number;
  due_date?: string | null;
  assigned_to?: string | null;
  assigned_member_name?: string | null;
  priority?: 'low' | 'medium' | 'high' | null;
  created_at?: string;
  completed_at?: string | null;
}

interface Checklist {
  id: string;
  title: string;
  position: number;
  checklist_items: ChecklistItem[];
}

interface EnhancedChecklistProps {
  checklist: Checklist;
  onUpdateItem: (itemId: string, updates: Partial<ChecklistItem>) => void;
  onAddItem: (checklistId: string, text: string) => void;
  onDeleteItem: (itemId: string) => void;
}

export default function EnhancedChecklist({ 
  checklist, 
  onUpdateItem, 
  onAddItem, 
  onDeleteItem 
}: EnhancedChecklistProps) {
  const [newItemText, setNewItemText] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const mockMembers = [
    { id: 'user1', name: 'John Doe', email: 'john@example.com' },
    { id: 'user2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: 'user3', name: 'Mike Johnson', email: 'mike@example.com' },
  ];

  const handleAddItem = () => {
    if (newItemText.trim()) {
      onAddItem(checklist.id, newItemText.trim());
      setNewItemText('');
      setShowAddForm(false);
    }
  };

  const handleToggleItem = (item: ChecklistItem) => {
    onUpdateItem(item.id, {
      done: !item.done,
      completed_at: !item.done ? new Date().toISOString() : null,
    });
  };

  const getPriorityColor = (priority?: string | null) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-500 bg-blue-50 border-blue-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const isOverdue = (dueDate?: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !checklist.checklist_items.find(item => item.due_date === dueDate)?.done;
  };

  const completedItems = checklist.checklist_items.filter(item => item.done).length;
  const totalItems = checklist.checklist_items.length;
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Checklist Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">{checklist.title}</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {completedItems}/{totalItems}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round(completionPercentage)}%
          </span>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {checklist.checklist_items
          .sort((a, b) => a.position - b.position)
          .map((item) => (
            <div 
              key={item.id} 
              className={`group border rounded-lg p-3 transition-all ${
                item.done 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : isOverdue(item.due_date)
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleItem(item)}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    item.done
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 dark:border-gray-500 hover:border-green-400'
                  }`}
                >
                  {item.done && <span className="text-xs">✓</span>}
                </button>
                
                {/* Item Content */}
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${
                    item.done 
                      ? 'line-through text-gray-500 dark:text-gray-400' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {item.text}
                  </div>
                  
                  {/* Item Meta Info */}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    {/* Due Date */}
                    {item.due_date && (
                      <div className={`flex items-center gap-1 ${
                        isOverdue(item.due_date) ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <span>📅</span>
                        <span>{format(new Date(item.due_date), 'MMM d')}</span>
                        {isOverdue(item.due_date) && <span className="text-xs">(Overdue)</span>}
                      </div>
                    )}
                    
                    {/* Assigned Member */}
                    {item.assigned_member_name && (
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <span>👤</span>
                        <span>{item.assigned_member_name}</span>
                      </div>
                    )}
                    
                    {/* Priority */}
                    {item.priority && (
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                        {item.priority.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Item Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingItem(item.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Edit item"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {/* Edit Form */}
              {editingItem === item.id && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Due Date */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={item.due_date ? item.due_date.split('T')[0] : ''}
                        onChange={(e) => onUpdateItem(item.id, { 
                          due_date: e.target.value ? new Date(e.target.value).toISOString() : null 
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    {/* Assign Member */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Assign To
                      </label>
                      <select
                        value={item.assigned_to || ''}
                        onChange={(e) => {
                          const selectedMember = mockMembers.find(m => m.id === e.target.value);
                          onUpdateItem(item.id, { 
                            assigned_to: e.target.value || null,
                            assigned_member_name: selectedMember?.name || null
                          });
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Unassigned</option>
                        {mockMembers.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Priority */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Priority
                      </label>
                      <select
                        value={item.priority || ''}
                        onChange={(e) => onUpdateItem(item.id, { 
                          priority: e.target.value as 'low' | 'medium' | 'high' | null || null 
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">No Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(null)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Add New Item */}
      <div className="mt-4">
        {showAddForm ? (
          <div className="space-y-3">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Add a checklist item..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddItem();
                if (e.key === 'Escape') setShowAddForm(false);
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Item
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewItemText('');
                }}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600"
          >
            + Add an item
          </button>
        )}
      </div>
    </div>
  );
}