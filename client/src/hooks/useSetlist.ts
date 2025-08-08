import { useState } from 'react';
import type { Setlist, SpotifyTrack } from '../types';
import { apiService } from '../services/api';
import { setlistUtils } from '../utils/setlist';

export const useSetlist = () => {
  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [spotifyTracks, setSpotifyTracks] = useState<SpotifyTrack[]>([]);
  const [notFoundTracks, setNotFoundTracks] = useState<string[]>([]);
  const [playlistCreated, setPlaylistCreated] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSetlist = async (url: string) => {
    if (!url.trim()) return;
    
    setLoading(true);
    setError('');
    setPlaylistCreated(false);
    setPlaylistUrl('');
    
    try {
      const setlistData = await apiService.getSetlistFromUrl(url);
      setSetlist(setlistData);
      return setlistData;
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('Setlist not found. Please check the URL.');
      } else if (error.response?.status === 400) {
        setError('Invalid setlist URL. Please paste a valid setlist.fm link.');
      } else {
        setError('Failed to load setlist. Please try again.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchSpotifyTracks = async (setlistData: Setlist, accessToken: string, onTokenExpired?: () => Promise<void>) => {
    setLoading(true);
    setError('');
    
    try {
      const songs = setlistUtils.getSongsFromSetlist(setlistData);
      const result = await apiService.searchSpotifyTracks(songs, setlistData.artist.name, accessToken);
      
      setSpotifyTracks(result.foundTracks);
      setNotFoundTracks(result.notFoundTracks);
    } catch (error: any) {
      if (error.response?.status === 401 && onTokenExpired) {
        // Token expired, try to refresh
        await onTokenExpired();
      } else {
        setError('Failed to search for tracks on Spotify');
      }
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async (
    name: string, 
    description: string, 
    accessToken: string,
    isPublic: boolean = false,
    onTokenExpired?: () => Promise<void>
  ) => {
    if (spotifyTracks.length === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await apiService.createSpotifyPlaylist(
        name,
        description,
        spotifyTracks,
        accessToken,
        isPublic
      );
      
      if (result.success) {
        setPlaylistCreated(true);
        setPlaylistUrl(result.playlistUrl);
      }
    } catch (error: any) {
      if (error.response?.status === 401 && onTokenExpired) {
        // Token expired, try to refresh
        await onTokenExpired();
      } else {
        setError('Failed to create playlist. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSetlist(null);
    setSpotifyTracks([]);
    setNotFoundTracks([]);
    setPlaylistCreated(false);
    setPlaylistUrl('');
    setError('');
  };

  return {
    setlist,
    spotifyTracks,
    notFoundTracks,
    playlistCreated,
    playlistUrl,
    loading,
    error,
    loadSetlist,
    searchSpotifyTracks,
    createPlaylist,
    reset
  };
};