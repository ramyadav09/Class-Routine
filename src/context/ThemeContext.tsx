import React, {createContext, useContext, useState, useEffect, useCallback, ReactNode} from 'react';
import {COLORS} from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../utils/constants';
import {ThemeMode} from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  colors: typeof COLORS.light;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

const defaultColors = COLORS.light;

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: defaultColors,
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: false,
});

export const ThemeProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark' || saved === 'light') {
        setThemeState(saved);
      }
    } catch {}
  };

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(STORAGE_KEYS.THEME, next);
      return next;
    });
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    AsyncStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  }, []);

  const colors = COLORS[theme];
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider
      value={{theme, colors, toggleTheme, setTheme, isDark}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);