'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { FaPlay } from 'react-icons/fa6'

interface NewAlbums {
    items: Array<{
        id: string;
        images: Array<{
            url: string;
        }>;
        name: string;
        artists: Array<{
            id: number;
            name: string;
        }>
    }>;
}

export default function NewAlbum() {

    const {data:session} : any = useSession()
    const [newAlbums, setNewAlbums] = useState<NewAlbums>()
    const router = useRouter()

    

    useEffect(() => {
        const getNewAlbum = async () => {
            if(session && session.accessToken){
                try {
                 const response = await fetch("https://api.spotify.com/v1/browse/new-releases?limit=10", {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`
                    }
                 })
                 const data = await response.json()             
                 setNewAlbums(data.albums)
                } catch (error) {
                    console.log("Error fetching data: ", error);
                }
            }
        };
        getNewAlbum()
    }, [session])

    return (
        newAlbums &&
        <section className='flex flex-col gap-4'>
            <h2 className='text-2xl font-bold'>Sorties récentes d'albums</h2>
            <div className='grid xs:grid-cols-2 md:grid-cols-5 gap-2'>
                {
                    newAlbums?.items?.map((newAlbum) => (
                        <div className='relative flex flex-col gap-2 p-4 group hover:bg-primary/5 transition-colors cursor-pointer rounded-lg' key={newAlbum.id}
                            onClick={() => router.push(`/dashboard/album/${newAlbum.id}`)}
                        >
                            <img
                                src={newAlbum?.images[0]?.url}
                                alt={newAlbum?.artists[0]?.name + ' - ' + newAlbum?.name}
                                className='rounded-lg'
                            />
                            <h3 className='text-sm text-neutral-400 font-semibold capitalize'>
                                {
                                    newAlbum.name && newAlbum.name.length > 20 ? newAlbum?.name?.substring(0, 20) + "..." : newAlbum?.name
                                }
                            </h3>
                            <Button 
                                size="largePlay" 
                                className="absolute right-8 bottom-12 opacity-0 group-hover:bottom-14 group-hover:opacity-100 rounded-full hover:scale-105 transition-all"
                                aria-label='Jouer la nouvelle sortie'
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
