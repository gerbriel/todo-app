import type { BoardRow, ListRow } from '@/types/dto';
import { supabase } from '@/app/supabaseClient';

// Archive board - always present and cannot be deleted
const ARCHIVE_BOARD: BoardRow = {
  id: 'archive-board',
  workspace_id: 'guest-workspace',
  name: 'Archive',
  created_at: new Date().toISOString(),
};

export async function getBoards(userId: string): Promise<BoardRow[]> {
  try {
    console.log('📡 Fetching boards from Supabase for user:', userId);
    
    // Fetch non-archived boards from Supabase
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('workspace_id', userId)
      .eq('archived', false)
      .order('position', { ascending: true });

    if (error) {
      console.error('❌ Error fetching boards:', error);
      throw error;
    }

    console.log('✅ Fetched', data?.length || 0, 'boards from Supabase');

    // Add the archive board
    const allBoards = [...(data || []), { ...ARCHIVE_BOARD, workspace_id: userId }];
    return allBoards;
  } catch (error) {
    console.error('❌ Failed to fetch boards:', error);
    return [{ ...ARCHIVE_BOARD, workspace_id: userId }];
  }
}

export async function getArchivedBoards(userId: string): Promise<BoardRow[]> {
  try {
    console.log('📡 Fetching archived boards from Supabase for user:', userId);
    
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('workspace_id', userId)
      .eq('archived', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching archived boards:', error);
      throw error;
    }

    console.log('✅ Fetched', data?.length || 0, 'archived boards from Supabase');
    return data || [];
  } catch (error) {
    console.error('❌ Failed to fetch archived boards:', error);
    return [];
  }
}

export async function getBoard(boardId: string): Promise<BoardRow | null> {
  // Check if it's the archive board
  if (boardId === 'archive-board') {
    return ARCHIVE_BOARD;
  }

  try {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('id', boardId)
      .single();

    if (error) {
      console.error('Error fetching board:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch board:', error);
    return null;
  }
}

export async function createBoard(userId: string, name: string): Promise<BoardRow> {
  try {
    console.log('🆕 Creating board:', name, 'for user:', userId);
    
    // Get the highest position
    const { data: existingBoards } = await supabase
      .from('boards')
      .select('position')
      .eq('workspace_id', userId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = existingBoards && existingBoards.length > 0 
      ? (existingBoards[0].position || 0) + 1000 
      : 1000;

    const { data, error } = await supabase
      .from('boards')
      .insert({
        workspace_id: userId,
        name,
        position: nextPosition,
        archived: false,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating board:', error);
      throw error;
    }

    console.log('✅ Board created successfully:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to create board:', error);
    throw error;
  }
}

export async function deleteBoard(boardId: string): Promise<void> {
  // Prevent deleting the archive board
  if (boardId === ARCHIVE_BOARD.id) {
    console.warn('Cannot delete the Archive board');
    return;
  }

  try {
    console.log('🗑️ Deleting board:', boardId);
    
    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', boardId);

    if (error) {
      console.error('❌ Error deleting board:', error);
      throw error;
    }

    console.log('✅ Board deleted successfully');
  } catch (error) {
    console.error('❌ Failed to delete board:', error);
    throw error;
  }
}

// Keep archiveBoard as an alias for backwards compatibility
export async function archiveBoard(boardId: string): Promise<void> {
  // Prevent archiving the archive board
  if (boardId === ARCHIVE_BOARD.id) {
    console.warn('Cannot archive the Archive board');
    return;
  }

  try {
    console.log('📦 Archiving board:', boardId);
    
    const { error } = await supabase
      .from('boards')
      .update({ archived: true, updated_at: new Date().toISOString() })
      .eq('id', boardId);

    if (error) {
      console.error('❌ Error archiving board:', error);
      throw error;
    }

    console.log('✅ Board archived successfully');
  } catch (error) {
    console.error('❌ Failed to archive board:', error);
    throw error;
  }
}

export async function updateBoardName(boardId: string, name: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('boards')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', boardId);

    if (error) {
      console.error('Error updating board name:', error);
      throw error;
    }
    
    console.log('✅ Board name updated');
  } catch (error) {
    console.error('Failed to update board name:', error);
    throw error;
  }
}

export async function updateBoardPosition(boardId: string, position: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('boards')
      .update({ position, updated_at: new Date().toISOString() })
      .eq('id', boardId);

    if (error) {
      console.error('Error updating board position:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to update board position:', error);
    throw error;
  }
}

export async function getListsByBoard(_boardId: string): Promise<ListRow[]> {
  // This function should use the lists API instead of making direct Supabase calls
  // For now, return empty array to avoid Supabase 400 errors
  return [];
}

export async function getBoardsByUser(userId: string): Promise<BoardRow[]> {
  // Get boards where the user is a member or owner
  return getBoards(userId);
}
