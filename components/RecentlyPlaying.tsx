import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { FaPause, FaPlay } from 'react-icons/fa6'
import useStore from '@/store/store'

interface RecentlyPlaying {
    items: Array<{
        track: {
            id: string;
            album: {
                images: Array<{
                    url: string;
                }>
                name: string;
            };
            artists: Array<{
                name: string;
            }>;
            name: string;
            uri: string;
        }
    }>
}

export default function RecentlyPlaying() {
    const { data: session }: any = useSession()
    const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlaying>()
    const { setIsTrackPlaying, isTrackPlaying, setCurrentSongId, currentSongId, deviceId } = useStore();

    useEffect(() => {
        const getRecentlyPlayed = async () => {
            if (session && session.accessToken) {
                try {
                    const response = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=12", {
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`
                        }
                    })
                    const data = await response.json()
                    // Filtrer les doublons en utilisant track.id comme clé unique
                    const uniqueTracks = data.items.filter(
                        (item: any, index: number, self: any[]) =>
                            index === self.findIndex((t) => t.track.id === item.track.id)
                    )
                    setRecentlyPlayed({ items: uniqueTracks })
                } catch (error) {
                    console.log("Error fetching data: ", error);
                }
            }
        }
        getRecentlyPlayed()
    }, [session])

    const playTrack = async (trackId: string) => {
        if (session && session.accessToken && deviceId) {
            try {
                const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        uris: [`spotify:track:${trackId}`]
                    })
                });
                if(response.status == 204 || response.status == 200) {
                    setCurrentSongId(trackId);
                    setIsTrackPlaying(true);
                }
            } catch (error) {
                console.log(error);
            }
        }
    };
    
    return (
        recentlyPlayed?.items &&
        <section className='flex flex-col gap-4'>
            <h2 className='text-2xl font-bold'>Récemments écoutés</h2>
            <div className='h-full grid xs:grid-cols-2 md:grid-cols-6 gap-2'>
                {
                    recentlyPlayed?.items?.map((data, index) => (
                        <div className='relative flex flex-col gap-2 p-4 group hover:bg-primary/5 transition-colors cursor-pointer rounded-lg'
                            key={`${data.track.id}-${index}`}
                        >
                            <img
                                src={data?.track?.album?.images[0].url}
                                alt={data?.track?.artists[0]?.name + ' - ' + data?.track?.album?.name}
                                className='rounded-lg'
                            />
                            <div className='flex flex-col'>
                                <h3 className={`text-sm ${isTrackPlaying && data?.track?.id === currentSongId ? 'text-primary' : 'text-white'} font-semibold font-mono capitalize`}>
                                    {
                                        data?.track?.name && data?.track?.name.length > 20 ? data?.track?.name?.substring(0, 12) + "..." : data?.track?.name
                                    }
                                </h3>
                                <p className='text-xs text-neutral-400 font-semibold capitalize'>
                                    {
                                        data?.track?.artists.map((artist, i) => (
                                            <span key={i}>
                                                {i === data?.track?.artists.length - 1 ? artist.name.length > 10 ? artist.name?.substring(0, 10) + "..." : artist.name : artist.name + ", "}
                                            </span>
                                        ))
                                    }
                                </p>
                            </div>
                            <Button
                                size="icon"
                                className={`absolute right-8 bottom-12 group-hover:bottom-12 group-hover:opacity-100 rounded-full hover:scale-105 transition-all ${isTrackPlaying && data?.track?.id === currentSongId ? 'opacity-100' : 'opacity-0'} `}
                                aria-label='Jouer ou mettre en pause la piste'
                                onClick={() => playTrack(data?.track?.id)}
                            >
                                {
                                    isTrackPlaying && data?.track?.id === currentSongId ? (
                                        <FaPause className='text-base' />
                                    ) : (
                                        <FaPlay className='text-base' />
                                    )
                                }
                            </Button>
                        </div>
                    ))
                }
            </div>
        </section>
    )
}
