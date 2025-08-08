import { Link, Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { ServerStatus } from '../../types';

interface SetlistInputProps {
  onLoadSetlist: (url: string) => void;
  loading: boolean;
  serverStatus: ServerStatus;
}

export const SetlistInput = ({ onLoadSetlist, loading, serverStatus }: SetlistInputProps) => {
  const [url, setUrl] = useState('');

  const handleSubmit = () => {
    if (url.trim()) {
      onLoadSetlist(url);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6 mx-4 md:mx-0">
      <h2 className="text-lg md:text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Link className="w-4 h-4 md:w-5 md:h-5" />
        Paste Setlist.fm Link
      </h2>
      <div className="flex flex-col md:flex-row gap-2">
        <input
          type="text"
          placeholder="https://www.setlist.fm/setlist/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-white/20 text-white placeholder-gray-400 rounded-lg px-4 py-2.5 md:py-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm md:text-base"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !url.trim() || serverStatus === 'offline'}
          className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium px-4 md:px-6 py-2.5 md:py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm md:text-base"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
          ) : (
            <Search className="w-4 h-4 md:w-5 md:h-5" />
          )}
          <span className="md:inline">Load Setlist</span>
        </button>
      </div>
      <p className="text-gray-400 text-xs md:text-sm mt-2 break-all">
        Example: https://www.setlist.fm/setlist/turnstile/2025/agrobaan-ysselsteyn-netherlands-335fb495.html
      </p>
    </div>
  );
};