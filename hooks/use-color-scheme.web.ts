import { useTheme } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';

export function useColorScheme() {
  const { theme } = useTheme();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (hasHydrated) {
    return theme;
  }

  return 'light';
}
