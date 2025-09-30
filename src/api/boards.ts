import { supabase } from '../lib/supabase'
import type { 
  Board, 
  List, 
  CreateBoardData, 
  UpdateBoardData, 
  CreateListData, 
  UpdateListData 
} from '../types'

// Boards API
export const boardsApi = {
  async getBoards(workspaceId: string): Promise<Board[]> {
    const { data, error } = await supabase
      .from('boards')
      .select(`
        *,
        lists:lists (
          *,
          cards:cards (
            *,
            labels:card_labels (
              label:labels (*)
            )
          )
        )
      `)
      .eq('workspace_id', workspaceId)
      .eq('archived', false)
      .order('position')

    if (error) throw error
    return data || []
  },

  async getBoard(id: string): Promise<Board> {
    const { data, error } = await supabase
      .from('boards')
      .select(`
        *,
        lists:lists (
          *,
          cards:cards (
            *,
            labels:card_labels (
              label:labels (*)
            ),
            workflows:checklists (
              *,
              tasks:checklist_items (*)
            ),
            attachments (*),
            custom_field_values:card_custom_field_values (
              *,
              custom_field:custom_fields (*)
            )
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createBoard(data: CreateBoardData): Promise<Board> {
    const { data: board, error } = await supabase
      .from('boards')
      .insert({
        ...data,
        position: 0, // Will be updated by trigger
      })
      .select()
      .single()

    if (error) throw error
    return board
  },

  async updateBoard(id: string, data: UpdateBoardData): Promise<Board> {
    const { data: board, error } = await supabase
      .from('boards')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return board
  },

  async deleteBoard(id: string): Promise<void> {
    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async archiveBoard(id: string): Promise<Board> {
    return this.updateBoard(id, { archived: true })
  },

  async restoreBoard(id: string): Promise<Board> {
    return this.updateBoard(id, { archived: false })
  },
}

// Lists API
export const listsApi = {
  async createList(data: CreateListData): Promise<List> {
    const { data: list, error } = await supabase
      .from('lists')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return list
  },

  async updateList(id: string, data: UpdateListData): Promise<List> {
    const { data: list, error } = await supabase
      .from('lists')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return list
  },

  async deleteList(id: string): Promise<void> {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async reorderLists(boardId: string, listIds: string[]): Promise<void> {
    const updates = listIds.map((id, index) => ({
      id,
      position: index,
    }))

    for (const update of updates) {
      await supabase
        .from('lists')
        .update({ position: update.position })
        .eq('id', update.id)
        .eq('board_id', boardId)
    }
  },
}