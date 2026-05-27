import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme, Appearance } from 'react-native';

/**
 * Native implementation of useColorScheme with proper fallback
 */
export function useColorScheme() {
  const systemColorScheme = useRNColorScheme();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | null>(
    systemColorScheme || 'light'
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme || 'light');
    });

    return () => subscription.remove();
  }, []);

  return colorScheme || systemColorScheme || 'light';
}
