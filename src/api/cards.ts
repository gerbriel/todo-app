// Cards API - Full implementation with localStorage persistence and complete card features
import type { CardRow } from '@/types/dto';
import { generateAdCopy, type AdCopyRequest } from '@/services/aiService';

// Activity type for better TypeScript support
type ActivityType = 'card_created' | 'card_updated' | 'card_moved' | 'card_archived' | 'card_restored' |
  'title_changed' | 'description_changed' | 'date_start_changed' | 'date_end_changed' |
  'location_changed' | 'member_assigned' | 'member_removed' | 'label_added' | 'label_removed' |
  'attachment_added' | 'attachment_removed' | 'checklist_added' | 'checklist_removed' |
  'checklist_item_added' | 'checklist_item_removed' | 'checklist_item_completed' | 'checklist_item_uncompleted' |
  'checklist_item_due_date_set' | 'checklist_item_due_date_removed' | 'checklist_item_assigned' |
  'checklist_item_unassigned' | 'checklist_item_priority_changed' | 'checklist_item_start_date_set' |
  'checklist_item_start_date_removed' | 'checklist_item_label_added' | 'checklist_item_label_removed' |
  'comment_added' | 'comment_removed';

type ActivityMeta = {
  old_value?: any;
  new_value?: any;
  field_name?: string;
  target_id?: string;
  target_name?: string;
  details?: string;
};

type Activity = {
  id: string;
  type: ActivityType;
  meta: ActivityMeta;
  actor_id: string;
  actor_name?: string;
  created_at: string;
};

