'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import useStore from '@/store/store';
import { RiMusic2Line } from 'react-icons/ri';
import { RxAvatar } from "react-icons/rx";
import { IoRemoveCircleOutline } from "react-icons/io5";
import { HiOutlinePencil } from "react-icons/hi2";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ListStart } from 'lucide-react';
import { SlOptions } from 'react-icons/sl';
import AlbumHeader from './AlbumHeader';
import AlbumTracks from './AlbumTracks';

interface Album {
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

export default function AlbumView({ albumId }: { albumId: string }) {
  const { data: session }: any = useSession();

  const [album, setAlbum] = useState<Album | null>(null)
  const [opacity, setOpacity] = useState(0);
  const [textOpacity, setTextOpacity] = useState(0);

  const fetchAlbum = async () => {
    if (session && session.accessToken) {
      try {
        const id = albumId;
        if(!id) return
        const response = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          }
        })
        const data = await response.json();
        setAlbum(data);
      } catch (error) {
        console.log("Erreur lors de la récupération d'album", error);
      }
    }
  }

  useEffect(() => {
    fetchAlbum()
  }, [albumId])

  // Function to change opacity on scroll
  const changeOpacity = (scrollPos: number) => {
    const offset = 150;
    const textOffset = 10;
    if (scrollPos < offset) {
      const newOpacity = 1 - (offset - scrollPos) / offset;
      setOpacity(newOpacity);
      setTextOpacity(0);
    } else {
      setOpacity(1);
      const delta = scrollPos - offset;
      const newTextOpacity = 1 - (textOffset - delta) / textOffset;
      setTextOpacity(newTextOpacity);
    }
  };

  return (
    <div
      onScroll={(e: React.UIEvent<HTMLDivElement>) => changeOpacity(e.currentTarget.scrollTop)}
      className='relative flex-grow h-[77%] max-h-[100svh] bg-card scrollbar-none overflow-y-auto rounded-xl'
    >
      <AlbumHeader albumData={album} />
      <div className='flex flex-col justify-between space-x-7'>
        <div className={`sticky z-10 top-0 left-0 h-24 w-full flex flex-row items-center gap-2`}>
          <div className="absolute w-full h-full top-0 left-0 bg-card" style={{ opacity }} />
          <div className='relative z-10 flex flex-row items-center gap-4 p-4'>
            {/* OPTIONS */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="link" size="icon">
                  <SlOptions className="text-lg text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-4 p-2 w-56">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="flex flex-col gap-1">
                  <DropdownMenuItem>
                    <ListStart className="mr-2 h-4 w-4 text-primary" />
                    <span>Ajouter à la file d'attente</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="font-sans">
                    <RxAvatar className="mr-2 h-4 w-4 text-primary" />
                    <span>Supprimer du profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="font-sans">
                    <HiOutlinePencil className="mr-2 h-4 w-4 text-primary" />
                    <span>Modifier les informations</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="font-sans">
                    <IoRemoveCircleOutline className="mr-2 h-4 w-4 text-primary" />
                    <span>Supprimer la playlist</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {album && album.images ? (
              <img
                className='h-8 w-8 rounded-sm'
                src={album?.images[0]?.url}
                style={{ opacity: textOpacity, visibility: textOpacity ? 'visible' : 'hidden' }}
                alt=''
              />
            ) : (
              <div className='flex items-center justify-center w-8 h-8 rounded-sm bg-neutral-800 shadow-2xl' style={{ opacity: textOpacity, visibility: textOpacity ? 'visible' : 'hidden' }}>
                <RiMusic2Line className="text-xl text-white/50" />
              </div>
            )}
            <span
              className="font-bold text-xl md:text-3xl"
              style={{ opacity: textOpacity, visibility: textOpacity ? 'visible' : 'hidden' }}
            >
              {album?.name}
            </span>
          </div>
        </div>

        {/* Tracks */}
        {album && (
          <AlbumTracks
            albumData={album}
          />
        )}
      </div>
    </div>
  )
}
