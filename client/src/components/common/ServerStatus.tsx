import type { ServerStatus as ServerStatusType } from '../../types';

interface ServerStatusProps {
  status: ServerStatusType;
}

export const ServerStatus = ({ status }: ServerStatusProps) => {
  return (
    <div className="mt-3 md:mt-4 flex justify-center items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${
        status === 'online' ? 'bg-green-400' : 
        status === 'offline' ? 'bg-red-400' : 
        'bg-yellow-400'
      }`} />
      <span className="text-xs md:text-sm text-gray-400">
        Server: {status}
      </span>
    </div>
  );
};