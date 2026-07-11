import React from 'react';

const ThemeModeContext = React.createContext({
  mode: 'system',
  setMode: () => {},
  resolvedMode: 'light',
});

export function useThemeMode() {
  return React.useContext(ThemeModeContext);
}

export function ThemeModeProvider({ children }) {
  const getSystemPrefersDark = () => {
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  };

  const [mode, setMode] = React.useState(() => {
    try {
      return localStorage.getItem('lf_theme_mode') || 'system';
    } catch {
      return 'system';
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('lf_theme_mode', mode);
    } catch {
      // ignore
    }
  }, [mode]);

  const [systemPrefersDark, setSystemPrefersDark] = React.useState(getSystemPrefersDark());

  React.useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemPrefersDark(!!e.matches);

    if (mql && mql.addEventListener) mql.addEventListener('change', handler);
    else if (mql && mql.addListener) mql.addListener(handler);

    return () => {
      if (mql && mql.removeEventListener) mql.removeEventListener('change', handler);
      else if (mql && mql.removeListener) mql.removeListener(handler);
    };
  }, []);

  const resolvedMode = mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : mode;

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, resolvedMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

