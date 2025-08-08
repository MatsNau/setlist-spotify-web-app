import { Music } from 'lucide-react';
import { ServerStatus } from '../common/ServerStatus';
import type { ServerStatus as ServerStatusType } from '../../types';

interface HeaderProps {
  serverStatus: ServerStatusType;
}

export const Header = ({ serverStatus }: HeaderProps) => {
  return (
    <header className="text-center mb-8 md:mb-12">
      <div className="flex justify-center items-center gap-2 md:gap-3 mb-3 md:mb-4">
        <Music className="w-8 h-8 md:w-10 md:h-10 text-green-400" />
        <h1 className="text-2xl md:text-4xl font-bold text-white">Setlist to Spotify</h1>
      </div>
      <p className="text-gray-300 text-sm md:text-base px-4">Transform concert setlists into Spotify playlists</p>
      <ServerStatus status={serverStatus} />
    </header>
  );
};