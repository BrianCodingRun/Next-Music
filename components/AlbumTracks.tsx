"use client"
import React, { useState, useEffect, useCallback } from 'react'
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
import { FaPause, FaPlay } from 'react-icons/fa6';
import { TbCircleCheckFilled, TbCirclePlus } from 'react-icons/tb';
import { RxAvatar } from 'react-icons/rx';
import { HiOutlinePencil } from 'react-icons/hi2';
import { IoRemoveCircleOutline } from 'react-icons/io5';
import useStore from '@/store/store';
import { useSession } from 'next-auth/react';

interface Album {
    id: string;
}

interface AlbumTrack {
    total: number;
    items: Array<{
        id: string;
        name: string;
        duration_ms: number;
        artists: Array<{
            name: string;
            id: string;
        }>;
        uri: string;
    }>;
}

export default function AlbumTracks({ albumData }: { albumData: Album }) {
    const {data:session}:any = useSession();
    const [album, setAlbum] = useState<Album>(albumData);
    const [albumTrack, setAlbumTrack] = useState<AlbumTrack>()
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const { setIsTrackPlaying, isTrackPlaying, setCurrentSongId, currentSongId, setCurrentPlaylistId, deviceId } = useStore();

    // Fetch Album Track
    const fetchAlbumTrack = useCallback(async () => {
        if(session && session.accessToken && album && album.id) {
            try {
                const response = await fetch(`https://api.spotify.com/v1/albums/${album.id}/tracks?limit=25`, {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`
                    }
                })
                const data = await response.json();
                setAlbumTrack(data)
            } catch (error) {
                console.log(error);                
            }
        }
    }, [album.id])
    
    useEffect(() => {
        fetchAlbumTrack()
    }, [fetchAlbumTrack])

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const playTrack = async (trackId: string) => {
        setCurrentSongId(trackId);
        setIsTrackPlaying(true);
        if (session && session.accessToken) {
            try {
                const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        uris: [`spotify:track:${trackId}`]
                    })
                });
                const data = await response.json();
                console.log(data);
            } catch (error) {
                console.log(error);
            }
        }
    };

    return (
        albumTrack?.total && albumTrack?.total > 0 ? (
            <Table className='my-4'>
                <TableHeader>
                    <TableRow>
                        <TableHead className='text-center'>#</TableHead>
                        <TableHead className='w-6/12'>Titre</TableHead>
                        <TableHead className='w-[5%]'>
                            <FaRegClock />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        albumTrack?.items.map((item, index) => (
                            <TableRow
                                key={item.id}
                                className={`h-16`}
                                onMouseEnter={() => setHoveredRow(index)} // Définit l'index de la ligne survolée
                                onMouseLeave={() => setHoveredRow(null)} // Réinitialise l'état lors du départ de la souris
                            >
                                <TableCell className='w-[4%] md:w-[2%] text-center'>
                                    <div className="relative">
                                        {isTrackPlaying && item.id === currentSongId && hoveredRow !== index ? (
                                            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                                                <EquilizerAnimIcon />
                                            </div>
                                        ) : (
                                            <span className={`text-sm text-neutral-400 transition-opacity hidden md:inline duration-200 ${hoveredRow === index ? 'opacity-0' : 'opacity-100'}`}>
                                                {index + 1}
                                            </span>
                                        )}
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${hoveredRow === index ? 'opacity-100' : 'opacity-0'}`}
                                            onClick={() => playTrack(item.id)}
                                        >
                                            {isTrackPlaying && item.id === currentSongId ? (
                                                <FaPause className="text-sm text-white" />
                                            ) : (
                                                <FaPlay className="text-sm text-white" />
                                            )}
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell className='w-1/12'>
                                    <div className='flex items-center gap-4'>
                                        <div className='flex flex-col'>
                                            <p className={`text-base truncate ${isTrackPlaying && item.id === currentSongId && 'text-primary'}`}>
                                                {
                                                    item?.name.length > 30 ?
                                                        item?.name.substring(0, 30) + "..." :
                                                        item?.name
                                                }
                                            </p>
                                            <div className='flex gap-2'>
                                                {
                                                    item?.artists?.slice(0, 3).map((artist, i) =>

                                                        <span className='text-xs text-neutral-400' key={i}>
                                                            {
                                                                i === item?.artists?.length - 1 ? artist.name : `${artist.name},`
                                                            }
                                                        </span>)
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className='relative invisible w-[3%] md:visible'>
                                    <p className='text-neutral-400'>
                                        {formatTime(item.duration_ms)}
                                    </p>
                                    {/* OPTIONS */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="link"
                                                size="icon"
                                                className={`absolute top-1/2 right-0 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${hoveredRow === index ? 'opacity-100' : 'opacity-0'}`}
                                            >
                                                <SlOptions className="text-lg text-neutral-400 transition-colors hover:text-white" />
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
                                                    <span>Supprimer</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        ) : (
            <div className='flex flex-col items-center justify-center h-full'>
                <p className='text-neutral-400 text-center'>Aucun titre</p>
            </div>
        )
    )
}
