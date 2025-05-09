// ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from '../utils/themes';

type ThemeKey = keyof typeof themes;

interface ThemeContextType {
  theme: typeof themes.default;
  themeKey: ThemeKey;
  setThemeByKey: (key: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes.default,
  themeKey: 'default',
  setThemeByKey: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeKey, setThemeKey] = useState<ThemeKey>('default');
  const [theme, setTheme] = useState(themes.default);

  useEffect(() => {
    AsyncStorage.getItem('activeTheme').then((stored) => {
      if (stored && themes[stored as ThemeKey]) {
        setThemeByKey(stored as ThemeKey); // ✅ use your state-updating function
      }
    });
  }, []);
  

  const setThemeByKey = async (key: ThemeKey) => {
    await AsyncStorage.setItem('activeTheme', key);
    console.log('🟢 Theme set to:', key); // helpful debug
    setThemeKey(key);
    setTheme(themes[key]);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeKey, setThemeByKey }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ✅ THIS must be exported!
export const useTheme = () => useContext(ThemeContext);
