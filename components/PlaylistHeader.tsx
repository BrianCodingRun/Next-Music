import{ useEffect, useState } from 'react'
import { RiMusic2Line } from 'react-icons/ri';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FaSpotify } from 'react-icons/fa6';

interface Playlist {
    id: string;
    name: string;
    type: string;
    owner: {
        display_name: string;
        id: string;
    };
    images: { url: string }[];
    tracks: {
        total: number;
    }
}

export default function PlaylistHeader({playlistData, currentUserData}: { playlistData: any, currentUserData: any }) {
    const [currentUser, setCurrentUser] = useState<any>({});
    const [playlist, setPlaylist] = useState<Playlist>()

    useEffect(() => {
        setPlaylist(playlistData);
        setCurrentUser(currentUserData);   
    }, [playlistData, currentUserData])

    return (
        <header
            className="relative z-10 rounded-xl border border-b-neutral-800"
        >
            <div className={`absolute top-0 bottom-0 w-full h-full bg-gradient-to-b to-card from-primary/50`} />
            <section className={`relative z-50 flex md:h-60 xs:h-40 items-center gap-4 p-8`}>
                {playlist && playlist.images ? (<img className='h-32 w-32 xs:hidden md:block md:h-40 md:w-40 rounded-xl shadow-sm' src={playlist?.images[0]?.url} alt="" />) : (
                    <div className='flex items-center justify-center w-40 h-40 rounded-sm bg-neutral-800 shadow-2xl'>
                        <RiMusic2Line className="text-8xl text-white/50" />
                    </div>
                )}
                <div>
                    <p className='text-sm capitalize'>{playlist?.type}</p>
                    <h1 className='text-3xl md:text-4xl xl:text-8xl font-extrabold py-4 tracking-tighter'>{playlist?.name && playlist?.name.length > 10 ? playlist?.name?.substring(0, 15) + "..." : playlist?.name }</h1>
                    <div className='flex flex-row space-x-2 items-center'>
                        <Avatar className='h-6 w-6'>
                            {
                                playlist?.owner?.display_name === "Spotify" ? (
                                    <FaSpotify className='text-xl text-primary' />
                                ) : (
                                    <AvatarImage src={currentUser?.images?.[0]?.url} />
                                )
                            }
                            <AvatarFallback>{playlist?.owner?.display_name?.slice(0, 1) ?? 'U'}</AvatarFallback>
                        </Avatar>
                        <p className='text-sm font-bold'>{playlist?.owner?.display_name}</p>
                        <hr className='border-none w-1 h-1 bg-neutral-400 rounded-full' />
                        {
                            playlist?.tracks?.total ? (
                                <p className='text-sm font-sans text-neutral-300'>{playlist?.tracks?.total} titres</p>
                            ) : (
                                <p className='text-sm font-sans text-neutral-300'>Aucun titre</p>
                            )
                        }
                    </div>
                </div>
            </section>
        </header>
    )
}