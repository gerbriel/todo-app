export type ID = string;

export type Workspace = { 
  id: ID; 
  name: string; 
  created_at?: string;
  updated_at?: string;
};

export type Board = {
  id: ID; 
  workspace_id: ID; 
  name: string; 
  background_url?: string;
  created_at?: string;
  updated_at?: string;
};

export type List = {
  id: ID; 
  board_id: ID; 
  name: string; 
  position: number;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Label = { 
  id: ID; 
  workspace_id: ID; 
  name: string; 
  color: string;
  created_at?: string;
};

export type CustomFieldDef = {
  id: ID; 
  workspace_id: ID; 
  name: string;
  type: 'text'|'email'|'phone'|'number'|'checkbox'|'select'|'date';
  options?: string[];
  created_at?: string;
};

export type Card = {
  id: ID; 
  workspace_id: ID; 
  board_id: ID; 
  list_id: ID;
  title: string;
  description?: unknown; // rich text JSON
  date_start?: string; 
  date_end?: string;
  labels: ID[]; 
  members: ID[];
  location?: { 
    address?: string; 
    lat?: number; 
    lon?: number; 
    place_id?: string; 
  };
  position: number;
  archived?: boolean;
  created_by?: ID;
  created_at?: string;
  updated_at?: string;
};

export type Task = {
  id: ID;
  checklist_id: ID;
  text: string;
  done: boolean;
  position: number;
  created_at?: string;
  updated_at?: string;
};

export type User = {
  id: ID;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
};

export type WorkspaceMember = {
  id: ID;
  workspace_id: ID;
  user_id: ID;
  role: 'admin' | 'member' | 'viewer';
  created_at?: string;
};

export type Comment = {
  id: ID;
  card_id: ID;
  author_id: ID;
  body: string;
  created_at: string;
  updated_at?: string;
};

export type Attachment = {
  id: ID;
  card_id: ID;
  name: string;
  url: string;
  mime: string;
  size: number;
  created_at: string;
};

export type Activity = {
  id: ID;
  workspace_id: ID;
  board_id?: ID;
  card_id?: ID;
  actor_id: ID;
  type: string;
  meta: Record<string, any>;
  created_at: string;
};