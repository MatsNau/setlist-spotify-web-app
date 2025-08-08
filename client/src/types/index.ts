export interface Artist {
  mbid: string;
  name: string;
}

export interface Setlist {
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

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  uri: string;
  album: {
    images: Array<{ url: string }>;
  };
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}

export type ServerStatus = 'checking' | 'online' | 'offline';