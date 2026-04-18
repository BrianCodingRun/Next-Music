'use client'

import { useSession } from 'next-auth/react'
import useStore from '@/store/store';
import React, { useCallback, useEffect, useState } from 'react'
import { RxAvatar } from "react-icons/rx";
import { IoRemoveCircleOutline } from "react-icons/io5";
import { HiOutlinePencil } from "react-icons/hi2";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FaHeart, FaPause, FaPlay } from 'react-icons/fa6';
import { TbCirclePlus } from 'react-icons/tb'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ListStart } from 'lucide-react';
import { SlOptions } from 'react-icons/sl';
import { FaRegClock } from 'react-icons/fa';
import EquilizerAnimIcon from './EquilizerAnimIcon';
import { likedFetch } from '@/pages/api/spotify/liked/likedApi';
import PlaylistHeader from './PlaylistHeader';
import LikedHeader from './LikedHeader';
import SavedTracks from './LikedTracks';

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

export default function LikedView() {
  const { data: session }: any = useSession()
  const [savedTracks, setSavedTracks] = useState<SavedTracks>()
  const [currentUser, setCurrentUser] = useState<any>({});
  const [opacity, setOpacity] = useState(0)
  const [textOpacity, setTextOpacity] = useState(0)
  const { setCurrentSongId, currentSongId, setIsTrackPlaying, isTrackPlaying } = useStore();

  // GET INFO CURRENT USER
  const getUserInfo = useCallback(async () => {
    if (session && session.accessToken) {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      });

      const data = await response.json();
      
      setCurrentUser(data)
    }
  }, [session])

  // Get saved tracks
  const getSavedTracks = useCallback(async () => {
    if (session && session.accessToken) {
      try {
        let response: any;
        response = await likedFetch(session.accessToken);
        setSavedTracks(response);
      } catch (error) {
        console.log(error);
      }
    }
  }, [session]);

  useEffect(() => {
    if (session?.accessToken) {
      getUserInfo();
      getSavedTracks();
    }
  }, [session]);

  useEffect(() => {
    if (savedTracks) {
      document.title = `Spotify Clone - Titres likés`
    }
    return () => {
      document.title = `Spotify Clone`
    }
  }, [savedTracks])

  // Function to change opacity on scroll
  const changeOpacity = (scrollPos: any) => {
    const offset = 150
    const textOffset = 10
    if (scrollPos < offset) {
      const newOpacity = 1 - ((offset - scrollPos) / offset)
      setOpacity(newOpacity)
      setTextOpacity(0)
    } else {
      setOpacity(1)
      const delta = scrollPos - offset
      const newTextOpacity = 1 - ((textOffset - delta) / textOffset)
      setTextOpacity(newTextOpacity)
    }
  }

  return (
    <div onScroll={(e: any) => changeOpacity(e.target.scrollTop)} className='relative flex-grow h-[75%] max-h-[100svh] bg-card scrollbar-none overflow-y-auto rounded-xl'>
      {savedTracks && <LikedHeader savedTracksData={savedTracks} currentUserData={currentUser} />}
      <div className='flex flex-col justify-between space-x-7 relative'>
        <div className={`sticky backdrop-blur-3xl z-10 top-0 left-0 h-24 w-full flex flex-row items-center gap-2`}>
          <div className="absolute w-full h-full top-0 left-0 bg-card" style={{ opacity: opacity }} />
          <div className='relative z-10 flex flex-row items-center gap-4 p-4'>
              <div className='flex items-center justify-center w-8 h-8 rounded-sm bg-gradient-to-br from-primary to-slate-50 shadow-2xl' style={{ opacity: textOpacity, visibility: textOpacity ? 'visible' : 'hidden' }}>
                <FaHeart className="text-xl text-white/50" />
              </div>
            <span
              className="font-bold text-xl md:text-3xl"
              style={{ opacity: textOpacity, visibility: textOpacity ? 'visible' : 'hidden' }}
            >
              Titres likés
            </span>
          </div>
        </div>
        {/* TABLE OF CONTENTS */}
        {savedTracks && <SavedTracks savedData={savedTracks} />}
      </div>
    </div>
  )
}