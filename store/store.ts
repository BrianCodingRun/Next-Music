import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Store {
  deviceId: string;
  setDeviceId: (deviceId: string) => void;
  likedTracks: any[];
  setLikedTracks: (likedTracks: any[]) => void;
  isTrackPlaying: boolean;
  setIsTrackPlaying: (isTrackPlaying: boolean) => void;
  currentContextUri: string;
  setCurrentContextUri: (currentContextUri: string) => void;
  currentPlaylistId: string;
  setCurrentPlaylistId: (currentPlaylistId: string) => void;
  currentSongId: string;
  setCurrentSongId: (currentSongId: string) => void;
}

const useStore = create<Store>()(
  persist(
    (set) => ({
      deviceId: '',
      setDeviceId: (deviceId) => set({ deviceId }),
      likedTracks: [],
      setLikedTracks: (likedTracks) => set({ likedTracks }),
      isTrackPlaying: false,
      setIsTrackPlaying: (isTrackPlaying) => set({ isTrackPlaying }),
      currentContextUri: '',
      setCurrentContextUri: (currentContextUri) => set({ currentContextUri }),
      currentPlaylistId: '',
      setCurrentPlaylistId: (currentPlaylistId) => set({ currentPlaylistId }),
      currentSongId: '',
      setCurrentSongId: (currentSongId) => set({ currentSongId }),
    }),
    {
      name: 'next-music-store',
    },
  ),
);

export default useStore;