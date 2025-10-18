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
  description?: string;
  // nested relations are intentionally typed as any to reduce strictness across the codebase
  lists?: any;
  created_at?: string;
  updated_at?: string;
};

// list type defined later (kept single definition)

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
  field_type?: 'text'|'textarea'|'email'|'phone'|'number'|'currency'|'checkbox'|'select'|'multi-select'|'date'|'url';
  options?: string[];
  required?: boolean;
  default_value?: string;
  placeholder?: string;
  help_text?: string;
  created_at?: string;
};

export type Card = {
  id: ID; 
  workspace_id: ID; 
  board_id: ID; 
  list_id: ID;
  title: string;
  description?: string | unknown; // rich text JSON
  status?: 'not-started' | 'in-progress' | 'done' | string;
  priority?: 'low' | 'medium' | 'high' | string;
  date_start?: string; 
  date_end?: string;
  // labels and members can be either ids or richer objects across the codebase
  labels: any[];
  members: any[];
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

export type List = {
  id: ID; 
  board_id: ID; 
  name: string; 
  position: number;
  cards?: any;
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
  details?: string;
  action?: string;
  created_at: string;
};

// Additional types used elsewhere in the app (minimal shapes)
export type CustomField = CustomFieldDef;
export type CustomFieldValue = {
  id?: ID;
  card_id: ID;
  custom_field_id: ID;
  value: string | string[] | null;
  created_at?: string;
  // allow loose shapes from different storage backends
  [key: string]: any;
};

export type CreateCustomFieldData = Omit<CustomField, 'id' | 'created_at'>;
export type UpdateCustomFieldData = Partial<CreateCustomFieldData>;
export type CustomFieldType = CustomFieldDef['field_type'];

export type CardSection = {
  id: ID;
  card_id: ID;
  section_type: string;
  content?: any;
  title?: string;
  collapsed?: boolean;
  full_address?: string;
};

export type Address = {
  address?: string;
  full_address?: string;
  lat?: number;
  lon?: number;
};

export type TimeEntry = {
  id: ID;
  card_id?: ID;
  user_id: ID;
  hours: number;
  description?: string;
  created_at?: string;
};

export type CreateTimeEntryData = Omit<TimeEntry, 'id' | 'created_at'>;
