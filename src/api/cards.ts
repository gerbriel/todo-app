// Cards API - Full implementation with localStorage persistence and complete card features
import type { CardRow } from '@/types/dto';
import type { ID } from '@/types/models';

// Enhanced card type for our implementation
type EnhancedCardRow = CardRow & {
  labels?: Array<{ id: string; name: string; color: string }>;
  checklist_items?: Array<{ id: string; text: string; done: boolean; position: number }>;
  comments?: Array<{ id: string; text: string; author: string; created_at: string }>;
  attachments?: Array<{ id: string; name: string; url: string; mime: string; size: number; created_at: string }>;
};

// Default cards for new users with enhanced features
const DEFAULT_CARDS: CardRow[] = [
  {
    id: 'demo-card-1',
    list_id: 'demo-list-1',
    title: 'Welcome! Try editing this card',
    description: 'This card demonstrates all features. Click to edit and add labels, checklists, comments, and more!',
    position: 1000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    date_start: null,
    date_end: null,
    workspace_id: 'guest-workspace',
    board_id: 'demo-board-1',
    created_by: 'guest-user',
    card_labels: [
      { label_id: 'label-1', labels: { id: 'label-1', name: 'Priority', color: '#ef4444' } }
    ],
    checklists: [
      {
        id: 'checklist-1',
        title: 'Getting Started',
        position: 1,
        checklist_items: [
          { id: 'item-1', text: 'Click to edit this card', done: false, position: 1 },
          { id: 'item-2', text: 'Try adding a new checklist item', done: false, position: 2 },
          { id: 'item-3', text: 'Check off completed items', done: true, position: 3 }
        ]
      }
    ],
    comments: [
      { id: 'comment-1', author_id: 'guest-user', created_at: new Date().toISOString() }
    ]
  },
  {
    id: 'demo-card-2',
    list_id: 'demo-list-2',
    title: 'Drag cards between lists',
    description: 'You can drag and drop cards to reorganize them!',
    position: 1000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    date_start: null,
    date_end: '2025-01-15',
    workspace_id: 'guest-workspace',
    board_id: 'demo-board-1',
    created_by: 'guest-user',
  },
  // Cards for board-1 (mock data board)
  {
    id: 'card-1',
    list_id: 'list-1',
    title: 'Welcome to the Demo!',
    description: 'This is a sample card to show how the app works. Click to edit!',
    position: 1000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    date_start: null,
    date_end: null,
    workspace_id: 'guest-workspace',
    board_id: 'board-1',
    created_by: 'guest-user',
  },
  {
    id: 'card-2',
    list_id: 'list-1',
    title: 'Try dragging cards between lists',
    description: 'Drag and drop functionality is fully working!',
    position: 2000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    date_start: null,
    date_end: '2025-01-15',
    workspace_id: 'guest-workspace',
    board_id: 'board-1',
    created_by: 'guest-user',
  },
  {
    id: 'card-3',
    list_id: 'list-2',
    title: 'Sample card in progress',
    description: 'This card is in the "In Progress" list',
    position: 1000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    date_start: null,
    date_end: null,
    workspace_id: 'guest-workspace',
    board_id: 'board-1',
    created_by: 'guest-user',
  },
  {
    id: 'card-4',
    list_id: 'list-3',
    title: 'Completed task example',
    description: 'This task has been completed!',
    position: 1000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    date_start: null,
    date_end: null,
    workspace_id: 'guest-workspace',
    board_id: 'board-1',
    created_by: 'guest-user',
  },
];

// Persistent storage functions
const STORAGE_KEY = 'todo-app-cards';

function loadCards(): CardRow[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Failed to load cards from localStorage:', error);
  }
  return [...DEFAULT_CARDS];
}