// Activity logging utilities
const generateActivityId = () => `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getCurrentUser = () => {
  // Try to get user from localStorage or session storage
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (e) {
      console.warn('Failed to parse stored user:', e);
    }
  }
  
  // Fallback to a more realistic default user
  return {
    id: 'demo-user-id',
    name: 'Demo User'
  };
};

// Function to set current user (can be called from auth context)
export const setCurrentUser = (user: { id: string; name: string; email?: string }) => {
  localStorage.setItem('currentUser', JSON.stringify({
    id: user.id,
    name: user.name || user.email?.split('@')[0] || 'User'
  }));
};

const createActivity = (
  type: ActivityType,
  meta: ActivityMeta = {},
  actor_id?: string,
  actor_name?: string
): Activity => {
  const user = getCurrentUser();
  return {
    id: generateActivityId(),
    type,
    meta,
    actor_id: actor_id || user.id,
    actor_name: actor_name || user.name,
    created_at: new Date().toISOString()
  };
};

const logActivity = (card: CardRow, activity: Activity): CardRow => {
  const updatedCard = { ...card };
  if (!updatedCard.activity) {
    updatedCard.activity = [];
  }
  updatedCard.activity.unshift(activity); // Add to beginning for chronological order
  
  // Store updated card
  const cards = loadCards();
  const cardIndex = cards.findIndex((c: CardRow) => c.id === card.id);
  if (cardIndex !== -1) {
    cards[cardIndex] = updatedCard;
    saveCards(cards);
    // Update session cards too
    sessionCards = cards;
  }
  
  return updatedCard;
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
  const filteredCards = sessionCards.filter(card => card.board_id === boardId);
  return filteredCards;
}

export async function getCardsByList(listId: string): Promise<CardRow[]> {
  const filteredCards = sessionCards.filter(card => card.list_id === listId);
  return filteredCards;
}

export async function createCardInList(listId: string, title: string): Promise<CardRow> {
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
  return newCard;
}

export async function createCardInBoard(boardId: string, title: string): Promise<CardRow> {
  return createCardInList(`${boardId}-list-1`, title);
}

// Create a card representing an archived board
export async function createArchivedBoardCard(board: any): Promise<CardRow> {
  const user = getCurrentUser();
  const archivedDate = new Date().toISOString();
  
  const newCard: CardRow = {
    id: `archived-board-${board.id}`,
    list_id: 'archive-list-3', // Archived Boards list
    board_id: 'archive-board',
    workspace_id: board.workspace_id || 'guest-workspace',
    title: board.name,
    description: `Board archived on ${new Date().toLocaleDateString()}\n\nOriginal board ID: ${board.id}`,
    position: Date.now(),
    created_at: board.created_at || archivedDate,
    updated_at: archivedDate,
    date_start: null,
    date_end: null,
    created_by: user.id,
    // Store original board data in custom metadata
    metadata: {
      original_board_id: board.id,
      archived_at: archivedDate,
      board_data: board,
    }
  };
  
  sessionCards.push(newCard);
  saveCards(sessionCards);
  
  return newCard;
}

export async function getCardById(cardId: string): Promise<CardRow | null> {
  return sessionCards.find(card => card.id === cardId) || null;
}

export async function updateCard(cardId: string, updates: Partial<CardRow>): Promise<CardRow> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex === -1) {
    throw new Error('Card not found');
  }
  
  const originalCard = sessionCards[cardIndex];
  const updatedCard = {
    ...originalCard,
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  // Log activities for each changed field
  const activities: Activity[] = [];
  
  // Check for title changes
  if (updates.title !== undefined && updates.title !== originalCard.title) {
    activities.push(createActivity('title_changed', {
      field_name: 'title',
      old_value: originalCard.title,
      new_value: updates.title
    }));
  }
  
  // Check for description changes
  if (updates.description !== undefined && updates.description !== originalCard.description) {
    activities.push(createActivity('description_changed', {
      field_name: 'description',
      old_value: originalCard.description,
      new_value: updates.description
    }));
  }
  
  // Check for date changes
  if (updates.date_start !== undefined && updates.date_start !== originalCard.date_start) {
    activities.push(createActivity('date_start_changed', {
      field_name: 'date_start',
      old_value: originalCard.date_start,
      new_value: updates.date_start
    }));
  }
  
  if (updates.date_end !== undefined && updates.date_end !== originalCard.date_end) {
    activities.push(createActivity('date_end_changed', {
      field_name: 'date_end',
      old_value: originalCard.date_end,
      new_value: updates.date_end
    }));
  }
  
  // Check for location changes
  if ((updates.location_address !== undefined && updates.location_address !== originalCard.location_address) ||
      (updates.location_lat !== undefined && updates.location_lat !== originalCard.location_lat) ||
      (updates.location_lng !== undefined && updates.location_lng !== originalCard.location_lng)) {
    activities.push(createActivity('location_changed', {
      field_name: 'location',
      old_value: {
        address: originalCard.location_address,
        lat: originalCard.location_lat,
        lng: originalCard.location_lng
      },
      new_value: {
        address: updates.location_address ?? originalCard.location_address,
        lat: updates.location_lat ?? originalCard.location_lat,
        lng: updates.location_lng ?? originalCard.location_lng
      }
    }));
  }
  
  // Add activities to the card
  if (activities.length > 0) {
    if (!updatedCard.activity) {
      updatedCard.activity = [];
    }
    // Add all activities to the beginning
    updatedCard.activity.unshift(...activities);
  }
  
  sessionCards[cardIndex] = updatedCard;
  saveCards(sessionCards); // Persist to localStorage
  return updatedCard;
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
    
    // Log activity
    const activity = createActivity('checklist_added', {
      target_id: checklistId,
      target_name: title,
      details: `Added checklist "${title}"`
    });
    
    const updatedCard = { ...card, updated_at: new Date().toISOString() };
    sessionCards[cardIndex] = logActivity(updatedCard, activity);
    return checklistId;
  }
  throw new Error('Card not found');
}

export async function removeChecklistFromCard(cardId: string, checklistId: string): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    if (card.checklists) {
      const checklistToRemove = card.checklists.find(cl => cl.id === checklistId);
      card.checklists = card.checklists.filter(cl => cl.id !== checklistId);
      
      if (checklistToRemove) {
        // Log activity
        const activity = createActivity('checklist_removed', {
          target_id: checklistId,
          target_name: checklistToRemove.title || 'Untitled checklist',
          details: `Removed checklist "${checklistToRemove.title || 'Untitled checklist'}"`
        });
        
        const updatedCard = { ...card, updated_at: new Date().toISOString() };
        sessionCards[cardIndex] = logActivity(updatedCard, activity);
      } else {
        sessionCards[cardIndex] = { ...card, updated_at: new Date().toISOString() };
        saveCards(sessionCards);
      }
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
      
      // Log activity
      const activity = createActivity('checklist_item_added', {
        target_id: itemId,
        target_name: text,
        details: `Added task "${text}" to checklist "${checklist.title || 'Untitled checklist'}"`
      });
      
      const updatedCard = { ...card, updated_at: new Date().toISOString() };
      sessionCards[cardIndex] = logActivity(updatedCard, activity);
      saveCards(sessionCards); // Persist to localStorage
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
      
      if (item.done) {
        item.completed_at = new Date().toISOString();
      } else {
        item.completed_at = null;
      }
      
      // Log activity
      const activityType = item.done ? 'checklist_item_completed' : 'checklist_item_uncompleted';
      const activity = createActivity(activityType, {
        target_id: itemId,
        target_name: item.text || 'Untitled task',
        details: item.done 
          ? `Completed task "${item.text}"`
          : `Uncompleted task "${item.text}"`
      });
      
      const updatedCard = { ...card, updated_at: new Date().toISOString() };
      sessionCards[cardIndex] = logActivity(updatedCard, activity);
      saveCards(sessionCards); // Persist to localStorage
    }
  }
}

export async function removeChecklistItem(cardId: string, checklistId: string, itemId: string): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    const checklist = card.checklists?.find(cl => cl.id === checklistId);
    
    if (checklist && checklist.checklist_items) {
      const itemToRemove = checklist.checklist_items.find(item => item.id === itemId);
      checklist.checklist_items = checklist.checklist_items.filter(item => item.id !== itemId);
      
      if (itemToRemove) {
        // Log activity
        const activity = createActivity('checklist_item_removed', {
          target_id: itemId,
          target_name: itemToRemove.text || 'Untitled task',
          details: `Removed task "${itemToRemove.text}" from checklist "${checklist.title || 'Untitled checklist'}"`
        });
        
        const updatedCard = { ...card, updated_at: new Date().toISOString() };
        sessionCards[cardIndex] = logActivity(updatedCard, activity);
        saveCards(sessionCards); // Persist to localStorage
      } else {
        sessionCards[cardIndex] = { ...card, updated_at: new Date().toISOString() };
        saveCards(sessionCards);
      }
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
    
    // Log activity
    const activity = createActivity('attachment_added', {
      target_id: attachmentId,
      target_name: attachment.name,
      details: `Added attachment "${attachment.name}" (${(attachment.size / 1024).toFixed(1)} KB)`
    });
    
    const updatedCard = { ...card, updated_at: new Date().toISOString() };
    sessionCards[cardIndex] = logActivity(updatedCard, activity);
    return attachmentId;
  }
  throw new Error('Card not found');
}

export async function removeAttachmentFromCard(cardId: string, attachmentId: string): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    if (card.attachments) {
      const attachmentToRemove = card.attachments.find(a => a.id === attachmentId);
      card.attachments = card.attachments.filter(a => a.id !== attachmentId);
      
      if (attachmentToRemove) {
        // Log activity
        const activity = createActivity('attachment_removed', {
          target_id: attachmentId,
          target_name: attachmentToRemove.name,
          details: `Removed attachment "${attachmentToRemove.name}"`
        });
        
        const updatedCard = { ...card, updated_at: new Date().toISOString() };
        sessionCards[cardIndex] = logActivity(updatedCard, activity);
      } else {
        sessionCards[cardIndex] = { ...card, updated_at: new Date().toISOString() };
        saveCards(sessionCards);
      }
    }
  }
}

// === MEMBER MANAGEMENT ===
export async function assignMemberToCard(cardId: string, member: { name: string; email?: string; avatar?: string }): Promise<string> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const memberId = `member-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const card = sessionCards[cardIndex];
    
    if (!card.assigned_members) {
      card.assigned_members = [];
    }
    
    // Check if member already assigned
    const existingMember = card.assigned_members.find(m => m.email === member.email || m.name === member.name);
    if (!existingMember) {
      card.assigned_members.push({
        id: memberId,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        assigned_at: new Date().toISOString()
      });
      
      // Log activity
      const activity = createActivity('member_assigned', {
        target_id: memberId,
        target_name: member.name,
        details: `Assigned ${member.name} to card`
      });
      
      const updatedCard = { ...card, updated_at: new Date().toISOString() };
      sessionCards[cardIndex] = logActivity(updatedCard, activity);
    }
    return memberId;
  }
  throw new Error('Card not found');
}

