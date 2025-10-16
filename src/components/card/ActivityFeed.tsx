import { useState } from 'react';
import { 
  Clock, Edit, Move, Archive, FileText, Calendar, MapPin, 
  Tag, Paperclip, CheckSquare, Plus, Minus, Check, X,
  AlertCircle, MessageSquare, Trash2, UserPlus, UserMinus
} from 'lucide-react';
import type { CardRow } from '@/types/dto';

// Activity type for better TypeScript support
type Activity = {
  id: string;
  type: 'card_created' | 'card_updated' | 'card_moved' | 'card_archived' | 'card_restored' |
    'title_changed' | 'description_changed' | 'date_start_changed' | 'date_end_changed' |
    'location_changed' | 'member_assigned' | 'member_removed' | 'label_added' | 'label_removed' |
    'attachment_added' | 'attachment_removed' | 'checklist_added' | 'checklist_removed' |
    'checklist_item_added' | 'checklist_item_removed' | 'checklist_item_completed' | 'checklist_item_uncompleted' |
    'checklist_item_due_date_set' | 'checklist_item_due_date_removed' | 'checklist_item_assigned' |
    'checklist_item_unassigned' | 'checklist_item_priority_changed' | 'comment_added' | 'comment_removed';
  meta: {
    old_value?: any;
    new_value?: any;
    field_name?: string;
    target_id?: string;
    target_name?: string;
    details?: string;
  };
  actor_id: string;
  actor_name?: string;
  created_at: string;
};

interface ActivityFeedProps {
  card: CardRow;
  showLimit?: number;
  showActorNames?: boolean;
  compact?: boolean;
}

const ACTIVITY_ICONS: Record<string, React.ComponentType<any>> = {
  // Card level
  card_created: Plus,
  card_updated: Edit,
  card_moved: Move,
  card_archived: Archive,
  card_restored: Archive,
  
  // Field changes
  title_changed: Edit,
  description_changed: FileText,
  date_start_changed: Calendar,
  date_end_changed: Calendar,
  location_changed: MapPin,
  
  // Members
  member_assigned: UserPlus,
  member_removed: UserMinus,
  
  // Labels
  label_added: Tag,
  label_removed: Tag,
  
  // Attachments
  attachment_added: Paperclip,
  attachment_removed: Paperclip,
  
  // Checklists
  checklist_added: CheckSquare,
  checklist_removed: CheckSquare,
  checklist_item_added: Plus,
  checklist_item_removed: Minus,
  checklist_item_completed: Check,
  checklist_item_uncompleted: X,
  checklist_item_due_date_set: Calendar,
  checklist_item_due_date_removed: Calendar,
  checklist_item_assigned: UserPlus,
  checklist_item_unassigned: UserMinus,
  checklist_item_priority_changed: AlertCircle,
  
  // Comments
  comment_added: MessageSquare,
  comment_removed: Trash2,
};

const ACTIVITY_COLORS: Record<string, string> = {
  // Card level - blue
  card_created: 'text-blue-500 bg-blue-50',
  card_updated: 'text-blue-500 bg-blue-50',
  card_moved: 'text-blue-500 bg-blue-50',
  card_archived: 'text-gray-500 bg-gray-50',
  card_restored: 'text-green-500 bg-green-50',
  
  // Field changes - purple
  title_changed: 'text-purple-500 bg-purple-50',
  description_changed: 'text-purple-500 bg-purple-50',
  date_start_changed: 'text-indigo-500 bg-indigo-50',
  date_end_changed: 'text-indigo-500 bg-indigo-50',
  location_changed: 'text-emerald-500 bg-emerald-50',
  
  // Members - orange
  member_assigned: 'text-orange-500 bg-orange-50',
  member_removed: 'text-red-500 bg-red-50',
  
  // Labels - pink
  label_added: 'text-pink-500 bg-pink-50',
  label_removed: 'text-red-500 bg-red-50',
  
  // Attachments - green
  attachment_added: 'text-green-500 bg-green-50',
  attachment_removed: 'text-red-500 bg-red-50',
  
  // Checklists - cyan
  checklist_added: 'text-cyan-500 bg-cyan-50',
  checklist_removed: 'text-red-500 bg-red-50',
  checklist_item_added: 'text-cyan-500 bg-cyan-50',
  checklist_item_removed: 'text-red-500 bg-red-50',
  checklist_item_completed: 'text-green-500 bg-green-50',
  checklist_item_uncompleted: 'text-yellow-500 bg-yellow-50',
  checklist_item_due_date_set: 'text-indigo-500 bg-indigo-50',
  checklist_item_due_date_removed: 'text-gray-500 bg-gray-50',
  checklist_item_assigned: 'text-orange-500 bg-orange-50',
  checklist_item_unassigned: 'text-red-500 bg-red-50',
  checklist_item_priority_changed: 'text-amber-500 bg-amber-50',
  
  // Comments - teal
  comment_added: 'text-teal-500 bg-teal-50',
  comment_removed: 'text-red-500 bg-red-50',
};

