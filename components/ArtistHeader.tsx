import{ useEffect, useState } from 'react'
import { RiMusic2Line } from 'react-icons/ri';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FaSpotify } from 'react-icons/fa6';

interface Artist {
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

export default function ArtistHeader({artistData}: { artistData: any }) {
    const [artist, setArtist] = useState<Artist>()

    useEffect(() => {
        if(!artistData) return;
        setArtist(artistData);
    }, [artistData])

    return (
        <header
            className="relative z-10 rounded-xl"
        >
            <div 
                className={`absolute top-0 bottom-0 w-full h-full`}
                style={{
                    backgroundImage: `url(${artist?.images[0]?.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: '50% 20%',
                    width: '100%',
                    height: '100%',
                }}
            />
            <div className='absolute top-0 left-0 w-full h-full bg-neutral-900/80' />
            <section className={`relative z-50 flex md:h-60 xs:h-40 items-center gap-4 p-8`}>
                <div className='flex flex-col items-start justify-center'>
                    <span className='text-slate-200 font-medium'>Artiste</span>
                    <h1 className='text-3xl md:text-4xl xl:text-8xl font-extrabold py-2 tracking-tighter'>{artist?.name}</h1>
                </div>
            </section>
        </header>
    )
}
