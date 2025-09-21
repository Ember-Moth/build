import { isBrowser } from '@builder.io/qwik';
import Cookies from 'universal-cookie';

/**
 * Available theme modes
 * - light: Light theme
 * - dark: Dark theme
 * - system: Follow system preference
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Actual theme applied (excluding system mode)
 */
export type SystemTheme = 'light' | 'dark';

/**
 * Theme management class
 * Handles theme persistence, switching and system preference sync
 */
export class ThemeManager {
  // Storage keys for theme preferences
  private readonly THEME_KEY = 'theme';
  private readonly SYSTEM_THEME_KEY = 'system-theme';
  private cookies: Cookies;

  /**
   * Initialize theme manager with optional cookie header for SSR
   */
  constructor(cookieHeader?: string) {
    this.cookies = new Cookies(cookieHeader || null, { path: '/' });

    if (isBrowser) {
      this.initSystemThemeListener();
    }
  }

  /**
   * Initialize system theme change listener
   * Updates theme when system preference changes if using system theme
   */
  private initSystemThemeListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.getTheme() === 'system') {
        this.setTheme('system');
      }
    });
  }

  /**
   * Get current system color scheme preference
   * Returns 'light' for SSR to avoid hydration mismatch
   */
  private getSystemPreference(): SystemTheme {
    if (!isBrowser) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Get user's theme preference from storage
   * Returns 'system' if no preference is set
   */
  public getTheme(): Theme {
    const theme = this.cookies.get(this.THEME_KEY);
    if (!theme && isBrowser) {
      this.setTheme('system');
      return 'system';
    }
    return theme;
  }

  /**
   * Update DOM to reflect current theme
   * Updates: class names, color-scheme, window variables
   */
  private updateDOM(theme: SystemTheme) {
    if (!isBrowser) return;

    const doc = document.documentElement;
    const win = window as any;

    // Update class names
    doc.classList.remove('light', 'dark');
    doc.classList.add(theme);

    // Update color scheme
    doc.style.colorScheme = theme;

    // Update window variables
    win.isDark = theme === 'dark';
  }

  /**
   * Set and persist theme preference
   * Updates DOM and saves to storage
   */
  public setTheme(theme: Theme): void {
    if (!isBrowser) return;

    // Save user selected theme
    this.cookies.set(this.THEME_KEY, theme, {
      maxAge: 60 * 60 * 24 * 365,
    });

    // Save current system theme state
    const systemTheme = this.getSystemPreference();
    this.cookies.set(this.SYSTEM_THEME_KEY, systemTheme, {
      maxAge: 60 * 60 * 24 * 365,
    });

    // Update DOM with real theme
    const realTheme = theme === 'system' ? systemTheme : theme;
    this.updateDOM(realTheme);
  }

  /**
   * Sync theme state from server without triggering side effects
   */
  public syncFromServer(theme: SystemTheme): void {
    if (!isBrowser) return;
    this.cookies.set(this.THEME_KEY, theme, {
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  /**
   * Get current system theme from storage or system preference
   */
  public getSystemTheme(): SystemTheme {
    return (this.cookies.get(this.SYSTEM_THEME_KEY) || this.getSystemPreference()) as SystemTheme;
  }

  /**
   * Get actual theme being applied
   * Resolves 'system' to actual theme based on system preference
   * For SSR, gets theme from cookie to avoid hydration mismatch
   */
  public getRealTheme(): SystemTheme {
    const theme = this.getTheme();
    if (theme === 'system') {
      return isBrowser ? this.getSystemPreference() : this.getSystemTheme();
    }
    return theme;
  }

  /**
   * Sync system theme preference with storage
   */
  public syncSystemTheme(): void {
    if (!isBrowser) return;
    const systemTheme = this.getSystemPreference();
    this.cookies.set(this.SYSTEM_THEME_KEY, systemTheme, {
      maxAge: 60 * 60 * 24 * 365,
    });
  }
}

// Export singleton instance
export const themeManager = new ThemeManager();
