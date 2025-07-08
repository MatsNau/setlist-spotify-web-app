import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // Wichtig für Render!

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Spotify configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback';

// Generate state for OAuth
const generateRandomString = (length) => {
  return crypto.randomBytes(length).toString('hex');
};

// ============================================
// API ROUTES - MÜSSEN VOR STATIC FILES KOMMEN!
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Spotify OAuth - Get auth URL
app.get('/api/spotify/auth-url', (req, res) => {
  const state = generateRandomString(16);
  const scope = 'playlist-modify-public playlist-modify-private user-read-private user-read-email';
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state: state,
  });
  
  res.json({ 
    url: `https://accounts.spotify.com/authorize?${params}`,
    state: state 
  });
});

// Spotify OAuth - Exchange code for token
app.post('/api/spotify/token', async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }
  
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    res.json({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in,
    });
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
});

// Refresh Spotify token
app.post('/api/spotify/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  
  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }
  
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
      }),
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    res.json({
      access_token: response.data.access_token,
      expires_in: response.data.expires_in,
    });
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Search Spotify tracks
app.post('/api/spotify/search-tracks', async (req, res) => {
  const { tracks, artist, access_token } = req.body;
  
  if (!tracks || !artist || !access_token) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  const foundTracks = [];
  const notFoundTracks = [];
  
  for (const trackName of tracks) {
    try {
      const searchQueries = [
        `track:"${trackName}" artist:"${artist}"`,
        `${trackName} ${artist}`,
        trackName
      ];
      
      let found = false;
      
      for (const query of searchQueries) {
        const response = await axios.get(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
          {
            headers: {
              'Authorization': `Bearer ${access_token}`,
            },
          }
        );
        
        if (response.data.tracks.items.length > 0) {
          const exactMatch = response.data.tracks.items.find(track => 
            track.artists.some(a => 
              a.name.toLowerCase() === artist.toLowerCase()
            )
          );
          
          foundTracks.push(exactMatch || response.data.tracks.items[0]);
          found = true;
          break;
        }
      }
      
      if (!found) {
        notFoundTracks.push(trackName);
      }
    } catch (error) {
      console.error(`Failed to find track: ${trackName}`, error.message);
      notFoundTracks.push(trackName);
    }
  }
  
  res.json({ foundTracks, notFoundTracks });
});

// Create Spotify playlist
app.post('/api/spotify/create-playlist', async (req, res) => {
  const { name, description, tracks, access_token, isPublic = false } = req.body;
  
  if (!name || !tracks || !access_token) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  try {
    // Get user profile
    const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });
    
    const userId = profileResponse.data.id;
    
    // Create playlist
    const createResponse = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        name: name,
        description: description || 'Created with Setlist to Spotify',
        public: isPublic,
      },
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const playlistId = createResponse.data.id;
    const playlistUrl = createResponse.data.external_urls.spotify;
    
    // Add tracks
    const trackUris = tracks.map(track => track.uri);
    
    // Spotify limits to 100 tracks per request
    for (let i = 0; i < trackUris.length; i += 100) {
      const batch = trackUris.slice(i, i + 100);
      
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          uris: batch,
        },
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    res.json({ 
      success: true, 
      playlistUrl: playlistUrl,
      playlistId: playlistId 
    });
  } catch (error) {
    console.error('Playlist creation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Get setlist by ID
app.get('/api/setlist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await axios.get(
      `https://api.setlist.fm/rest/1.0/setlist/${id}`,
      {
        headers: {
          'x-api-key': process.env.SETLIST_API_KEY,
          'Accept': 'application/json'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Setlist API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'Setlist not found' });
    } else if (error.response?.status === 403) {
      res.status(403).json({ error: 'Invalid API key' });
    } else {
      res.status(500).json({ error: 'Failed to fetch setlist' });
    }
  }
});

// Get setlist from URL
app.post('/api/setlist/from-url', async (req, res) => {
  try {
    const { url } = req.body;
    console.log('Received URL:', url);
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Extract setlist ID from URL
    const patterns = [
      /setlist\.fm\/setlist\/[^\/]+\/\d+\/[^\/]+-([a-f0-9]+)\.html/,
      /setlist\.fm\/.*-([a-f0-9]{8})\.html/,
      /([a-f0-9]{8})$/
    ];
    
    let setlistId = null;
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        setlistId = match[1];
        break;
      }
    }
    
    console.log('Extracted ID:', setlistId);
    
    if (!setlistId) {
      return res.status(400).json({ error: 'Invalid setlist URL' });
    }
    
    // Check if API key exists
    if (!process.env.SETLIST_API_KEY) {
      console.error('SETLIST_API_KEY is not set!');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    // Fetch setlist data
    console.log('Fetching from Setlist.fm API...');
    const response = await axios.get(
      `https://api.setlist.fm/rest/1.0/setlist/${setlistId}`,
      {
        headers: {
          'x-api-key': process.env.SETLIST_API_KEY,
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('Setlist fetched successfully');
    res.json(response.data);
  } catch (error) {
    console.error('URL Parse Error:', error.response?.data || error.message);
    console.error('Full error:', error);
    
    if (error.response?.status === 403) {
      res.status(403).json({ error: 'Invalid API key' });
    } else {
      res.status(500).json({ error: 'Failed to fetch setlist from URL' });
    }
  }
});

// ============================================
// STATIC FILES - MUSS NACH ALLEN API ROUTES KOMMEN!
// ============================================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Catch all route - serve React app - MUSS DIE ALLERLETZTE ROUTE SEIN!
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Server starten
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Check required env vars
  const requiredEnvVars = ['SETLIST_API_KEY', 'SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET'];
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingEnvVars.length > 0) {
    console.warn('⚠️  Missing environment variables:', missingEnvVars.join(', '));
  } else {
    console.log('✅ All required environment variables are set');
  }
});