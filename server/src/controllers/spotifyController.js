import spotifyService from '../services/spotifyService.js';
import { generateRandomString } from '../utils/crypto.js';

export const getAuthUrl = (req, res) => {
  const state = generateRandomString(16);
  const url = spotifyService.generateAuthUrl(state);
  
  res.json({ 
    url: url,
    state: state 
  });
};

export const exchangeToken = async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }
  
  try {
    const tokens = await spotifyService.exchangeCodeForToken(code);
    res.json(tokens);
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
};

export const refreshToken = async (req, res) => {
  const { refresh_token } = req.body;
  
  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }
  
  try {
    const tokens = await spotifyService.refreshToken(refresh_token);
    res.json(tokens);
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
};

export const searchTracks = async (req, res) => {
  const { tracks, artist, access_token } = req.body;
  
  if (!tracks || !artist || !access_token) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  try {
    const result = await spotifyService.searchTracks(tracks, artist, access_token);
    res.json(result);
  } catch (error) {
    console.error('Search tracks error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to search tracks' });
  }
};

export const createPlaylist = async (req, res) => {
  const { name, description, tracks, access_token, isPublic = false } = req.body;
  
  if (!name || !tracks || !access_token) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  try {
    const result = await spotifyService.createPlaylistWithTracks(
      name, 
      description, 
      tracks, 
      access_token, 
      isPublic
    );
    res.json(result);
  } catch (error) {
    console.error('Playlist creation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
};