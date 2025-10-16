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
  // Always reload from localStorage to ensure we get the latest data
  sessionBoards = loadBoards();
  
  // Use localStorage only - filter out archived boards by default
  const boards = sessionBoards
    .filter(board => board.archived !== true)
    .map(board => ({
      ...board,
      workspace_id: userId,
    }));
  
  // Always add the archive board
  const allBoards = [...boards, { ...ARCHIVE_BOARD, workspace_id: userId }];
  
  return allBoards;
}

export async function getBoard(boardId: string): Promise<BoardRow | null> {
  // Check if it's the archive board
  if (boardId === 'archive-board') {
    return ARCHIVE_BOARD;
  }
  
  // Always reload from localStorage to ensure we get the latest data
  sessionBoards = loadBoards();
  
  // Find in session boards
  const board = sessionBoards.find(b => b.id === boardId);
  return board || null;
}

export async function createBoard(userId: string, name: string): Promise<BoardRow> {
  const newBoard: BoardRow = {
    id: `board-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    workspace_id: userId,
    name,
    created_at: new Date().toISOString(),
  };

  // Save to localStorage only - no Supabase to avoid errors
  sessionBoards.push(newBoard);
  saveBoards(sessionBoards);
  
  // Reload sessionBoards from localStorage to ensure consistency
  sessionBoards = loadBoards();
  
  return newBoard;
}

export async function deleteBoard(boardId: string): Promise<void> {
  // Prevent deleting the archive board
  if (boardId === ARCHIVE_BOARD.id) {
    console.warn('Cannot delete the Archive board');
    return;
  }

  // Get the board to delete
  const boardIndex = sessionBoards.findIndex(board => board.id === boardId);
  if (boardIndex === -1) {
    console.warn('Board not found:', boardId);
    return;
  }

  const boardToDelete = sessionBoards[boardIndex];
  console.log('�️ Deleting board:', boardToDelete.name, '(ID:', boardId, ')');

  // Remove the board from the active boards list
  sessionBoards.splice(boardIndex, 1);
  saveBoards(sessionBoards);
  console.log('💾 Deleted board and saved to localStorage');
  
  // Reload sessionBoards from localStorage to ensure consistency
  sessionBoards = loadBoards();
  console.log('🔄 Reloaded boards from localStorage. Active boards:', sessionBoards.length);
}

// Keep archiveBoard as an alias for backwards compatibility
export async function archiveBoard(boardId: string): Promise<void> {
  return deleteBoard(boardId);
}

export async function updateBoardName(boardId: string, name: string): Promise<void> {
  // Update localStorage only - no Supabase to avoid errors
  const boardIndex = sessionBoards.findIndex(board => board.id === boardId);
  if (boardIndex !== -1) {
    sessionBoards[boardIndex].name = name;
    saveBoards(sessionBoards);
    // Reload sessionBoards from localStorage to ensure consistency
    sessionBoards = loadBoards();
  }
}

export async function updateBoardPosition(boardId: string, position: number): Promise<void> {
  // Update localStorage only - no Supabase to avoid errors
  const boardIndex = sessionBoards.findIndex(board => board.id === boardId);
  if (boardIndex !== -1) {
    sessionBoards[boardIndex].position = position;
    sessionBoards[boardIndex].updated_at = new Date().toISOString();
    saveBoards(sessionBoards);
    // Reload sessionBoards from localStorage to ensure consistency
    sessionBoards = loadBoards();
  }
}

export async function getListsByBoard(_boardId: string): Promise<ListRow[]> {
  // This function should use the lists API instead of making direct Supabase calls
  // For now, return empty array to avoid Supabase 400 errors
  return [];
}

export async function getBoardsByUser(userId: string): Promise<BoardRow[]> {
  // Get boards where the user is a member or owner
  // For now, return all boards for any user (localStorage-based)
  return getBoards(userId);
}