export async function removeMemberFromCard(cardId: string, memberId: string): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    if (card.assigned_members) {
      const memberToRemove = card.assigned_members.find(m => m.id === memberId);
      card.assigned_members = card.assigned_members.filter(m => m.id !== memberId);
      
      if (memberToRemove) {
        // Log activity
        const activity = createActivity('member_removed', {
          target_id: memberId,
          target_name: memberToRemove.name,
          details: `Removed ${memberToRemove.name} from card`
        });
        
        const updatedCard = { ...card, updated_at: new Date().toISOString() };
        sessionCards[cardIndex] = logActivity(updatedCard, activity);
      } else {
        sessionCards[cardIndex] = { ...card, updated_at: new Date().toISOString() };
        saveCards(sessionCards);
      }
    }
  }
}

export async function assignMemberToChecklistItem(cardId: string, checklistId: string, itemId: string, memberId: string): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    const checklist = card.checklists?.find(cl => cl.id === checklistId);
    const item = checklist?.checklist_items?.find(item => item.id === itemId);
    const member = card.assigned_members?.find(m => m.id === memberId);
    
    if (item && member) {
      const previousAssignee = item.assigned_member_name;
      item.assigned_to = memberId;
      item.assigned_member_name = member.name;
      
      // Log activity
      const activity = createActivity('checklist_item_assigned', {
        target_id: itemId,
        target_name: item.text || 'Untitled task',
        details: previousAssignee 
          ? `Reassigned task "${item.text}" from ${previousAssignee} to ${member.name}`
          : `Assigned ${member.name} to task "${item.text}"`
      });
      
      const updatedCard = { ...card, updated_at: new Date().toISOString() };
      sessionCards[cardIndex] = logActivity(updatedCard, activity);
      saveCards(sessionCards); // Persist to localStorage
    }
  }
}

