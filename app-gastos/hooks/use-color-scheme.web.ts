import { useEffect, useState } from 'react';

/**
 * Web implementation of useColorScheme that detects system preferences
 */
export function useColorScheme() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    // Check if dark mode is preferred
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateColorScheme = () => {
      setColorScheme(darkModeQuery.matches ? 'dark' : 'light');
    };

    // Set initial value
    updateColorScheme();

    // Listen for changes
    darkModeQuery.addEventListener('change', updateColorScheme);
    
    return () => {
      darkModeQuery.removeEventListener('change', updateColorScheme);
    };
  }, []);

  return colorScheme;
}
