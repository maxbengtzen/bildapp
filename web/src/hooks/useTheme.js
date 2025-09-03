import { useState, useEffect } from 'react';

const useTheme = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference on mount
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    applyTheme(prefersDark);

    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        setIsDark(e.matches);
        applyTheme(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const applyTheme = (isDarkMode) => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  };

  return {
    isDark,
    applyTheme
  };
};

export default useTheme;