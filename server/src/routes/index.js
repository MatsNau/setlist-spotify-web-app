import express from 'express';
import { getHealth } from '../controllers/healthController.js';
import { getAuthUrl, exchangeToken, refreshToken, searchTracks, createPlaylist } from '../controllers/spotifyController.js';
import { getSetlistById, getSetlistFromUrl } from '../controllers/setlistController.js';

const router = express.Router();

// Health check
router.get('/health', getHealth);

// Spotify OAuth routes
router.get('/spotify/auth-url', getAuthUrl);
router.post('/spotify/token', exchangeToken);
router.post('/spotify/refresh', refreshToken);
router.post('/spotify/search-tracks', searchTracks);
router.post('/spotify/create-playlist', createPlaylist);

// Setlist routes
router.get('/setlist/:id', getSetlistById);
router.post('/setlist/from-url', getSetlistFromUrl);

export default router;