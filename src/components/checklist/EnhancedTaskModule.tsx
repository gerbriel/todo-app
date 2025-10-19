import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, Plus, Trash2,
  ChevronDown, ChevronRight, MoreHorizontal,
  CheckSquare, Calendar, User, Link, Tag
} from 'lucide-react';

interface TaskItem {
  id: string;
  text?: string;
  done: boolean;
  position?: number;
  start_date?: string | null;
  due_date?: string | null;
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
  linked_cards?: string[]; // Array of linked card IDs
}

interface TaskList {
  id: string;
  title?: string;
  position?: number;
  tasks?: TaskItem[];
}

interface EnhancedTaskModuleProps {
  taskList: TaskList;
  cardLabels?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  availableCards?: Array<{
    id: string;
    title: string;
    board_name?: string;
  }>;
  cardAssignedMembers?: Array<{
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  }>;
  onTaskListUpdate: (taskList: TaskList) => void;
  onTaskListDelete: (taskListId: string) => void;
  onTaskToggle: (taskId: string) => void;
  onTaskUpdate: (taskId: string, updates: Partial<TaskItem>) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskCreate: (taskData: Partial<TaskItem>) => void;
}

interface TaskItemComponentProps {
  task: TaskItem;
  cardLabels: Array<{ id: string; name: string; color: string; }>;
  availableCards: Array<{ id: string; title: string; board_name?: string; }>;
  assignedMembers: Array<{ id: string; name: string; email?: string; avatar?: string; }>;
  onToggle: () => void;
  onUpdate: (updates: Partial<TaskItem>) => void;
  onDelete: () => void;
}

