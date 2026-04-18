import React, { useCallback, useEffect, useState } from 'react';
import { FaPause, FaPlay } from 'react-icons/fa6';
import { IoPlaySkipForward, IoPlaySkipBack } from "react-icons/io5";
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import useStore from '@/store/store';
import { Progress } from '@/components/ui/progress';
import { TbCircleCheckFilled, TbCirclePlus } from 'react-icons/tb';
import { Slider } from './ui/slider';
import muteIcon from '@/assets/icons/volume-mute.png';
import lowIcon from '@/assets/icons/volume-low.png';
import highIcon from '@/assets/icons/volume-high.png';
import crossIcon from '@/assets/icons/volume-cross.png';

interface Song {
  id: string;
  name: string;
  album: { images: [{ url: string }] };
  artists: [{ name: string }];
  duration_ms: number;
  uri: string;
}

const iconsVolume = [
  { icon: muteIcon, value: 0, alt: 'Mute' },
  { icon: lowIcon, value: 33, alt: 'Low' },
  { icon: highIcon, value: 66, alt: 'High' },
  { icon: crossIcon, value: 100, alt: 'Cross' }
]

export default function Player() {
  const { data: session }: any = useSession();
  const [token, setToken] = useState<string>("");
  const [currentTrack, setCurrentTrack] = useState<Song>();
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [savedTracks, setSavedTracks] = useState<any[]>([]);
  const [volume, setVolume] = useState<number>(100);
  // Store the result to display the correct icon
  const [isInPlaylist, setIsInPlaylist] = useState(false);
  const { isTrackPlaying, setIsTrackPlaying, setCurrentSongId, currentSongId, deviceId } = useStore();

  // Récupérer le token depuis la session
  useEffect(() => {
    if (session && session.accessToken) {
      setToken(session.accessToken);
    }
  }, [session]);

  // Gestion des icons volume en utilisant le tableau d'icones "iconsVolume"
  const getVolumeIcon = () => {
    if (volume === 0) {
      return iconsVolume[3];
    } else if (volume <= 33) {
      return iconsVolume[0];
    } else if (volume <= 66) {
      return iconsVolume[1];
    } else if (volume >= 66) {
      return iconsVolume[2];
    } else {
      return iconsVolume[3];
    }
  };

  const fetchTrack = async (trackId: string) => {
    if (trackId) {
      try {
        const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`
          }
        });
        const data = await response.json();
        setCurrentTrack(data)
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Récupérer les données de la piste
  useEffect(() => {
    const f = async () => {
      if (session && session.accessToken) {
        if (!currentSongId) {
          // Get the currently playing song from spotify
          const data = await getCurrentlyPlaying();
          setCurrentSongId(data?.item?.id);
          if (data?.is_playing) {
            setIsTrackPlaying(true);
          }
          await fetchTrack(data?.item?.id);
        } else {
          // Get song info
          await fetchTrack(currentSongId);
        }
      }
    };
    f();
  }, [currentSongId]);

  /********  GESTION DE LA PLAYBACK *********/

  // Vérifier si la piste est en cours de lecture
  const getCurrentlyPlaying = async () => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      })
      if (response.status === 204) {
        console.log("204 response from currently playing");
        return;
      }
      const data = await response.json();
      return data;

    } catch (error) {
      console.log(error);
    }
  };

  // Lecture/Pause de la piste
  const handlePlayPause = async () => {
    if (session && session.accessToken) {
      const data = await getCurrentlyPlaying();
      if (data?.is_playing) {
        const response = await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.accessToken}`
          }
        })
        if (response.status == 204 || response.status == 200) {
          setIsTrackPlaying(false)
        }
      } else {
        try {
          const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              'Content-Type': 'application/json'
            },
          });
          if (response.status == 204 || response.status == 200) {
            setIsTrackPlaying(true)
            setCurrentSongId(data.item.id)
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  // Musique suivante
  const handleNextSong = async () => {
    if (!session || !session.accessToken || !deviceId) return;

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/next?device_id=${deviceId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log("Piste suivante déclenchée");
        // Attendre une seconde pour laisser Spotify changer de piste
        setTimeout(async () => {
          const updatedTrack = await getCurrentlyPlaying();
          if (updatedTrack?.item?.id) {
            setCurrentSongId(updatedTrack.item.id);
            setCurrentTrack(updatedTrack.item);
          }
          if (!updatedTrack?.item.is_playing) {
            setIsTrackPlaying(true);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Erreur dans handleNextSong:", error);
    }
  };

  const handlePreviousSong = async () => {
    if (!session || !session.accessToken || !deviceId) return;

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/previous?device_id=${deviceId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log("Piste précédente déclenchée");

        // Attendre une seconde pour laisser Spotify changer de piste
        setTimeout(async () => {
          const updatedTrack = await getCurrentlyPlaying();
          if (updatedTrack?.item?.id) {
            setCurrentSongId(updatedTrack.item.id);
            setCurrentTrack(updatedTrack.item);
          }
          if (!updatedTrack?.item.is_playing) {
            setIsTrackPlaying(true);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Erreur dans handlePreviousSong:", error);
    }
  };

  // Gestion du volume
  const handleVolumeChange = async (value: number[]) => {
    if (session && session.accessToken) {
      try {
        const volumeValue = Math.round(value[0]); // Convertit en entier entre 0-100
        const response = await fetch(
          `https://api.spotify.com/v1/me/player/volume?volume_percent=${volumeValue}&device_id=${deviceId}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (response.ok) {
          setVolume(volumeValue); // Met à jour l'état local
        } else {
          console.error("Erreur lors de la mise à jour du volume :", response.status);
        }
      } catch (error) {
        console.error("Erreur dans handleVolumeChange:", error);
      }
    }
  };

  // Progression de la piste
  useEffect(() => {
    if (!isTrackPlaying || !currentTrack) return;

    const updateProgress = async () => {
      const data = await getCurrentlyPlaying();

      if (data && data.progress_ms !== undefined) {
        setCurrentTime(data.progress_ms);
        setProgress((data.progress_ms / currentTrack.duration_ms) * 100);

        // Vérifier si la piste est terminée
        if (data.progress_ms >= currentTrack.duration_ms - 1000) {
          console.log("La piste est terminée, passage à la suivante...");

          // Attendre 1 seconde avant de récupérer la nouvelle piste
          setTimeout(async () => {
            const newSong = await getCurrentlyPlaying();
            if (newSong?.item?.id) {
              setCurrentSongId(newSong.item.id);
              setCurrentTrack(newSong.item);
              console.log("Nouvelle piste chargée :", newSong.item.name);
            }
          }, 1000); // Laisse un court délai pour éviter un état désynchronisé
        }
      }
    };

    const interval = setInterval(updateProgress, 800);
    return () => clearInterval(interval);
  }, [isTrackPlaying, currentTrack]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!session) return null;

  return (
    <div className='h-20 w-full bg-black text-white grid grid-cols-3 text-xs md:text-base px-2 md:px-8'>
      <div className='flex items-center space-x-4'>
        {currentTrack?.album?.images?.length && (
          <img
            src={currentTrack?.album?.images[0]?.url}
            className='w-12 h-12 rounded-sm'
            alt={currentTrack?.name}
          />
        )}
        <div>
          <p className='text-white font-semibold text-sm'>{currentTrack?.name}</p>
          <p className='text-neutral-400 text-xs'>
            {
              currentTrack?.artists?.slice(0, 2).map((artist: any) => artist.name).join(", ")
            }
          </p>
        </div>
        <div>
          {
            currentTrack &&
            <Button variant="link">
              {isInPlaylist ? (
                <TbCircleCheckFilled className='text-xl text-primary' />
              ) : (
                <TbCirclePlus className='text-xl text-neutral-400 hover:text-white transition-colors' />
              )}
            </Button>
          }
        </div>
      </div>
      <div className='flex flex-col items-center justify-center py-2 w-full'>
        <div className='flex items-center justify-center space-x-2 w-full'>
          {/* Bouton piste précédente */}
          <Button
            variant="link"
            className={`text-white w-9 h-9 text-lg`}
            size="icon"
            aria-label='Piste précédente'
            onClick={handlePreviousSong}
          >
            <IoPlaySkipBack />
          </Button>
          {/* Bouton lecture/pause */}
          <Button
            className={`bg-white w-9 h-9 rounded-full hover:bg-white/80 transition-colors text-lg`}
            size="icon"
            aria-label='Mettre pause ou play'
            onClick={handlePlayPause}
          >
            {isTrackPlaying ? <FaPause /> : <FaPlay />}
          </Button>
          {/* Bouton piste suivante */}
          <Button
            variant="link"
            className={`text-white w-9 h-9 transition-colors text-lg`}
            size="icon"
            aria-label='Piste suivante'
            onClick={handleNextSong}
          >
            <IoPlaySkipForward />
          </Button>
        </div>
        <div className='flex items-center justify-center space-x-2 my-1 gap-4 w-full'>
          {currentTime ? (<span className='text-white text-xs'>{formatTime(currentTime)}</span>) : ''}
          {
            currentTrack && (
              <Progress
                className='h-1 bg-neutral-800/50 rounded-full w-full cursor-pointer'
                value={progress}
              />
            )
          }
          {
            currentTrack?.duration_ms && (
              <p className='text-white text-xs'>{formatTime(currentTrack?.duration_ms)}</p>
            )
          }
        </div>
      </div>
      {/* Volume */}
      <div className='flex items-center justify-end w-full'>
        <div className='flex items-center gap-2 w-32'>
          <div className='text-neutral-400 w-5 h-5 cursor-pointer'
          >
            <img src={getVolumeIcon().icon.src} alt={getVolumeIcon().alt} style={{ width: '100%', height: '100%' }} />
          </div>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange} // Corrigé pour recevoir la valeur
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
}