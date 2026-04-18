import React, { useState } from 'react'
import { FaHeart } from 'react-icons/fa6'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SavedTracks {
    items: [{
        added_at: string;
        track: {
            id: string;
            name: string;
            duration_ms: number;
            album: {
                name: string;
                images: { url: string }[];
            };
            artists: [
                {
                    name: string;
                    id: string;
                    images: { url: string }[];
                }
            ];
            uri: string;
        }
    }];
}

export default function LikedHeader({ savedTracksData, currentUserData }: { savedTracksData: SavedTracks, currentUserData: any }) {

    const [savedTracks, setSavedTracks] = useState<SavedTracks>(savedTracksData)
    const [currentUser, setCurrentUser] = useState<any>(currentUserData)

    return (
        <header
            className="relative z-10 rounded-xl border border-b-neutral-800"
        >
            <div className={`absolute top-0 bottom-0 w-full h-full bg-gradient-to-b to-card from-primary/50`} />
            <section className={`relative z-50 flex md:h-60 xs:h-40 items-center gap-4 p-8`}>
                <div className='flex items-center justify-center w-40 h-40 rounded-sm shadow-2xl bg-gradient-to-br from-primary to-slate-50'>
                    <FaHeart className="text-5xl text-white" />
                </div>
                <div>
                    <p className='text-sm capitalize'>Playlist</p>
                    <h1 className='text-3xl md:text-4xl xl:text-8xl font-extrabold py-4 tracking-tighter'>Titres likés</h1>
                    <div className='flex flex-row space-x-2 items-center'>
                        <Avatar className='h-6 w-6'>
                            <AvatarImage src={currentUser?.images?.[0]?.url} />
                            <AvatarFallback>{currentUser?.display_name?.slice(0, 1) ?? 'U'}</AvatarFallback>
                        </Avatar>
                        <p className='text-sm font-bold'>{currentUser?.display_name}</p>
                        <hr className='border-none w-1 h-1 bg-neutral-400 rounded-full' />
                        {
                            savedTracks?.items?.length && savedTracks?.items?.length > 0 ? (
                                <p className='text-sm font-sans text-neutral-300'>{savedTracks?.items?.length} titres</p>
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
