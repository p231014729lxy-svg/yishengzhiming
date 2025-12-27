import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Try to load saved theme from localStorage, otherwise default to time-based
  const [theme, setTheme] = useState(() => {
      const saved = localStorage.getItem('app-theme');
      if (saved) return saved;
      
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 17) return 'day';
      if (hour >= 17 && hour < 20) return 'dusk';
      return 'night';
  });

  // Manual toggle function
  const cycleTheme = () => {
      setTheme(prev => {
          const next = prev === 'day' ? 'dusk' : prev === 'dusk' ? 'night' : 'day';
          localStorage.setItem('app-theme', next); // Save preference
          return next;
      });
  };

  // Only auto-update if user hasn't manually set a preference? 
  // Or maybe we just let manual override persist until page reload?
  // Let's stick to manual override persists.
  // Removing the interval for now to respect user choice, or we can make a "auto" mode later.
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      <div className={`theme-${theme} min-h-screen transition-colors duration-1000`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