function saveCards(cards: CardRow[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (error) {
    console.warn('Failed to save cards to localStorage:', error);
  }
}

// Initialize with persisted data
let sessionCards: CardRow[] = loadCards();

export async function getCardsByBoard(boardId: string): Promise<CardRow[]> {
  console.log('Getting cards for board:', boardId);
  const filteredCards = sessionCards.filter(card => card.board_id === boardId);
  console.log('Found', filteredCards.length, 'cards for board:', boardId);
  return filteredCards;
}

export async function createCardInList(listId: string, title: string): Promise<CardRow> {
  console.log('Creating card in list:', listId, 'with title:', title);
  
  // Find which board this list belongs to by checking saved lists
  let boardId = 'guest-board'; // fallback
  
  try {
    const savedLists = localStorage.getItem('todo-app-lists');
    if (savedLists) {
      const lists = JSON.parse(savedLists);
      const targetList = lists.find((list: any) => list.id === listId);
      if (targetList) {
        boardId = targetList.board_id;
      }
    }
  } catch (error) {
    console.warn('Could not find board ID for list:', listId);
  }
  
  const position = Date.now();
  
  const newCard: CardRow = {
    id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    list_id: listId,
    title,
    description: null,
    position,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    date_start: null,
    date_end: null,
    workspace_id: 'guest-workspace',
    board_id: boardId,
    created_by: 'guest-user',
  };
  
  sessionCards.push(newCard);
  saveCards(sessionCards); // Persist to localStorage
  console.log('Card created successfully:', newCard.id, 'for board:', boardId);
  return newCard;
}

export async function createCardInBoard(boardId: string, title: string): Promise<CardRow> {
  return createCardInList(`${boardId}-list-1`, title);
}

export async function getCardById(cardId: string): Promise<CardRow | null> {
  return sessionCards.find(card => card.id === cardId) || null;
}

export async function updateCard(cardId: string, updates: Partial<CardRow>): Promise<CardRow> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex === -1) {
    throw new Error('Card not found');
  }
  
  sessionCards[cardIndex] = {
    ...sessionCards[cardIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  saveCards(sessionCards); // Persist to localStorage
  return sessionCards[cardIndex];
}

export async function updateCardPosition(cardId: string, listId: string, position: number): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    sessionCards[cardIndex] = {
      ...sessionCards[cardIndex],
      list_id: listId,
      position,
      updated_at: new Date().toISOString(),
    };
    saveCards(sessionCards); // Persist to localStorage
  }
}

export async function deleteCard(cardId: string): Promise<void> {
  // Only allow deletion if card is in archive board
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    if (card.board_id === 'archive-board') {
      sessionCards.splice(cardIndex, 1);
      saveCards(sessionCards); // Persist to localStorage
    } else {
      throw new Error('Cards must be archived before they can be deleted');
    }
  }
}

export async function moveCardToBoard(cardId: string, targetBoardId: string, targetListId?: string): Promise<void> {
  console.log('Moving card to board:', cardId, targetBoardId, targetListId);
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    let finalListId = targetListId;
    
    // If no specific list provided, find the first list in the target board
    if (!finalListId) {
      try {
        const savedLists = localStorage.getItem('todo-app-lists');
        if (savedLists) {
          const lists = JSON.parse(savedLists);
          const targetBoardLists = lists.filter((list: any) => list.board_id === targetBoardId);
          if (targetBoardLists.length > 0) {
            finalListId = targetBoardLists[0].id;
          }
        }
      } catch (error) {
        console.warn('Could not find lists for target board:', targetBoardId);
      }
      
      // Fallback if no lists found
      if (!finalListId) {
        finalListId = `${targetBoardId}-list-1`;
      }
    }
    
    // Update the card's board_id and list_id
    sessionCards[cardIndex] = {
      ...sessionCards[cardIndex],
      board_id: targetBoardId,
      list_id: finalListId,
      position: Date.now(), // Put at end of list
      updated_at: new Date().toISOString(),
    };
    saveCards(sessionCards); // Persist to localStorage
    console.log('Card moved successfully to board:', targetBoardId, 'list:', finalListId);
  }
}

