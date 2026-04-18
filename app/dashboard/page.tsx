'use client'
import NewAlbum from '@/components/NewAlbum';
import RecentlyPlaying from '@/components/RecentlyPlaying';
import { Badge } from '@/components/ui/badge';
import Collection from '@/components/Collection';
import TopArtists from '@/components/TopArtists';
import TopTracks from '@/components/TopTracks';
import { useEffect } from 'react';

export default function Home() {

  useEffect(() => {
    document.title = "Spotify Clone - Dashboard"
  
    return () => {
      document.title = "Spotify Clone - Accueil"
    }
  }, [])
  

  return (
    <div className='flex flex-col rounded-lg h-[75%] max-h-[100svh] w-full bg-card'>
      <header className={`sticky top-0 left-0 z-10 w-full h-max p-4 rounded-t-xl`}>
        <section className="flex items-center gap-4">
          <Badge className='rounded-full hover:bg-primary'>
            <span className="font-sans text-sm font-bold">Accueil</span>
          </Badge>
        </section>
      </header>
      {/* CONTENT */}
      <main className="relative flex-grow flex flex-col gap-8 scrollbar-none overflow-y-auto p-4">
        {/* COLLECTION AND PLAYLIST */}
        <Collection />
        {/* RECENTLY PLAYING */}
        <RecentlyPlaying />
        {/* NEW ALBUMS */}
        <NewAlbum />
        {/* TOP TRACKS USER */}
        <TopTracks />
        {/* TOP ARTIST */}
        <TopArtists />
      </main>
    </div>
  )
}