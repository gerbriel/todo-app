import { getSupabase } from '@/app/supabaseClient';
import type { ListRow } from '@/types/dto';
import type { ID } from '@/types/models';

// Check if we're in guest mode
const isGuestMode = (boardId?: string) => {
  try {
    // If board ID is from guest boards, we're definitely in guest mode
    if (boardId === 'board-1' || boardId === 'board-2') {
      return true;
    }
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return !supabaseUrl || supabaseUrl === 'your-supabase-url';
  } catch {
    return true;
  }
};

export async function getListsByBoard(boardId: string): Promise<ListRow[]> {
  if (isGuestMode(boardId)) {
    return getMockLists(boardId);
  }
  
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true });

    if (error) {
      console.warn('Database error, falling back to mock data:', error.message);
      return getMockLists(boardId);
    }
    
    return data || [];
  } catch (error) {
    console.warn('Failed to fetch lists, using mock data:', error);
    return getMockLists(boardId);
  }
}

export async function createList(boardId: string, name: string): Promise<ListRow> {
  if (isGuestMode(boardId)) {
    return addMockList({ board_id: boardId, name });
  }
  
  const supabase = getSupabase();
  
  // Get next position
  const { data: lastList } = await supabase
    .from('lists')
    .select('position')
    .eq('board_id', boardId)
    .order('position', { ascending: false })
    .limit(1);
    
  const position = (lastList?.[0]?.position ?? 0) + 1000;
  
  const { data, error } = await supabase
    .from('lists')
    .insert({ board_id: boardId, name, position })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function moveListToBoard(listId: string, targetBoardId: string): Promise<void> {
  // Check if this is a mock list ID or target board
  const allMockLists = getMockLists('board-1').concat(getMockLists('board-2'));
  const isMockList = allMockLists.some(list => list.id === listId);
  
  if (isGuestMode(targetBoardId) || isMockList) {
    // For guest mode, implement mock list move
    updateMockListBoard(listId, targetBoardId);
    return;
  }
  
  const supabase = getSupabase();
  
  // Get next position in target board
  const { data: lastList } = await supabase
    .from('lists')
    .select('position')
    .eq('board_id', targetBoardId)
    .order('position', { ascending: false })
    .limit(1);
    
  const position = (lastList?.[0]?.position ?? 0) + 1000;
  
  const { error } = await supabase
    .from('lists')
    .update({ 
      board_id: targetBoardId,
      position 
    })
    .eq('id', listId);
    
  if (error) throw error;
}

export async function deleteList(listId: string): Promise<void> {
  // Check if this is a mock list ID
  const allMockLists = getMockLists('board-1').concat(getMockLists('board-2'));
  const isMockList = allMockLists.some(list => list.id === listId);
  
  if (isGuestMode() || isMockList) {
    deleteMockList(listId);
    return;
  }
  
  const supabase = getSupabase();
  const { error } = await supabase
    .from('lists')
    .delete()
    .eq('id', listId);
    
  if (error) throw error;
}

export async function renameList(listId: string, name: string): Promise<void> {
  // Check if this is a mock list ID
  const allMockLists = getMockLists('board-1').concat(getMockLists('board-2'));
  const isMockList = allMockLists.some(list => list.id === listId);
  
  if (isGuestMode() || isMockList) {
    console.warn('List rename not implemented in guest mode');
    return;
  }
  
  const supabase = getSupabase();
  const { error } = await supabase
    .from('lists')
    .update({ name })
    .eq('id', listId);
    
  if (error) throw error;
}

export async function archiveList(listId: string): Promise<void> {
  // Check if this is a mock list ID
  const allMockLists = getMockLists('board-1').concat(getMockLists('board-2'));
  const isMockList = allMockLists.some(list => list.id === listId);
  
  if (isGuestMode() || isMockList) {
    console.warn('List archive not implemented in guest mode');
    return;
  }
  
  const supabase = getSupabase();
  const { error } = await supabase
    .from('lists')
    .update({ archived: true })
    .eq('id', listId);
    
  if (error) throw error;
}
