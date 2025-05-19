import { useEffect, useState } from 'react';
import { useColorScheme as _useColorScheme } from 'react-native';

// The useColorScheme value is always either light or dark, but the built-in
// type suggests that it can be null. This will not happen in practice, so this
// makes it a bit easier to work with.
export type ColorScheme = 'light' | 'dark';

export function useColorScheme(): ColorScheme {
  const colorScheme = _useColorScheme() as ColorScheme | null;
  const [scheme, setScheme] = useState<ColorScheme>(colorScheme || 'light');
  
  useEffect(() => {
    if (colorScheme) {
      setScheme(colorScheme);
    }
  }, [colorScheme]);
  
  return scheme;
}