// DTOs and API shapes
export type Paginated<T> = { data: T[]; nextCursor?: string | null };

export type ListRow = {
  id: string;
  board_id: string;
  name: string;
  position: number;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CardRow = {
  id: string;
  workspace_id: string;
  board_id: string;
  list_id: string;
  title: string;
  description: unknown | null;
  date_start: string | null;
  date_end: string | null;
  position: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived?: boolean;
  // Optional metadata for special card types (e.g., archived boards)
  metadata?: {
    original_board_id?: string;
    archived_at?: string;
    board_data?: any;
    [key: string]: any;
  };
  // Optional location
  location_lat?: number | null;
  location_lng?: number | null;
  location_address?: string | null;
  // Optional nested relation for previews
  card_field_values?: Array<{
    field_id: string;
    value: any;
    // Supabase embed may return an array; tolerate both
    custom_field_defs?: { name: string } | { name: string }[];
  }>;
  // Optional nested labels via card_labels -> labels
  card_labels?: Array<{
    label_id: string;
    labels?: { id: string; name: string; color: string };
  }>;
  // Optional attachments
  attachments?: Array<{
    id: string;
    name?: string;
    url: string;
    mime: string;
    size?: number;
    created_at: string;
  }>;
  // Optional assigned members
  assigned_members?: Array<{
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    assigned_at: string;
  }>;
  // Optional comments count
  comments?: Array<{
    id: string;
    author_id: string;
    created_at: string;
  }>;
  // Optional checklists with items
  checklists?: Array<{
    id: string;
    title?: string;
    position?: number;
    checklist_items?: Array<{
      id: string;
      text?: string;
      done: boolean;
      position?: number;
      // Enhanced checklist items with dates and assignments
      due_date?: string | null;
      start_date?: string | null;
      assigned_to?: string | null;
      assigned_member_name?: string | null;
      priority?: 'low' | 'medium' | 'high' | null;
      created_at?: string;
      completed_at?: string | null;
      // Label support for checklist items
      labels?: Array<{
        id: string;
        name: string;
        color: string;
      }>;
    }>;
  }>;
  // Optional activity log
  activity?: Array<{
    id: string;
    type: 'card_created' | 'card_updated' | 'card_moved' | 'card_archived' | 'card_restored' |
          'title_changed' | 'description_changed' | 'date_start_changed' | 'date_end_changed' |
          'location_changed' | 'member_assigned' | 'member_removed' | 'label_added' | 'label_removed' |
          'attachment_added' | 'attachment_removed' | 'checklist_added' | 'checklist_removed' |
          'checklist_item_added' | 'checklist_item_removed' | 'checklist_item_completed' | 'checklist_item_uncompleted' |
          'checklist_item_due_date_set' | 'checklist_item_due_date_removed' | 'checklist_item_assigned' |
          'checklist_item_unassigned' | 'checklist_item_priority_changed' | 'checklist_item_start_date_set' |
          'checklist_item_start_date_removed' | 'checklist_item_label_added' | 'checklist_item_label_removed' |
          'comment_added' | 'comment_removed';
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
  }>;
  // AI-generated ad copy sections
  ad_copies?: Array<{
    id: string;
    title: string;
    platform: 'facebook' | 'google' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'custom';
    graphics_copy: string;
    subheadline: string;
    description: string;
    primary_text: string;
    generated_at: string;
    ai_model_used?: string;
    is_approved?: boolean;
    position?: number;
  }>;
  // Optional human-friendly fields used in UI
  labels_simple?: Array<{ id: string; name: string; color: string } | string>;
  members_simple?: Array<{ id: string; name?: string } | string>;
};

export type BoardRow = {
  id: string;
  workspace_id: string;
  name: string;
  background_url?: string | null;
  position?: number;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
  description?: string | null;
  // UI sometimes expects a lists array on board rows
  lists?: any;
};

export type LabelRow = {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  created_at?: string;
};

export type UserRow = {
  id: string;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
};

export type WorkspaceRow = {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

export type CustomFieldDefRow = {
  id: string;
  workspace_id: string;
  name: string;
  type: 'text'|'textarea'|'email'|'phone'|'number'|'currency'|'checkbox'|'select'|'multi-select'|'date';
  options?: string[] | null;
  created_at?: string;
};

export type CommentRow = {
  id: string;
  card_id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at?: string;
};

export type AttachmentRow = {
  id: string;
  card_id: string;
  name: string;
  url: string;
  mime: string;
  size: number;
  created_at: string;
};