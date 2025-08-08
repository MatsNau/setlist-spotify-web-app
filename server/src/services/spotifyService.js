import axios from 'axios';
import { config } from '../config/environment.js';

class SpotifyService {
  constructor() {
    this.clientId = config.spotify.clientId;
    this.clientSecret = config.spotify.clientSecret;
    this.redirectUri = config.spotify.redirectUri;
  }

  generateAuthUrl(state) {
    const scope = 'playlist-modify-public playlist-modify-private user-read-private user-read-email';
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: scope,
      redirect_uri: this.redirectUri,
      state: state,
    });
    
    return `https://accounts.spotify.com/authorize?${params}`;
  }

  async exchangeCodeForToken(code) {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
      }),
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in,
    };
  }

  async refreshToken(refreshToken) {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    return {
      access_token: response.data.access_token,
      expires_in: response.data.expires_in,
    };
  }

  async searchTracks(tracks, artist, accessToken) {
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
                'Authorization': `Bearer ${accessToken}`,
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
    
    return { foundTracks, notFoundTracks };
  }

  async getUserProfile(accessToken) {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    return response.data;
  }

  async createPlaylist(userId, name, description, isPublic, accessToken) {
    const response = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        name: name,
        description: description || 'Created with Setlist to Spotify',
        public: isPublic,
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      id: response.data.id,
      url: response.data.external_urls.spotify
    };
  }

  async addTracksToPlaylist(playlistId, tracks, accessToken) {
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
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  async createPlaylistWithTracks(name, description, tracks, accessToken, isPublic = false) {
    const profile = await this.getUserProfile(accessToken);
    const playlist = await this.createPlaylist(profile.id, name, description, isPublic, accessToken);
    await this.addTracksToPlaylist(playlist.id, tracks, accessToken);
    
    return {
      success: true,
      playlistUrl: playlist.url,
      playlistId: playlist.id
    };
  }
}

export default new SpotifyService();