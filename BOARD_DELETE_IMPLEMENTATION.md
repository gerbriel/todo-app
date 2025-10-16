# Board Delete Functionality

## Overview
Boards can now be **permanently deleted** instead of archived. This simplifies the board management system by removing the archive/restore workflow.

---

## Changes Made

### 1. API Changes (`src/api/boards.ts`)

#### New `deleteBoard()` Function
```typescript
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
  console.log('🗑️ Deleting board:', boardToDelete.name, '(ID:', boardId, ')');

  // Remove the board permanently
  sessionBoards.splice(boardIndex, 1);
  saveBoards(sessionBoards);
  console.log('💾 Deleted board and saved to localStorage');
  
  // Reload sessionBoards from localStorage to ensure consistency
  sessionBoards = loadBoards();
  console.log('🔄 Reloaded boards from localStorage. Active boards:', sessionBoards.length);
}
```

#### `archiveBoard()` is now an alias
```typescript
// Keep archiveBoard as an alias for backwards compatibility
export async function archiveBoard(boardId: string): Promise<void> {
  return deleteBoard(boardId);
}
```

#### Removed Functions
- ❌ `unarchiveBoard()` - No longer needed
- ❌ `getArchivedBoards()` - No longer needed
- ❌ `createArchivedBoardCard()` - No longer needed (in cards.ts)

---

### 2. UI Changes

#### Sidebar (`src/components/Sidebar.tsx`)

**Renamed mutation:**
```typescript
const deleteBoardMutation = useMutation({
  mutationFn: async (boardId: string) => {
    console.log('🚀 Starting delete mutation for board:', boardId);
    await archiveBoard(boardId); // Uses archiveBoard which calls deleteBoard
    console.log('✅ Delete mutation completed for board:', boardId);
  },
  onSuccess: () => {
    console.log('📢 Delete mutation onSuccess called - invalidating queries');
    queryClient.invalidateQueries({ queryKey: ['boards', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['my-boards'] });
    console.log('✨ All queries invalidated');
  },
  onError: (error) => {
    console.error('❌ Delete mutation failed:', error);
  },
});
```

**Updated handler:**
```typescript
const handleDeleteBoard = (boardId: string) => {
  console.log('🔔 handleDeleteBoard called with boardId:', boardId);
  const boardToDelete = boards.find(b => b.id === boardId);
  console.log('📋 Board to delete:', boardToDelete);
  
  if (confirm(`Are you sure you want to delete "${boardToDelete?.name}"? This action cannot be undone.`)) {
    console.log('✔️ User confirmed delete');
    deleteBoardMutation.mutate(boardId);
  } else {
    console.log('❌ User cancelled delete');
  }
};
```

#### SortableBoard (`src/components/SortableBoard.tsx`)

**Updated button styling:**
```typescript
<button
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    onArchiveBoard(board.id); // Still uses this prop name for compatibility
  }}
  className={`p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400`}
  title="Delete board"
>
  <Archive className="w-3 h-3" />
</button>
```

**Visual Changes:**
- Button now has red color scheme (red text, red hover background)
- Tooltip changed from "Archive board" to "Delete board"
- Confirmation dialog says "This action cannot be undone"

---

## User Flow

### Deleting a Board

1. **Hover over a board** in the sidebar
2. **Click the trash icon** (red, on the right side)
3. **Confirm deletion** in the dialog:
   ```
   Are you sure you want to delete "Board Name"? 
   This action cannot be undone.
   ```
4. **Board is permanently deleted**:
   - ✅ Removed from sidebar immediately
   - ✅ Deleted from localStorage
   - ✅ No way to restore

### What Happens to Board Data?

- **Board metadata**: Deleted permanently
- **Lists in the board**: Remain in localStorage (orphaned)
- **Cards in the board**: Remain in localStorage (orphaned)
- **Archive board**: Cannot be deleted (protected)

---

## Differences from Archive System

### Before (Archive System)
```
User Action → Archive board
    ↓
Board removed from sidebar
    ↓
Card created in "Archived Boards" list
    ↓
Board data stored in card metadata
    ↓
User can restore from Archive page or card modal
```

### After (Delete System)
```
User Action → Delete board
    ↓
Confirmation dialog (with warning)
    ↓
Board permanently removed from localStorage
    ↓
❌ No card created
    ↓
❌ No way to restore
```

---

## Benefits

✅ **Simpler**: No archive/restore workflow to maintain  
✅ **Cleaner codebase**: Less code, fewer edge cases  
✅ **Clearer UX**: Users know deletion is permanent  
✅ **No orphaned archive cards**: Archive board stays clean  
✅ **Less localStorage usage**: No duplicate board data in cards  

---

## Backward Compatibility

The `archiveBoard()` function is kept as an alias to `deleteBoard()`, so any code still calling `archiveBoard()` will work correctly.

---

## Console Logs

When deleting a board, you'll see:
```
🔔 handleDeleteBoard called with boardId: board-123
📋 Board to delete: { id: 'board-123', name: 'My Board', ... }
✔️ User confirmed delete
🚀 Starting delete mutation for board: board-123
🗑️ Deleting board: My Board (ID: board-123)
💾 Deleted board and saved to localStorage
🔄 Reloaded boards from localStorage. Active boards: 5
✅ Delete mutation completed for board: board-123
📢 Delete mutation onSuccess called - invalidating queries
✨ All queries invalidated
```

---

## Testing Checklist

- [ ] Delete a board → Board disappears from sidebar
- [ ] Delete confirmation shows board name
- [ ] Cancel deletion → Board remains
- [ ] Confirm deletion → Board is deleted
- [ ] Check localStorage → Board removed from `todo-app-boards`
- [ ] Try to delete Archive board → Warning message, not deleted
- [ ] Create new board after deletion → Works correctly
- [ ] Refresh page after deletion → Board stays deleted

---

## Files Modified

1. **`src/api/boards.ts`**
   - Added `deleteBoard()` function
   - Made `archiveBoard()` an alias
   - Removed `unarchiveBoard()` and `getArchivedBoards()`

2. **`src/components/Sidebar.tsx`**
   - Renamed `archiveBoardMutation` → `deleteBoardMutation`
   - Renamed `handleArchiveBoard` → `handleDeleteBoard`
   - Updated confirmation message
   - Updated console logs

3. **`src/components/SortableBoard.tsx`**
   - Changed button styling to red color scheme
   - Updated tooltip to "Delete board"

---

## Future Considerations

🔮 **Undo functionality**: Could add a "Recently Deleted" temporary holding area  
🔮 **Cascade delete**: Delete all associated lists and cards  
🔮 **Archive boards page**: Remove if not needed elsewhere  
🔮 **Bulk operations**: Delete multiple boards at once  

---

**Status: ✅ IMPLEMENTED**

Boards can now be permanently deleted with a single click and confirmation!
