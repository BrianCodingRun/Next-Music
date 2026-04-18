import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FaPlay } from 'react-icons/fa6'

interface TopArtist {
    items: Array<{
        id: string;
        images: Array<{
            url: string;
        }>;
        name: string;
        type: string;
    }>;
}

export default function TopArtists() {
    const { data: session }: any = useSession()
    const [topArtists, setTopArtists] = useState<TopArtist>()
    const router = useRouter()

    useEffect(() => {
        const getTopArtist = async () => {
            if (session && session.accessToken) {
                try {
                    const response = await fetch("https://api.spotify.com/v1/me/top/artists?limit=10", {
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`
                        }
                    })
                    const data = await response.json()
                    setTopArtists(data)
                } catch (error) {
                    console.log("Error fetching data: ", error);
                }
            }
        }
        getTopArtist();
    }, [session])
    

    return (
        topArtists &&
        <section className='flex flex-col gap-4'>
            <h2 className='text-2xl font-bold'>Top artistes selon votre affinité</h2>
            <div className="grid grid-cols-2 gap-1 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {
                    topArtists && topArtists.items && topArtists.items.map((artist) => (
                        <div className='relative flex flex-col justify-center gap-2 px-4 py-2 group hover:bg-primary/5 transition-colors cursor-pointer rounded-lg' key={artist.id}
                            onClick={() => router.push(`/dashboard/artist/${artist.id}`)}
                        >
                            <img
                                src={artist?.images[0]?.url}
                                alt={"Photo de l'artiste" + artist?.name}
                                width={192}
                                height={192}
                                className="w-full h-full object-cover transition-transform rounded-full"
                                style={{ aspectRatio: "192/192", objectFit: "cover" }}
                            />
                            <div className='flex flex-col px-1 text-sm capitalize'>
                                <h3 className='text-white font-semibold font-mono'>
                                    {
                                        artist.name && artist.name.length > 20 ? artist?.name?.substring(0, 20) + "..." : artist?.name
                                    }
                                </h3>
                                <p className='text-neutral-400'>
                                    Artiste
                                </p>
                            </div>
                            <Button 
                                size="largePlay" 
                                className="absolute right-8 bottom-12 opacity-0 group-hover:bottom-14 group-hover:opacity-100 rounded-full hover:scale-105 transition-all"
                                aria-label='Jouer la piste'
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
