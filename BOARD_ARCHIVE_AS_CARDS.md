# Board Archive System - Cards Implementation

## Overview
Archived boards now appear as **cards in a list** within the Archive board, making them visible and manageable just like archived cards and lists.

---

## How It Works

### 1. **Archiving a Board**
When you archive a board (right-click → "Archive Board" in the sidebar):
- A new **card is created** in the `Archived Boards` list (inside the Archive board)
- The card's **title** is the board name
- The card's **description** includes when it was archived
- The **original board data** is stored in the card's `metadata` field
- The board is **removed** from the active boards list

### 2. **Viewing Archived Boards**
Navigate to the **Archive board** and you'll see:
- `Archived Cards` list
- `Archived Lists` list  
- `Archived Boards` list ← **New!** Your archived boards appear here as cards

### 3. **Restoring a Board**
Two ways to restore an archived board:

#### Option A: From the Card (Recommended)
1. Go to the **Archive board**
2. Click on an archived board card
3. In the card modal, click the green **"Restore Board"** button in the Actions sidebar
4. Confirm the restoration
5. The board is restored to your sidebar and the card is removed

#### Option B: From the Archive Page
1. Go to the **Archive page** (via sidebar)
2. Find the archived board in the list
3. Click **"Restore"**
4. The board is restored to your sidebar

---

## Technical Implementation

### New List
Added a third list to the Archive board:
```typescript
{
  id: 'archive-list-3',
  board_id: 'archive-board',
  name: 'Archived Boards',
  position: 3000,
}
```

### Card Metadata Structure
Archived board cards store the original board data:
```typescript
{
  id: 'archived-board-{original-board-id}',
  list_id: 'archive-list-3',
  board_id: 'archive-board',
  title: 'Board Name',
  description: 'Board archived on MM/DD/YYYY\n\nOriginal board ID: ...',
  metadata: {
    original_board_id: 'board-123',
    archived_at: '2025-10-16T...',
    board_data: { /* Full original board object */ }
  }
}
```

### API Changes

#### `archiveBoard(boardId)`
```typescript
// 1. Get the board to archive
// 2. Create a card in archive-list-3
// 3. Remove board from active boards
```

#### `unarchiveBoard(boardId)`
```typescript
// 1. Find archived card: archived-board-{boardId}
// 2. Restore board from card.metadata.board_data
// 3. Delete the archived card
```

#### `getArchivedBoards(userId)`
```typescript
// 1. Get all cards from archive-list-3
// 2. Convert card metadata back to board objects
// 3. Return as BoardRow[]
```

---

## UI Enhancements

### Archive Board View
- Three lists displayed side-by-side
- Archived boards appear as cards with board names as titles
- Drag & drop disabled for archived items (read-only)

### Card Modal
When viewing an archived board card:
- Shows all board metadata in description
- **Green "Restore Board" button** appears in Actions sidebar
- Button only shows when `card.metadata?.original_board_id` exists
- One-click restoration with confirmation

### Archive Page
- Shows archived boards in a grid layout
- Each board displays:
  - Board name
  - When it was archived
  - "Restore" button
  - "Delete" option (placeholder)

---

## Benefits

✅ **Visual Consistency**: Boards, lists, and cards all archived in the same place  
✅ **Easy Discovery**: Archived boards visible as cards in Archive board  
✅ **Quick Restoration**: Restore from card modal or Archive page  
✅ **Data Preservation**: All board data stored safely in card metadata  
✅ **No Database**: Works with localStorage (no Supabase needed)  
✅ **Intuitive UX**: Matches existing archive pattern for cards/lists

---

## Usage Example

### Archive a Board
1. **Sidebar** → Right-click any board → "Archive Board"
2. Board disappears from sidebar
3. ✅ Card created in Archive board's "Archived Boards" list

### Restore a Board
1. **Navigate** to Archive board (sidebar)
2. **Click** on archived board card in "Archived Boards" list
3. **Click** green "Restore Board" button in Actions sidebar
4. **Confirm** restoration dialog
5. ✅ Board restored to sidebar + card removed from archive

---

## Testing Checklist

- [ ] Archive a board from sidebar → Appears as card in Archive board
- [ ] View archived board card → Shows board name and archive date
- [ ] Click "Restore Board" → Board restored to sidebar
- [ ] Check Archive page → Archived boards listed correctly
- [ ] Restore from Archive page → Works as expected
- [ ] Archive multiple boards → All appear as separate cards
- [ ] Check localStorage → Board data preserved in card metadata

---

## Files Modified

### API Layer
- `src/api/boards.ts` - Updated archive/unarchive logic
- `src/api/cards.ts` - Added `createArchivedBoardCard()` and `getCardsByList()`
- `src/api/lists.ts` - Added "Archived Boards" list

### Types
- `src/types/dto.ts` - Added `metadata` field to `CardRow` type

### UI Components
- `src/components/card/EnhancedCardEditModal.tsx` - Added "Restore Board" button

---

## Future Enhancements

🔮 **Permanent Deletion**: Implement actual deletion from Archive page  
🔮 **Board Preview**: Show board thumbnail in card  
🔮 **Bulk Actions**: Archive/restore multiple boards at once  
🔮 **Search**: Filter archived boards by name or date  
🔮 **Export**: Download archived board data as JSON  

---

**🎉 Archived boards are now cards! Much cleaner and more intuitive.**
