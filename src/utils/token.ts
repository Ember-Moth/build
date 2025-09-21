import { isBrowser } from '@builder.io/qwik';
import Cookies from 'universal-cookie';

/**
 * Token Manager class
 * Handles authentication token storage, retrieval and validation
 */
export class TokenManager {
  // Storage key for token
  private readonly TOKEN_KEY = 'token';
  private cookies: Cookies;

  /**
   * Initialize token manager with optional cookie header for SSR
   */
  constructor(cookieHeader?: string) {
    this.cookies = new Cookies(cookieHeader || null, { path: '/' });
  }

  /**
   * Check if user is authenticated (has a valid token)
   */
  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get authentication token
   */
  public getToken(): string | null {
    return this.cookies.get(this.TOKEN_KEY) || null;
  }

  /**
   * Save authentication token
   * @param token The authentication token to save
   * @param expiresInDays Number of days until token expires (default: 30 days)
   */
  public setToken(token: string, expiresInDays: number = 30): void {
    const cookieOptions = {
      maxAge: 60 * 60 * 24 * expiresInDays,
      // secure: process.env.NODE_ENV === "production",
      // sameSite: "strict" as const,
    };

    this.cookies.set(this.TOKEN_KEY, token, cookieOptions);
  }

  /**
   * Clear authentication token (logout)
   */
  public clearToken(): void {
    this.cookies.remove(this.TOKEN_KEY);
  }

  /**
   * Get authorization header for API requests
   * @returns Object with Authorization header if token exists, empty object otherwise
   */
  public getAuthorization(authorization?: string | null): string | null {
    if (authorization) return authorization;
    if (!isBrowser) return null;
    return this.getToken();
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();
