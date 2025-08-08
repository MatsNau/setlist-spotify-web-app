import { useState, useEffect } from 'react';
import type { AuthTokens } from '../types';
import { apiService } from '../services/api';
import { authUtils } from '../utils/auth';

export const useSpotifyAuth = () => {
  const [tokens, setTokens] = useState<AuthTokens | null>(authUtils.getStoredTokens());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      exchangeCodeForToken(code);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Check and refresh token if needed
  useEffect(() => {
    if (tokens && authUtils.isTokenExpired(tokens) && tokens.refresh_token) {
      refreshAccessToken();
    }
  }, [tokens]);

  const exchangeCodeForToken = async (code: string) => {
    setLoading(true);
    setError('');
    
    try {
      const { access_token, refresh_token, expires_in } = await apiService.exchangeSpotifyToken(code);
      const savedTokens = authUtils.saveTokens(access_token, expires_in, refresh_token);
      setTokens(savedTokens);
    } catch (error) {
      setError('Failed to authenticate with Spotify');
      console.error('Token exchange error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    if (!tokens?.refresh_token) return;
    
    try {
      const { access_token, expires_in } = await apiService.refreshSpotifyToken(tokens.refresh_token);
      const savedTokens = authUtils.saveTokens(access_token, expires_in);
      setTokens(savedTokens);
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, clear tokens and require re-login
      logout();
    }
  };

  const login = async () => {
    setError('');
    
    try {
      const { url } = await apiService.getSpotifyAuthUrl();
      window.location.href = url;
    } catch (error) {
      setError('Failed to initiate Spotify login');
    }
  };

  const logout = () => {
    authUtils.clearTokens();
    setTokens(null);
    setError('');
  };

  return {
    tokens,
    loading,
    error,
    login,
    logout,
    refreshAccessToken
  };
};