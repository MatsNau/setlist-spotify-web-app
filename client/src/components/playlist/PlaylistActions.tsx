import { Plus, Check, Loader2 } from 'lucide-react';

interface PlaylistActionsProps {
  playlistCreated: boolean;
  playlistUrl: string;
  loading: boolean;
  playlistName: string;
  onCreatePlaylist: () => void;
}

export const PlaylistActions = ({ 
  playlistCreated, 
  playlistUrl, 
  loading, 
  playlistName, 
  onCreatePlaylist 
}: PlaylistActionsProps) => {
  if (!playlistCreated) {
    return (
      <button
        onClick={onCreatePlaylist}
        disabled={loading || !playlistName.trim()}
        className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium px-6 py-2.5 md:py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto text-sm md:text-base"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
        ) : (
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
        )}
        Create Playlist
      </button>
    );
  }

  return (
    <div className="text-center">
      <div className="bg-green-500/20 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
        <Check className="w-6 h-6 md:w-8 md:h-8 text-green-400 mx-auto mb-2" />
        <p className="text-white font-semibold text-sm md:text-base">Playlist Created Successfully!</p>
      </div>
      <a
        href={playlistUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2.5 md:py-3 rounded-lg transition-colors duration-200 inline-flex items-center gap-2 text-sm md:text-base"
      >
        Open in Spotify
      </a>
    </div>
  );
};