const TaskItemComponent: React.FC<TaskItemComponentProps> = ({
  task,
  cardLabels,
  availableCards,
  assignedMembers,
  onToggle,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text || '');
  const [showOptions, setShowOptions] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(
    task.labels?.map(l => l.id) || []
  );
  const [linkedCards, setLinkedCards] = useState<string[]>(task.linked_cards || []);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onUpdate({ text: editText.trim() });
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditText(task.text || '');
      setIsEditing(false);
    }
  };

  const handleDateChange = (field: 'start_date' | 'due_date', value: string) => {
    const toISO = (v: string | null) => {
      if (!v) return null;
      const dt = new Date(v);
      return isNaN(dt.getTime()) ? null : dt.toISOString();
    };
    onUpdate({ [field]: toISO(value || null) });
  };

  const handleLabelToggle = (labelId: string) => {
    const newSelectedLabels = selectedLabels.includes(labelId)
      ? selectedLabels.filter(id => id !== labelId)
      : [...selectedLabels, labelId];
    
    setSelectedLabels(newSelectedLabels);
    
    const newLabels = cardLabels.filter(label => newSelectedLabels.includes(label.id));
    onUpdate({ labels: newLabels });
  };

  const handleCardLink = (cardId: string) => {
    const newLinkedCards = linkedCards.includes(cardId)
      ? linkedCards.filter(id => id !== cardId)
      : [...linkedCards, cardId];
    
    setLinkedCards(newLinkedCards);
    onUpdate({ linked_cards: newLinkedCards });
  };

  const getPriorityColor = (priority?: string | null) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`group p-3 rounded-lg border transition-all ${
      task.done 
        ? 'bg-gray-50 border-gray-200 opacity-75' 
        : getPriorityColor(task.priority)
    }`}>
      {/* Main Task Row */}
      <div className="flex items-center space-x-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            task.done
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {task.done && <Check className="w-3 h-3" />}
        </button>

        {/* Task Text */}
        <div className="flex-1">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyPress}
              className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <span
              className={`text-sm cursor-pointer ${
                task.done ? 'line-through text-gray-500' : 'text-gray-700'
              }`}
              onClick={() => setIsEditing(true)}
            >
              {task.text || 'Untitled task'}
            </span>
          )}
        </div>

        {/* Priority indicator */}
        {task.priority && (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            task.priority === 'high' ? 'bg-red-100 text-red-800' :
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {task.priority}
          </span>
        )}

        {/* Assigned Member */}
        {task.assigned_member_name && (
          <div className="flex items-center space-x-1">
            <User className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600">{task.assigned_member_name}</span>
          </div>
        )}

        {/* Options */}
        <div className="relative" ref={optionsRef}>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-opacity"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>

          {showOptions && (
            <div className="absolute right-0 top-8 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
              {/* Dates */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <label className="text-xs font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={task.start_date?.split('T')[0] || ''}
                    onChange={(e) => handleDateChange('start_date', e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <label className="text-xs font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    value={task.due_date?.split('T')[0] || ''}
                    onChange={(e) => handleDateChange('due_date', e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  />
                </div>
              </div>

              {/* Priority */}
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-700 block mb-1">Priority</label>
                <div className="flex space-x-1">
                  {['low', 'medium', 'high'].map(priority => (
                    <button
                      key={priority}
                      onClick={() => onUpdate({ priority: priority as any })}
                      className={`px-2 py-1 text-xs rounded ${
                        task.priority === priority
                          ? priority === 'high' ? 'bg-red-100 text-red-800' :
                            priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee */}
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-700 block mb-1">Assignee</label>
                <select
                  value={task.assigned_to || ''}
                  onChange={(e) => {
                    const userId = e.target.value;
                    const member = assignedMembers.find(m => m.id === userId);
                    onUpdate({ 
                      assigned_to: userId || null,
                      assigned_member_name: member?.name || null
                    });
                  }}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="">Unassigned</option>
                  {assignedMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Labels */}
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  <Tag className="w-3 h-3 inline mr-1" />
                  Task Labels
                </label>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {cardLabels.map(label => (
                    <label key={label.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLabels.includes(label.id)}
                        onChange={() => handleLabelToggle(label.id)}
                        className="w-3 h-3"
                      />
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-xs text-gray-700">{label.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Note: Task labels are independent of card labels
                </p>
              </div>

              {/* Linked Cards */}
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  <Link className="w-3 h-3 inline mr-1" />
                  Link to Cards
                </label>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {availableCards.slice(0, 5).map(card => (
                    <label key={card.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={linkedCards.includes(card.id)}
                        onChange={() => handleCardLink(card.id)}
                        className="w-3 h-3"
                      />
                      <span className="text-xs text-gray-700 truncate">
                        {card.title}
                        {card.board_name && (
                          <span className="text-gray-500 ml-1">({card.board_name})</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <button
                  onClick={onDelete}
                  className="text-xs text-red-600 hover:text-red-800 flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setShowOptions(false)}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Details Row */}
      {(task.start_date || task.due_date || task.labels?.length || linkedCards.length) && (
        <div className="mt-2 ml-8 flex flex-wrap items-center gap-2 text-xs">
          {/* Dates */}
          {task.start_date && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Start: {formatDate(task.start_date)}
            </span>
          )}
          {task.due_date && (
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
              Due: {formatDate(task.due_date)}
            </span>
          )}

          {/* Labels */}
          {task.labels?.map(label => (
            <span
              key={label.id}
              className="px-2 py-1 rounded-full text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}

          {/* Linked Cards */}
          {linkedCards.length > 0 && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center space-x-1">
              <Link className="w-3 h-3" />
              <span>{linkedCards.length} linked</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default function EnhancedTaskModule({
  taskList,
  cardLabels = [],
  availableCards = [],
  cardAssignedMembers = [],
  onTaskListUpdate,
  onTaskListDelete,
  onTaskToggle,
  onTaskUpdate,
  onTaskDelete,
  onTaskCreate
}: EnhancedTaskModuleProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(taskList.title || '');
  const [newTaskText, setNewTaskText] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const newTaskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (showAddTask && newTaskInputRef.current) {
      newTaskInputRef.current.focus();
    }
  }, [showAddTask]);

  const handleTitleSave = () => {
    const newTitle = titleText.trim() || 'Untitled Task List';
    onTaskListUpdate({ ...taskList, title: newTitle });
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitleText(taskList.title || '');
      setIsEditingTitle(false);
    }
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onTaskCreate({
        text: newTaskText.trim(),
        done: false,
        position: (taskList.tasks?.length || 0) + 1
      });
      setNewTaskText('');
      setShowAddTask(false);
    }
  };

  const handleNewTaskKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setNewTaskText('');
      setShowAddTask(false);
    }
  };

  const tasks = taskList.tasks || [];
  const completedCount = tasks.filter(task => task.done).length;
  const totalCount = tasks.length;

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-gray-100"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
            
            <CheckSquare className="w-5 h-5 text-blue-500" />
            
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyPress}
                className="font-medium text-gray-900 border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <h3
                className="font-medium text-gray-900 cursor-pointer"
                onClick={() => setIsEditingTitle(true)}
              >
                {taskList.title || 'Untitled Task List'}
              </h3>
            )}
            
            <span className="text-sm text-gray-500">
              {completedCount}/{totalCount} completed
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddTask(true)}
              className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onTaskListDelete(taskList.id)}
              className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round((completedCount / totalCount) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Add New Task */}
          {showAddTask && (
            <div className="mb-4 p-3 border border-blue-300 rounded-lg bg-blue-50">
              <input
                ref={newTaskInputRef}
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={handleNewTaskKeyPress}
                placeholder="Enter task description..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    setNewTaskText('');
                    setShowAddTask(false);
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskText.trim()}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Task
                </button>
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No tasks yet. Click the + button to add your first task.</p>
              </div>
            ) : (
              tasks.map(task => (
                <TaskItemComponent
                  key={task.id}
                  task={task}
                  cardLabels={cardLabels}
                  availableCards={availableCards}
                  assignedMembers={cardAssignedMembers}
                  onToggle={() => onTaskToggle(task.id)}
                  onUpdate={(updates) => onTaskUpdate(task.id, updates)}
                  onDelete={() => onTaskDelete(task.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}