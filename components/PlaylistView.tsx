'use client'

import { playlistFetch } from '@/pages/api/spotify/playlists/playlistApi';
import { useSession } from 'next-auth/react'
import React, { useCallback, useEffect, useState } from 'react'
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
import PlaylistTracks from './PlaylistTracks';
import PlaylistHeader from './PlaylistHeader';

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

export default function PlaylistView({ globalPlaylistId }: { globalPlaylistId: string }) {
  const { data: session }: any = useSession();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [currentUser, setCurrentUser] = useState<any>({});
  const [opacity, setOpacity] = useState(0);
  const [textOpacity, setTextOpacity] = useState(0);

  // GET INFO CURRENT USER
  const getUserInfo = useCallback(async () => {
    if (session && session.accessToken) {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      const data = await response.json();
      setCurrentUser(data);
    }
  }, [session]);

  // Get playlists
  const getPlaylist = useCallback(async () => {
    if (session && session.accessToken) {
      try {
        const response = await playlistFetch(session.accessToken, globalPlaylistId);
        setPlaylist(response);
      } catch (error) {
        console.error(error);
      }
    }
  }, [session, globalPlaylistId]);

  useEffect(() => {
    if (session?.accessToken) {
      getUserInfo();
      getPlaylist();
    }
  }, [getUserInfo, getPlaylist]);

  useEffect(() => {
    if (playlist) {
      document.title = `${playlist.name} - Spotify Clone`;
    }
    return () => {
      document.title = 'Spotify Clone';
    };
  }, [playlist]);

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
      <PlaylistHeader playlistData={playlist} currentUserData={currentUser} />
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
            {playlist && playlist.images ? (
              <img
                className='h-8 w-8 rounded-sm'
                src={playlist?.images[0]?.url}
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
              {playlist?.name}
            </span>
          </div>
        </div>

        {/* Tracks */}
        {playlist && (
          <PlaylistTracks
            playlistData={playlist}
          />
        )}
      </div>
    </div>
  );
}