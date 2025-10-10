import { useState, useEffect } from 'react';
import { Search, X, Edit2, Check, Archive, Star, Tag } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Label } from '@/types';

interface AdvancedLabelManagerProps {
  isOpen: boolean;
  onClose: () => void;
  cardId?: string; // If provided, we're managing labels for a specific card
  selectedLabelIds?: string[];
  onLabelsChange?: (labelIds: string[]) => void;
}

interface LabelWithStats extends Label {
  cardCount: number;
  isSelected?: boolean;
}

// Mock data for demonstration - replace with actual API calls
const mockLabels: LabelWithStats[] = [
  { id: 'label-1', name: 'Final Form', color: '#22C55E', workspace_id: 'ws-1', created_at: new Date().toISOString(), cardCount: 12 },
  { id: 'label-2', name: 'Viking Customers', color: '#A3A833', workspace_id: 'ws-1', created_at: new Date().toISOString(), cardCount: 8 },
  { id: 'label-3', name: 'Dealer Order Form', color: '#D2691E', workspace_id: 'ws-1', created_at: new Date().toISOString(), cardCount: 15 },
  { id: 'label-4', name: '', color: '#CD853F', workspace_id: 'ws-1', created_at: new Date().toISOString(), cardCount: 3 },
  { id: 'label-5', name: '', color: '#DC143C', workspace_id: 'ws-1', created_at: new Date().toISOString(), cardCount: 2 },
  { id: 'label-6', name: '', color: '#8A2BE2', workspace_id: 'ws-1', created_at: new Date().toISOString(), cardCount: 5 },
  { id: 'label-7', name: 'QMC Customers', color: '#4169E1', workspace_id: 'ws-1', created_at: new Date().toISOString(), cardCount: 20 },
  { id: 'label-8', name: '', color: '#1E90FF', workspace_id: 'ws-1', created_at: new Date().toISOString(), cardCount: 7 },
];

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
    queryFn: () => Promise.resolve(mockLabels),
    enabled: isOpen
  });

  const createLabelMutation = useMutation({
    mutationFn: async (newLabel: { name: string; color: string }) => {
      // Mock API call
      const label: LabelWithStats = {
        id: `label-${Date.now()}`,
        name: newLabel.name,
        color: newLabel.color,
        workspace_id: 'ws-1',
        created_at: new Date().toISOString(),
        cardCount: 0
      };
      return label;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      setIsCreatingNew(false);
      setNewLabelName('');
      setNewLabelColor('#3B82F6');
    }
  });

  const updateLabelMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      // Mock API call
      console.log('Updating label:', id, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      setEditingLabel(null);
      setEditName('');
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
                className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-md cursor-pointer group"
                onClick={() => toggleLabel(label.id)}
              >
                {/* Checkbox */}
                <div className={`w-4 h-4 border border-gray-500 rounded flex items-center justify-center ${
                  localSelectedIds.includes(label.id) ? 'bg-blue-500 border-blue-500' : ''
                }`}>
                  {localSelectedIds.includes(label.id) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>

                {/* Label */}
                <div 
                  className={`flex-1 px-3 py-2 rounded-md text-white font-medium flex items-center justify-between ${
                    label.name ? '' : 'opacity-80'
                  }`}
                  style={{ backgroundColor: label.color }}
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
                  
                  {/* Edit button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditLabel(label.id, label.name);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black hover:bg-opacity-20 rounded"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
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