import React from 'react'
import AlbumView from '@/components/AlbumView'


export default function Album({params}:{params: {slug: string}}) {
  return <AlbumView albumId={params.slug} />
}
