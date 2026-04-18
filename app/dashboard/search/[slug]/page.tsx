"use client"
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import SearchResults from '@/components/SearchResults';

export default function Search({ params }: { params: { slug: string } }) {
    const { data: session }: any = useSession();
    const [searchData, setSearchData] = useState<any>(null);
    const slug = params.slug

    const fetchSearchData = async (query: string) => {
        const response = await fetch("https://api.spotify.com/v1/search?" + new URLSearchParams({
            q: query,
            type: ["artist", "playlist", "track", "album"].join(","),
        }), {
            headers: { Authorization: `Bearer ${session?.accessToken}` },
        });
        const data = await response.json();
        setSearchData(data)
    }

    useEffect(() => {
        fetchSearchData(slug);
    }, [slug]);

    return (
        <div
            className='flex flex-col rounded-lg w-full h-[75%] max-h-[100svh] bg-card'
        >
            <header className={`sticky top-0 left-0 z-10 w-full h-max rounded-t-xl p-4`}>
                <section className="flex items-center">
                    <Badge className='rounded-full'>
                        Résultats de recherche pour
                        <span className="font-sans text-sm font-bold">
                            "{slug}"
                        </span>
                    </Badge>
                </section>
            </header>
            <main className='relative flex-grow flex flex-col gap-8 scrollbar-none overflow-y-auto'>
                {searchData !== null && <SearchResults artists={searchData?.artists?.items} tracks={searchData?.tracks?.items} albums={searchData?.albums?.items} playlists={searchData?.playlists?.items} />}
            </main>
        </div>
    )
}
