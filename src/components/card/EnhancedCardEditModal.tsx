import { useState, useEffect } from 'react';
import { X, Edit2, Calendar, User, Tag, FileText, Check, Move, Paperclip, MapPin, Users, Archive, Copy, Plus, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBoards } from '@/api/boards';
import { 
  moveCardToBoard, 
  updateCard,
  addLabelToCard,
  removeLabelFromCard,
  addChecklistToCard,
  removeChecklistFromCard,
  addChecklistItem,
  toggleChecklistItem,
  removeChecklistItem,
  updateChecklistItemText,
  addCommentToCard,
  getCardComments,
  removeCommentFromCard,
  addAttachmentToCard,
  removeAttachmentFromCard
} from '@/api/cards';
import type { CardRow, BoardRow } from '@/types/dto';

interface CardLabel {
  id: string;
  name: string;
  color: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface CardAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

interface CardComment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

interface CardEditModalProps {
  card: CardRow;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCard: Partial<CardRow>) => void;
}

export default function CardEditModal({ card, isOpen, onClose, onSave }: CardEditModalProps) {
  const [formData, setFormData] = useState<any>({
    ...card,
    title: card.title || '',
    description: card.description || '',
    date_start: card.date_start || '',
    date_end: card.date_end || ''
  });

  // Enhanced state for comprehensive card features
  const [labels] = useState<CardLabel[]>([
    { id: '1', name: 'High Priority', color: 'bg-red-500' },
    { id: '2', name: 'In Review', color: 'bg-yellow-500' },
    { id: '3', name: 'Completed', color: 'bg-green-500' },
  ]);
  
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', text: 'Review requirements', completed: true },
    { id: '2', text: 'Complete implementation', completed: false },
    { id: '3', text: 'Test functionality', completed: false },
  ]);

  const [attachments] = useState<CardAttachment[]>([
    { 
      id: '1', 
      name: 'design-mockup.png', 
      type: 'image/png', 
      size: 245760, 
      url: '#', 
      uploadedAt: '2025-01-05T10:30:00Z' 
    },
  ]);

  const [comments, setComments] = useState<CardComment[]>([
    {
      id: '1',
      text: 'Great progress on this task! The mockups look good.',
      author: 'John Doe',
      createdAt: '2025-01-05T09:15:00Z'
    },
  ]);

  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');

  const queryClient = useQueryClient();

  // Mutations for enhanced card features
  const updateCardMutation = useMutation({
    mutationFn: (updates: Partial<CardRow>) => updateCard(card.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
    }
  });

  const addLabelMutation = useMutation({
    mutationFn: (label: { name: string; color: string }) => addLabelToCard(card.id, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
    }
  });

  const removeLabelMutation = useMutation({
    mutationFn: (labelId: string) => removeLabelFromCard(card.id, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
    }
  });

  const addChecklistItemMutation = useMutation({
    mutationFn: ({ checklistId, text }: { checklistId: string; text: string }) => 
      addChecklistItem(card.id, checklistId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
    }
  });

  const toggleChecklistItemMutation = useMutation({
    mutationFn: ({ checklistId, itemId }: { checklistId: string; itemId: string }) => 
      toggleChecklistItem(card.id, checklistId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => addCommentToCard(card.id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
    }
  });

  // Get available boards for moving
  const boardsQuery = useQuery({
    queryKey: ['boards', card.workspace_id],
    queryFn: () => getBoards(card.workspace_id),
    enabled: isOpen,
  });

  // Get card comments
  const commentsQuery = useQuery({
    queryKey: ['card-comments', card.id],
    queryFn: () => getCardComments(card.id),
    enabled: isOpen,
  });

  const moveCardMutation = useMutation({
    mutationFn: ({ targetBoardId }: { targetBoardId: string }) => 
      moveCardToBoard(card.id, targetBoardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      onClose();
    },
    onError: (error) => {
      console.error('Failed to move card:', error);
      alert('Failed to move card. Please try again.');
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isSaving, onClose]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(formData);
      onClose(); // Only close after successful save
    } catch (error) {
      console.error('Failed to save card:', error);
      // Keep modal open if save fails
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (fieldId: string, value: any) => {
    setFormData({ ...formData, [fieldId]: value });
  };

  // Helper functions for enhanced features
  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const toggleChecklistItem = (itemId: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, completed: !item.completed }
        : item
    ));
  };

  const addChecklistItem = (text: string) => {
    if (text.trim()) {
      setChecklist(prev => [...prev, {
        id: Date.now().toString(),
        text: text.trim(),
        completed: false
      }]);
    }
  };

  const addComment = () => {
    if (newComment.trim()) {
      setComments(prev => [...prev, {
        id: Date.now().toString(),
        text: newComment.trim(),
        author: 'You',
        createdAt: new Date().toISOString()
      }]);
      setNewComment('');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getChecklistProgress = () => {
    const completed = checklist.filter(item => item.completed).length;
    return checklist.length > 0 ? Math.round((completed / checklist.length) * 100) : 0;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop, not the modal content, and not while saving
    if (e.target === e.currentTarget && !isSaving) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white text-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white text-gray-900 border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">Card Details</h2>
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  activeTab === 'details' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  activeTab === 'activity' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Activity ({comments.length})
              </button>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={isSaving}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 p-6">
            {activeTab === 'details' ? (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Edit2 className="w-4 h-4" />
                    <span>Title</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full p-3 border rounded-lg font-medium text-lg text-gray-900"
                    placeholder="Enter card title"
                  />
                </div>

                {/* Labels */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4" />
                    <span>Labels</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {labels.map((label) => (
                      <button
                        key={label.id}
                        onClick={() => toggleLabel(label.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedLabels.includes(label.id)
                            ? `${label.color} text-white`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {label.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4" />
                    <span>Description</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="w-full p-3 border rounded-lg resize-none text-gray-900"
                    rows={4}
                    placeholder="Add a more detailed description..."
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>Start Date</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date_start}
                      onChange={(e) => updateField('date_start', e.target.value)}
                      className="w-full p-3 border rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>Due Date</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date_end}
                      onChange={(e) => updateField('date_end', e.target.value)}
                      className="w-full p-3 border rounded-lg text-gray-900"
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Check className="w-4 h-4" />
                      <span>Checklist</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {getChecklistProgress()}% Complete
                      </span>
                    </label>
                    <button
                      onClick={() => {
                        const text = prompt('Add checklist item:');
                        if (text) addChecklistItem(text);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add Item
                    </button>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getChecklistProgress()}%` }}
                    />
                  </div>
                  <div className="space-y-2">
                    {checklist.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleChecklistItem(item.id)}
                          className="w-4 h-4 text-green-600 rounded border-gray-300"
                        />
                        <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : ''}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Paperclip className="w-4 h-4" />
                      <span>Attachments ({attachments.length})</span>
                    </label>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      + Add Attachment
                    </button>
                  </div>
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{attachment.name}</div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(attachment.size)} • Added {new Date(attachment.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Activity Tab */
              <div className="space-y-6">
                {/* Add Comment */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    <span>Add Comment</span>
                  </label>
                  <div className="flex space-x-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 p-3 border rounded-lg resize-none text-gray-900"
                      rows={2}
                      placeholder="Write a comment..."
                    />
                    <button
                      onClick={addComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 h-fit"
                    >
                      Post
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {comment.author.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Actions */}
          <div className="w-64 border-l bg-gray-50 text-gray-900 p-4">
            <h3 className="font-medium text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded">
                <Users className="w-4 h-4" />
                <span className="text-sm">Members</span>
              </button>
              <button className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded">
                <Tag className="w-4 h-4" />
                <span className="text-sm">Labels</span>
              </button>
              <button className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded">
                <Check className="w-4 h-4" />
                <span className="text-sm">Checklist</span>
              </button>
              <button className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Dates</span>
              </button>
              <button className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded">
                <Paperclip className="w-4 h-4" />
                <span className="text-sm">Attachment</span>
              </button>
              <button className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Location</span>
              </button>
              
              <hr className="my-3" />
              
              <button className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded">
                <Move className="w-4 h-4" />
                <span className="text-sm">Move</span>
              </button>
              <button className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded">
                <Copy className="w-4 h-4" />
                <span className="text-sm">Copy</span>
              </button>
              <button className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded text-red-600">
                <Archive className="w-4 h-4" />
                <span className="text-sm">Archive</span>
              </button>
            </div>

            {/* Move to Board Section */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Move to Board</h4>
              <div className="space-y-2">
                {(boardsQuery.data as BoardRow[] || [])
                  .filter(board => board.id !== card.board_id)
                  .map((board) => (
                    <button
                      key={board.id}
                      onClick={() => moveCardMutation.mutate({ targetBoardId: board.id })}
                      disabled={moveCardMutation.isPending || isSaving}
                      className="w-full text-left p-2 border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50"
                    >
                      <div className="font-medium text-xs">{board.name}</div>
                      {moveCardMutation.isPending && (
                        <div className="text-xs text-blue-600">Moving...</div>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white text-gray-900 border-t px-6 py-4 flex space-x-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}