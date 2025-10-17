# Live Theme Preview Feature

## Overview
The Theme Editor now includes a **live preview** mode that allows users to see color changes in real-time without needing to save the theme. This creates a sandbox environment for experimenting with theme designs.

## How It Works

### 1. Preview Mode State
- **Default**: Preview mode is **ON** by default when opening the theme editor
- **Toggle**: Users can turn preview on/off using the button in the modal header
- **Visual Indicator**: Button shows "Preview On" (blue) or "Preview Off" (gray)

### 2. Real-Time Updates
When preview mode is enabled:
- Every color change immediately updates CSS custom properties on `document.documentElement`
- Changes are visible instantly across the entire application
- No save required to see the effect

### 3. Original Theme Preservation
- When the theme editor opens, the current theme is saved as `originalTheme`
- If user closes the editor without saving, the original theme is restored
- This ensures safe experimentation without losing the active theme

### 4. Technical Implementation

#### State Management
```typescript
const [previewMode, setPreviewMode] = useState(true) // Preview enabled by default
const [originalTheme, setOriginalTheme] = useState<Theme | null>(null)
const [editingTheme, setEditingTheme] = useState<Theme | null>(null)
```

#### Live Preview Effect
```typescript
useEffect(() => {
  if (previewMode && editingTheme && isOpen) {
    const root = document.documentElement
    Object.entries(editingTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
  }
}, [editingTheme, previewMode, isOpen])
```

#### Color Change Handler
```typescript
const handleColorChange = (colorKey: string, value: string) => {
  setEditingTheme(prev => {
    if (!prev) return prev
    return {
      ...prev,
      colors: { ...prev.colors, [colorKey]: value }
    }
  })
  
  // Instant preview update
  if (previewMode) {
    document.documentElement.style.setProperty(`--color-${colorKey}`, value)
  }
}
```

#### Cleanup on Close
```typescript
useEffect(() => {
  return () => {
    if (originalTheme && !isOpen) {
      // Restore original theme when closing without save
      const root = document.documentElement
      Object.entries(originalTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value)
      })
    }
  }
}, [isOpen, originalTheme])
```

## User Experience

### Opening the Theme Editor
1. Current theme is automatically saved as backup
2. Preview mode is enabled by default
3. User sees current theme colors loaded in the editor

### Making Changes
1. User changes any color using color pickers
2. Change is instantly visible across the app (if preview is on)
3. No need to save to see the effect

### Preview Toggle
- **Click "Preview On"**: Disables live updates, shows "Preview Off"
- **Click "Preview Off"**: Re-enables live updates, shows "Preview On"
- Icon changes between Eye (on) and EyeOff (off)

### Closing Without Saving
1. User clicks "Cancel" or closes the modal
2. Cleanup effect runs automatically
3. Original theme is restored
4. No changes are persisted

### Saving Changes
1. User clicks "Save Theme"
2. Theme is saved to database
3. Original theme is updated to new theme
4. Changes are now permanent

## Benefits

1. **Instant Feedback**: See color changes immediately without waiting for save/reload
2. **Safe Experimentation**: Original theme is always preserved until explicit save
3. **Toggle Control**: Users can disable preview if they prefer manual updates
4. **Visual Clarity**: Clear button state shows whether preview is active
5. **No Side Effects**: Closing without saving always restores original state

## CSS Custom Properties
The system uses CSS variables (custom properties) for all theme colors:
- Format: `--color-{colorKey}`
- Example: `--color-primary`, `--color-background`, `--color-cardText`
- These variables are referenced throughout the application's CSS
- Updating them instantly updates all components using those colors

## Future Enhancements
- Add preview history (undo/redo color changes)
- Show before/after comparison view
- Add preset color palettes for quick experimentation
- Allow exporting preview as new theme without affecting current theme
