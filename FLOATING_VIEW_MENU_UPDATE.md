# UI/UX Updates - Sidebar & View Switcher

## Changes Made

### 1. Sidebar - Create Board Button Repositioning ✅
**Issue**: The "Create Board" button was positioned below the Archive section, making it feel disconnected from the board list.

**Solution**: Moved the "Create Board" button to appear directly after the board list and before the Archive section.

**Location**: `src/components/Sidebar.tsx`
- Boards list (with drag & drop)
- **Create Board button** ← MOVED HERE
- Archive section

### 2. Board Archiving Reimplemented ✅
**Previous**: Boards were permanently deleted when clicking the trash icon.

**New**: Boards are now archived (soft delete) and can be restored later.

**Changes**:
- **`src/api/boards.ts`**:
  - Updated `archiveBoard()` function to set `archived: true` instead of deleting
  - Added `getArchivedBoards()` function to fetch archived boards
  - Updated `getBoards()` to filter out archived boards (`eq('archived', false)`)
  - Kept `deleteBoard()` for potential future hard delete functionality

- **`src/components/SortableBoard.tsx`**:
  - Changed archive button color from red to amber
  - Updated title from "Delete board" to "Archive board"
  - Updated hover states to use amber colors

- **`src/components/Sidebar.tsx`**:
  - Renamed `deleteBoardMutation` → `archiveBoardMutation`
  - Renamed `handleDeleteBoard` → `handleArchiveBoard`
  - Updated confirmation message to say "archive" instead of "delete"
  - Archive confirmation no longer says "cannot be undone"

### 3. Floating View Menu with Fan-Out Animation ✅
**Previous**: Hamburger menu in top-right corner opened a sidebar panel for view switching.

**New**: Elegant floating menu at bottom-center with animated half-arc fan-out effect.

**Features**:
- **Fixed position**: Bottom-center of screen
- **Three-dot trigger button**: Rotates 90° when opened
- **Fan-out animation**: 5 view buttons spread in a half-arc pattern
- **Staggered animation**: Each button appears with a 30ms delay
- **Current view indicator**: Small icon badge on trigger button when closed
- **Tooltips**: Hover over any view button to see its name
- **Active state**: Current view highlighted in blue
- **Click outside to close**: Overlay closes menu when clicking anywhere

**View Buttons**:
1. Board (LayoutGrid icon) - Left (-60°)
2. Table (Table icon) - (-30°)
3. Calendar (Calendar icon) - Center (0°)
4. Timeline (Clock icon) - (30°)
5. Map (MapPin icon) - Right (60°)

**Technical Implementation**:
- **Component**: `src/components/FloatingViewMenu.tsx`
- **Math**: Uses trigonometry to calculate button positions in a half-arc
- **Animation**: CSS transforms with staggered transition delays
- **Distance**: 100px radius from center button

**Removed**:
- `src/components/ViewsPanel.tsx` (no longer used)
- Hamburger menu button from `src/components/Topbar.tsx`
- `onToggleViews` prop from `TopbarProps` interface
- `showViewsPanel` state from `MainLayout`

**Updated**:
- `src/components/MainLayout.tsx`: Now renders `<FloatingViewMenu />` instead of `<ViewsPanel />`
- `src/components/Topbar.tsx`: Removed hamburger menu button and prop

## Visual Design

### Floating Menu States

**Closed State**:
```
     [●●●]  ← Three dots with small icon badge showing current view
```

**Open State** (Half Arc):
```
        📋         📊
           
               ⦿            Current view (blue)
           
        📅    🗺️
     
        [···]  ← Rotated 90° (vertical dots)
```

### Color Scheme
- **Trigger Button**: Blue (primary)
- **Active View**: Blue background, white icon
- **Inactive Views**: White background (light mode) / Gray-800 (dark mode)
- **Archive Button**: Amber (warning color, not destructive red)

## Benefits

1. **Better UX**: Create board button is now grouped logically with boards
2. **Data Safety**: Archived boards can be recovered (vs permanent deletion)
3. **Modern UI**: Floating menu is more elegant and less intrusive than sidebar
4. **Space Efficient**: No need to open/close a full sidebar panel
5. **Visual Feedback**: Animated fan-out provides delightful interaction
6. **Accessibility**: Clear tooltips and current view indication

## Future Enhancements

- [ ] Add "Archived Boards" page to view/restore archived boards
- [ ] Add "Restore" button on archived boards
- [ ] Add permanent delete option for archived boards (after confirmation)
- [ ] Add keyboard shortcuts for view switching (1-5 keys)
- [ ] Add swipe gestures for mobile view switching
