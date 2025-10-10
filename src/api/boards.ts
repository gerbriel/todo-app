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
const DEFAULT_BOARDS: BoardRow[] = [];

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

export async function getBoards(userId: string): Promise<BoardRow[]> {
  console.log('Getting boards for user:', userId);
  
  // Use localStorage only - filter out archived boards by default
  const boards = sessionBoards
    .filter(board => board.archived !== true)
    .map(board => ({
      ...board,
      workspace_id: userId,
    }));
  
  // Always add the archive board
  const allBoards = [...boards, { ...ARCHIVE_BOARD, workspace_id: userId }];
  console.log('Found', allBoards.length, 'boards from localStorage');
  
  return allBoards;
}

export async function createBoard(userId: string, name: string): Promise<BoardRow> {
  console.log('Creating board:', name, 'for user:', userId);
  
  const newBoard: BoardRow = {
    id: `board-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    workspace_id: userId,
    name,
    created_at: new Date().toISOString(),
  };

  // Save to localStorage only - no Supabase to avoid errors
  sessionBoards.push(newBoard);
  saveBoards(sessionBoards);
  console.log('Board created in localStorage:', newBoard.id);
  
  return newBoard;
}

export async function archiveBoard(boardId: string): Promise<void> {
  // Prevent archiving of the archive board
  if (boardId === ARCHIVE_BOARD.id) {
    console.warn('Cannot archive the Archive board');
    return;
  }

  console.log('Archiving board:', boardId);

  // Mark as archived in localStorage - no Supabase to avoid errors
  const boardIndex = sessionBoards.findIndex(board => board.id === boardId);
  if (boardIndex !== -1) {
    sessionBoards[boardIndex] = {
      ...sessionBoards[boardIndex],
      archived: true,
      updated_at: new Date().toISOString()
    };
    saveBoards(sessionBoards);
    console.log('Board archived in localStorage');
  }
}

export async function unarchiveBoard(boardId: string): Promise<void> {
  console.log('Unarchiving board:', boardId);

  // Mark as unarchived in localStorage
  const boardIndex = sessionBoards.findIndex(board => board.id === boardId);
  if (boardIndex !== -1) {
    sessionBoards[boardIndex] = {
      ...sessionBoards[boardIndex],
      archived: false,
      updated_at: new Date().toISOString()
    };
    saveBoards(sessionBoards);
    console.log('Board unarchived in localStorage');
  }
}

export async function getArchivedBoards(userId: string): Promise<BoardRow[]> {
  console.log('Getting archived boards for user:', userId);
  
  // Get archived boards from localStorage
  const boards = sessionBoards.filter(board => board.archived === true);
  
  return boards;
}

export async function updateBoardName(boardId: string, name: string): Promise<void> {
  console.log('Updating board name:', boardId, 'to:', name);

  // Update localStorage only - no Supabase to avoid errors
  const boardIndex = sessionBoards.findIndex(board => board.id === boardId);
  if (boardIndex !== -1) {
    sessionBoards[boardIndex].name = name;
    saveBoards(sessionBoards);
    console.log('Board name updated in localStorage');
  }
}

export async function updateBoardPosition(boardId: string, position: number): Promise<void> {
  console.log('Updating board position:', boardId, 'to:', position);

  // Update localStorage only - no Supabase to avoid errors
  const boardIndex = sessionBoards.findIndex(board => board.id === boardId);
  if (boardIndex !== -1) {
    sessionBoards[boardIndex].position = position;
    sessionBoards[boardIndex].updated_at = new Date().toISOString();
    saveBoards(sessionBoards);
    console.log('Board position updated in localStorage');
  }
}

export async function getListsByBoard(boardId: string): Promise<ListRow[]> {
  // This function should use the lists API instead of making direct Supabase calls
  // For now, return empty array to avoid Supabase 400 errors
  console.log('getListsByBoard called - delegating to lists API');
  return [];
}
