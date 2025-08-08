import type { Setlist } from '../types';

export const setlistUtils = {
  getSongsFromSetlist(setlist: Setlist): string[] {
    const songs: string[] = [];
    setlist.sets?.set?.forEach(set => {
      set.song?.forEach(song => {
        if (song.name && song.name !== '...') {
          songs.push(song.name);
        }
      });
    });
    return [...new Set(songs)]; // Remove duplicates
  },

  generateDefaultPlaylistName(setlist: Setlist): string {
    return `${setlist.artist.name} - ${setlist.venue.city.name} ${new Date(
      setlist.date
    ).toLocaleDateString()}`;
  }
};