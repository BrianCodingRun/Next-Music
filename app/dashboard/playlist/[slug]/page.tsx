{/************************************************/}
{/*******************PAGE PLAYLIST****************/}
{/************************************************/}

import React from 'react';
import PlaylistView from '@/components/PlaylistView'

export default function Playlist({ params }: { params: { slug: string } }) {
    
    return <PlaylistView globalPlaylistId={params.slug} />
}