import { supabase } from '@/app/supabaseClient';

export interface Theme {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_default: boolean;
  is_active: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    cardBackground: string;
    listBackground: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    textInverted: string;
    border: string;
    borderLight: string;
    borderDark: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    hover: string;
    focus: string;
    disabled: string;
    shadow: string;
    overlay: string;
    // Card specific colors
    cardText: string;
    cardTitle: string;
    cardSubtitle: string;
    cardBorder: string;
    // List specific colors
    listText: string;
    listTitle: string;
    listBorder: string;
    // Board specific colors
    boardBackground: string;
    boardText: string;
    boardTitle: string;
    // Navigation colors
    navBackground: string;
    navText: string;
    navHover: string;
    navActive: string;
    // Button colors
    buttonPrimary: string;
    buttonPrimaryText: string;
    buttonSecondary: string;
    buttonSecondaryText: string;
    buttonDanger: string;
    buttonDangerText: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface CreateThemeData {
  name: string;
  description?: string;
  colors: Theme['colors'];
  typography: Theme['typography'];
  spacing: Theme['spacing'];
  borderRadius: Theme['borderRadius'];
  shadows: Theme['shadows'];
}

export interface UpdateThemeData extends Partial<CreateThemeData> {
  id: string;
}

// Default theme configuration
export const defaultTheme: Omit<Theme, 'id' | 'created_by' | 'created_at' | 'updated_at'> = {
  name: 'Default',
  description: 'Default theme for the application',
  is_default: true,
  is_active: true,
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#10b981',
    background: '#ffffff',
    cardBackground: '#f9fafb',
    listBackground: '#f3f4f6',
    text: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    textInverted: '#ffffff',
    border: '#d1d5db',
    borderLight: '#e5e7eb',
    borderDark: '#9ca3af',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    hover: '#f3f4f6',
    focus: '#dbeafe',
    disabled: '#f3f4f6',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    // Card specific colors
    cardText: '#111827',
    cardTitle: '#1f2937',
    cardSubtitle: '#6b7280',
    cardBorder: '#e5e7eb',
    // List specific colors
    listText: '#111827',
    listTitle: '#1f2937',
    listBorder: '#d1d5db',
    // Board specific colors
    boardBackground: '#f9fafb',
    boardText: '#111827',
    boardTitle: '#1f2937',
    // Navigation colors
    navBackground: '#ffffff',
    navText: '#374151',
    navHover: '#f3f4f6',
    navActive: '#3b82f6',
    // Button colors
    buttonPrimary: '#3b82f6',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: '#f3f4f6',
    buttonSecondaryText: '#374151',
    buttonDanger: '#ef4444',
    buttonDangerText: '#ffffff',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
};

// LocalStorage key for themes
const THEMES_STORAGE_KEY = 'todo-app-themes';

// Load themes from localStorage or use defaults
function loadThemes(): Theme[] {
  try {
    const saved = localStorage.getItem(THEMES_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Failed to load themes from localStorage:', error);
  }
  // Return default themes if none saved
  return [
    {
      id: '1',
      ...defaultTheme,
      created_by: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Dark',
      description: 'Dark theme for low-light environments',
      is_default: false,
      is_active: true,
      created_by: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        background: '#1f2937',
        cardBackground: '#374151',
        listBackground: '#2d3748',
        text: '#f9fafb',
        textSecondary: '#d1d5db',
        textMuted: '#9ca3af',
        textInverted: '#1f2937',
        border: '#4b5563',
        borderLight: '#6b7280',
        borderDark: '#374151',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#6366f1',
        hover: '#4b5563',
        focus: '#6366f1',
        disabled: '#4b5563',
        shadow: 'rgba(0, 0, 0, 0.5)',
        overlay: 'rgba(0, 0, 0, 0.7)',
        cardText: '#f9fafb',
        cardTitle: '#ffffff',
        cardSubtitle: '#d1d5db',
        cardBorder: '#4b5563',
        listText: '#f9fafb',
        listTitle: '#ffffff',
        listBorder: '#4b5563',
        boardBackground: '#1f2937',
        boardText: '#f9fafb',
        boardTitle: '#ffffff',
        navBackground: '#374151',
        navText: '#f9fafb',
        navHover: '#4b5563',
        navActive: '#6366f1',
        buttonPrimary: '#6366f1',
        buttonPrimaryText: '#ffffff',
        buttonSecondary: '#4b5563',
        buttonSecondaryText: '#f9fafb',
        buttonDanger: '#ef4444',
        buttonDangerText: '#ffffff',
      },
      typography: defaultTheme.typography,
      spacing: defaultTheme.spacing,
      borderRadius: defaultTheme.borderRadius,
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
      },
    },
    {
      id: '3',
      name: 'Ocean',
      description: 'Ocean-inspired blue theme',
      is_default: false,
      is_active: true,
      created_by: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      colors: {
        primary: '#0891b2',
        secondary: '#06b6d4',
        accent: '#0284c7',
        background: '#f0f9ff',
        cardBackground: '#ffffff',
        listBackground: '#e0f2fe',
        text: '#0c4a6e',
        textSecondary: '#0369a1',
        textMuted: '#0891b2',
        textInverted: '#ffffff',
        border: '#bae6fd',
        borderLight: '#e0f2fe',
        borderDark: '#7dd3fc',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        info: '#0891b2',
        hover: '#e0f2fe',
        focus: '#0891b2',
        disabled: '#f0f9ff',
        shadow: 'rgba(8, 145, 178, 0.2)',
        overlay: 'rgba(12, 74, 110, 0.5)',
        cardText: '#0c4a6e',
        cardTitle: '#164e63',
        cardSubtitle: '#0369a1',
        cardBorder: '#bae6fd',
        listText: '#0c4a6e',
        listTitle: '#164e63',
        listBorder: '#7dd3fc',
        boardBackground: '#f0f9ff',
        boardText: '#0c4a6e',
        boardTitle: '#164e63',
        navBackground: '#ffffff',
        navText: '#0c4a6e',
        navHover: '#e0f2fe',
        navActive: '#0891b2',
        buttonPrimary: '#0891b2',
        buttonPrimaryText: '#ffffff',
        buttonSecondary: '#e0f2fe',
        buttonSecondaryText: '#0c4a6e',
        buttonDanger: '#dc2626',
        buttonDangerText: '#ffffff',
      },
      typography: defaultTheme.typography,
      spacing: defaultTheme.spacing,
      borderRadius: defaultTheme.borderRadius,
      shadows: defaultTheme.shadows,
    },
  ];
}

