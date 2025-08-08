import { LogIn } from 'lucide-react';
import type { ServerStatus as ServerStatusType } from '../../types';

interface LoginCardProps {
  onLogin: () => void;
  serverStatus: ServerStatusType;
}

export const LoginCard = ({ onLogin, serverStatus }: LoginCardProps) => {
  return (
    <div className="max-w-md mx-auto px-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 text-center">
        <LogIn className="w-12 h-12 md:w-16 md:h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-3 md:mb-4">Get Started</h2>
        <p className="text-gray-300 text-sm md:text-base mb-6">
          Connect your Spotify account to create playlists from concert setlists
        </p>
        <button
          onClick={onLogin}
          disabled={serverStatus === 'offline'}
          className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium px-6 md:px-8 py-2.5 md:py-3 rounded-full transition-colors duration-200 flex items-center gap-2 mx-auto text-sm md:text-base"
        >
          <LogIn className="w-4 h-4 md:w-5 md:h-5" />
          Login with Spotify
        </button>
      </div>
    </div>
  );
};