import type { Setlist } from '../../types';

interface SetlistDetailsProps {
  setlist: Setlist;
}

export const SetlistDetails = ({ setlist }: SetlistDetailsProps) => {
  return (
    <div className="mb-4 md:mb-6">
      <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
        {setlist.artist.name}
      </h3>
      <p className="text-gray-300 text-sm md:text-base">
        {setlist.venue.name}, {setlist.venue.city.name}
      </p>
      <p className="text-gray-400 text-sm">
        {new Date(setlist.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>
    </div>
  );
};