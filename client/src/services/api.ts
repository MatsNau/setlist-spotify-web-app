import axios from 'axios';
import type { SpotifyTrack } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const apiService = {
  // Health check
  async checkHealth() {
    const response = await axios.get(`${API_URL}/health`);
    return response.data;
  },

  // Spotify authentication
  async getSpotifyAuthUrl() {
    const response = await axios.get(`${API_URL}/spotify/auth-url`);
    return response.data;
  },

  async exchangeSpotifyToken(code: string) {
    const response = await axios.post(`${API_URL}/spotify/token`, { code });
    return response.data;
  },

  async refreshSpotifyToken(refreshToken: string) {
    const response = await axios.post(`${API_URL}/spotify/refresh`, {
      refresh_token: refreshToken
    });
    return response.data;
  },

  // Spotify operations
  async searchSpotifyTracks(tracks: string[], artist: string, accessToken: string) {
    const response = await axios.post(`${API_URL}/spotify/search-tracks`, {
      tracks,
      artist,
      access_token: accessToken
    });
    return response.data;
  },

  async createSpotifyPlaylist(
    name: string, 
    description: string, 
    tracks: SpotifyTrack[], 
    accessToken: string, 
    isPublic: boolean = false
  ) {
    const response = await axios.post(`${API_URL}/spotify/create-playlist`, {
      name,
      description,
      tracks,
      access_token: accessToken,
      isPublic
    });
    return response.data;
  },

  // Setlist operations
  async getSetlistById(id: string) {
    const response = await axios.get(`${API_URL}/setlist/${id}`);
    return response.data;
  },

  async getSetlistFromUrl(url: string) {
    const response = await axios.post(`${API_URL}/setlist/from-url`, { url });
    return response.data;
  }
};