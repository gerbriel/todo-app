import { supabase } from '../lib/supabase'
import type { 
  Card, 
  CreateCardData, 
  UpdateCardData,
  Activity
} from '../types'

export const cardsApi = {
  async getCard(id: string): Promise<Card> {
    const { data, error } = await supabase
      .from('cards')
      .select(`
        *,
        labels:card_labels (
          label:labels (*)
        ),
        workflows:checklists (
          *,
          tasks:checklist_items (
            *,
            assigned_user:profiles!checklist_items_assigned_to_fkey (
              id,
              email,
              name,
              avatar_url
            )
          )
        ),
        attachments (*),
        custom_field_values:card_custom_field_values (
          *,
          custom_field:custom_fields (*)
        ),
        activity (
          *,
          user:profiles!activity_user_id_fkey (
            id,
            email,
            name,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createCard(data: CreateCardData): Promise<Card> {
    const { data: card, error } = await supabase
      .from('cards')
      .insert(data)
      .select()
      .single()

    if (error) throw error

    // Log activity
    await this.logActivity(card.id, 'created', `Created card "${card.title}"`)

    return card
  },

  async updateCard(id: string, data: UpdateCardData): Promise<Card> {
    const { data: card, error } = await supabase
      .from('cards')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Log activity for significant changes
    if (data.title) {
      await this.logActivity(id, 'updated', `Changed title to "${data.title}"`)
    }
    if (data.list_id) {
      await this.logActivity(id, 'moved', 'Moved to another list')
    }
    if (data.archived !== undefined) {
      await this.logActivity(id, data.archived ? 'archived' : 'restored', 
        data.archived ? 'Archived card' : 'Restored card')
    }

    return card
  },

  async deleteCard(id: string): Promise<void> {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async archiveCard(id: string): Promise<Card> {
    return this.updateCard(id, { archived: true })
  },

  async restoreCard(id: string, listId: string): Promise<Card> {
    return this.updateCard(id, { archived: false, list_id: listId })
  },

  async moveCard(id: string, listId: string, position: number): Promise<Card> {
    return this.updateCard(id, { list_id: listId, position })
  },

  async reorderCards(listId: string, cardIds: string[]): Promise<void> {
    const updates = cardIds.map((id, index) => ({
      id,
      position: index,
    }))

    for (const update of updates) {
      await supabase
        .from('cards')
        .update({ position: update.position })
        .eq('id', update.id)
        .eq('list_id', listId)
    }
  },

  async addLabel(cardId: string, labelId: string): Promise<void> {
    const { error } = await supabase
      .from('card_labels')
      .insert({ card_id: cardId, label_id: labelId })

    if (error) throw error
    await this.logActivity(cardId, 'label_added', 'Added label')
  },

  async removeLabel(cardId: string, labelId: string): Promise<void> {
    const { error } = await supabase
      .from('card_labels')
      .delete()
      .eq('card_id', cardId)
      .eq('label_id', labelId)

    if (error) throw error
    await this.logActivity(cardId, 'label_removed', 'Removed label')
  },

  async setCustomFieldValue(
    cardId: string, 
    customFieldId: string, 
    value: string
  ): Promise<void> {
    const { error } = await supabase
      .from('card_custom_field_values')
      .upsert({
        card_id: cardId,
        custom_field_id: customFieldId,
        value,
      })

    if (error) throw error
    await this.logActivity(cardId, 'custom_field_updated', 'Updated custom field')
  },

  async logActivity(
    cardId: string, 
    action: string, 
    details?: string
  ): Promise<Activity> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('activity')
      .insert({
        card_id: cardId,
        user_id: user.id,
        action,
        details,
      })
      .select(`
        *,
        user:profiles!activity_user_id_fkey (
          id,
          email,
          name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error
    return data
  },

  async getArchivedCards(boardId?: string): Promise<Card[]> {
    let query = supabase
      .from('cards')
      .select(`
        *,
        list:lists!inner (
          id,
          name,
          board:boards!inner (
            id,
            name,
            workspace_id
          )
        )
      `)
      .eq('archived', true)

    if (boardId) {
      query = query.eq('lists.board_id', boardId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },
}