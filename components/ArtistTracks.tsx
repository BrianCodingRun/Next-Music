import React, { useEffect, useState } from 'react'
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
import { Button } from '@/components/ui/button';
import { ListStart } from 'lucide-react';
import { SlOptions } from 'react-icons/sl';
import { FaRegClock } from 'react-icons/fa';
import EquilizerAnimIcon from './EquilizerAnimIcon';
import useStore from '@/store/store';
import { FaPause, FaPlay } from 'react-icons/fa6';
import { TbCircleCheckFilled, TbCirclePlus } from 'react-icons/tb';
import { RxAvatar } from 'react-icons/rx';
import { HiOutlinePencil } from 'react-icons/hi2';
import { IoRemoveCircleOutline } from 'react-icons/io5';
import { useSession } from 'next-auth/react';

interface Artist {
    id: string;
    name: string;
    type: string;
    owner: {
        display_name: string;
        id: string;
    };
    images: { url: string }[];
    uri: string;
}

export default function ArtistTracks({ artistData }: { artistData: any }) {
    const { data: session }: any = useSession();
    const [token, setToken] = useState<string>('');
    const [artistDat, setArtistDat] = useState<Artist>(artistData);
    const [artistTracks, setArtistTracks] = useState<any[]>([]);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [trackStatus, setTrackStatus] = useState<{ [key: string]: boolean }>({}); // Stocker l'état de chaque morceau (aimé ou dans une playlist)

    const { setIsTrackPlaying, isTrackPlaying, setCurrentSongId, currentSongId, setCurrentPlaylistId, deviceId } = useStore();
    // Récupérer le token depuis la session
    useEffect(() => {
        if (session && session.accessToken) {
            setToken(session.accessToken);
        }
    }, [session]);

    const fetchTracks = async () => {
        if (session && session.accessToken) {
            const response = await fetch(`https://api.spotify.com/v1/artists/${artistDat.id}/top-tracks`, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                }
            });
            const data = await response.json();
            setArtistTracks(data.tracks);         
        }
    };

    useEffect(() => {
        fetchTracks();
    }, [fetchTracks]);

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
        artistTracks?.length > 0 ? (
            <Table className='my-4'>
                <TableHeader>
                    <TableRow>
                        <TableHead className='w-[4%] md:w-[2%] text-center'>#</TableHead>
                        <TableHead className='w-1/12'>Titre</TableHead>
                        <TableHead className='invisible w-1/12 md:visible'>Album</TableHead>
                        <TableHead className='invisible w-[2%] md:visible'>
                            <FaRegClock />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        artistTracks?.map((item, index) => (
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
                                        <div className="relative h-10 w-10">
                                            <img src={item.album.images[0].url} className='w-full h-full object-cover rounded-sm' loading='lazy' />
                                        </div>
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
                                                    item?.artists?.slice(0, 3).map((artist:any, i:number) =>

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
                                <TableCell className='invisible w-1/12 md:visible'><p className='text-neutral-400'>{item.album.name}</p></TableCell>
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
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className={`absolute top-1/2 -left-8 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${hoveredRow === index ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        {trackStatus[item.id] ? (
                                            <TbCircleCheckFilled className='text-xl text-primary' />
                                        ) : (
                                            <TbCirclePlus className='text-xl text-neutral-400 hover:text-white transition-colors' />
                                        )}
                                    </Button>
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
