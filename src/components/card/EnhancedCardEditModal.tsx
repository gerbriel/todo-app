import { useState, useEffect } from 'react';
import { X, Edit2, Calendar, User, Tag, FileText, Check, Move, Paperclip, MapPin, Users, Archive, Copy, Sparkles, Clock, Upload, Download, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBoards } from '@/api/boards';
import { useOrg } from '@/contexts/OrgContext';
import { 
  moveCardToBoard, 
  updateCard,
  addLabelToCard,
  removeLabelFromCardById,
  addChecklistToCard,
  addAttachmentToCard,
  removeAttachmentFromCard,
  assignMemberToCard,
  assignMemberToChecklistItem,
  setChecklistItemDueDate,
  setChecklistItemStartDate,
  addLabelToChecklistItem,
  removeLabelFromChecklistItem,
  getAvailableLabelsForChecklistItems,
  addChecklistItem,
  removeChecklistItem,
  toggleChecklistItem,
  removeChecklistFromCard
} from '@/api/cards';
import type { CardRow, BoardRow } from '@/types/dto';
import AIAdCopyManager from './AIAdCopyManager';
import ActivityFeed from './ActivityFeed';
import AdvancedLabelManager from '../label/AdvancedLabelManager';
import LabelCreationModal from '../label/LabelCreationModal';
import ChecklistModule from '../checklist/ChecklistModule';
import UserDropdown from '../ui/UserDropdown';
import FilePreview from '../ui/FilePreview';

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
  // ensure date inputs are in yyyy-MM-dd format for <input type="date">
  const formatForDateInput = (iso?: string | null) => {
    if (!iso) return '';
    try {
      return new Date(iso).toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const [formData, setFormData] = useState<any>({
    ...card,
    title: card.title || '',
    description: card.description || '',
    // ensure date inputs conform to yyyy-MM-dd
    date_start: formatForDateInput(card.date_start),
    date_end: formatForDateInput(card.date_end),
  });

  // Initialize selected labels from card data
  const [selectedLabels, setSelectedLabels] = useState<string[]>(
    card.card_labels?.map(cl => cl.label_id) || []
  );

  const [comments, setComments] = useState<CardComment[]>([
    {
      id: '1',
      text: 'Great progress on this task! The mockups look good.',
      author: 'John Doe',
      createdAt: '2025-01-05T09:15:00Z'
    },
  ]);

  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'activity' | 'ai-copy'>('details');
  
  // Modal states for different actions
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showLabelCreationModal, setShowLabelCreationModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showDatesModal, setShowDatesModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [previewFile, setPreviewFile] = useState<{
    id: string;
    name: string;
    url: string;
    mime: string;
    size?: number;
  } | null>(null);
  
  // Form states
  const [memberForm, setMemberForm] = useState({ name: '', email: '' });
  const [checklistForm, setChecklistForm] = useState({ title: '' });
  const [datesForm, setDatesForm] = useState({ 
    start_date: formData.date_start || '', 
    end_date: formData.date_end || '' 
  });
  const [attachmentForm, setAttachmentForm] = useState({ name: '', url: '', file: null as File | null });
  const [locationForm, setLocationForm] = useState({ 
    address: card.location_address || '', 
    coordinates: card.location_lat && card.location_lng ? `${card.location_lat}, ${card.location_lng}` : ''
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [availableChecklistLabels, setAvailableChecklistLabels] = useState<Array<{
    id: string;
    name: string;
    color: string;
  }>>([]);

  const queryClient = useQueryClient();

  // Mutations for enhanced card features
  const updateCardMutation = useMutation({
    mutationFn: (updates: Partial<CardRow>) => updateCard(card.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
    },
    onError: (error: any) => {
      const msg = (error?.message || '').toString();
      if (msg.includes("Could not find the 'location_address'")) {
        // Helpful guidance for the developer/user
        alert('Database schema mismatch: location columns are missing in the Supabase schema cache. Run your migration and then refresh Supabase API schema (Project → Settings → Database → Refresh schema).');
      } else {
        console.error('Error updating card:', error);
      }
    }
  });

  const addLabelMutation = useMutation({
    mutationFn: (label: { name: string; color: string }) => addLabelToCard(card.id, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
    }
  });

  const removeLabelMutation = useMutation({
    mutationFn: (labelId: string) => removeLabelFromCardById(card.id, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
    }
  });

  const addAttachmentMutation = useMutation({
    mutationFn: (attachment: { name: string; url: string; mime: string; size: number }) => 
      addAttachmentToCard(card.id, attachment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
    }
  });

  const removeAttachmentMutation = useMutation({
    mutationFn: (attachmentId: string) => removeAttachmentFromCard(card.id, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
    }
  });

  const addMemberMutation = useMutation({
    mutationFn: (member: { name: string; email?: string; avatar?: string }) => 
      assignMemberToCard(card.id, member),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
    }
  });

  const { currentOrg } = useOrg();
  // Get available boards for moving
  const workspaceForBoards = currentOrg?.id || card.workspace_id;
  const boardsQuery = useQuery({
    queryKey: ['boards', workspaceForBoards],
    queryFn: () => workspaceForBoards ? getBoards(workspaceForBoards) : Promise.resolve([]),
    enabled: isOpen && !!workspaceForBoards,
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

  // Load available checklist labels
  useEffect(() => {
    const loadAvailableLabels = async () => {
      try {
        const labels = await getAvailableLabelsForChecklistItems();
        setAvailableChecklistLabels(labels);
      } catch (error) {
        console.error('Failed to load available checklist labels:', error);
      }
    };
    loadAvailableLabels();
  }, []);

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

  // Reset location form when modal opens
  useEffect(() => {
    if (showLocationModal) {
      setLocationForm({
        address: card.location_address || '',
        coordinates: card.location_lat && card.location_lng ? `${card.location_lat}, ${card.location_lng}` : ''
      });
    }
  }, [showLocationModal, card.location_address, card.location_lat, card.location_lng]);

  // Keep the dates modal in-sync with the main form when opened
  useEffect(() => {
    if (showDatesModal) {
      setDatesForm({
        start_date: formData.date_start || '',
        end_date: formData.date_end || ''
      });
    }
  }, [showDatesModal, formData.date_start, formData.date_end]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Normalize date inputs (from yyyy-MM-dd) to ISO strings for the DB
      const normalizeToISO = (d: any) => {
        if (!d) return null;
        try {
          // If already ISO-ish, Date will keep it; if yyyy-MM-dd, this creates a correct Date
          const dt = new Date(d);
          if (isNaN(dt.getTime())) return null;
          return dt.toISOString();
        } catch (e) {
          return null;
        }
      };

      const payload: Partial<any> = {
        ...formData,
        date_start: normalizeToISO(formData.date_start),
        date_end: normalizeToISO(formData.date_end)
      };

      await onSave(payload);
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop, not the modal content, and not while saving
    if (e.target === e.currentTarget && !isSaving) {
      onClose();
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      const fileUrl = URL.createObjectURL(file);
      
      addAttachmentMutation.mutate({
        name: file.name,
        url: fileUrl,
        mime: file.type || 'application/octet-stream',
        size: file.size
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative
          ${isDragOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center z-10 rounded-lg">
            <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-dashed border-blue-500">
              <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-blue-600 font-medium">Drop file to upload</p>
            </div>
          </div>
        )}
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
                Activity ({(card.activity?.length || 0) + comments.length})
              </button>
              <button
                onClick={() => setActiveTab('ai-copy')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium ${
                  activeTab === 'ai-copy' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>AI Copy</span>
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
          <div
            className="flex-1 p-6 overflow-y-auto"
            style={{ maxHeight: 'calc(90vh - 160px)' }}
          >
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
                  {/* Display selected labels */}
                  <div className="flex flex-wrap gap-2">
                    {card.card_labels?.map((cardLabel) => {
                      const label = cardLabel.labels;
                      if (!label) return null;
                      return (
                        <div
                          key={label.id}
                          className="px-3 py-1 rounded-full text-sm font-medium text-white flex items-center space-x-2"
                          style={{ backgroundColor: label.color }}
                        >
                          <span>{label.name}</span>
                          <button
                            onClick={() => removeLabelMutation.mutate(label.id)}
                            className="hover:bg-black hover:bg-opacity-20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                    {(!card.card_labels || card.card_labels.length === 0) && (
                      <p className="text-gray-500 text-sm">No labels assigned. Click "Labels" in the sidebar to add some.</p>
                    )}
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

                {/* Assigned Members */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Users className="w-4 h-4" />
                      <span>Assigned Members</span>
                    </label>
                  </div>
                  <UserDropdown
                    selectedUsers={card.assigned_members?.map(({ assigned_at, ...member }) => member) || []}
                    onUsersChange={(users) => {
                      // Add assigned_at timestamp to each user
                      const usersWithTimestamp = users.map(user => ({
                        ...user,
                        assigned_at: new Date().toISOString()
                      }));
                      updateCardMutation.mutate({ assigned_members: usersWithTimestamp });
                    }}
                    placeholder="Assign team members..."
                    maxUsers={10}
                    compact={false}
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

                {/* Checklists */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Check className="w-4 h-4" />
                      <span>Checklists</span>
                    </label>
                    <button
                      onClick={() => setShowChecklistModal(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add Checklist
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {card.checklists?.map((checklist) => (
                      <ChecklistModule
                        key={checklist.id}
                        checklist={checklist}
                        cardAssignedMembers={card.assigned_members || []}
                        availableLabels={availableChecklistLabels}
                        onChecklistUpdate={(updatedChecklist) => {
                          const updatedChecklists = card.checklists?.map(cl => 
                            cl.id === updatedChecklist.id ? updatedChecklist : cl
                          );
                          updateCardMutation.mutate({ checklists: updatedChecklists });
                        }}
                        onChecklistDelete={(checklistId) => {
                          removeChecklistFromCard(card.id, checklistId);
                          queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
                        }}
                        onItemToggle={(itemId) => {
                          const targetChecklist = card.checklists?.find(cl => 
                            cl.checklist_items?.some(item => item.id === itemId)
                          );
                          if (targetChecklist) {
                            toggleChecklistItem(card.id, targetChecklist.id, itemId);
                            queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
                          }
                        }}
                        onItemUpdate={(itemId, updates) => {
                          const updatedChecklists = card.checklists?.map(checklist => ({
                            ...checklist,
                            checklist_items: checklist.checklist_items?.map(item =>
                              item.id === itemId ? { ...item, ...updates } : item
                            )
                          }));
                          updateCardMutation.mutate({ checklists: updatedChecklists });
                        }}
                        onItemAdd={(checklistId: string, text: string) => {
                          addChecklistItem(card.id, checklistId, text);
                          queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
                        }}
                        onItemDelete={(itemId) => {
                          const targetChecklist = card.checklists?.find(cl => 
                            cl.checklist_items?.some(item => item.id === itemId)
                          );
                          if (targetChecklist) {
                            removeChecklistItem(card.id, targetChecklist.id, itemId);
                            queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
                          }
                        }}
                        onItemAssign={(itemId, userId) => {
                          const targetChecklist = card.checklists?.find(cl => 
                            cl.checklist_items?.some(item => item.id === itemId)
                          );
                          if (targetChecklist) {
                            assignMemberToChecklistItem(card.id, targetChecklist.id, itemId, userId);
                            queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
                          }
                        }}
                        onItemDueDateSet={(itemId, dueDate) => {
                          const targetChecklist = card.checklists?.find(cl => 
                            cl.checklist_items?.some(item => item.id === itemId)
                          );
                          if (targetChecklist) {
                            setChecklistItemDueDate(card.id, targetChecklist.id, itemId, dueDate);
                            queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
                          }
                        }}
                        onItemStartDateSet={(itemId, startDate) => {
                          const targetChecklist = card.checklists?.find(cl => 
                            cl.checklist_items?.some(item => item.id === itemId)
                          );
                          if (targetChecklist) {
                            setChecklistItemStartDate(card.id, targetChecklist.id, itemId, startDate);
                            queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
                          }
                        }}
                        onItemLabelAdd={(itemId, labelId) => {
                          const targetChecklist = card.checklists?.find(cl => 
                            cl.checklist_items?.some(item => item.id === itemId)
                          );
                          if (targetChecklist) {
                            addLabelToChecklistItem(card.id, targetChecklist.id, itemId, labelId);
                            queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
                          }
                        }}
                        onItemLabelRemove={(itemId, labelId) => {
                          const targetChecklist = card.checklists?.find(cl => 
                            cl.checklist_items?.some(item => item.id === itemId)
                          );
                          if (targetChecklist) {
                            removeLabelFromChecklistItem(card.id, targetChecklist.id, itemId, labelId);
                            queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
                          }
                        }}
                      />
                    ))}
                  </div>
                  
                  {(!card.checklists || card.checklists.length === 0) && (
                    <p className="text-gray-500 text-sm">No checklists yet. Click "Add Checklist" to create one.</p>
                  )}
                </div>

                {/* Attachments */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Paperclip className="w-4 h-4" />
                      <span>Attachments ({card.attachments?.length || 0})</span>
                    </label>
                    <button 
                      onClick={() => setShowAttachmentModal(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add Attachment
                    </button>
                  </div>
                  <div className="space-y-2">
                    {card.attachments?.map((attachment) => (
                      <div key={attachment.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => setPreviewFile({
                            id: attachment.id,
                            name: attachment.name || 'Untitled',
                            url: attachment.url,
                            mime: attachment.mime,
                            size: attachment.size
                          })}
                        >
                          <div className="font-medium text-sm text-blue-600 hover:text-blue-800">{attachment.name}</div>
                          <div className="text-xs text-gray-500">
                            {attachment.size ? formatFileSize(attachment.size) : 'Unknown size'} • Added {new Date(attachment.created_at).toLocaleDateString()} • Click to preview
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewFile({
                                id: attachment.id,
                                name: attachment.name || 'Untitled',
                                url: attachment.url,
                                mime: attachment.mime,
                                size: attachment.size
                              });
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Preview
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(attachment.url, '_blank');
                            }}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Download
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAttachmentMutation.mutate(attachment.id);
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!card.attachments || card.attachments.length === 0) && (
                      <p className="text-gray-500 text-sm">No attachments. Click "Add Attachment" to upload files.</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <span>Location</span>
                    </label>
                    <button 
                      onClick={() => setShowLocationModal(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {card.location_address ? 'Edit Location' : '+ Add Location'}
                    </button>
                  </div>
                  {card.location_address ? (
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{card.location_address}</div>
                          {card.location_lat && card.location_lng && (
                            <div className="text-xs text-gray-500 mt-1">
                              Coordinates: {card.location_lat}, {card.location_lng}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => {
                            updateCardMutation.mutate({
                              location_address: null,
                              location_lat: null,
                              location_lng: null
                            });
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No location set. Click "Add Location" to set one.</p>
                  )}
                </div>
              </div>
            ) : activeTab === 'activity' ? (
              /* Activity Tab */
              <div className="space-y-6">
                {/* Activity Feed */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Activity Log</span>
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <ActivityFeed card={card} showLimit={15} showActorNames={true} compact={false} />
                  </div>
                </div>

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
                  <h4 className="text-md font-medium text-gray-900">Comments</h4>
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
                  {comments.length === 0 && (
                    <p className="text-gray-500 text-sm italic">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </div>
            ) : (
              /* AI Copy Tab */
              <AIAdCopyManager card={card} />
            )}
          </div>

          {/* Sidebar Actions */}
          <div className="w-64 border-l bg-gray-50 text-gray-900 p-4">
            <h3 className="font-medium text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setShowMemberModal(true)}
                className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">Members</span>
              </button>
              <button 
                onClick={() => setShowLabelModal(true)}
                className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded"
              >
                <Tag className="w-4 h-4" />
                <span className="text-sm">Labels</span>
              </button>
              <button 
                onClick={() => setShowChecklistModal(true)}
                className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded"
              >
                <Check className="w-4 h-4" />
                <span className="text-sm">Checklist</span>
              </button>
              <button 
                onClick={() => setShowDatesModal(true)}
                className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded"
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Dates</span>
              </button>
              <button 
                onClick={() => setShowAttachmentModal(true)}
                className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded"
              >
                <Paperclip className="w-4 h-4" />
                <span className="text-sm">Attachment</span>
              </button>
              <button 
                onClick={() => setShowLocationModal(true)}
                className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded"
              >
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Location</span>
              </button>
              
              <hr className="my-3" />
              
              <button 
                onClick={() => {
                  // Move functionality is already implemented in the "Move to Board" section below
                  const moveSection = document.querySelector('[data-move-section]');
                  if (moveSection) {
                    moveSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded"
              >
                <Move className="w-4 h-4" />
                <span className="text-sm">Move</span>
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify({
                    title: card.title,
                    description: card.description,
                    labels: selectedLabels,
                    checklist: card.checklists || [],
                    attachments: card.attachments || [],
                    members: card.assigned_members || []
                  }));
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                }}
                className={`w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded ${copySuccess ? 'bg-green-50' : ''}`}
              >
                <Copy className={`w-4 h-4 ${copySuccess ? 'text-green-600' : ''}`} />
                <span className={`text-sm ${copySuccess ? 'text-green-600' : ''}`}>
                  {copySuccess ? 'Copied!' : 'Copy'}
                </span>
              </button>
              
              <button 
                onClick={() => setShowArchiveModal(true)}
                className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded text-red-600"
              >
                <Archive className="w-4 h-4" />
                <span className="text-sm">Archive</span>
              </button>
            </div>

            {/* Move to Board Section */}
            <div className="mt-6" data-move-section>
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

        {/* Action Modals */}
        
        {/* Add Member Modal */}
        {showMemberModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
              <h3 className="text-lg font-semibold mb-4">Add Member</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({...memberForm, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter member name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter member email"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    if (memberForm.name.trim()) {
                      addMemberMutation.mutate({
                        name: memberForm.name.trim(),
                        email: memberForm.email.trim() || undefined
                      });
                      setMemberForm({ name: '', email: '' });
                      setShowMemberModal(false);
                    }
                  }}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  Add Member
                </button>
                <button
                  onClick={() => {
                    setMemberForm({ name: '', email: '' });
                    setShowMemberModal(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Label Modal */}
        <AdvancedLabelManager
          isOpen={showLabelModal}
          onClose={() => setShowLabelModal(false)}
          cardId={card.id}
          selectedLabelIds={card.card_labels?.map(cl => cl.label_id) || []}
          onLabelsChange={(labelIds) => {
            // Update the local selected labels state
            setSelectedLabels(labelIds);
            // This will trigger a refetch of the card data
            queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
          }}
        />

        {/* Label Creation Modal */}
        <LabelCreationModal
          isOpen={showLabelCreationModal}
          onClose={() => setShowLabelCreationModal(false)}
          onLabelCreated={(label) => {
            // Add the new label to the card
            addLabelMutation.mutate({ name: label.name, color: label.color });
          }}
        />

        {/* Add Checklist Modal */}
        {showChecklistModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
              <h3 className="text-lg font-semibold mb-4">Add Checklist</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Checklist Title</label>
                  <input
                    type="text"
                    value={checklistForm.title}
                    onChange={(e) => setChecklistForm({...checklistForm, title: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter checklist title"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    if (checklistForm.title.trim()) {
                      addChecklistToCard(card.id, checklistForm.title).then(() => {
                        queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
                      });
                      setChecklistForm({ title: '' });
                      setShowChecklistModal(false);
                    }
                  }}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  Add Checklist
                </button>
                <button
                  onClick={() => {
                    setChecklistForm({ title: '' });
                    setShowChecklistModal(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Set Dates Modal */}
        {showDatesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
              <h3 className="text-lg font-semibold mb-4">Set Dates</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={datesForm.start_date}
                    onChange={(e) => setDatesForm({...datesForm, start_date: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={datesForm.end_date}
                    onChange={(e) => setDatesForm({...datesForm, end_date: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    updateCardMutation.mutate({ 
                      date_start: datesForm.start_date || null, 
                      date_end: datesForm.end_date || null 
                    });
                    setShowDatesModal(false);
                  }}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  Set Dates
                </button>
                <button
                  onClick={() => setShowDatesModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Attachment Modal */}
        {showAttachmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
              <h3 className="text-lg font-semibold mb-4">Add Attachment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
                  <input
                    type="text"
                    value={attachmentForm.name}
                    onChange={(e) => setAttachmentForm({...attachmentForm, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter file name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File URL</label>
                  <input
                    type="url"
                    value={attachmentForm.url}
                    onChange={(e) => setAttachmentForm({...attachmentForm, url: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter file URL"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  Or upload a file:
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAttachmentForm({
                          name: file.name,
                          url: URL.createObjectURL(file),
                          file: file
                        });
                      }
                    }}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    if (attachmentForm.name && attachmentForm.url) {
                      const fileSize = attachmentForm.file?.size || 0;
                      const mimeType = attachmentForm.file?.type || 'application/octet-stream';
                      
                      addAttachmentMutation.mutate({
                        name: attachmentForm.name,
                        url: attachmentForm.url,
                        mime: mimeType,
                        size: fileSize
                      });
                      
                      setAttachmentForm({ name: '', url: '', file: null });
                      setShowAttachmentModal(false);
                    }
                  }}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  Add Attachment
                </button>
                <button
                  onClick={() => {
                    setAttachmentForm({ name: '', url: '', file: null });
                    setShowAttachmentModal(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Location Modal */}
        {showLocationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
              <h3 className="text-lg font-semibold mb-4">
                {card.location_address ? 'Edit Location' : 'Add Location'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={locationForm.address}
                    onChange={(e) => setLocationForm({...locationForm, address: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter address or location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coordinates (Optional)</label>
                  <input
                    type="text"
                    value={locationForm.coordinates}
                    onChange={(e) => setLocationForm({...locationForm, coordinates: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="lat, lng (e.g., 40.7128, -74.0060)"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    if (locationForm.address.trim()) {
                      // Parse coordinates if provided
                      let lat = null;
                      let lng = null;
                      
                      if (locationForm.coordinates.trim()) {
                        const coords = locationForm.coordinates.split(',').map(c => parseFloat(c.trim()));
                        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                          lat = coords[0];
                          lng = coords[1];
                        }
                      }
                      
                      // Update the card with location data
                      updateCardMutation.mutate({
                        location_address: locationForm.address.trim(),
                        location_lat: lat,
                        location_lng: lng
                      });
                      
                      setLocationForm({ address: '', coordinates: '' });
                      setShowLocationModal(false);
                    }
                  }}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  {card.location_address ? 'Update Location' : 'Add Location'}
                </button>
                <button
                  onClick={() => {
                    setLocationForm({ address: '', coordinates: '' });
                    setShowLocationModal(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Archive Confirmation Modal */}
        {showArchiveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Archive Card</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to archive "{card.title}"? You can restore it later from the archive.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    updateCardMutation.mutate({ archived: true });
                    setShowArchiveModal(false);
                    onClose(); // Close the main modal since card is archived
                  }}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
                >
                  Archive Card
                </button>
                <button
                  onClick={() => setShowArchiveModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

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
      
      {/* File Preview Modal */}
      {previewFile && (
        <FilePreview
          isOpen={!!previewFile}
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}