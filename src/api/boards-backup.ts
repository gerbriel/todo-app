import { getSupabase } from '@/app/supabaseClient';
import type { BoardRow, ListRow } from '@/types/dto';

// Storage key for localStorage
const STORAGE_KEY = 'todo-app-boards';

// Archive board - always present and cannot be deleted
const ARCHIVE_BOARD: BoardRow = {
  id: 'archive-board',
  workspace_id: 'guest-workspace',
  name: 'Archive',
  created_at: new Date().toISOString(),
};

// Default starter boards for new users
const DEFAULT_BOARDS: BoardRow[] = [
  {
    id: 'board-1',
    workspace_id: 'guest-workspace',
    name: 'Sample Project Board',
    created_at: new Date().toISOString(),
  },
];

// Load boards from localStorage
function loadBoards(): BoardRow[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return [...DEFAULT_BOARDS]; // Return default boards if none saved
  } catch (error) {
    console.warn('Failed to load boards from localStorage:', error);
    return [...DEFAULT_BOARDS];
  }
}

// Save boards to localStorage
function saveBoards(boards: BoardRow[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  } catch (error) {
    console.warn('Failed to save boards to localStorage:', error);
  }
}

// In-memory storage that syncs with localStorage
let sessionBoards: BoardRow[] = loadBoards();

// Archive board - always present and cannot be deleted
const ARCHIVE_BOARD: BoardRow = {
  id: 'archive-board',
  workspace_id: 'user-workspace', 
  name: 'Archive',
  created_at: new Date().toISOString(),
};

// In-memory storage for demo mode
let demoBoards: BoardRow[] = [...FALLBACK_BOARDS];
let isDemoMode = false;

// Check if we're in demo mode (user ID starts with 'demo-user')
function checkDemoMode(userId: string): boolean {
  return userId.startsWith('demo-user');
}

