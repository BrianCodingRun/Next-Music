'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import useStore from '@/store/store';

export default function ClearStoreOnLogout() {
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Clear zustand store when user logs out
      useStore.setState({ likedTracks: [], currentSongId: null, isTrackPlaying: false });
      localStorage.removeItem('next-music-store');
    }
  }, [status]);

  return null;
}