export async function archiveCard(cardId: string): Promise<void> {
  // Move card to archive board
  await moveCardToBoard(cardId, 'archive-board', 'archive-list-1');
}

export async function getArchivedCards(boardId: string): Promise<CardRow[]> {
  // Return cards from the archive board
  if (boardId === 'archive-board') {
    return sessionCards.filter(card => card.board_id === 'archive-board');
  }
  return [];
}

// === LABEL MANAGEMENT ===
export async function addLabelToCard(cardId: string, label: { id?: string; name: string; color: string }): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const labelId = label.id || `label-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const card = sessionCards[cardIndex];
    
    if (!card.card_labels) {
      card.card_labels = [];
    }
    
    // Check if label already exists
    const existingLabel = card.card_labels.find(cl => cl.labels?.name === label.name);
    if (!existingLabel) {
      card.card_labels.push({
        label_id: labelId,
        labels: { id: labelId, name: label.name, color: label.color }
      });
      
      sessionCards[cardIndex] = { ...card, updated_at: new Date().toISOString() };
      saveCards(sessionCards);
    }
  }
}

export async function removeLabelFromCard(cardId: string, labelId: string): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    if (card.card_labels) {
      card.card_labels = card.card_labels.filter(cl => cl.label_id !== labelId);
      sessionCards[cardIndex] = { ...card, updated_at: new Date().toISOString() };
      saveCards(sessionCards);
    }
  }
}

// === CHECKLIST MANAGEMENT ===
export async function addChecklistToCard(cardId: string, title: string): Promise<string> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const checklistId = `checklist-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const card = sessionCards[cardIndex];
    
    if (!card.checklists) {
      card.checklists = [];
    }
    
    card.checklists.push({
      id: checklistId,
      title,
      position: card.checklists.length + 1,
      checklist_items: []
    });
    
    sessionCards[cardIndex] = { ...card, updated_at: new Date().toISOString() };
    saveCards(sessionCards);
    return checklistId;
  }
  throw new Error('Card not found');
}

export async function removeChecklistFromCard(cardId: string, checklistId: string): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    if (card.checklists) {
      card.checklists = card.checklists.filter(cl => cl.id !== checklistId);
      sessionCards[cardIndex] = { ...card, updated_at: new Date().toISOString() };
      saveCards(sessionCards);
    }
  }
}

export async function addChecklistItem(cardId: string, checklistId: string, text: string): Promise<string> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    const checklist = card.checklists?.find(cl => cl.id === checklistId);
    if (checklist) {
      const itemId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      
      if (!checklist.checklist_items) {
        checklist.checklist_items = [];
      }
      
      checklist.checklist_items.push({
        id: itemId,
        text,
        done: false,
        position: checklist.checklist_items.length + 1
      });
      
      sessionCards[cardIndex] = { ...card, updated_at: new Date().toISOString() };
      saveCards(sessionCards);
      return itemId;
    }
  }
  throw new Error('Card or checklist not found');
}

export async function toggleChecklistItem(cardId: string, checklistId: string, itemId: string): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    const checklist = card.checklists?.find(cl => cl.id === checklistId);
    const item = checklist?.checklist_items?.find(item => item.id === itemId);
    
    if (item) {
      item.done = !item.done;
      sessionCards[cardIndex] = { ...card, updated_at: new Date().toISOString() };
      saveCards(sessionCards);
    }
  }
}

export async function removeChecklistItem(cardId: string, checklistId: string, itemId: string): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    const checklist = card.checklists?.find(cl => cl.id === checklistId);
    
    if (checklist && checklist.checklist_items) {
      checklist.checklist_items = checklist.checklist_items.filter(item => item.id !== itemId);
      sessionCards[cardIndex] = { ...card, updated_at: new Date().toISOString() };
      saveCards(sessionCards);
    }
  }
}

