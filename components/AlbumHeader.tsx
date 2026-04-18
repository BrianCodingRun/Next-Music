import React, { useEffect, useState } from 'react'
import { RiMusic2Line } from 'react-icons/ri';

interface Album {
    id: string;
    name: string;
    release_date: string;
    type: string;
    total_tracks: number;
    artists: Array<{
        id: string;
        name: string;
    }>;
    images: { url: string }[];
    tracks: {
        total: number;
        items: Array<{
            added_at: string;
            track: {
                id: string;
                name: string;
                duration_ms: number;
                album: {
                    name: string;
                    images: { url: string }[];
                };
                artists: Array<{
                    name: string;
                    id: string;
                    images: { url: string }[];
                }>;
                uri: string;
            };
        }>;
    };
    uri: string;
}

export default function AlbumHeader({albumData} : {albumData: any}) {

    const [album, setAlbum] = useState<Album>()

    useEffect(() => {
        setAlbum(albumData)
    }, [albumData])

    return (
        <header
            className="relative z-10 rounded-xl border border-b-neutral-800"
        >
            <div className={`absolute top-0 bottom-0 w-full h-full bg-gradient-to-t from-gray-700 to-gray-400`} />
            <section className={`relative z-50 flex md:h-60 xs:h-40 items-center gap-4 p-8`}>
                {album && album.images ? (<img className='h-32 w-32 xs:hidden md:block md:h-40 md:w-40 rounded-xl shadow-sm' src={album?.images[0]?.url} alt="" />) : (
                    <div className='flex items-center justify-center w-40 h-40 rounded-sm bg-neutral-800 shadow-2xl'>
                        <RiMusic2Line className="text-8xl text-white/50" />
                    </div>
                )}
                <div>
                    <p className='text-sm capitalize'>{album?.type}</p>
                    <h1 className='text-3xl md:text-4xl xl:text-8xl font-extrabold py-4 tracking-tighter'>
                        {album?.name ? (album.name.length > 10 ? album.name.substring(0, 10) + "..." : album.name) : 'No Title'}
                    </h1>
                    <div className='flex flex-row space-x-2 items-center'>
                        <p className='text-sm font-bold'>{album?.artists[0]?.name}</p>
                        <hr className='border-none w-1 h-1 bg-neutral-400 rounded-full' />
                        <p className='text-sm font-sans text-neutral-300'>
                            {album?.release_date.slice(0, 4)}
                        </p>
                        <hr className='border-none w-1 h-1 bg-neutral-400 rounded-full' />
                        {
                            album?.total_tracks ? (
                                <p className='text-sm font-sans text-neutral-300'>{album?.total_tracks} titres</p>
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
