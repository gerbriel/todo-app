import { useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface LabelCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
  initialColor?: string;
  onLabelCreated?: (label: { id: string; name: string; color: string }) => void;
}

export default function LabelCreationModal({ 
  isOpen, 
  onClose, 
  initialName = '',
  initialColor = '#3B82F6',
  onLabelCreated 
}: LabelCreationModalProps) {
  const [labelName, setLabelName] = useState(initialName);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const queryClient = useQueryClient();

  const predefinedColors = [
    // Green variants
    '#22C55E', '#16A34A', '#15803D', '#166534',
    // Yellow/Gold variants  
    '#EAB308', '#CA8A04', '#A16207', '#92400E',
    // Orange variants
    '#F97316', '#EA580C', '#DC2626', '#B91C1C',
    // Red variants
    '#EF4444', '#DC2626', '#B91C1C', '#991B1B',
    // Purple variants
    '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6',
    // Blue variants
    '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF',
    // Teal/Cyan variants
    '#06B6D4', '#0891B2', '#0E7490', '#155E75',
    // More blues
    '#0EA5E9', '#0284C7', '#0369A1', '#075985',
    // Light variants
    '#84CC16', '#65A30D', '#4D7C0F', '#365314',
    // Pink variants
    '#EC4899', '#DB2777', '#BE185D', '#9D174D',
    // Additional colors
    '#10B981', '#059669', '#047857', '#065F46'
  ];

  const createLabelMutation = useMutation({
    mutationFn: async (newLabel: { name: string; color: string }) => {
      // Mock API call - replace with actual implementation
      const label = {
        id: `label-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        name: newLabel.name,
        color: newLabel.color,
        workspace_id: 'ws-1',
        created_at: new Date().toISOString()
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return label;
    },
    onSuccess: (newLabel) => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      onLabelCreated?.(newLabel);
      handleClose();
    }
  });

  const handleClose = () => {
    setLabelName(initialName);
    setSelectedColor(initialColor);
    onClose();
  };

  const handleCreate = () => {
    if (labelName.trim()) {
      createLabelMutation.mutate({ name: labelName.trim(), color: selectedColor });
    }
  };

  const handleRemoveColor = () => {
    setSelectedColor('#6B7280'); // Gray color as "no color"
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white rounded-lg w-96 max-w-90vw max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">Create label</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="p-4">
          <div 
            className="w-full h-16 rounded-md flex items-center justify-center text-white font-medium"
            style={{ backgroundColor: selectedColor }}
          >
            {labelName || 'Label preview'}
          </div>
        </div>

        {/* Title Input */}
        <div className="px-4 pb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={labelName}
            onChange={(e) => setLabelName(e.target.value)}
            placeholder="Enter label title"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={50}
          />
        </div>

        {/* Color Selection */}
        <div className="px-4 pb-4">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Select a color
          </label>
          
          {/* Color Grid */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {predefinedColors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-12 h-12 rounded-md border-2 hover:scale-105 transition-transform ${
                  selectedColor === color 
                    ? 'border-white border-4' 
                    : 'border-gray-600 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          {/* Remove Color Option */}
          <button
            onClick={handleRemoveColor}
            className="w-full text-left text-red-400 hover:text-red-300 py-2 text-sm flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Remove color</span>
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4">
          <button
            onClick={handleCreate}
            disabled={!labelName.trim() || createLabelMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            {createLabelMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}