function formatActivityMessage(activity: Activity): string {
  const { type, meta } = activity;
  
  switch (type) {
    case 'title_changed':
      return `changed title from "${meta.old_value}" to "${meta.new_value}"`;
    case 'description_changed':
      return meta.new_value ? 'updated description' : 'removed description';
    case 'date_start_changed':
      return meta.new_value 
        ? `set start date to ${new Date(meta.new_value).toLocaleDateString()}`
        : 'removed start date';
    case 'date_end_changed':
      return meta.new_value 
        ? `set end date to ${new Date(meta.new_value).toLocaleDateString()}`
        : 'removed end date';
    case 'location_changed':
      return meta.new_value?.address ? `set location to "${meta.new_value.address}"` : 'updated location';
    case 'member_assigned':
      return `assigned ${meta.target_name} to this card`;
    case 'member_removed':
      return `removed ${meta.target_name} from this card`;
    case 'label_added':
      return `added label "${meta.target_name}"`;
    case 'label_removed':
      return `removed label "${meta.target_name}"`;
    case 'attachment_added':
      return `added attachment "${meta.target_name}"`;
    case 'attachment_removed':
      return `removed attachment "${meta.target_name}"`;
    case 'checklist_added':
      return `added checklist "${meta.target_name}"`;
    case 'checklist_removed':
      return `removed checklist "${meta.target_name}"`;
    case 'checklist_item_added':
      return `added task "${meta.target_name}"`;
    case 'checklist_item_removed':
      return `removed task "${meta.target_name}"`;
    case 'checklist_item_completed':
      return `completed task "${meta.target_name}"`;
    case 'checklist_item_uncompleted':
      return `uncompleted task "${meta.target_name}"`;
    case 'checklist_item_due_date_set':
      return `set due date for "${meta.target_name}" to ${new Date(meta.new_value).toLocaleDateString()}`;
    case 'checklist_item_due_date_removed':
      return `removed due date from "${meta.target_name}"`;
    case 'checklist_item_assigned':
      return meta.details || `assigned task "${meta.target_name}"`;
    case 'checklist_item_unassigned':
      return `unassigned task "${meta.target_name}"`;
    case 'checklist_item_priority_changed':
      return `changed priority of "${meta.target_name}" to ${meta.new_value}`;
    case 'comment_added':
      return `added a comment`;
    case 'comment_removed':
      return `removed a comment`;
    default:
      return meta.details || `performed ${type.replace(/_/g, ' ')}`;
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}

export default function ActivityFeed({ 
  card, 
  showLimit = 10, 
  showActorNames = true, 
  compact = false 
}: ActivityFeedProps) {
  const [showAll, setShowAll] = useState(false);
  
  const activities = card.activity || [];
  const displayedActivities = showAll ? activities : activities.slice(0, showLimit);
  const hasMore = activities.length > showLimit;
  
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {displayedActivities.map((activity) => {
        const IconComponent = ACTIVITY_ICONS[activity.type] || Edit;
        const colorClass = ACTIVITY_COLORS[activity.type] || 'text-gray-500 bg-gray-50';
        
        return (
          <div key={activity.id} className={`flex items-start space-x-3 ${compact ? 'py-1' : 'py-2'}`}>
            {/* Icon */}
            <div className={`p-1.5 rounded-full ${colorClass}`}>
              <IconComponent className="w-3 h-3" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className={`text-sm ${compact ? 'leading-tight' : ''}`}>
                <span className="text-gray-900 dark:text-gray-100">
                  {showActorNames && activity.actor_name && (
                    <span className="font-medium">{activity.actor_name} </span>
                  )}
                  <span className="text-gray-700 dark:text-gray-300">
                    {formatActivityMessage(activity)}
                  </span>
                </span>
              </div>
              
              {!compact && (
                <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(activity.created_at)}</span>
                </div>
              )}
            </div>
            
            {compact && (
              <div className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                {formatTimeAgo(activity.created_at)}
              </div>
            )}
          </div>
        );
      })}
      
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 px-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
        >
          Show {activities.length - showLimit} more activities
        </button>
      )}
      
      {showAll && hasMore && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full py-2 px-3 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-md transition-colors"
        >
          Show less
        </button>
      )}
    </div>
  );
}