export async function setChecklistItemDueDate(cardId: string, checklistId: string, itemId: string, dueDate: string | null): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    const checklist = card.checklists?.find(cl => cl.id === checklistId);
    const item = checklist?.checklist_items?.find(item => item.id === itemId);
    
    if (item) {
      const previousDueDate = item.due_date;
      item.due_date = dueDate;
      
      // Log activity
      const activityType = dueDate ? 'checklist_item_due_date_set' : 'checklist_item_due_date_removed';
      const activity = createActivity(activityType, {
        target_id: itemId,
        target_name: item.text || 'Untitled task',
        old_value: previousDueDate,
        new_value: dueDate,
        details: dueDate 
          ? `Set due date for task "${item.text}" to ${new Date(dueDate).toLocaleDateString()}`
          : `Removed due date from task "${item.text}"`
      });
      
      const updatedCard = { ...card, updated_at: new Date().toISOString() };
      sessionCards[cardIndex] = logActivity(updatedCard, activity);
      saveCards(sessionCards); // Persist to localStorage
    }
  }
}

export async function setChecklistItemStartDate(cardId: string, checklistId: string, itemId: string, startDate: string | null): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    const checklist = card.checklists?.find(cl => cl.id === checklistId);
    const item = checklist?.checklist_items?.find(item => item.id === itemId);
    
    if (item) {
      const previousStartDate = (item as any).start_date;
      (item as any).start_date = startDate;
      
      // Log activity
      const activityType = startDate ? 'checklist_item_start_date_set' : 'checklist_item_start_date_removed';
      const activity = createActivity(activityType as any, {
        target_id: itemId,
        target_name: item.text || 'Untitled task',
        old_value: previousStartDate,
        new_value: startDate,
        details: startDate 
          ? `Set start date for task "${item.text}" to ${new Date(startDate).toLocaleDateString()}`
          : `Removed start date from task "${item.text}"`
      });
      
      const updatedCard = { ...card, updated_at: new Date().toISOString() };
      sessionCards[cardIndex] = logActivity(updatedCard, activity);
      saveCards(sessionCards); // Persist to localStorage
    }
  }
}

