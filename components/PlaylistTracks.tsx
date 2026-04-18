'use client'

import React, { useEffect, useState } from 'react'
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
import useStore from '@/store/store';
import { FaPause, FaPlay } from 'react-icons/fa6';
import { TbCircleCheckFilled, TbCirclePlus } from 'react-icons/tb';
import { RxAvatar } from 'react-icons/rx';
import { HiOutlinePencil } from 'react-icons/hi2';
import { IoRemoveCircleOutline } from 'react-icons/io5';
import { useSession } from 'next-auth/react';

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

export default function PlaylistTracks({ playlistData }: { playlistData: Playlist }) {
    const { data: session }: any = useSession();
    const [token, setToken] = useState<string>('');
    const [playlist, setPlaylist] = useState<Playlist>(playlistData);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [savedTracks, setSavedTracks] = useState<any[]>([]);
    const [trackStatus, setTrackStatus] = useState<{ [key: string]: boolean }>({}); // Stocker l'état de chaque morceau (aimé ou dans une playlist)

    const { setIsTrackPlaying, isTrackPlaying, setCurrentSongId, currentSongId, setCurrentPlaylistId, deviceId } = useStore();

    // Récupérer le token depuis la session
    useEffect(() => {
        if (session && session.accessToken) {
            setToken(session.accessToken);
        }
    }, [session]);

    const getPlaylists = async () => {
        try {
            const response = await fetch("https://api.spotify.com/v1/me/playlists", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setPlaylists(data.items);
        } catch (error) {
            console.error("Erreur lors de la récupération des playlists:", error);
        }
    };

    const getSavedTracks = async () => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/me/tracks?limit=50`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setSavedTracks(data.items);
        } catch (error) {
            console.error("Erreur lors de la récupération des morceaux aimés:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await getPlaylists();  // Récupère d'abord les playlists
            await getSavedTracks();  // Ensuite les morceaux aimés
        };
    
        if (playlist && token) {
            fetchData();
        }
    }, [playlist, token]);    

    // Function convert ms to time
    function convertMsToTime(millis: number) {
        let minutes = Math.floor(millis / 60000);
        let seconds = Math.floor((millis % 60000) / 1000);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Fonction convertir la date s'il y a moins de 24 heures
    const convertDate = (date: string) => {
        const dateObject = new Date(date);
        const diff = Date.now() - dateObject.getTime();
        // Si la date est inférieure à 1 heures afficher "il y a X minutes"
        if (diff < 1000 * 60 * 60) {
            const minutes = Math.floor(diff / (1000 * 60));
            return `Il y a ${minutes} minutes`;
        }
        // Si la date est inférieure à 24 heures afficher "il y a X heures"
        if (diff < 1000 * 60 * 60 * 24) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            return `Il y a ${hours} heures`;
        }
        // Si la date est plus de 24 heures et moins de 30 jours
        else if (diff < 1000 * 60 * 60 * 24 * 30) {
            return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(dateObject);
        }
        // Si la date est plus de 24 heures
        else {
            return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(dateObject);
        }
    }

    const playTrack = async (trackId: string, index: number) => {
        setCurrentSongId(trackId);
        setIsTrackPlaying(true);
        if (session && session.accessToken) {
            try {
                await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        context_uri: `spotify:playlist:${playlist.id}`,
                        offset: {
                            position: index
                        }
                    })
                });               
            } catch (error) {
                console.log(error);
            }
        }
    };

    return (
        playlist?.tracks?.items?.length && playlist?.tracks?.items?.length > 0 ? (
            <Table className='my-4'>
                <TableHeader>
                    <TableRow>
                        <TableHead className='w-[4%] md:w-[2%] text-center'>#</TableHead>
                        <TableHead className='w-1/12'>Titre</TableHead>
                        <TableHead className='invisible w-1/12 md:visible'>Album</TableHead>
                        <TableHead className='invisible md:visible w-1/12'>Date d'ajout</TableHead>
                        <TableHead className='invisible w-[3%] md:visible'>
                            <FaRegClock />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        playlist?.tracks?.items?.map((item, index) => (
                            <TableRow
                                key={item.track.id}
                                className={`h-16`}
                                onMouseEnter={() => setHoveredRow(index)} // Définit l'index de la ligne survolée
                                onMouseLeave={() => setHoveredRow(null)} // Réinitialise l'état lors du départ de la souris
                            >
                                <TableCell className='w-[4%] md:w-[2%] text-center'>
                                    <div className="relative">
                                        {isTrackPlaying && item.track.id === currentSongId && hoveredRow !== index ? (
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
                                            onClick={() => playTrack(item.track.id, index)}
                                        >
                                            {isTrackPlaying && item.track.id === currentSongId ? (
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
                                            <img src={item.track.album.images[0].url} className='w-full h-full object-cover rounded-sm' loading='lazy' />
                                        </div>
                                        <div className='flex flex-col'>
                                            <p className={`text-base truncate ${isTrackPlaying && item.track.id === currentSongId && 'text-primary'}`}>
                                                {
                                                    item?.track?.name.length > 30 ?
                                                        item?.track?.name.substring(0, 30) + "..." :
                                                        item?.track?.name
                                                }
                                            </p>
                                            <div className='flex gap-2'>
                                                {
                                                    item?.track?.artists?.slice(0, 3).map((artist, i) =>

                                                        <span className='text-xs text-neutral-400' key={i}>
                                                            {
                                                                i === item?.track?.artists?.length - 1 ? artist.name : `${artist.name},`
                                                            }
                                                        </span>)
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className='invisible w-1/12 md:visible'><p className='text-neutral-400'>{item.track.album.name}</p></TableCell>
                                <TableCell className='relative invisible w-1/12 md:visible'>
                                    <p className='text-neutral-400'>
                                        {
                                            convertDate(item.added_at)
                                        }
                                    </p>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className={`absolute top-1/2 right-0 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${hoveredRow === index ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        {trackStatus[item.track.id] ? (
                                            <TbCircleCheckFilled className='text-xl text-primary' />
                                        ) : (
                                            <TbCirclePlus className='text-xl text-neutral-400 hover:text-white transition-colors' />
                                        )}
                                    </Button>
                                </TableCell>
                                <TableCell className='relative invisible w-[3%] md:visible'>
                                    <p className='text-neutral-400'>
                                        {convertMsToTime(item.track.duration_ms)}
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