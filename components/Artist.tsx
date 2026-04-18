import React from 'react'

export default function Artist({ globalArtistId }: { globalArtistId: any }) {
    return (
        <div className='flex-grow h-4/5 rounded-xl mx-2 py-4 px-6 space-y-4 bg-neutral-900'>
            Artist id: {globalArtistId}
        </div>
    )
}
