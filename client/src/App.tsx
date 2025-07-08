import React, { useState, useEffect } from 'react';
import { Music, Link, LogIn, Search, Plus, Check, AlertCircle, Loader2, Edit2, Save, LogOut } from 'lucide-react';
import axios from 'axios';

// Configuration
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Types
interface Artist {
  mbid: string;
  name: string;
}

interface Setlist {
  id: string;
  date: string;
  venue: {
    name: string;
    city: {
      name: string;
      country: {
        name: string;
      };
    };
  };
  artist: Artist;
  sets: {
    set: Array<{
      song: Array<{
        name: string;
      }>;
    }>;
  };
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  uri: string;
  album: {
    images: Array<{ url: string }>;
  };
}

interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}

// Token storage helpers
const TOKEN_KEY = 'spotify_auth_tokens';

const saveTokens = (access_token: string, expires_in: number, refresh_token?: string) => {
  const tokens: AuthTokens = {
    access_token,
    expires_at: Date.now() + (expires_in * 1000),
    refresh_token: refresh_token || getStoredTokens()?.refresh_token
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  return tokens;
};

const getStoredTokens = (): AuthTokens | null => {
  const stored = localStorage.getItem(TOKEN_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const isTokenExpired = (tokens: AuthTokens): boolean => {
  return Date.now() >= tokens.expires_at;
};

export default function App() {
  const [tokens, setTokens] = useState<AuthTokens | null>(getStoredTokens());
  const [setlistUrl, setSetlistUrl] = useState('');
  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [spotifyTracks, setSpotifyTracks] = useState<SpotifyTrack[]>([]);
  const [notFoundTracks, setNotFoundTracks] = useState<string[]>([]);
  const [playlistCreated, setPlaylistCreated] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check server status on mount
  useEffect(() => {
    checkServerStatus();
  }, []);

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
    if (tokens && isTokenExpired(tokens) && tokens.refresh_token) {
      refreshAccessToken();
    }
  }, [tokens]);

  // Generate default playlist name when setlist changes
  useEffect(() => {
    if (setlist) {
      const defaultName = `${setlist.artist.name} - ${setlist.venue.city.name} ${new Date(
        setlist.date
      ).toLocaleDateString()}`;
      setPlaylistName(defaultName);
    }
  }, [setlist]);

  // Check if server is running
  const checkServerStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/health`);
      if (response.data.status === 'OK') {
        setServerStatus('online');
      }
    } catch (error) {
      setServerStatus('offline');
      setError('Server is not running. Please start the backend server.');
    }
  };

  // Exchange authorization code for token
  const exchangeCodeForToken = async (code: string) => {
    try {
      const response = await axios.post(`${API_URL}/spotify/token`, { code });
      const { access_token, refresh_token, expires_in } = response.data;
      
      const savedTokens = saveTokens(access_token, expires_in, refresh_token);
      setTokens(savedTokens);
    } catch (error) {
      setError('Failed to authenticate with Spotify');
      console.error('Token exchange error:', error);
    }
  };

  // Refresh access token
  const refreshAccessToken = async () => {
    if (!tokens?.refresh_token) return;
    
    try {
      const response = await axios.post(`${API_URL}/spotify/refresh`, {
        refresh_token: tokens.refresh_token
      });
      
      const { access_token, expires_in } = response.data;
      const savedTokens = saveTokens(access_token, expires_in);
      setTokens(savedTokens);
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, clear tokens and require re-login
      clearTokens();
      setTokens(null);
    }
  };

  // Spotify login
  const handleSpotifyLogin = async () => {
    try {
      const response = await axios.get(`${API_URL}/spotify/auth-url`);
      window.location.href = response.data.url;
    } catch (error) {
      setError('Failed to initiate Spotify login');
    }
  };

  // Logout
  const handleLogout = () => {
    clearTokens();
    setTokens(null);
    setSetlist(null);
    setSpotifyTracks([]);
    setPlaylistCreated(false);
    setPlaylistUrl('');
  };

  // Load setlist from URL
  const loadSetlist = async () => {
    if (!setlistUrl.trim()) return;
    
    setLoading(true);
    setError('');
    setPlaylistCreated(false);
    setPlaylistUrl('');
    
    try {
      const response = await axios.post(`${API_URL}/setlist/from-url`, {
        url: setlistUrl
      });
      
      setSetlist(response.data);
      await searchSpotifyTracks(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('Setlist not found. Please check the URL.');
      } else if (error.response?.status === 400) {
        setError('Invalid setlist URL. Please paste a valid setlist.fm link.');
      } else {
        setError('Failed to load setlist. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get songs from setlist
  const getSongsFromSetlist = (setlist: Setlist): string[] => {
    const songs: string[] = [];
    setlist.sets?.set?.forEach(set => {
      set.song?.forEach(song => {
        if (song.name && song.name !== '...') {
          songs.push(song.name);
        }
      });
    });
    return [...new Set(songs)]; // Remove duplicates
  };

  // Search Spotify tracks
  const searchSpotifyTracks = async (setlistData: Setlist) => {
    if (!tokens) return;
    
    setLoading(true);
    setError('');
    
    try {
      const songs = getSongsFromSetlist(setlistData);
      
      const response = await axios.post(`${API_URL}/spotify/search-tracks`, {
        tracks: songs,
        artist: setlistData.artist.name,
        access_token: tokens.access_token
      });
      
      setSpotifyTracks(response.data.foundTracks);
      setNotFoundTracks(response.data.notFoundTracks);
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token expired, try to refresh
        await refreshAccessToken();
      } else {
        setError('Failed to search for tracks on Spotify');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create Spotify playlist
  const createPlaylist = async () => {
    if (!setlist || spotifyTracks.length === 0 || !tokens) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/spotify/create-playlist`, {
        name: playlistName,
        description: `Setlist from ${setlist.venue.name} - Created with Setlist to Spotify`,
        tracks: spotifyTracks,
        access_token: tokens.access_token,
        isPublic: false
      });
      
      if (response.data.success) {
        setPlaylistCreated(true);
        setPlaylistUrl(response.data.playlistUrl);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token expired, try to refresh
        await refreshAccessToken();
      } else {
        setError('Failed to create playlist. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Music className="w-10 h-10 text-green-400" />
            <h1 className="text-4xl font-bold text-white">Setlist to Spotify</h1>
          </div>
          <p className="text-gray-300">Transform concert setlists into Spotify playlists</p>
          
          {/* Server Status Indicator */}
          <div className="mt-4 flex justify-center items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              serverStatus === 'online' ? 'bg-green-400' : 
              serverStatus === 'offline' ? 'bg-red-400' : 
              'bg-yellow-400'
            }`} />
            <span className="text-sm text-gray-400">
              Server: {serverStatus}
            </span>
          </div>
        </header>

        {!tokens ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
              <LogIn className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-4">Get Started</h2>
              <p className="text-gray-300 mb-6">
                Connect your Spotify account to create playlists from concert setlists
              </p>
              <button
                onClick={handleSpotifyLogin}
                disabled={serverStatus === 'offline'}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium px-8 py-3 rounded-full transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                <LogIn className="w-5 h-5" />
                Login with Spotify
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Logout button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* URL Input Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Link className="w-5 h-5" />
                Paste Setlist.fm Link
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://www.setlist.fm/setlist/..."
                  value={setlistUrl}
                  onChange={(e) => setSetlistUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && loadSetlist()}
                  className="flex-1 bg-white/20 text-white placeholder-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                  onClick={loadSetlist}
                  disabled={loading || !setlistUrl.trim() || serverStatus === 'offline'}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  Load Setlist
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Example: https://www.setlist.fm/setlist/turnstile/2025/agrobaan-ysselsteyn-netherlands-335fb495.html
              </p>
            </div>

            {error && (
              <div className="bg-red-500/20 backdrop-blur-md rounded-lg p-4 mb-6 flex items-center gap-2 text-white">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Setlist Details & Tracks */}
            {setlist && spotifyTracks.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {setlist.artist.name}
                  </h3>
                  <p className="text-gray-300">
                    {setlist.venue.name}, {setlist.venue.city.name}
                  </p>
                  <p className="text-gray-400">
                    {new Date(setlist.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                {/* Editable Playlist Name */}
                <div className="mb-6">
                  <label className="text-sm text-gray-400 mb-2 block">Playlist Name</label>
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                        className="flex-1 bg-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                      <button
                        onClick={() => setIsEditingName(false)}
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{playlistName}</p>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Found {spotifyTracks.length} of {getSongsFromSetlist(setlist).length} songs
                  </h4>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {spotifyTracks.map((track, index) => (
                      <div key={track.id} className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
                        <span className="text-gray-400 text-sm w-6">{index + 1}</span>
                        {track.album.images[0] && (
                          <img 
                            src={track.album.images[0].url} 
                            alt={track.album.images[0].url}
                            className="w-10 h-10 rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-white font-medium">{track.name}</p>
                          <p className="text-gray-400 text-sm">
                            {track.artists.map(a => a.name).join(', ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {notFoundTracks.length > 0 && (
                    <details className="mt-4">
                      <summary className="text-yellow-400 cursor-pointer hover:text-yellow-300">
                        {notFoundTracks.length} songs not found on Spotify
                      </summary>
                      <div className="mt-2 space-y-1">
                        {notFoundTracks.map((track, index) => (
                          <p key={index} className="text-gray-400 text-sm">• {track}</p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>

                {!playlistCreated ? (
                  <button
                    onClick={createPlaylist}
                    disabled={loading || !playlistName.trim()}
                    className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                    Create Playlist
                  </button>
                ) : (
                  <div className="text-center">
                    <div className="bg-green-500/20 rounded-lg p-4 mb-4">
                      <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-white font-semibold">Playlist Created Successfully!</p>
                    </div>
                    <a
                      href={playlistUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
                    >
                      Open in Spotify
                    </a>
                  </div>
                )}
              </div>
            )}

            {loading && !setlist && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                <p className="text-gray-300">Loading setlist...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}