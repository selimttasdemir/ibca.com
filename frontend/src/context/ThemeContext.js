import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  classic: {
    name: 'classic',
    primary: '#6B1515',
    secondary: '#F5E6D3',
    background: '#8B3A3A',
    card: '#FFF8E7',
    text: '#2D1B1B',
    border: '#D4AF37',
    accent: '#C17F3E'
  },
  modern: {
    name: 'modern',
    primary: '#1E3A8A',
    secondary: '#E0E7FF',
    background: '#F1F5F9',
    card: '#FFFFFF',
    text: '#1E293B',
    border: '#CBD5E1',
    accent: '#3B82F6'
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'classic';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'classic' ? 'modern' : 'classic');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, currentTheme: themes[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};