export async function updateChecklistItemText(cardId: string, checklistId: string, itemId: string, text: string): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    const checklist = card.checklists?.find(cl => cl.id === checklistId);
    const item = checklist?.checklist_items?.find(item => item.id === itemId);
    
    if (item) {
      item.text = text;
      sessionCards[cardIndex] = { ...card, updated_at: new Date().toISOString() };
      saveCards(sessionCards);
    }
  }
}

// === COMMENT MANAGEMENT ===
export async function addCommentToCard(cardId: string, text: string, author: string = 'guest-user'): Promise<string> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const card = sessionCards[cardIndex];
    
    if (!card.comments) {
      card.comments = [];
    }
    
    card.comments.push({
      id: commentId,
      author_id: author,
      created_at: new Date().toISOString()
    });
    
    // Store comment text separately (for demo purposes, we'll store it in localStorage)
    const commentData = { id: commentId, text, author, created_at: new Date().toISOString() };
    const commentsKey = `card-comments-${cardId}`;
    const existingComments = JSON.parse(localStorage.getItem(commentsKey) || '[]');
    existingComments.push(commentData);
    localStorage.setItem(commentsKey, JSON.stringify(existingComments));
    
    sessionCards[cardIndex] = { ...card, updated_at: new Date().toISOString() };
    saveCards(sessionCards);
    return commentId;
  }
  throw new Error('Card not found');
}

export async function getCardComments(cardId: string): Promise<Array<{ id: string; text: string; author: string; created_at: string }>> {
  const commentsKey = `card-comments-${cardId}`;
  return JSON.parse(localStorage.getItem(commentsKey) || '[]');
}

export async function removeCommentFromCard(cardId: string, commentId: string): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    if (card.comments) {
      card.comments = card.comments.filter(c => c.id !== commentId);
      
      // Also remove from localStorage
      const commentsKey = `card-comments-${cardId}`;
      const existingComments = JSON.parse(localStorage.getItem(commentsKey) || '[]');
      const filteredComments = existingComments.filter((c: any) => c.id !== commentId);
      localStorage.setItem(commentsKey, JSON.stringify(filteredComments));
      
      sessionCards[cardIndex] = { ...card, updated_at: new Date().toISOString() };
      saveCards(sessionCards);
    }
  }
}

// === ATTACHMENT MANAGEMENT ===
export async function addAttachmentToCard(cardId: string, attachment: { name: string; url: string; mime: string; size: number }): Promise<string> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const attachmentId = `attachment-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const card = sessionCards[cardIndex];
    
    if (!card.attachments) {
      card.attachments = [];
    }
    
    card.attachments.push({
      id: attachmentId,
      name: attachment.name,
      url: attachment.url,
      mime: attachment.mime,
      size: attachment.size,
      created_at: new Date().toISOString()
    });
    
    sessionCards[cardIndex] = { ...card, updated_at: new Date().toISOString() };
    saveCards(sessionCards);
    return attachmentId;
  }
  throw new Error('Card not found');
}

export async function removeAttachmentFromCard(cardId: string, attachmentId: string): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    if (card.attachments) {
      card.attachments = card.attachments.filter(a => a.id !== attachmentId);
      sessionCards[cardIndex] = { ...card, updated_at: new Date().toISOString() };
      saveCards(sessionCards);
    }
  }
}

// Export all functions as a namespace for convenience
export const cardsApi = {
  getCardsByBoard,
  createCardInList,
  createCardInBoard,
  getCardById,
  updateCard,
  updateCardPosition,
  deleteCard,
  moveCardToBoard,
  archiveCard,
  getArchivedCards,
  // Label management
  addLabelToCard,
  removeLabelFromCard,
  // Checklist management
  addChecklistToCard,
  removeChecklistFromCard,
  addChecklistItem,
  toggleChecklistItem,
  removeChecklistItem,
  updateChecklistItemText,
  // Comment management
  addCommentToCard,
  getCardComments,
  removeCommentFromCard,
  // Attachment management
  addAttachmentToCard,
  removeAttachmentFromCard
};