// Save themes to localStorage
function saveThemes(themes: Theme[]): void {
  try {
    localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify(themes));
  } catch (error) {
    console.warn('Failed to save themes to localStorage:', error);
  }
}

// Mock data for development (replace with real Supabase calls in production)
let mockThemes: Theme[] = loadThemes();

export const getAllThemes = async (): Promise<Theme[]> => {
  try {
    // In a real implementation, this would be:
    // const { data, error } = await supabase.from('themes').select('*');
    // if (error) throw error;
    // return data || [];
    
    return mockThemes;
  } catch (error) {
    console.error('Error fetching themes:', error);
    throw error;
  }
};

export const getThemeById = async (id: string): Promise<Theme | null> => {
  try {
    // In a real implementation:
    // const { data, error } = await supabase.from('themes').select('*').eq('id', id).single();
    // if (error) throw error;
    // return data;
    
    return mockThemes.find(theme => theme.id === id) || null;
  } catch (error) {
    console.error('Error fetching theme:', error);
    throw error;
  }
};

export const createTheme = async (themeData: CreateThemeData): Promise<Theme> => {
  try {
    const newTheme: Theme = {
      id: Date.now().toString(),
      ...themeData,
      created_by: 'current-user', // Replace with actual user ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_default: false,
      is_active: true,
      typography: { ...defaultTheme.typography, ...themeData.typography },
      spacing: { ...defaultTheme.spacing, ...themeData.spacing },
      borderRadius: { ...defaultTheme.borderRadius, ...themeData.borderRadius },
      shadows: { ...defaultTheme.shadows, ...themeData.shadows },
    };

    // In a real implementation:
    // const { data, error } = await supabase.from('themes').insert([newTheme]).select().single();
    // if (error) throw error;
    // return data;
    
    mockThemes.push(newTheme);
    saveThemes(mockThemes); // Save to localStorage
    return newTheme;
  } catch (error) {
    console.error('Error creating theme:', error);
    throw error;
  }
};

export const updateTheme = async (themeData: UpdateThemeData): Promise<Theme> => {
  try {
    const existingTheme = mockThemes.find(t => t.id === themeData.id);
    if (!existingTheme) {
      throw new Error('Theme not found');
    }

    const updatedTheme: Theme = {
      ...existingTheme,
      ...themeData,
      typography: themeData.typography ? 
        { ...existingTheme.typography, ...themeData.typography } : 
        existingTheme.typography,
      spacing: themeData.spacing ? 
        { ...existingTheme.spacing, ...themeData.spacing } : 
        existingTheme.spacing,
      borderRadius: themeData.borderRadius ? 
        { ...existingTheme.borderRadius, ...themeData.borderRadius } : 
        existingTheme.borderRadius,
      shadows: themeData.shadows ? 
        { ...existingTheme.shadows, ...themeData.shadows } : 
        existingTheme.shadows,
      updated_at: new Date().toISOString(),
    };

    // In a real implementation:
    // const { data, error } = await supabase.from('themes')
    //   .update(updatedTheme)
    //   .eq('id', themeData.id)
    //   .select()
    //   .single();
    // if (error) throw error;
    // return data;
    
    const index = mockThemes.findIndex(t => t.id === themeData.id);
    mockThemes[index] = updatedTheme;
    saveThemes(mockThemes); // Save to localStorage
    return updatedTheme;
  } catch (error) {
    console.error('Error updating theme:', error);
    throw error;
  }
};

export const deleteTheme = async (id: string): Promise<void> => {
  try {
    const theme = mockThemes.find(t => t.id === id);
    if (!theme) {
      throw new Error('Theme not found');
    }
    if (theme.is_default) {
      throw new Error('Cannot delete default theme');
    }

    // In a real implementation:
    // const { error } = await supabase.from('themes').delete().eq('id', id);
    // if (error) throw error;
    
    mockThemes = mockThemes.filter(t => t.id !== id);
  } catch (error) {
    console.error('Error deleting theme:', error);
    throw error;
  }
};

export const setDefaultTheme = async (id: string): Promise<void> => {
  try {
    // In a real implementation:
    // await supabase.from('themes').update({ is_default: false }).neq('id', id);
    // const { error } = await supabase.from('themes').update({ is_default: true }).eq('id', id);
    // if (error) throw error;
    
    mockThemes = mockThemes.map(theme => ({
      ...theme,
      is_default: theme.id === id,
    }));
    saveThemes(mockThemes); // Save to localStorage
  } catch (error) {
    console.error('Error setting default theme:', error);
    throw error;
  }
};

export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  
  // Apply colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  // Apply typography
  root.style.setProperty('--font-family', theme.typography.fontFamily);
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    root.style.setProperty(`--font-size-${key}`, value);
  });
  Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
    root.style.setProperty(`--font-weight-${key}`, value);
  });
  
  // Apply spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });
  
  // Apply border radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--border-radius-${key}`, value);
  });
  
  // Apply shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value);
  });
};