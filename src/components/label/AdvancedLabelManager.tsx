import { useState, useEffect } from 'react';
import { Search, X, Edit2, Check, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllLabels, 
  createGlobalLabel, 
  updateGlobalLabel, 
  deleteGlobalLabel,
  addLabelToCardById,
  removeLabelFromCardById
} from '@/api/cards';
import type { Label } from '@/types';

interface AdvancedLabelManagerProps {
  isOpen: boolean;
  onClose: () => void;
  cardId?: string; // If provided, we're managing labels for a specific card
  selectedLabelIds?: string[];
  onLabelsChange?: (labelIds: string[]) => void;
}

export default function AdvancedLabelManager({ 
  isOpen, 
  onClose, 
  cardId, 
  selectedLabelIds = [], 
  onLabelsChange 
}: AdvancedLabelManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedLabelIds);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3B82F6');
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [colorblindMode, setColorblindMode] = useState(false);

  const queryClient = useQueryClient();

  // Mock query - replace with actual API
  const labelsQuery = useQuery({
    queryKey: ['labels'],
    queryFn: () => getAllLabels(),
    enabled: isOpen
  });

  const createLabelMutation = useMutation({
    mutationFn: createGlobalLabel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      setIsCreatingNew(false);
      setNewLabelName('');
      setNewLabelColor('#3B82F6');
    }
  });

  const updateLabelMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateGlobalLabel(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      setEditingLabel(null);
      setEditName('');
    }
  });

  const deleteLabelMutation = useMutation({
    mutationFn: deleteGlobalLabel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    }
  });

  const addLabelToCardMutation = useMutation({
    mutationFn: ({ labelId }: { labelId: string }) => 
      cardId ? addLabelToCardById(cardId, labelId) : Promise.resolve(),
    onSuccess: () => {
      if (cardId) {
        queryClient.invalidateQueries({ queryKey: ['cards'] });
      }
    }
  });

  const removeLabelFromCardMutation = useMutation({
    mutationFn: ({ labelId }: { labelId: string }) => 
      cardId ? removeLabelFromCardById(cardId, labelId) : Promise.resolve(),
    onSuccess: () => {
      if (cardId) {
        queryClient.invalidateQueries({ queryKey: ['cards'] });
      }
    }
  });

  useEffect(() => {
    setLocalSelectedIds(selectedLabelIds);
  }, [selectedLabelIds]);

  const labels = labelsQuery.data || [];
  const filteredLabels = labels.filter(label => 
    label.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLabel = (labelId: string) => {
    const newSelection = localSelectedIds.includes(labelId)
      ? localSelectedIds.filter(id => id !== labelId)
      : [...localSelectedIds, labelId];
    
    setLocalSelectedIds(newSelection);
    onLabelsChange?.(newSelection);
    
    // If we have a cardId, also update the card's labels
    if (cardId) {
      if (localSelectedIds.includes(labelId)) {
        removeLabelFromCardMutation.mutate({ labelId });
      } else {
        addLabelToCardMutation.mutate({ labelId });
      }
    }
  };

  const handleCreateLabel = () => {
    if (newLabelName.trim()) {
      createLabelMutation.mutate({ name: newLabelName, color: newLabelColor });
    }
  };

  const handleEditLabel = (labelId: string, currentName: string) => {
    setEditingLabel(labelId);
    setEditName(currentName);
  };

  const handleSaveEdit = () => {
    if (editingLabel && editName.trim()) {
      updateLabelMutation.mutate({ id: editingLabel, name: editName });
    }
  };

  const handleDeleteLabel = (labelId: string) => {
    if (confirm('Are you sure you want to delete this label? This action cannot be undone.')) {
      deleteLabelMutation.mutate(labelId);
      // Remove from local selection if it was selected
      if (localSelectedIds.includes(labelId)) {
        const newSelection = localSelectedIds.filter(id => id !== labelId);
        setLocalSelectedIds(newSelection);
        onLabelsChange?.(newSelection);
      }
    }
  };

  const predefinedColors = [
    '#22C55E', '#A3A833', '#D2691E', '#CD853F', '#DC143C', '#8A2BE2',
    '#4169E1', '#1E90FF', '#20B2AA', '#FFD700', '#FF6347', '#DDA0DD'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white rounded-lg w-96 max-w-90vw max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Labels</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search labels..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Labels List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-300 mb-2 px-2">Labels</div>
            
            {filteredLabels.map((label) => (
              <div
                key={label.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-md group"
              >
                {/* Checkbox */}
                <div 
                  className={`w-4 h-4 border border-gray-500 rounded flex items-center justify-center cursor-pointer ${
                    localSelectedIds.includes(label.id) ? 'bg-blue-500 border-blue-500' : ''
                  }`}
                  onClick={() => toggleLabel(label.id)}
                >
                  {localSelectedIds.includes(label.id) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>

                {/* Label */}
                <div 
                  className={`flex-1 px-3 py-2 rounded-md text-white font-medium flex items-center justify-between cursor-pointer ${
                    label.name ? '' : 'opacity-80'
                  }`}
                  style={{ backgroundColor: label.color }}
                  onClick={() => toggleLabel(label.id)}
                >
                  {editingLabel === label.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') setEditingLabel(null);
                      }}
                      onBlur={handleSaveEdit}
                      className="bg-transparent border-none outline-none text-white placeholder-gray-200"
                      placeholder="Enter label name"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span>
                      {label.name || (colorblindMode ? `Color: ${label.color}` : '')}
                      {!label.name && !colorblindMode && <span className="text-xs opacity-70">Color: {label.color.toUpperCase()}</span>}
                    </span>
                  )}
                  
                  {/* Action buttons */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditLabel(label.id, label.name);
                      }}
                      className="p-1 hover:bg-black hover:bg-opacity-20 rounded"
                      title="Edit label"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLabel(label.id);
                      }}
                      className="p-1 hover:bg-black hover:bg-opacity-20 rounded text-red-300 hover:text-red-200"
                      title="Delete label"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-700 p-4 space-y-3">
          {/* Create New Label */}
          {isCreatingNew ? (
            <div className="space-y-3">
              <input
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Enter label name"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Color selection */}
              <div 
                className="w-full h-12 rounded-md border-2 border-gray-600 cursor-pointer"
                style={{ backgroundColor: newLabelColor }}
                onClick={() => {
                  // Simple color rotation for demo
                  const currentIndex = predefinedColors.indexOf(newLabelColor);
                  const nextIndex = (currentIndex + 1) % predefinedColors.length;
                  setNewLabelColor(predefinedColors[nextIndex]);
                }}
              />
              
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateLabel}
                  disabled={!newLabelName.trim() || createLabelMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setIsCreatingNew(false);
                    setNewLabelName('');
                    setNewLabelColor('#3B82F6');
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="w-full text-left text-gray-300 hover:text-white py-2 text-sm"
            >
              Create a new label
            </button>
          )}

          <button
            onClick={() => {/* Show more labels logic */}}
            className="w-full text-left text-gray-300 hover:text-white py-2 text-sm"
          >
            Show more labels
          </button>

          {/* Colorblind friendly mode toggle */}
          <button
            onClick={() => setColorblindMode(!colorblindMode)}
            className="w-full text-left text-gray-300 hover:text-white py-2 text-sm"
          >
            {colorblindMode ? 'Disable' : 'Enable'} colorblind friendly mode
          </button>
        </div>
      </div>
    </div>
  );
}