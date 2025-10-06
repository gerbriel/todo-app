import type { BoardRow, ListRow, CardRow } from '@/types/dto';

// Mock data for guest users
export const MOCK_BOARDS: BoardRow[] = [
  {
    id: 'board-2', 
    workspace_id: 'guest-workspace',
    name: 'Personal Tasks',
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'archive-board',
    workspace_id: 'guest-workspace',
    name: 'Archive',
    created_at: '2025-01-01T00:00:00.000Z',
  },
];

export const MOCK_LISTS: ListRow[] = [
  {
    id: 'list-1',
    board_id: 'board-1',
    name: 'To Do',
    position: 1000,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'list-2',
    board_id: 'board-1', 
    name: 'In Progress',
    position: 2000,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'list-3',
    board_id: 'board-1',
    name: 'Done',
    position: 3000,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'list-personal-1',
    board_id: 'board-2',
    name: 'Personal To Do',
    position: 1000,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'archive-list-1',
    board_id: 'archive-board',
    name: 'Archived Items',
    position: 1000,
    created_at: '2025-01-01T00:00:00.000Z',
  },
];

export const MOCK_CARDS: CardRow[] = [
  {
    id: 'card-1',
    workspace_id: 'guest-workspace',
    board_id: 'board-1',
    list_id: 'list-1',
    title: 'Welcome to the Demo!',
    description: 'This is a sample card to show how the app works. Click to edit!',
    position: 1000,
    created_by: 'guest',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    date_start: '2025-10-06',
    date_end: '2025-10-08',
  },
  {
    id: 'card-2',
    workspace_id: 'guest-workspace',
    board_id: 'board-1',
    list_id: 'list-1',
    title: 'Try dragging cards between lists',
    description: 'Drag and drop functionality is fully working!',
    position: 2000,
    created_by: 'guest',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    date_start: null,
    date_end: '2025-10-15',
  },
  {
    id: 'card-3',
    workspace_id: 'guest-workspace',
    board_id: 'board-1',
    list_id: 'list-2',
    title: 'Sample card in progress',
    description: 'This card is in the "In Progress" list',
    position: 1000,
    created_by: 'guest',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    date_start: '2025-10-10',
    date_end: '2025-10-12',
  },
  {
    id: 'card-4',
    workspace_id: 'guest-workspace',
    board_id: 'board-1',
    list_id: 'list-3',
    title: 'Completed task example',
    description: 'This task has been completed!',
    position: 1000,
    created_by: 'guest',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    date_start: null,
    date_end: '2025-10-05',
  },
  {
    id: 'card-5',
    workspace_id: 'guest-workspace',
    board_id: 'board-2',
    list_id: 'list-personal-1',
    title: 'Personal Task Example',
    description: 'This is a task from Personal Tasks board',
    position: 1000,
    created_by: 'guest',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    date_start: '2025-10-07',
    date_end: '2025-10-09',
  },
];

// In-memory storage for guest session
let guestBoards = [...MOCK_BOARDS];
let guestLists = [...MOCK_LISTS];
let guestCards = [...MOCK_CARDS];

export const getMockBoards = (): BoardRow[] => guestBoards;
export const getMockLists = (boardId: string): ListRow[] => 
  guestLists.filter(list => list.board_id === boardId);
export const getMockCards = (boardId: string): CardRow[] =>
  guestCards.filter(card => card.board_id === boardId);

export const addMockCard = (card: Partial<CardRow>): CardRow => {
  const newCard: CardRow = {
    id: `card-${Date.now()}`,
    workspace_id: 'guest-workspace',
    board_id: card.board_id || 'board-1',
    list_id: card.list_id || 'list-1',
    title: card.title || 'New Card',
    description: card.description || null,
    position: card.position || Date.now(),
    created_by: 'guest',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    date_start: card.date_start || null,
    date_end: card.date_end || null,
  };
  guestCards.push(newCard);
  return newCard;
};

export const addMockBoard = (board: Partial<BoardRow>): BoardRow => {
  const newBoard: BoardRow = {
    id: `board-${Date.now()}`,
    workspace_id: 'guest-workspace',
    name: board.name || 'New Board',
    created_at: new Date().toISOString(),
  };
  guestBoards.push(newBoard);
  return newBoard;
};

export const addMockList = (list: Partial<ListRow>): ListRow => {
  const newList: ListRow = {
    id: `list-${Date.now()}`,
    board_id: list.board_id || 'board-1',
    name: list.name || 'New List',
    position: list.position || Date.now(),
    created_at: new Date().toISOString(),
  };
  guestLists.push(newList);
  return newList;
};

export const updateMockCard = (cardId: string, updates: Partial<CardRow>): CardRow | null => {
  const cardIndex = guestCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    guestCards[cardIndex] = {
      ...guestCards[cardIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return guestCards[cardIndex];
  }
  return null;
};

export const updateMockCardPosition = (cardId: string, listId: string, position: number): void => {
  const cardIndex = guestCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    guestCards[cardIndex] = {
      ...guestCards[cardIndex],
      list_id: listId,
      position,
      updated_at: new Date().toISOString(),
    };
  }
};

export const updateMockCardBoard = (cardId: string, boardId: string): void => {
  const cardIndex = guestCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    guestCards[cardIndex] = {
      ...guestCards[cardIndex],
      board_id: boardId,
      updated_at: new Date().toISOString(),
    };
  }
};

export const deleteMockCard = (cardId: string): void => {
  const cardIndex = guestCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    guestCards.splice(cardIndex, 1);
  }
};

export const updateMockListBoard = (listId: string, boardId: string): void => {
  const listIndex = guestLists.findIndex(list => list.id === listId);
  if (listIndex !== -1) {
    guestLists[listIndex] = {
      ...guestLists[listIndex],
      board_id: boardId,
    };
  }
};

export const deleteMockList = (listId: string): void => {
  const listIndex = guestLists.findIndex(list => list.id === listId);
  if (listIndex !== -1) {
    guestLists.splice(listIndex, 1);
  }
  
  // Also remove all cards in this list
  guestCards = guestCards.filter(card => card.list_id !== listId);
};
