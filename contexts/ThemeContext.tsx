
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Theme {
  id: string;
  name: string;
  primaryHue: number;
  primarySat: string;
  neutralHue: number;
  neutralSat: string;
}

export const THEMES: Theme[] = [
  { id: 'classic', name: 'Classic Blue', primaryHue: 221, primarySat: '83%', neutralHue: 215, neutralSat: '25%' },
  { id: 'forest', name: 'Forest Green', primaryHue: 150, primarySat: '60%', neutralHue: 150, neutralSat: '10%' },
  { id: 'royal', name: 'Royal Purple', primaryHue: 270, primarySat: '60%', neutralHue: 270, neutralSat: '15%' },
  { id: 'sunset', name: 'Sunset Orange', primaryHue: 25, primarySat: '90%', neutralHue: 30, neutralSat: '15%' },
  { id: 'crimson', name: 'Crimson Red', primaryHue: 345, primarySat: '80%', neutralHue: 210, neutralSat: '10%' },
  { id: 'ocean', name: 'Ocean Teal', primaryHue: 190, primarySat: '75%', neutralHue: 195, neutralSat: '15%' },
  { id: 'luxury', name: 'Luxury Gold', primaryHue: 45, primarySat: '80%', neutralHue: 40, neutralSat: '15%' },
  { id: 'midnight', name: 'Midnight Indigo', primaryHue: 235, primarySat: '70%', neutralHue: 230, neutralSat: '25%' },
  { id: 'berry', name: 'Berry Pink', primaryHue: 330, primarySat: '70%', neutralHue: 330, neutralSat: '10%' },
  { id: 'steel', name: 'Steel Monochrome', primaryHue: 210, primarySat: '10%', neutralHue: 210, neutralSat: '10%' },
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);

  useEffect(() => {
    // Load saved theme from localStorage if available
    const savedThemeId = localStorage.getItem('sm360_theme');
    if (savedThemeId) {
      const theme = THEMES.find(t => t.id === savedThemeId);
      if (theme) setCurrentTheme(theme);
    }
  }, []);

  useEffect(() => {
    // Inject CSS variables into root
    const root = document.documentElement;
    root.style.setProperty('--primary-hue', currentTheme.primaryHue.toString());
    root.style.setProperty('--primary-sat', currentTheme.primarySat);
    root.style.setProperty('--neutral-hue', currentTheme.neutralHue.toString());
    root.style.setProperty('--neutral-sat', currentTheme.neutralSat);
    
    // Save to local storage
    localStorage.setItem('sm360_theme', currentTheme.id);
  }, [currentTheme]);

  const setTheme = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (theme) setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
