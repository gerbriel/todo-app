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
  colors: Record<string, string> & {
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
    siteBackground: string;
    sidebarBackground: string;
    navbarBackground: string;
  };
  siteName?: string;
  siteLogo?: string;
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    fontWeight: Record<string, string>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

export interface CreateThemeData {
  name: string;
  description?: string;
  colors: Theme['colors'];
  siteName?: string;
  siteLogo?: string;
  typography: Theme['typography'];
  spacing: Theme['spacing'];
  borderRadius: Theme['borderRadius'];
  shadows: Theme['shadows'];
}

export interface UpdateThemeData extends Partial<CreateThemeData> {
  id: string;
}

// LocalStorage helpers (mock/demo mode)
const THEMES_STORAGE_KEY = 'todo-app-themes';

function loadThemesFromStorage(): Theme[] {
  try {
    const saved = localStorage.getItem(THEMES_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to parse themes from localStorage', e);
  }
  return [];
}

function saveThemesToStorage(themes: Theme[]) {
  try {
    localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify(themes));
  } catch (e) {
    console.warn('Failed to save themes to localStorage', e);
  }
}

// Default theme
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
    cardText: '#111827',
    cardTitle: '#1f2937',
    cardSubtitle: '#6b7280',
    cardBorder: '#e5e7eb',
    listText: '#111827',
    listTitle: '#1f2937',
    listBorder: '#d1d5db',
    boardBackground: '#f9fafb',
    boardText: '#111827',
    boardTitle: '#1f2937',
    navBackground: '#ffffff',
    navText: '#374151',
    navHover: '#f3f4f6',
    navActive: '#3b82f6',
    buttonPrimary: '#3b82f6',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: '#f3f4f6',
    buttonSecondaryText: '#374151',
    buttonDanger: '#ef4444',
    buttonDangerText: '#ffffff',
    siteBackground: '#f3f4f6',
    sidebarBackground: '#e5e7eb',
    navbarBackground: '#ffffff',
  },
  siteName: 'Todo App',
  siteLogo: '',
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem' },
    fontWeight: { normal: '400', medium: '500', semibold: '600', bold: '700' },
  },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', '2xl': '3rem' },
  borderRadius: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem', full: '9999px' },
  shadows: { sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)', lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)', xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)' },
};

// Seeded mock themes
let mockThemes: Theme[] = (() => {
  const stored = loadThemesFromStorage();
  if (stored && stored.length > 0) return stored;
  const now = new Date().toISOString();
  const base: Theme = { id: '1', name: defaultTheme.name, description: defaultTheme.description, is_default: true, is_active: true, colors: defaultTheme.colors, typography: defaultTheme.typography, spacing: defaultTheme.spacing, borderRadius: defaultTheme.borderRadius, shadows: defaultTheme.shadows, siteName: defaultTheme.siteName, siteLogo: defaultTheme.siteLogo, created_by: 'admin', created_at: now, updated_at: now };
  const dark: Theme = { id: '2', name: 'Dark', description: 'Dark theme', is_default: false, is_active: true, colors: { ...defaultTheme.colors, background: '#1f2937', cardBackground: '#374151', listBackground: '#2d3748', text: '#f9fafb' }, typography: defaultTheme.typography, spacing: defaultTheme.spacing, borderRadius: defaultTheme.borderRadius, shadows: defaultTheme.shadows, siteName: defaultTheme.siteName, siteLogo: defaultTheme.siteLogo, created_by: 'admin', created_at: now, updated_at: now };
  const ocean: Theme = { id: '3', name: 'Ocean', description: 'Ocean-inspired blue theme', is_default: false, is_active: true, colors: { ...defaultTheme.colors, primary: '#0891b2', background: '#f0f9ff' }, typography: defaultTheme.typography, spacing: defaultTheme.spacing, borderRadius: defaultTheme.borderRadius, shadows: defaultTheme.shadows, siteName: defaultTheme.siteName, siteLogo: defaultTheme.siteLogo, created_by: 'admin', created_at: now, updated_at: now };
  const seeded = [base, dark, ocean];
  saveThemesToStorage(seeded);
  return seeded;
})();

// API (mocked). Swap to Supabase-based queries when you're ready.
export const getAllThemes = async (): Promise<Theme[]> => mockThemes;

export const getThemeById = async (id: string): Promise<Theme | null> => mockThemes.find(t => t.id === id) || null;

export const createTheme = async (themeData: CreateThemeData): Promise<Theme> => {
  const now = new Date().toISOString();
  const newTheme: Theme = { id: Date.now().toString(), ...themeData, created_by: 'current-user', created_at: now, updated_at: now, is_default: false, is_active: true } as Theme;
  mockThemes.push(newTheme);
  saveThemesToStorage(mockThemes);
  return newTheme;
};

export const updateTheme = async (themeData: UpdateThemeData): Promise<Theme> => {
  const idx = mockThemes.findIndex(t => t.id === themeData.id);
  if (idx === -1) throw new Error('Theme not found');
  const updated: Theme = { ...mockThemes[idx], ...themeData, updated_at: new Date().toISOString() } as Theme;
  mockThemes[idx] = updated;
  saveThemesToStorage(mockThemes);
  return updated;
};

export const deleteTheme = async (id: string): Promise<void> => {
  const theme = mockThemes.find(t => t.id === id);
  if (!theme) throw new Error('Theme not found');
  if (theme.is_default) throw new Error('Cannot delete default theme');
  mockThemes = mockThemes.filter(t => t.id !== id);
  saveThemesToStorage(mockThemes);
};

export const setDefaultTheme = async (id: string): Promise<void> => {
  mockThemes = mockThemes.map(t => ({ ...t, is_default: t.id === id }));
  saveThemesToStorage(mockThemes);
};

export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => root.style.setProperty(`--color-${key}`, value));
  root.style.setProperty('--font-family', theme.typography.fontFamily);
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => root.style.setProperty(`--font-size-${key}`, value));
  Object.entries(theme.typography.fontWeight).forEach(([key, value]) => root.style.setProperty(`--font-weight-${key}`, value));
  Object.entries(theme.spacing).forEach(([key, value]) => root.style.setProperty(`--spacing-${key}`, value));
  Object.entries(theme.borderRadius).forEach(([key, value]) => root.style.setProperty(`--border-radius-${key}`, value));
  Object.entries(theme.shadows).forEach(([key, value]) => root.style.setProperty(`--shadow-${key}`, value));
};
