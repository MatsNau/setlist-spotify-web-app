import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { Header } from './components/Layout/Header';
import { LoginCard } from './components/Layout/LoginCard';
import { SetlistInput } from './components/setlist/SetlistInput';
import { SetlistDetails } from './components/setlist/SetlistDetails';
import { PlaylistNameEditor } from './components/playlist/PlaylistNameEditor';
import { TrackList } from './components/tracks/TrackList';
import { PlaylistActions } from './components/playlist/PlaylistActions';
import { ErrorMessage } from './components/common/ErrorMessage';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useServerStatus } from './hooks/useServerStatus';
import { useSetlist } from './hooks/useSetlist';
import { setlistUtils } from './utils/setlist';

export default function App() {
  const [playlistName, setPlaylistName] = useState('');
  
  const { tokens, loading: authLoading, error: authError, login, logout, refreshAccessToken } = useSpotifyAuth();
  const { status: serverStatus, error: serverError } = useServerStatus();
  const {
    setlist,
    spotifyTracks,
    notFoundTracks,
    playlistCreated,
    playlistUrl,
    loading: setlistLoading,
    error: setlistError,
    loadSetlist,
    searchSpotifyTracks,
    createPlaylist,
    reset
  } = useSetlist();
  
  const loading = authLoading || setlistLoading;
  const error = authError || serverError || setlistError;

  // Generate default playlist name when setlist changes
  useEffect(() => {
    if (setlist) {
      const defaultName = setlistUtils.generateDefaultPlaylistName(setlist);
      setPlaylistName(defaultName);
    }
  }, [setlist]);

  const handleLoadSetlist = async (url: string) => {
    try {
      const setlistData = await loadSetlist(url);
      if (setlistData && tokens) {
        await searchSpotifyTracks(setlistData, tokens.access_token, refreshAccessToken);
      }
    } catch (error) {
      // Error already handled in useSetlist hook
    }
  };

  const handleCreatePlaylist = async () => {
    if (!setlist || !tokens) return;
    
    const description = `Setlist from ${setlist.venue.name} - Created with Setlist to Spotify`;
    await createPlaylist(playlistName, description, tokens.access_token, false, refreshAccessToken);
  };

  const handleLogout = () => {
    logout();
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        <Header serverStatus={serverStatus} />

        {!tokens ? (
          <LoginCard onLogin={login} serverStatus={serverStatus} />
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Logout button */}
            <div className="flex justify-end mb-4 px-4 md:px-0">
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            <SetlistInput 
              onLoadSetlist={handleLoadSetlist}
              loading={loading}
              serverStatus={serverStatus}
            />

            <ErrorMessage message={error} />

            {/* Setlist Details & Tracks */}
            {setlist && spotifyTracks.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 mx-4 md:mx-0">
                <SetlistDetails setlist={setlist} />
                
                <PlaylistNameEditor 
                  name={playlistName}
                  onChange={setPlaylistName}
                />
                
                <TrackList 
                  tracks={spotifyTracks}
                  notFoundTracks={notFoundTracks}
                  totalSongs={setlistUtils.getSongsFromSetlist(setlist).length}
                />

                <PlaylistActions 
                  playlistCreated={playlistCreated}
                  playlistUrl={playlistUrl}
                  loading={loading}
                  playlistName={playlistName}
                  onCreatePlaylist={handleCreatePlaylist}
                />
              </div>
            )}

            {loading && !setlist && (
              <LoadingSpinner message="Loading setlist..." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}