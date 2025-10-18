import type { ListRow } from '@/types/dto';

// Default lists for new users


// (Optional) Demo/offline mode helpers below. Not used in Supabase mode.
// const STORAGE_KEY = 'todo-app-lists';
// function loadLists(): ListRow[] { ... }
// function saveLists(lists: ListRow[]): void { ... }
// let demoLists: ListRow[] = loadLists();


import { supabase } from '@/app/supabaseClient';

export async function getListsByBoard(boardId: string): Promise<ListRow[]> {
  // Fetch lists for a board from Supabase
  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('board_id', boardId)
    .order('position', { ascending: true });
  if (error) {
    console.error('Error fetching lists:', error);
    return [];
  }
  return data || [];
}

export async function createList(boardId: string, name: string): Promise<ListRow> {
  // Get the highest position for the board
  const { data: existingLists } = await supabase
    .from('lists')
    .select('position')
    .eq('board_id', boardId)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = existingLists && existingLists.length > 0
    ? (existingLists[0].position || 0) + 1000
    : 1000;

  // Ensure we set the owner of the list so RLS policies that check auth.uid() pass
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user || null;
  if (!user) {
    const err = new Error('User not authenticated - cannot create list');
    console.error(err);
    throw err;
  }

  const { data, error } = await supabase
    .from('lists')
    .insert({
      board_id: boardId,
      name,
      position: nextPosition,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating list:', error);
    throw error;
  }
  return data;
}

export async function moveListToBoard(listId: string, targetBoardId: string): Promise<void> {
  // Update the board_id of the list in Supabase
  const { error } = await supabase
    .from('lists')
    .update({ board_id: targetBoardId, updated_at: new Date().toISOString() })
    .eq('id', listId);
  if (error) {
    console.error('Error moving list to board:', error);
    throw error;
  }
}

export async function updateListPosition(listId: string, position: number): Promise<void> {
  // Update the position of the list in Supabase
  const { error } = await supabase
    .from('lists')
    .update({ position, updated_at: new Date().toISOString() })
    .eq('id', listId);
  if (error) {
    console.error('Error updating list position:', error);
    throw error;
  }
}

export async function deleteList(listId: string): Promise<void> {
  // Only allow deletion if list is in archive board (enforced at UI/business logic layer)
  const { error } = await supabase
    .from('lists')
    .delete()
    .eq('id', listId);
  if (error) {
    console.error('Error deleting list:', error);
    throw error;
  }
}

export async function renameList(listId: string, name: string): Promise<void> {
  // Update the name of the list in Supabase
  const { error } = await supabase
    .from('lists')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', listId);
  if (error) {
    console.error('Error renaming list:', error);
    throw error;
  }
}

export async function archiveList(listId: string): Promise<void> {
  // Move list to archive board in Supabase
  const { error } = await supabase
    .from('lists')
    .update({ board_id: 'archive-board', position: Date.now(), updated_at: new Date().toISOString() })
    .eq('id', listId);
  if (error) {
    console.error('Error archiving list:', error);
    throw error;
  }
}

// Export all functions as a namespace for convenience
export const listsApi = {
  getListsByBoard,
  createList,
  moveListToBoard,
  updateListPosition,
  deleteList,
  archiveList
};