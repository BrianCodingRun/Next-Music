'use client'

import { useEffect, useCallback, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from './ui/button'
import { FaPlay } from 'react-icons/fa6'
import { useRouter } from 'next/navigation'
import useStore from '@/store/store'

interface FeaturedPlaylists {
  id: string;
  images: [{url: string}];
  name: string;
  uri: string;
}

export default function Featured() {
  const {data:session} : any = useSession()
  const [ featuredPlaylists, setFeaturedPlaylists ] = useState<FeaturedPlaylists[]>([])
  const { setCurrentContextUri } = useStore();
  const router = useRouter()

  const getFeaturedPlaylists = useCallback(async () => {
    if(session && session.accessToken) {
      const response = await fetch('https://api.spotify.com/v1/browse/featured-playlists?locale=fr-FR&limit=10', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      })
      const data = await response.json()
      setFeaturedPlaylists(data.playlists.items)
    }
  }, [session])

  useEffect(() => {
    getFeaturedPlaylists()
  }, [getFeaturedPlaylists])

  return (
    <section className='flex flex-col gap-4'>
        <h2 className='text-2xl font-bold'>Playlists à la une</h2>
        <div className='h-full grid xs:grid-cols-2 md:grid-cols-5 gap-2'>
          {
            featuredPlaylists && featuredPlaylists.map((playlist) => (
              <div className='relative flex flex-col gap-2 p-4 group hover:bg-primary/5 transition-colors cursor-pointer rounded-lg' key={playlist.id}
              onClick={() => router.push(`/dashboard/me/playlist/${playlist.id}`)}
              >
                <img 
                  src={playlist?.images[0]?.url} 
                  alt={playlist?.name}
                  className='rounded-lg w-full h-full object-cover'
                />
                <h3 className='text-sm text-neutral-400 font-semibold capitalize'>
                  {playlist?.name.length > 20 ? playlist?.name.slice(0, 20) + '...' : playlist?.name}
                </h3>
                <Button size="largePlay" className="absolute right-8 bottom-12 opacity-0 group-hover:bottom-14 group-hover:opacity-100 rounded-full hover:scale-105 transition-all"
                  onClick={() => setCurrentContextUri(playlist.uri)}
                >
                  <FaPlay className='text-xl' />
                </Button>
              </div>
            ))
          }
        </div>
    </section>
  )
}
