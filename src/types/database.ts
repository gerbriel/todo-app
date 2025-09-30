export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          owner_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          owner_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          owner_id?: string
        }
      }
      boards: {
        Row: {
          id: string
          workspace_id: string
          name: string
          description: string | null
          position: number
          archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          description?: string | null
          position: number
          archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          description?: string | null
          position?: number
          archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      lists: {
        Row: {
          id: string
          board_id: string
          name: string
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          board_id: string
          name: string
          position: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          board_id?: string
          name?: string
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          list_id: string
          title: string
          description: string | null
          position: number
          date_start: string | null
          date_end: string | null
          archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          list_id: string
          title: string
          description?: string | null
          position: number
          date_start?: string | null
          date_end?: string | null
          archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          title?: string
          description?: string | null
          position?: number
          date_start?: string | null
          date_end?: string | null
          archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      labels: {
        Row: {
          id: string
          workspace_id: string
          name: string
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          color: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      custom_fields: {
        Row: {
          id: string
          workspace_id: string
          name: string
          field_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          field_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          field_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      checklists: {
        Row: {
          id: string
          card_id: string
          title: string
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          card_id: string
          title?: string
          position: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          title?: string
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      checklist_items: {
        Row: {
          id: string
          checklist_id: string
          text: string
          done: boolean
          position: number
          due_date: string | null
          assigned_to: string | null
          reminder_date: string | null
          reminder_interval: string | null
          reminder_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          checklist_id: string
          text: string
          done?: boolean
          position: number
          due_date?: string | null
          assigned_to?: string | null
          reminder_date?: string | null
          reminder_interval?: string | null
          reminder_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          checklist_id?: string
          text?: string
          done?: boolean
          position?: number
          due_date?: string | null
          assigned_to?: string | null
          reminder_date?: string | null
          reminder_interval?: string | null
          reminder_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      card_labels: {
        Row: {
          card_id: string
          label_id: string
        }
        Insert: {
          card_id: string
          label_id: string
        }
        Update: {
          card_id?: string
          label_id?: string
        }
      }
      card_custom_field_values: {
        Row: {
          card_id: string
          custom_field_id: string
          value: string | null
        }
        Insert: {
          card_id: string
          custom_field_id: string
          value?: string | null
        }
        Update: {
          card_id?: string
          custom_field_id?: string
          value?: string | null
        }
      }
      attachments: {
        Row: {
          id: string
          card_id: string
          filename: string
          file_path: string
          file_size: number
          mime_type: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          id?: string
          card_id: string
          filename: string
          file_path: string
          file_size: number
          mime_type: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          id?: string
          card_id?: string
          filename?: string
          file_path?: string
          file_size?: number
          mime_type?: string
          uploaded_at?: string
          uploaded_by?: string
        }
      }
      activity: {
        Row: {
          id: string
          card_id: string
          user_id: string
          action: string
          details: string | null
          created_at: string
        }
        Insert: {
          id?: string
          card_id: string
          user_id: string
          action: string
          details?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          user_id?: string
          action?: string
          details?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}