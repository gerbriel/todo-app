import type { ListRow } from '@/types/dto';

// Default lists for new users
const DEFAULT_LISTS: ListRow[] = [
  {
    id: 'demo-list-1',
    board_id: 'demo-board-1',
    name: 'To Do',
    position: 1000,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-list-2',
    board_id: 'demo-board-1',
    name: 'In Progress',
    position: 2000,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-list-3',
    board_id: 'demo-board-1',
    name: 'Done',
    position: 3000,
    created_at: new Date().toISOString(),
  },
  // Add lists for board-1 (mock data board)
  {
    id: 'list-1',
    board_id: 'board-1',
    name: 'To Do',
    position: 1000,
    created_at: new Date().toISOString(),
  },
  {
    id: 'list-2',
    board_id: 'board-1',
    name: 'In Progress',
    position: 2000,
    created_at: new Date().toISOString(),
  },
  {
    id: 'list-3',
    board_id: 'board-1',
    name: 'Done',
    position: 3000,
    created_at: new Date().toISOString(),
  },
  // Archive board lists
  {
    id: 'archive-list-1',
    board_id: 'archive-board',
    name: 'Archived Cards',
    position: 1000,
    created_at: new Date().toISOString(),
  },
  {
    id: 'archive-list-2',
    board_id: 'archive-board',
    name: 'Archived Lists',
    position: 2000,
    created_at: new Date().toISOString(),
  },
  {
    id: 'archive-list-3',
    board_id: 'archive-board',
    name: 'Archived Boards',
    position: 3000,
    created_at: new Date().toISOString(),
  },
];

// Persistent storage functions
const STORAGE_KEY = 'todo-app-lists';

function loadLists(): ListRow[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Failed to load lists from localStorage:', error);
  }
  return [...DEFAULT_LISTS];
}

function saveLists(lists: ListRow[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch (error) {
    console.warn('Failed to save lists to localStorage:', error);
  }
}

// Initialize with persisted data
let demoLists: ListRow[] = loadLists();

export async function getListsByBoard(boardId: string): Promise<ListRow[]> {
  // Always use mock mode for now to avoid database errors
  const filteredLists = demoLists.filter(list => list.board_id === boardId);
  return filteredLists;
}

export async function createList(boardId: string, name: string): Promise<ListRow> {
  // Always use mock mode for now to avoid database errors
  const position = Math.max(...demoLists.map(l => l.position), 0) + 1000;
  const newList: ListRow = {
    id: `list-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    board_id: boardId,
    name,
    position,
    created_at: new Date().toISOString(),
  };
  demoLists.push(newList);
  saveLists(demoLists); // Persist to localStorage
  return newList;
}

export async function moveListToBoard(listId: string, targetBoardId: string): Promise<void> {
  // Always use mock mode for now
  const listIndex = demoLists.findIndex(list => list.id === listId);
  if (listIndex >= 0) {
    demoLists[listIndex].board_id = targetBoardId;
    saveLists(demoLists); // Persist to localStorage
  }
}

export async function updateListPosition(listId: string, position: number): Promise<void> {
  // Use mock data - find and update list position
  const listIndex = demoLists.findIndex(list => list.id === listId);
  if (listIndex >= 0) {
    demoLists[listIndex].position = position;
    saveLists(demoLists); // Persist to localStorage
  }
}

export async function deleteList(listId: string): Promise<void> {
  // Only allow deletion if list is in archive board
  const listIndex = demoLists.findIndex(list => list.id === listId);
  if (listIndex >= 0) {
    const list = demoLists[listIndex];
    if (list.board_id === 'archive-board') {
      demoLists.splice(listIndex, 1);
      saveLists(demoLists); // Persist to localStorage
    } else {
      throw new Error('Lists must be archived before they can be deleted');
    }
  }
}

export async function renameList(listId: string, name: string): Promise<void> {
  // Use mock data - find and update list name
  const listIndex = demoLists.findIndex(list => list.id === listId);
  if (listIndex >= 0) {
    demoLists[listIndex].name = name;
    saveLists(demoLists); // Persist to localStorage
  }
}

export async function archiveList(listId: string): Promise<void> {
  // Move list to archive board
  const listIndex = demoLists.findIndex(list => list.id === listId);
  if (listIndex >= 0) {
    demoLists[listIndex] = {
      ...demoLists[listIndex],
      board_id: 'archive-board',
      position: Date.now(),
    };
    saveLists(demoLists); // Persist to localStorage
  }
}

// Export all functions as a namespace for convenience
export const listsApi = {
  getListsByBoard,
  createList,
  moveListToBoard,
  updateListPosition,
  deleteList,
  renameList,
  archiveList
};