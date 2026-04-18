import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from './ui/button';
import { FaPause, FaPlay } from 'react-icons/fa6';
import useStore from '@/store/store';

export default function TopTracks() {

    const { data: session }: any = useSession();
    const [topTracks, setTopTracks] = useState<any>(null)
    const { setIsTrackPlaying, isTrackPlaying, setCurrentSongId, currentSongId, deviceId } = useStore();

    useEffect(() => {
        const fetchTopTracks = async () => {
            if (session && session.accessToken) {
                try {
                    const response = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=12", {
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`
                        }
                    })
                    const data = await response.json();
                    setTopTracks(data);
                } catch (error) {
                    console.log(error);
                }
            }
        };
        fetchTopTracks();
    }, [session])

    const playTrack = async (trackId: string) => {
        setCurrentSongId(trackId);
        setIsTrackPlaying(true);
        if (session && session.accessToken) {
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
                const data = await response.json();
                console.log(data);
            } catch (error) {
                console.log(error);
            }
        }
    };

    return (
        topTracks &&
        <section className='flex flex-col gap-4'>
            <h2 className='text-2xl font-bold'>Top musique selon votre historique</h2>
            <div className='h-full grid xs:grid-cols-2 md:grid-cols-6 gap-2'>
                {
                    topTracks?.items?.map((data: any, index: number) => (
                        <div className='relative flex flex-col gap-2 p-4 group hover:bg-primary/5 transition-colors cursor-pointer rounded-lg'
                            key={`${data.id}-${index}`}
                        >
                            <img
                                src={data?.album?.images[0].url}
                                alt={data?.artists[0]?.name + ' - ' + data?.name}
                                className='rounded-lg'
                            />
                            <div className='flex flex-col'>
                                <h3 className={`text-sm ${isTrackPlaying && data?.id === currentSongId ? 'text-primary' : 'text-white'} font-semibold font-mono capitalize`}>
                                    {
                                        data?.name && data?.name.length > 20 ? data?.name?.substring(0, 12) + "..." : data?.name
                                    }
                                </h3>
                                <p className='text-xs text-neutral-400 font-semibold capitalize'>
                                    {
                                        data?.artists.map((artist: any, i: number) => (
                                            <span key={i}>
                                                {i === data?.artists.length - 1 ? artist.name.length > 10 ? artist.name?.substring(0, 10) + "..." : artist.name : artist.name + ", "}
                                            </span>
                                        ))
                                    }
                                </p>
                            </div>
                            <Button
                                size="icon"
                                className={`absolute right-8 bottom-12 group-hover:bottom-12 group-hover:opacity-100 rounded-full hover:scale-105 transition-all ${isTrackPlaying && data?.id === currentSongId ? 'opacity-100' : 'opacity-0'} `}
                                aria-label='Jouer la piste'
                                onClick={() => playTrack(data.id)}
                            >
                                {
                                    isTrackPlaying && data?.id === currentSongId ? (
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
