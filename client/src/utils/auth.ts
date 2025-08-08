import type { AuthTokens } from '../types';

const TOKEN_KEY = 'spotify_auth_tokens';

export const authUtils = {
  saveTokens(access_token: string, expires_in: number, refresh_token?: string): AuthTokens {
    const tokens: AuthTokens = {
      access_token,
      expires_at: Date.now() + (expires_in * 1000),
      refresh_token: refresh_token || this.getStoredTokens()?.refresh_token
    };
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    return tokens;
  },

  getStoredTokens(): AuthTokens | null {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  isTokenExpired(tokens: AuthTokens): boolean {
    return Date.now() >= tokens.expires_at;
  }
};