import { useStore } from '@nanostores/react';
import { memo, useEffect, useState } from 'react';
import { themeStore, toggleTheme } from '~/lib/stores/theme';
import { IconButton } from './IconButton';

interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch = memo(({ className }: ThemeSwitchProps) => {
  const theme = useStore(themeStore);
  const [domLoaded, setDomLoaded] = useState(false);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  return (
    domLoaded && (
      <IconButton
        className={`text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all ${className || ''}`}
        icon={theme === 'dark' ? 'i-ph-sun-dim-duotone' : 'i-ph-moon-stars-duotone'}
        size="xl"
        title="Toggle Theme"
        onClick={toggleTheme}
      />
    )
  );
});
