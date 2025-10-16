import { useState, useRef, useEffect } from 'react';
import { 
  Check, Plus, X, Edit2, Trash2,
  ChevronDown, ChevronRight, MoreHorizontal,
  CheckSquare
} from 'lucide-react';
import UserDropdown from '../ui/UserDropdown';

interface ChecklistItem {
  id: string;
  text?: string;
  done: boolean;
  position?: number;
  due_date?: string | null;
  start_date?: string | null;
  assigned_to?: string | null;
  assigned_member_name?: string | null;
  priority?: 'low' | 'medium' | 'high' | null;
  created_at?: string;
  completed_at?: string | null;
  labels?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

interface Checklist {
  id: string;
  title?: string;
  position?: number;
  checklist_items?: ChecklistItem[];
}

interface ChecklistModuleProps {
  checklist: Checklist;
  cardAssignedMembers?: Array<{
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  }>;
  availableLabels?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  onChecklistUpdate: (checklist: Checklist) => void;
  onChecklistDelete: (checklistId: string) => void;
  onItemToggle: (itemId: string) => void;
  onItemUpdate: (itemId: string, updates: Partial<ChecklistItem>) => void;
  onItemAdd: (checklistId: string, text: string) => void;
  onItemDelete: (itemId: string) => void;
  onItemAssign: (itemId: string, userId: string) => void;
  onItemDueDateSet: (itemId: string, dueDate: string | null) => void;
  onItemStartDateSet: (itemId: string, startDate: string | null) => void;
  onItemLabelAdd: (itemId: string, labelId: string) => void;
  onItemLabelRemove: (itemId: string, labelId: string) => void;
}

export default function ChecklistModule({
  checklist,
  cardAssignedMembers = [],
  availableLabels = [],
  onChecklistUpdate,
  onChecklistDelete,
  onItemToggle,
  onItemUpdate,
  onItemAdd,
  onItemDelete,
  onItemAssign,
  onItemDueDateSet,
  onItemStartDateSet,
  onItemLabelAdd,
  onItemLabelRemove
}: ChecklistModuleProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(checklist.title || '');
  const [newItemText, setNewItemText] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');
  const [showItemActions, setShowItemActions] = useState<string | null>(null);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const newItemInputRef = useRef<HTMLInputElement>(null);
  const editItemInputRef = useRef<HTMLInputElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const items = checklist.checklist_items || [];
  const completedItems = items.filter(item => item.done).length;
  const totalItems = items.length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowItemActions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus inputs when editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (showAddItem && newItemInputRef.current) {
      newItemInputRef.current.focus();
    }
  }, [showAddItem]);

  useEffect(() => {
    if (editingItemId && editItemInputRef.current) {
      editItemInputRef.current.focus();
      editItemInputRef.current.select();
    }
  }, [editingItemId]);

  // Handle title save
  const handleTitleSave = () => {
    if (editTitle.trim() !== checklist.title) {
      onChecklistUpdate({
        ...checklist,
        title: editTitle.trim()
      });
    }
    setIsEditingTitle(false);
  };

  // Handle add new item
  const handleAddItem = () => {
    if (newItemText.trim()) {
      onItemAdd(checklist.id, newItemText.trim());
      setNewItemText('');
      setShowAddItem(false);
    }
  };

  // Handle item edit
  const handleItemEdit = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditingItemText(item.text || '');
    setShowItemActions(null);
  };

  // Handle item save
  const handleItemSave = () => {
    if (editingItemId && editingItemText.trim()) {
      onItemUpdate(editingItemId, { text: editingItemText.trim() });
    }
    setEditingItemId(null);
    setEditingItemText('');
  };

  // Get priority color
  const getPriorityColor = (priority?: string | null) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-yellow-500 bg-yellow-50'; 
      case 'low': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority?: string | null) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '';
    }
  };

  // Check if item is overdue
  const isOverdue = (dueDate?: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !items.find(item => item.due_date === dueDate)?.done;
  };

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 overflow-hidden">
      {/* Checklist Header */}
      <div className="p-3 bg-white dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            
            <CheckSquare className="w-4 h-4 text-gray-500" />
            
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                  if (e.key === 'Escape') {
                    setEditTitle(checklist.title || '');
                    setIsEditingTitle(false);
                  }
                }}
                className="flex-1 px-2 py-1 text-sm font-medium bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded"
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="flex-1 text-left text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {checklist.title || 'Untitled Checklist'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Progress */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{completedItems}/{totalItems}</span>
              <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => onChecklistDelete(checklist.id)}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              title="Delete checklist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      {!isCollapsed && (
        <div className="p-3 space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`group flex items-start gap-3 p-2 rounded-md hover:bg-white dark:hover:bg-gray-700 ${
                item.done ? 'opacity-60' : ''
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => onItemToggle(item.id)}
                className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  item.done 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-300 dark:border-gray-500 hover:border-green-400'
                }`}
              >
                {item.done && <Check className="w-3 h-3" />}
              </button>

              <div className="flex-1 min-w-0">
                {editingItemId === item.id ? (
                  <input
                    ref={editItemInputRef}
                    value={editingItemText}
                    onChange={(e) => setEditingItemText(e.target.value)}
                    onBlur={handleItemSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleItemSave();
                      if (e.key === 'Escape') {
                        setEditingItemId(null);
                        setEditingItemText('');
                      }
                    }}
                    className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded"
                  />
                ) : (
                  <div className="space-y-1">
                    <div className={`text-sm ${item.done ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                      {item.text || ''}
                    </div>
                    
                    {/* Item metadata */}
                    <div className="flex items-center gap-2 text-xs">
                      {item.priority && (
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${getPriorityColor(item.priority)}`}>
                          {getPriorityIcon(item.priority)} {item.priority}
                        </span>
                      )}
                      
                      {item.assigned_member_name && (
                        <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                          👤 {item.assigned_member_name}
                        </span>
                      )}
                      
                      {item.start_date && (
                        <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                          🟢 {new Date(item.start_date).toLocaleDateString()}
                        </span>
                      )}
                      
                      {item.due_date && (
                        <span className={`px-1.5 py-0.5 rounded-full ${
                          isOverdue(item.due_date) 
                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          📅 {new Date(item.due_date).toLocaleDateString()}
                        </span>
                      )}
                      
                      {item.labels && item.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.labels.map((label) => (
                            <span
                              key={label.id}
                              className="px-1.5 py-0.5 rounded-full text-xs text-white"
                              style={{ backgroundColor: label.color }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Item Actions */}
              <div className="relative" ref={actionsMenuRef}>
                <button
                  onClick={() => setShowItemActions(showItemActions === item.id ? null : item.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showItemActions === item.id && (
                  <div 
                    className="fixed bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-[60] max-h-96 overflow-y-auto min-w-[280px]"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      maxWidth: '90vw',
                      maxHeight: '80vh'
                    }}
                  >
                    <>
                      {/* Menu Header */}
                      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">Task Options</div>
                          <div className="text-xs text-gray-500 dark:text-gray-300 truncate">"{item.text || 'Untitled task'}"</div>
                        </div>
                        <button
                          onClick={() => setShowItemActions(null)}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                      <div className="text-xs text-gray-500 mb-2">Priority:</div>
                      <div className="flex gap-1">
                        {(['high', 'medium', 'low', null] as const).map((priority) => (
                          <button
                            key={priority || 'none'}
                            onClick={() => {
                              onItemUpdate(item.id, { priority });
                            }}
                            className={`px-2 py-1 text-xs rounded ${
                              item.priority === priority
                                ? priority === 'high' ? 'bg-red-500 text-white' :
                                  priority === 'medium' ? 'bg-yellow-500 text-white' :
                                  priority === 'low' ? 'bg-green-500 text-white' :
                                  'bg-gray-500 text-white'
                                : priority === 'high' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                                  priority === 'medium' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                                  priority === 'low' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                  'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {priority === 'high' ? 'High' : 
                             priority === 'medium' ? 'Medium' : 
                             priority === 'low' ? 'Low' : 'None'}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleItemEdit(item)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-t border-gray-200 dark:border-gray-600"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit text
                    </button>

                    <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Start Date Column */}
                        <div>
                          <div className="text-xs text-gray-500 mb-2">Start Date:</div>
                          <input
                            type="date"
                            value={item.start_date ? item.start_date.split('T')[0] : ''}
                            onChange={(e) => {
                              onItemStartDateSet(item.id, e.target.value || null);
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                          />
                          {item.start_date && (
                            <button
                              onClick={() => {
                                onItemStartDateSet(item.id, null);
                              }}
                              className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Due Date Column */}
                        <div>
                          <div className="text-xs text-gray-500 mb-2">Due Date:</div>
                          <input
                            type="date"
                            value={item.due_date ? item.due_date.split('T')[0] : ''}
                            onChange={(e) => {
                              onItemDueDateSet(item.id, e.target.value || null);
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                          />
                          {item.due_date && (
                            <button
                              onClick={() => {
                                onItemDueDateSet(item.id, null);
                              }}
                              className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Quick Date Buttons */}
                      <div className="flex gap-1 mt-3">
                        <button
                          onClick={() => {
                            const today = new Date().toISOString().split('T')[0];
                            onItemDueDateSet(item.id, today);
                          }}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                        >
                          Today
                        </button>
                        <button
                          onClick={() => {
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            onItemDueDateSet(item.id, tomorrow.toISOString().split('T')[0]);
                          }}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded"
                        >
                          Tomorrow
                        </button>
                        <button
                          onClick={() => {
                            const nextWeek = new Date();
                            nextWeek.setDate(nextWeek.getDate() + 7);
                            onItemDueDateSet(item.id, nextWeek.toISOString().split('T')[0]);
                          }}
                          className="px-2 py-1 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 rounded"
                        >
                          Next Week
                        </button>
                      </div>
                    </div>

                      <button
                        onClick={() => handleItemEdit(item)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-t border-gray-200 dark:border-gray-600"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit text
                      </button>

                      <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                      <div className="text-xs text-gray-500 mb-2">Labels:</div>
                      <div className="space-y-2">
                        {/* Current labels */}
                        {item.labels && item.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.labels.map((label) => (
                              <button
                                key={label.id}
                                onClick={() => onItemLabelRemove(item.id, label.id)}
                                className="group px-2 py-1 rounded-full text-xs text-white hover:opacity-80 flex items-center gap-1"
                                style={{ backgroundColor: label.color }}
                                title="Click to remove"
                              >
                                {label.name}
                                <X className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* Available labels to add */}
                        {availableLabels.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-xs text-gray-400">Add label:</div>
                            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                              {availableLabels
                                .filter(label => !item.labels?.some(itemLabel => itemLabel.id === label.id))
                                .map((label) => (
                                <button
                                  key={label.id}
                                  onClick={() => onItemLabelAdd(item.id, label.id)}
                                  className="px-2 py-1 rounded-full text-xs text-white hover:opacity-80"
                                  style={{ backgroundColor: label.color }}
                                >
                                  {label.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                      <div className="text-xs text-gray-500 mb-2">Assign to:</div>
                      <UserDropdown
                        selectedUsers={item.assigned_to ? cardAssignedMembers.filter(m => m.id === item.assigned_to) : []}
                        onUsersChange={(users) => {
                          if (users.length > 0) {
                            onItemAssign(item.id, users[0].id);
                          } else {
                            // Unassign if no users selected
                            onItemUpdate(item.id, { assigned_to: null, assigned_member_name: null });
                          }
                        }}
                        placeholder="Select member"
                        maxUsers={1}
                        compact={true}
                      />
                    </div>

                      <button
                        onClick={() => {
                          onItemDelete(item.id);
                          setShowItemActions(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-gray-200 dark:border-gray-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete item
                      </button>
                    </>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add New Item */}
          {showAddItem ? (
            <div className="flex items-center gap-2 p-2">
              <div className="w-4 h-4" /> {/* Spacer for checkbox alignment */}
              <input
                ref={newItemInputRef}
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onBlur={() => {
                  if (!newItemText.trim()) setShowAddItem(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddItem();
                  if (e.key === 'Escape') {
                    setNewItemText('');
                    setShowAddItem(false);
                  }
                }}
                placeholder="Add an item..."
                className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded"
              />
              <button
                onClick={handleAddItem}
                disabled={!newItemText.trim()}
                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setNewItemText('');
                  setShowAddItem(false);
                }}
                className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddItem(true)}
              className="flex items-center gap-2 p-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded-md w-full"
            >
              <Plus className="w-4 h-4" />
              Add an item
            </button>
          )}
        </div>
      )}
    </div>
  );
}