export async function addLabelToChecklistItem(cardId: string, checklistId: string, itemId: string, labelId: string): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    const checklist = card.checklists?.find(cl => cl.id === checklistId);
    const item = checklist?.checklist_items?.find(item => item.id === itemId);
    
    if (item) {
      // Get label details from available labels (mock data for now)
      const availableLabels = [
        { id: 'urgent', name: 'Urgent', color: '#ef4444' },
        { id: 'feature', name: 'Feature', color: '#3b82f6' },
        { id: 'bug', name: 'Bug', color: '#f59e0b' },
        { id: 'enhancement', name: 'Enhancement', color: '#10b981' },
        { id: 'documentation', name: 'Documentation', color: '#8b5cf6' },
        { id: 'research', name: 'Research', color: '#ec4899' },
      ];
      
      const label = availableLabels.find(l => l.id === labelId);
      if (label) {
        if (!(item as any).labels) {
          (item as any).labels = [];
        }
        
        // Don't add if already exists
        if (!(item as any).labels.some((l: any) => l.id === labelId)) {
          (item as any).labels.push(label);
          
          // Log activity
          const activity = createActivity('checklist_item_label_added' as any, {
            target_id: itemId,
            target_name: item.text || 'Untitled task',
            details: `Added label "${label.name}" to task "${item.text}"`
          });
          
          const updatedCard = { ...card, updated_at: new Date().toISOString() };
          sessionCards[cardIndex] = logActivity(updatedCard, activity);
          saveCards(sessionCards); // Persist to localStorage
        }
      }
    }
  }
}

export async function removeLabelFromChecklistItem(cardId: string, checklistId: string, itemId: string, labelId: string): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    const checklist = card.checklists?.find(cl => cl.id === checklistId);
    const item = checklist?.checklist_items?.find(item => item.id === itemId);
    
    if (item && (item as any).labels) {
      const labelToRemove = (item as any).labels.find((l: any) => l.id === labelId);
      (item as any).labels = (item as any).labels.filter((l: any) => l.id !== labelId);
      
      if (labelToRemove) {
        // Log activity
        const activity = createActivity('checklist_item_label_removed' as any, {
          target_id: itemId,
          target_name: item.text || 'Untitled task',
          details: `Removed label "${labelToRemove.name}" from task "${item.text}"`
        });
        
        const updatedCard = { ...card, updated_at: new Date().toISOString() };
        sessionCards[cardIndex] = logActivity(updatedCard, activity);
        saveCards(sessionCards); // Persist to localStorage
      }
    }
  }
}

// Function to get available labels for checklist items
export async function getAvailableLabelsForChecklistItems(): Promise<Array<{ id: string; name: string; color: string }>> {
  return [
    { id: 'urgent', name: 'Urgent', color: '#ef4444' },
    { id: 'feature', name: 'Feature', color: '#3b82f6' },
    { id: 'bug', name: 'Bug', color: '#f59e0b' },
    { id: 'enhancement', name: 'Enhancement', color: '#10b981' },
    { id: 'documentation', name: 'Documentation', color: '#8b5cf6' },
    { id: 'research', name: 'Research', color: '#ec4899' },
  ];
}

