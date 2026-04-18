"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { FaPause, FaPlay } from 'react-icons/fa6'
import { RiMusic2Line } from 'react-icons/ri'
import { HiSpeakerWave } from 'react-icons/hi2'
import useStore from '@/store/store'
import { useSession } from 'next-auth/react'
import EquilizerAnimIcon from './EquilizerAnimIcon'

export default function SearchResults({ artists, tracks, albums, playlists }: { artists: any, tracks: any, albums: any, playlists: any }) {

  const { data: session }: any = useSession();
  const [token, setToken] = useState<string>('');
  const { setCurrentSongId, isTrackPlaying, currentPlaylistId, deviceId, currentSongId, setIsTrackPlaying, setCurrentPlaylistId } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (session && session.accessToken) {
      setToken(session.accessToken);
    }
  }, [session]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const playTrack = async (trackId: string) => {
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
        if (response.status == 204 || response.status == 200) {
          setCurrentSongId(trackId);
          setIsTrackPlaying(true);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className='flex flex-col gap-2 px-8 h-screen overflow-y-auto scrollbar-none'>
      <div className="grid grid-cols-[3fr_4fr]">
        <div className="space-y-4">
          <h2 className='text-2xl font-bold'>Meilleur résultat</h2>
          <div className='h-64 pr-8'>
            <div className='cursor-pointer relative group h-56 w-full bg-primary/5 hover:bg-primary/10 p-4 flex flex-col gap-6 rounded-md transition duration-500'
              onClick={() => router.push(`/dashboard/artist/${artists[0].id}`)}
            >
              <Button size="largePlay" className="absolute right-8 bottom-6 opacity-0 group-hover:bottom-8 group-hover:opacity-100 rounded-full hover:scale-105 transition-all">
                <FaPlay className='text-xl' />
              </Button>
              {artists && <div className='flex flex-col gap-2'>
                <img className='h-24 w-24 rounded-full' src={artists[0].images[0].url} alt={artists.name} />
                <p className='text-3xl font-bold'>{artists[0].name}</p>
                <p className='text-sm text-neutral-400'>Artiste</p>
              </div>}
            </div>
          </div>
        </div>
        <div className='space-y-4'>
          <h2 className='text-2xl font-bold'>Titres</h2>
          <div className='pr-8'>
            {
              tracks && tracks.length && tracks.slice(0, 4).map((track: any) => (
                <div
                  className='w-full p-2 max-w-sm justify-start text-left group relative overflow-hidden gap-2 flex flex-row items-center cursor-pointer rounded-sm h-14'
                  key={track.id}
                >
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-sm bg-neutral-700 group-hover:bg-neutral-900 transition-colors">
                    <div className="relative">
                      {
                        track?.album?.images ? (
                          <img src={track.album?.images[0].url} className='w-10 h-10 rounded-sm' />
                        ) : (
                          <RiMusic2Line className="text-white text-2xl transition-opacity duration-300 group-hover:opacity-80" />
                        )
                      }
                      <div
                        className="z-40 absolute rounded-sm bg-black/70 inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        onClick={() => playTrack(track.id)}
                      >
                        {
                          isTrackPlaying && currentSongId === track.id ? (
                            <FaPause className="text-white text-base" />
                          ) : (
                            <FaPlay className="text-white text-base" />
                          )
                        }
                      </div>
                    </div>
                  </div>
                  <div className='relative z-20 flex flex-col'>
                    <h2 className={`font-sans text-base font-medium ${isTrackPlaying && currentSongId === track.id ? 'text-primary' : 'text-white'}`}>
                      {
                        track?.album?.name.length > 15 ? (
                          track?.album?.name.substring(0, 15) + '...'
                        ) : (
                          track?.album?.name
                        )
                      }
                    </h2>
                    <span className="font-sans text-sm text-neutral-400">
                      {
                        track?.artists?.slice(0, 2).map((artist: any) => artist.name).join(", ")
                      }
                    </span>
                  </div>
                  <div className={`absolute right-20 top-4 ${isTrackPlaying && currentSongId === track.id ? 'opacity-100' : 'opacity-0'}`}>
                    <EquilizerAnimIcon />
                  </div>
                  {/* Duration */}
                  <div className='absolute right-4 top-2/4 -translate-y-2/4'>
                    <span className='font-sans text-sm text-neutral-400'>{
                      formatTime(track.duration_ms)
                    }</span>
                  </div>
                  <div className="absolute inset-0 bg-neutral-700/10 invisible opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:visible" />
                </div>
              ))
            }
          </div>
        </div>
      </div>
      {/* Artists */}
      <div className='space-y-4'>
        <h2 className='text-2xl font-bold'>Artistes</h2>
        <div className="grid grid-cols-2 gap-1 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {
            artists && artists.filter((artist: any) => artist?.images[0]?.url).slice(0, 5).map((artist: any) => (
              <div className='relative z-50 flex flex-col justify-center gap-2 px-4 py-2 group hover:bg-primary/5 transition-colors cursor-pointer rounded-lg' key={artist.id}
                onClick={() => router.push(`/dashboard/artist/${artist.id}`)}
              >
                <img
                  src={artist?.images[0]?.url}
                  alt={artist?.name}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover transition-transform rounded-full"
                  style={{ aspectRatio: "192/192", objectFit: "cover" }}
                />
                <div className='flex flex-col px-1 text-sm capitalize'>
                  <h3 className='text-white font-semibold font-mono'>
                    {
                      artist.name && artist.name.length > 20 ? artist?.name?.substring(0, 20) + "..." : artist?.name
                    }
                  </h3>
                  <p className='text-neutral-400'>
                    Artiste
                  </p>
                </div>
                <Button size="largePlay" className="absolute right-8 bottom-12 opacity-0 group-hover:bottom-14 group-hover:opacity-100 rounded-full hover:scale-105 transition-all"
                >
                  <FaPlay className='text-xl' />
                </Button>
              </div>
            ))
          }
        </div>
      </div>
      {/* Albums */}
      <div className='space-y-4'>
        <h2 className='text-2xl font-bold'>Albums</h2>
        <div className='grid grid-cols-2 gap-1 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5'>
          {
            // Afficher uniquement les albums qui ont un id
            albums && albums.filter((album: any) => album?.name).slice(0, 5).map((album: any) => (
              <div
                className='relative flex flex-col gap-2 p-4 group hover:bg-primary/5 transition-colors cursor-pointer rounded-lg'
                key={album.id}
                onClick={() => router.push(`/dashboard/album/${album.id}`)}
              >
                <img
                  src={album?.images[0]?.url}
                  alt={album?.name}
                  className='rounded-lg w-full h-full object-cover'
                />
                <div className='flex flex-col py-2 text-sm capitalize'>
                  <h3 className='text-sm font-semibold capitalize'>{album?.name?.length > 20 ? album?.name?.substring(0, 20) + "..." : album?.name}</h3>
                  {
                    // Date de sortie
                    album?.release_date && (
                      <div className='flex items-center gap-2'>
                        <p className='text-xs text-neutral-400'>
                          {
                            album?.release_date.substring(0, 4)
                          }
                        </p>
                        <hr className='border-none w-1 h-1 bg-current rounded-full' />
                        <span className='text-xs text-neutral-400'>
                          {
                            album?.artists?.map((artist: any, i: number) => (
                              <span key={i}>
                                {i === album?.artists.length - 1 ? artist.name.length > 10 ? artist?.name?.substring(0, 10) + "..." : artist?.name : `${artist.name}, `}
                              </span>
                            ))
                          }
                        </span>
                      </div>
                    )
                  }
                </div>
                <Button size="largePlay" className="absolute right-8 bottom-12 opacity-0 group-hover:bottom-14 group-hover:opacity-100 rounded-full hover:scale-105 transition-all"
                >
                  <FaPlay className='text-xl' />
                </Button>
              </div>
            ))
          }
        </div>
      </div>
      {/* PLAYLISTS */}
      <div className='space-y-4'>
        <h2 className='text-2xl font-bold'>Playlists</h2>
        <div className="grid grid-cols-2 gap-1 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {
            playlists && playlists.filter((playlist: any) => playlist?.images[0]?.url).slice(0, 5).map((playlist: any) => (
              <div
                className='relative flex flex-col gap-2 p-4 group hover:bg-primary/5 transition-colors cursor-pointer rounded-lg' key={playlist.id}
                onClick={() => router.push(`/dashboard/playlist/${playlist.id}`)}
              >
                <img
                  src={playlist?.images[0]?.url}
                  alt={playlist?.name}
                  className='rounded-lg w-full h-full object-cover'
                />
                <div className='flex flex-col py-2 text-sm capitalize'>
                  <h3 className='text-sm font-semibold capitalize'>{playlist?.name?.length > 20 ? playlist?.name?.substring(0, 20) + "..." : playlist?.name}</h3>
                  <p className='text-neutral-400'>
                    Par {playlist?.owner?.display_name.length > 10 ? playlist?.owner?.display_name?.substring(0, 10) + "..." : playlist?.owner?.display_name}
                  </p>
                </div>
                <Button size="largePlay" className="absolute right-8 bottom-12 opacity-0 group-hover:bottom-14 group-hover:opacity-100 rounded-full hover:scale-105 transition-all"
                >
                  <FaPlay className='text-xl' />
                </Button>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
