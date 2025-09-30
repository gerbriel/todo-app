export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface Board {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  position: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
  lists?: List[];
}

export interface List {
  id: string;
  board_id: string;
  name: string;
  position: number;
  archived?: boolean;
  created_at: string;
  updated_at: string;
  cards?: Card[];
}

export interface Card {
  id: string;
  list_id: string;
  title: string;
  description?: string;
  position: number;
  date_start?: string;
  date_end?: string;
  due_date?: string;
  status?: 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'on-hold';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  archived: boolean;
  created_at: string;
  updated_at: string;
  labels?: Label[];
  members?: User[];
  attachments?: Attachment[];
  workflows?: Workflow[];
  custom_field_values?: CustomFieldValue[];
  activity?: Activity[];
}

export interface Label {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CustomField {
  id: string;
  workspace_id: string;
  name: string;
  field_type: 'text' | 'email' | 'phone' | 'number';
  created_at: string;
  updated_at: string;
}

export interface CustomFieldValue {
  card_id: string;
  custom_field_id: string;
  value: string;
  custom_field?: CustomField;
}

export interface Workflow {
  id: string;
  card_id: string;
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  workflow_id: string;
  text: string;
  done: boolean;
  position: number;
  due_date?: string;
  assigned_to?: string;
  reminder_date?: string;
  reminder_interval?: string;
  reminder_count: number;
  created_at: string;
  updated_at: string;
  assigned_user?: User;
}

export interface Attachment {
  id: string;
  card_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by: string;
  uploader?: User;
}

export interface Activity {
  id: string;
  card_id: string;
  user_id: string;
  action: string;
  details?: string;
  created_at: string;
  user?: User;
}

// Form and API types
export interface CreateBoardData {
  name: string;
  description?: string;
  workspace_id: string;
}

export interface UpdateBoardData {
  name?: string;
  description?: string;
  position?: number;
  archived?: boolean;
}

export interface CreateListData {
  name: string;
  board_id: string;
  position: number;
}

export interface UpdateListData {
  name?: string;
  position?: number;
}

export interface CreateCardData {
  title: string;
  description?: string;
  list_id: string;
  position: number;
  date_start?: string;
  date_end?: string;
}

export interface UpdateCardData {
  title?: string;
  description?: string;
  list_id?: string;
  position?: number;
  date_start?: string;
  date_end?: string;
  archived?: boolean;
}

export interface CreateWorkflowData {
  title: string;
  card_id: string;
  position: number;
}

export interface CreateTaskData {
  text: string;
  workflow_id: string;
  position: number;
  due_date?: string;
  assigned_to?: string;
  reminder_interval?: string;
}

export interface UpdateTaskData {
  text?: string;
  done?: boolean;
  position?: number;
  due_date?: string;
  assigned_to?: string;
  reminder_interval?: string;
}

export interface CreateLabelData {
  name: string;
  color: string;
  workspace_id: string;
}

export interface CreateCustomFieldData {
  name: string;
  field_type: 'text' | 'email' | 'phone' | 'number';
  workspace_id: string;
}

// Drag and drop types
export interface DragEndEvent {
  active: {
    id: string;
    data: {
      current?: {
        type: 'card' | 'list' | 'task';
        card?: Card;
        list?: List;
        task?: Task;
      };
    };
  };
  over: {
    id: string;
    data: {
      current?: {
        type: 'card' | 'list' | 'task';
        accepts?: string[];
      };
    };
  } | null;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
}

// Calendar types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  type: 'card' | 'task';
  card?: Card;
  task?: Task;
}

// Reminder intervals
export const REMINDER_INTERVALS = {
  '15min': '15 minutes',
  '1hr': '1 hour',
  '8hr': '8 hours',
  '24hr': '1 day',
  '48hr': '2 days',
  '72hr': '3 days',
  '1wk': '1 week',
  '1mo': '1 month',
} as const;

export type ReminderInterval = keyof typeof REMINDER_INTERVALS;

// Color options for labels
export const LABEL_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
  '#000000', // black
] as const;

export type LabelColor = typeof LABEL_COLORS[number];