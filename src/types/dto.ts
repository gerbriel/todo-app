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
    }>;
  }>;
  // Optional activity log
  activity?: Array<{
    id: string;
    type: string;
    meta: any;
    actor_id: string;
    created_at: string;
  }>;
};

export type BoardRow = {
  id: string;
  workspace_id: string;
  name: string;
  background_url?: string | null;
  created_at?: string;
  updated_at?: string;
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
  type: 'text'|'email'|'phone'|'number'|'checkbox'|'select'|'date';
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