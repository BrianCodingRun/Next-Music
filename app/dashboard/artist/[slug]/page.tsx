{/************************************************/}
{/*******************PAGE ARTIST****************/}
{/************************************************/}

import React from 'react';
import ArtistView from '@/components/ArtistView';

export default function Artist({ params }: { params: { slug: string } }) {
    
    return <ArtistView artistId={params.slug} />
}