// === AI AD COPY MANAGEMENT ===
export async function generateAdCopyForCard(
  cardId: string, 
  platform: 'facebook' | 'google' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'custom',
  options?: {
    targetAudience?: string;
    tone?: 'professional' | 'casual' | 'playful' | 'urgent' | 'informative';
    objective?: 'awareness' | 'conversion' | 'engagement' | 'traffic' | 'leads';
  }
): Promise<string> {
  const card = sessionCards.find(c => c.id === cardId);
  if (!card) {
    throw new Error('Card not found');
  }

  const request: AdCopyRequest = {
    cardTitle: card.title,
    cardDescription: typeof card.description === 'string' ? card.description : '',
    platform,
    targetAudience: options?.targetAudience,
    tone: options?.tone || 'professional',
    objective: options?.objective || 'conversion'
  };

  try {
    const adCopy = await generateAdCopy(request);
    
    const adCopyId = `ad-copy-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const cardIndex = sessionCards.findIndex(c => c.id === cardId);
    
    if (cardIndex !== -1) {
      if (!sessionCards[cardIndex].ad_copies) {
        sessionCards[cardIndex].ad_copies = [];
      }

      const newAdCopy = {
        id: adCopyId,
        title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Ad Copy`,
        platform: platform as any,
        graphics_copy: adCopy.graphics_copy,
        subheadline: adCopy.subheadline,
        description: adCopy.description,
        primary_text: adCopy.primary_text,
        generated_at: new Date().toISOString(),
        ai_model_used: 'Mock AI Service',
        is_approved: false,
        position: sessionCards[cardIndex].ad_copies!.length + 1
      };

      sessionCards[cardIndex].ad_copies!.push(newAdCopy);
      sessionCards[cardIndex].updated_at = new Date().toISOString();
      
      saveCards(sessionCards);
      return adCopyId;
    }
    
    throw new Error('Failed to save ad copy');
  } catch (error) {
    console.error('Failed to generate ad copy:', error);
    throw error;
  }
}

export async function updateAdCopy(
  cardId: string, 
  adCopyId: string, 
  updates: {
    graphics_copy?: string;
    subheadline?: string;
    description?: string;
    primary_text?: string;
    is_approved?: boolean;
  }
): Promise<void> {
  const cardIndex = sessionCards.findIndex(c => c.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    const adCopyIndex = card.ad_copies?.findIndex(ac => ac.id === adCopyId);
    
    if (adCopyIndex !== undefined && adCopyIndex !== -1 && card.ad_copies) {
      card.ad_copies[adCopyIndex] = {
        ...card.ad_copies[adCopyIndex],
        ...updates
      };
      
      sessionCards[cardIndex].updated_at = new Date().toISOString();
      saveCards(sessionCards);
    }
  }
}

export async function deleteAdCopy(cardId: string, adCopyId: string): Promise<void> {
  const cardIndex = sessionCards.findIndex(c => c.id === cardId);
  if (cardIndex !== -1) {
    const card = sessionCards[cardIndex];
    if (card.ad_copies) {
      card.ad_copies = card.ad_copies.filter(ac => ac.id !== adCopyId);
      sessionCards[cardIndex].updated_at = new Date().toISOString();
      saveCards(sessionCards);
    }
  }
}

export async function approveAdCopy(cardId: string, adCopyId: string): Promise<void> {
  await updateAdCopy(cardId, adCopyId, { is_approved: true });
}

export async function getAdCopiesForCard(cardId: string): Promise<Array<NonNullable<CardRow['ad_copies']>[0]>> {
  const card = sessionCards.find(c => c.id === cardId);
  return card?.ad_copies || [];
}

// === GLOBAL LABEL MANAGEMENT ===
const LABELS_STORAGE_KEY = 'todo-app-labels';

interface GlobalLabel {
  id: string;
  name: string;
  color: string;
  workspace_id: string;
  created_at: string;
  card_count?: number;
}

