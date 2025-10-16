import React, { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Edit } from 'lucide-react';
import type { CardRow } from '@/types/dto';
import CardContextMenu from './card/CardContextMenu';
import EnhancedCardEditModal from './card/EnhancedCardEditModal';
import { updateCard } from '@/api/cards';

interface SortableCardProps {
  card: CardRow;
}

export default function SortableCard({ card }: SortableCardProps) {
  const [showContextMenu, setShowContextMenu] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  
  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
    };

    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showContextMenu]);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', cardId: card.id, listId: card.list_id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

    const handleClick = () => {
    if (showContextMenu) {
      setShowContextMenu(false);
      return;
    }
    
    setIsEditModalOpen(true);
  };

  const handleCardUpdate = async (updatedData: Partial<CardRow>) => {
    try {
      await updateCard(card.id, updatedData);
    } catch (error) {
      console.error('Failed to update card:', error);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(!showContextMenu);
  };

  const overdue = Boolean(card.date_end && new Date(card.date_end) < new Date());

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-md transition-shadow relative ${
        isDragging ? 'opacity-50' : ''
      } ${overdue ? 'border-l-4 border-l-red-500' : ''}`}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="font-medium text-gray-900 dark:text-white flex-1 pr-2">
          {card.title}
        </div>
        
        <div className="flex items-center gap-1">
          {/* Assigned Members - Top Right */}
          {card.assigned_members && card.assigned_members.length > 0 && (
            <div className="flex -space-x-1">
              {card.assigned_members.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className="relative group"
                  title={member.name}
                >
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white dark:border-gray-700 flex items-center justify-center text-white text-xs font-medium">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                </div>
              ))}
              {card.assigned_members.length > 3 && (
                <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white dark:border-gray-700 flex items-center justify-center text-white text-xs font-medium">
                  +{card.assigned_members.length - 3}
                </div>
              )}
            </div>
          )}
          
          {/* Context Menu Button */}
          <button
            className="context-menu-button p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
            onClick={handleContextMenu}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
      
      {card.description && typeof card.description === 'string' && card.description.trim() && (
        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
          {card.description}
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          {card.card_labels && card.card_labels.length > 0 && (
            <div className="flex gap-1">
              {card.card_labels.slice(0, 3).map((label, index) => (
                <div
                  key={index}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: label.labels?.color || '#gray' }}
                />
              ))}
            </div>
          )}
          
          {card.attachments && card.attachments.length > 0 && (
            <span>📎 {card.attachments.length}</span>
          )}
          
          {card.comments && card.comments.length > 0 && (
            <span>💬 {card.comments.length}</span>
          )}
        </div>
        
        {card.date_end && (
          <div className={`text-xs px-2 py-1 rounded ${
            overdue ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
          }`}>
            {new Date(card.date_end).toLocaleDateString()}
          </div>
        )}
      </div>

      {showContextMenu && (
        <div ref={contextMenuRef}>
          <CardContextMenu
            card={card}
            isOpen={showContextMenu}
            onClose={() => setShowContextMenu(false)}
            onEdit={() => setIsEditModalOpen(true)}
          />
        </div>
      )}

      <EnhancedCardEditModal
        card={card}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleCardUpdate}
      />
    </div>
  );
}
