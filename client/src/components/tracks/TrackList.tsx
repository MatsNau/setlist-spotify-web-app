import type { SpotifyTrack } from '../../types';

interface TrackListProps {
  tracks: SpotifyTrack[];
  notFoundTracks: string[];
  totalSongs: number;
}

export const TrackList = ({ tracks, notFoundTracks, totalSongs }: TrackListProps) => {
  return (
    <div className="mb-4 md:mb-6">
      <h4 className="text-base md:text-lg font-semibold text-white mb-3">
        Found {tracks.length} of {totalSongs} songs
      </h4>
      
      <div className="space-y-1.5 md:space-y-2 max-h-60 md:max-h-96 overflow-y-auto">
        {tracks.map((track, index) => (
          <div key={track.id} className="bg-white/5 rounded-lg p-2 md:p-3 flex items-center gap-2 md:gap-3">
            <span className="text-gray-400 text-xs md:text-sm w-5 md:w-6 flex-shrink-0">{index + 1}</span>
            {track.album.images[0] && (
              <img 
                src={track.album.images[0].url} 
                alt={track.album.images[0].url}
                className="w-8 h-8 md:w-10 md:h-10 rounded flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm md:text-base truncate">{track.name}</p>
              <p className="text-gray-400 text-xs md:text-sm truncate">
                {track.artists.map(a => a.name).join(', ')}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {notFoundTracks.length > 0 && (
        <details className="mt-3 md:mt-4">
          <summary className="text-yellow-400 cursor-pointer hover:text-yellow-300 text-sm md:text-base">
            {notFoundTracks.length} songs not found on Spotify
          </summary>
          <div className="mt-2 space-y-1">
            {notFoundTracks.map((track, index) => (
              <p key={index} className="text-gray-400 text-xs md:text-sm">• {track}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};