export async function getBoards(userId: string): Promise<BoardRow[]> {
  // Check if we're in demo mode
  if (checkDemoMode(userId)) {
    console.log('Demo mode: returning demo boards');
    const boards = demoBoards.map(board => ({
      ...board,
      workspace_id: userId,
      id: `${userId}-${board.id}`,
    }));
    
    // Always add the archive board
    const archiveBoard = {
      ...ARCHIVE_BOARD,
      workspace_id: userId,
      id: 'archive-board',
    };
    
    return [...boards, archiveBoard];
  }

  try {
    const supabase = getSupabase();
    // 1. Find all workspaces for this user
    const { data: workspaces } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', userId);

    if (!workspaces || workspaces.length === 0) {
      // No workspaces found, fallback to old logic (try boards with workspace_id = userId)
      let { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('workspace_id', userId)
        .order('name');
      if (error || !data) {
        // Fallback to fallback boards + archive board
        const boards = FALLBACK_BOARDS.map(board => ({
          ...board,
          workspace_id: userId,
          id: `${userId}-${board.id}`,
        }));
        
        const archiveBoard = {
          ...ARCHIVE_BOARD,
          workspace_id: userId,
          id: 'archive-board',
        };
        
        return [...boards, archiveBoard];
      }
      
      // Add archive board to regular boards
      const archiveBoard = {
        ...ARCHIVE_BOARD,
        workspace_id: userId,
        id: 'archive-board',
      };
      
      return [...data, archiveBoard];
    }

    // 2. Fetch all boards for these workspace ids
    const workspaceIds = workspaces.map(w => w.id);
    let { data: boards, error: boardsError } = await supabase
      .from('boards')
      .select('*')
      .in('workspace_id', workspaceIds)
      .order('name');

    if (boardsError || !boards) {
      // Fallback to fallback boards + archive board
      const fallbackBoards = FALLBACK_BOARDS.map(board => ({
        ...board,
        workspace_id: userId,
        id: `${userId}-${board.id}`,
      }));
      
      const archiveBoard = {
        ...ARCHIVE_BOARD,
        workspace_id: userId,
        id: 'archive-board',
      };
      
      return [...fallbackBoards, archiveBoard];
    }
    
    // Add archive board to regular boards
    const archiveBoard = {
      ...ARCHIVE_BOARD,
      workspace_id: userId,
      id: 'archive-board',
    };
    
    return [...boards, archiveBoard];
  } catch (error) {
    console.warn('Failed to fetch boards, using fallback:', error);
    const fallbackBoards = FALLBACK_BOARDS.map(board => ({
      ...board,
      workspace_id: userId,
      id: `${userId}-${board.id}`,
    }));
    
    const archiveBoard = {
      ...ARCHIVE_BOARD,
      workspace_id: userId,
      id: 'archive-board',
    };
    
    return [...fallbackBoards, archiveBoard];
  }
}

export async function createBoard(userId: string, name: string): Promise<BoardRow> {
  // Handle demo mode
  if (checkDemoMode(userId)) {
    console.log('Demo mode: creating demo board');
    const newBoard: BoardRow = {
      id: `${userId}-board-${Date.now()}`,
      workspace_id: userId,
      name,
      created_at: new Date().toISOString(),
    };
    demoBoards.push(newBoard);
    return newBoard;
  }

  try {
    const supabase = getSupabase();
    // 1. Find an existing workspace for this user

    let { data: workspaces } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', userId)
      .limit(1);

    let workspaceId: string = workspaces && workspaces.length > 0 ? workspaces[0].id : '';

    // 2. If no workspace, create one
    if (!workspaceId) {
      const { data: newWorkspace, error: createWSError } = await supabase
        .from('workspaces')
        .insert({ name: 'My Workspace', owner_id: userId })
        .select('id')
        .single();
      if (createWSError || !newWorkspace) {
        throw new Error('Could not create workspace for user');
      }
      workspaceId = newWorkspace.id;
    }

    // 3. Now create the board with the valid workspace_id
    const boardId = crypto.randomUUID();
    const { data, error } = await supabase
      .from('boards')
      .insert({
        id: boardId,
        workspace_id: workspaceId,
        name,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.warn('Database insert failed, creating fallback board:', error.message);
      return {
        id: boardId,
        workspace_id: workspaceId,
        name,
        created_at: new Date().toISOString(),
      };
    }
    return data;
  } catch (error) {
    console.warn('Failed to create board, returning fallback:', error);
    const fallbackId = crypto.randomUUID();
    return {
      id: fallbackId,
      workspace_id: userId,
      name,
      created_at: new Date().toISOString(),
    };
  }
}

export async function archiveBoard(boardId: string): Promise<void> {
  // Prevent deletion of the permanent Archive board
  if (boardId === ARCHIVE_BOARD.id) {
    console.warn('Cannot delete the Archive board - it is permanent');
    throw new Error('Cannot delete the Archive board');
  }

  // Handle demo mode
  if (boardId.includes('demo-user')) {
    console.log('Demo mode: archiving demo board');
    demoBoards = demoBoards.filter(board => board.id !== boardId);
    return;
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', boardId);
      
    if (error) {
      console.warn('Failed to archive board:', error.message);
    }
  } catch (error) {
    console.warn('Archive board operation failed:', error);
  }
}

export async function updateBoardName(boardId: string, name: string): Promise<void> {
  // Handle demo mode
  if (boardId.includes('demo-user')) {
    console.log('Demo mode: updating demo board name');
    const boardIndex = demoBoards.findIndex(board => board.id === boardId);
    if (boardIndex !== -1) {
      demoBoards[boardIndex] = { ...demoBoards[boardIndex], name };
    }
    return;
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('boards')
      .update({ name })
      .eq('id', boardId);
      
    if (error) {
      console.warn('Failed to update board name:', error.message);
    }
  } catch (error) {
    console.warn('Update board name operation failed:', error);
  }
}

export async function getListsByBoard(boardId: string): Promise<ListRow[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('board_id', boardId)
      .order('position');
      
    if (error) {
      console.warn('Failed to fetch lists, returning empty array:', error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.warn('Failed to fetch lists:', error);
    return [];
  }
}
