import {
  $,
  createContextId,
  useContext,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from '@builder.io/qwik';
import { themeManager, type SystemTheme, type Theme } from '~/utils/theme';

export interface ThemeStore {
  theme: Theme;
  realTheme: SystemTheme;
}

export const ThemeContext = createContextId<ThemeStore>('theme-context');

export const useProvideThemeStore = () => {
  const store = useStore<ThemeStore>({
    theme: 'system',
    realTheme: 'light',
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    store.theme = themeManager.getTheme();
    store.realTheme = themeManager.getRealTheme();
  });

  useContextProvider(ThemeContext, store);

  return store;
};

export const useThemeStore = () => {
  const store = useContext(ThemeContext);

  const setTheme = $((newTheme: Theme) => {
    themeManager.setTheme(newTheme);
    store.theme = newTheme;
    store.realTheme = themeManager.getRealTheme();
  });

  return {
    store,
    setTheme,
  };
};