const DEFAULT_LABELS: GlobalLabel[] = [
  { id: 'label-1', name: 'Final Form', color: '#22C55E', workspace_id: 'guest-workspace', created_at: new Date().toISOString() },
  { id: 'label-2', name: 'Viking Customers', color: '#A3A833', workspace_id: 'guest-workspace', created_at: new Date().toISOString() },
  { id: 'label-3', name: 'Dealer Order Form', color: '#D2691E', workspace_id: 'guest-workspace', created_at: new Date().toISOString() },
  { id: 'label-4', name: '', color: '#CD853F', workspace_id: 'guest-workspace', created_at: new Date().toISOString() },
  { id: 'label-5', name: '', color: '#DC143C', workspace_id: 'guest-workspace', created_at: new Date().toISOString() },
  { id: 'label-6', name: '', color: '#8A2BE2', workspace_id: 'guest-workspace', created_at: new Date().toISOString() },
  { id: 'label-7', name: 'QMC Customers', color: '#4169E1', workspace_id: 'guest-workspace', created_at: new Date().toISOString() },
  { id: 'label-8', name: '', color: '#1E90FF', workspace_id: 'guest-workspace', created_at: new Date().toISOString() },
];

function loadLabels(): GlobalLabel[] {
  try {
    const saved = localStorage.getItem(LABELS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Failed to load labels from localStorage:', error);
  }
  return [...DEFAULT_LABELS];
}

function saveLabels(labels: GlobalLabel[]): void {
  try {
    localStorage.setItem(LABELS_STORAGE_KEY, JSON.stringify(labels));
  } catch (error) {
    console.warn('Failed to save labels to localStorage:', error);
  }
}

let sessionLabels: GlobalLabel[] = loadLabels();

export async function getAllLabels(workspaceId: string = 'guest-workspace'): Promise<GlobalLabel[]> {
  const labels = sessionLabels.filter(label => label.workspace_id === workspaceId);
  
  // Add card count for each label
  return labels.map(label => ({
    ...label,
    card_count: sessionCards.filter(card => 
      card.card_labels?.some(cl => cl.label_id === label.id)
    ).length
  }));
}

export async function createGlobalLabel(label: { name: string; color: string; workspace_id?: string }): Promise<GlobalLabel> {
  const newLabel: GlobalLabel = {
    id: `label-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    name: label.name,
    color: label.color,
    workspace_id: label.workspace_id || 'guest-workspace',
    created_at: new Date().toISOString()
  };
  
  sessionLabels.push(newLabel);
  saveLabels(sessionLabels);
  return newLabel;
}

export async function updateGlobalLabel(labelId: string, updates: { name?: string; color?: string }): Promise<void> {
  const labelIndex = sessionLabels.findIndex(label => label.id === labelId);
  if (labelIndex !== -1) {
    sessionLabels[labelIndex] = { ...sessionLabels[labelIndex], ...updates };
    saveLabels(sessionLabels);
  }
}

export async function deleteGlobalLabel(labelId: string): Promise<void> {
  // Remove label from all cards first
  sessionCards.forEach(card => {
    if (card.card_labels) {
      card.card_labels = card.card_labels.filter(cl => cl.label_id !== labelId);
    }
  });
  saveCards(sessionCards);
  
  // Remove from global labels
  sessionLabels = sessionLabels.filter(label => label.id !== labelId);
  saveLabels(sessionLabels);
}

export async function addLabelToCardById(cardId: string, labelId: string): Promise<void> {
  const cardIndex = sessionCards.findIndex(card => card.id === cardId);
  const label = sessionLabels.find(l => l.id === labelId);
  
  if (cardIndex !== -1 && label) {
    const card = sessionCards[cardIndex];
    
    if (!card.card_labels) {
      card.card_labels = [];
    }
    
    // Check if label already exists on card
    const existingLabel = card.card_labels.find(cl => cl.label_id === labelId);
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

export async function removeLabelFromCardById(cardId: string, labelId: string): Promise<void> {
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
  removeAttachmentFromCard,
  // AI Ad Copy management
  generateAdCopyForCard,
  updateAdCopy,
  deleteAdCopy,
  approveAdCopy,
  getAdCopiesForCard
};