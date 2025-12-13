import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
export type BackgroundStyle = 'solid' | 'gradient' | 'pattern';

export interface ThemeSettings {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  backgroundStyle: BackgroundStyle;
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  isDark: boolean;
  settings: ThemeSettings;
}

const COLOR_SCHEMES = {
  blue: { primary: '#007AFF', secondary: '#34C759', accent: '#FF9500' },
  green: { primary: '#34C759', secondary: '#007AFF', accent: '#FF3B30' },
  purple: { primary: '#AF52DE', secondary: '#5856D6', accent: '#FF9500' },
  orange: { primary: '#FF9500', secondary: '#FF3B30', accent: '#34C759' },
  red: { primary: '#FF3B30', secondary: '#FF9500', accent: '#007AFF' },
  indigo: { primary: '#5856D6', secondary: '#AF52DE', accent: '#34C759' },
};

const LIGHT_COLORS = {
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#1c1c1e',
  textSecondary: '#666666',
  border: '#e0e0e0',
  error: '#ff3b30',
  success: '#34c759',
  warning: '#ff9500',
};

const DARK_COLORS = {
  background: '#000000',
  surface: '#1c1c1e',
  text: '#ffffff',
  textSecondary: '#8e8e93',
  border: '#38383a',
  error: '#ff453a',
  success: '#32d74b',
  warning: '#ff9f0a',
};

const DEFAULT_SETTINGS: ThemeSettings = {
  mode: 'auto',
  colorScheme: 'blue',
  backgroundStyle: 'solid',
  reducedMotion: false,
  highContrast: false,
};

interface ThemeContextType {
  theme: Theme;
  settings: ThemeSettings;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  resetToDefaults: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'theme_settings';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveSettings(settings);
    }
  }, [settings, isLoaded]);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveSettings = async (newSettings: ThemeSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save theme settings:', error);
    }
  };

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  // Determine if dark mode should be active
  const isDarkMode = settings.mode === 'dark' || 
    (settings.mode === 'auto' && systemColorScheme === 'dark');

  // Create theme object
  const theme: Theme = {
    colors: {
      ...COLOR_SCHEMES[settings.colorScheme],
      ...(isDarkMode ? DARK_COLORS : LIGHT_COLORS),
    },
    isDark: isDarkMode,
    settings,
  };

  // Apply high contrast adjustments
  if (settings.highContrast) {
    theme.colors.text = isDarkMode ? '#ffffff' : '#000000';
    theme.colors.textSecondary = isDarkMode ? '#cccccc' : '#333333';
    theme.colors.border = isDarkMode ? '#666666' : '#999999';
  }

  const contextValue: ThemeContextType = {
    theme,
    settings,
    updateSettings,
    resetToDefaults,
  };

  if (!isLoaded) {
    return null; // or a loading screen
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const createThemedStyles = <T extends Record<string, any>>(
  styleCreator: (theme: Theme) => T
) => {
  return (theme: Theme) => styleCreator(theme);
};