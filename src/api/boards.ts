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
  
  return newBoard;
}

export async function archiveBoard(boardId: string): Promise<void> {
  // Prevent archiving of the archive board
  if (boardId === ARCHIVE_BOARD.id) {
    console.warn('Cannot archive the Archive board');
    return;
  }

  // Get the board to archive
  const boardIndex = sessionBoards.findIndex(board => board.id === boardId);
  if (boardIndex === -1) {
    console.warn('Board not found:', boardId);
    return;
  }

  const boardToArchive = sessionBoards[boardIndex];

  // Import cards API dynamically to avoid circular dependency
  const { createArchivedBoardCard } = await import('./cards');
  
  // Create a card in the "Archived Boards" list representing this board
  await createArchivedBoardCard(boardToArchive);

  // Remove the board from the active boards list
  sessionBoards.splice(boardIndex, 1);
  saveBoards(sessionBoards);
}

export async function unarchiveBoard(boardId: string): Promise<void> {
  // Import cards API dynamically to avoid circular dependency
  const { getCardById, deleteCard } = await import('./cards');
  
  // Find the archived board card
  const archivedCardId = `archived-board-${boardId}`;
  const archivedCard = await getCardById(archivedCardId);
  
  if (!archivedCard || !archivedCard.metadata?.board_data) {
    console.warn('Archived board card not found:', archivedCardId);
    return;
  }
  
  // Restore the board from the card metadata
  const restoredBoard: BoardRow = {
    ...archivedCard.metadata.board_data,
    updated_at: new Date().toISOString(),
  };
  
  // Add back to active boards
  sessionBoards.push(restoredBoard);
  saveBoards(sessionBoards);
  
  // Delete the archived board card
  await deleteCard(archivedCardId);
}

export async function getArchivedBoards(_userId: string): Promise<BoardRow[]> {
  // Get archived boards from the archived board cards in the archive board
  const { getCardsByList } = await import('./cards');
  
  try {
    const archivedBoardCards = await getCardsByList('archive-list-3');
    
    // Convert cards back to board objects
    const boards: BoardRow[] = archivedBoardCards
      .filter((card: any) => card.metadata?.board_data)
      .map((card: any) => ({
        ...card.metadata!.board_data,
        archived: true,
        updated_at: card.metadata!.archived_at || card.updated_at,
      }));
    
    return boards;
  } catch (error) {
    console.warn('Failed to get archived boards:', error);
    return [];
  }
}

export async function updateBoardName(boardId: string, name: string): Promise<void> {
  // Update localStorage only - no Supabase to avoid errors
  const boardIndex = sessionBoards.findIndex(board => board.id === boardId);
  if (boardIndex !== -1) {
    sessionBoards[boardIndex].name = name;
    saveBoards(sessionBoards);
  }
}

export async function updateBoardPosition(boardId: string, position: number): Promise<void> {
  // Update localStorage only - no Supabase to avoid errors
  const boardIndex = sessionBoards.findIndex(board => board.id === boardId);
  if (boardIndex !== -1) {
    sessionBoards[boardIndex].position = position;
    sessionBoards[boardIndex].updated_at = new Date().toISOString();
    saveBoards(sessionBoards);
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
