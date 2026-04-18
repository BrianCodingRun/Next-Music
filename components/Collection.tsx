import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaHeart, FaPause, FaPlay } from "react-icons/fa6";
import { RiMusic2Line } from "react-icons/ri";
import useStore from "@/store/store";
import { useSession } from "next-auth/react";
import { playlistsFetch } from "@/pages/api/spotify/playlists/playlistApi";
import { Skeleton } from "./ui/skeleton";

interface Playlists {
  id: string;
  name: string;
  images: { url: string }[];
  owner: {
    display_name: string;
  };
  type: string;
  uri: string;
}

export default function Collection() {
  const { data: session }: any = useSession();
  const [playlists, setPlaylists] = useState<Playlists[]>([]);
  const [cachedTracks, setCachedTracks] = useState<Record<string, any[]>>({});
  const [likedTracks, setLikedTracks] = useState<any[]>([]);
  const {
    setIsTrackPlaying,
    isTrackPlaying,
    setCurrentSongId,
    currentSongId,
    setCurrentPlaylistId,
    currentPlaylistId,
    deviceId,
  } = useStore();

  useEffect(() => {
    // Récupération des playlists
    const getPlaylists = async () => {
      if (session && session.accessToken) {
        try {
          const response = await playlistsFetch(session.accessToken);
          const data = response.items;
          const playlistsWithTracks = data.filter(
            (playlist: any) => playlist.tracks.total > 0
          );
          setPlaylists(playlistsWithTracks);
        } catch (error) {
          console.error("Error fetching playlists: ", error);
        }
      }
    };
    getPlaylists();
  }, [session]);

  // Récupération des pistes d'une playlist
  const getPlaylistTracks = async (playlistId: string) => {
    if ((!session && !session.accessToken) || cachedTracks[playlistId]) return;

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching playlist tracks: ", error);
    }
  };

  const getLikedTracks = async () => {
    if (!session && !session.accessToken) return;

    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/tracks?limit=50",
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      const data = await response.json();
      return data.items.map((item: any) => item.track); // Retourne un tableau de pistes
    } catch (error) {
      console.error("Error fetching liked tracks: ", error);
    }
  };

  // Récupération de la chanson en cours de lecture
  const getCurrentlyPlaying = async () => {
    if (!session && !session.accessToken) return;

    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      if (response.status === 204 || response.status === 200) {
        console.log("No track currently playing");
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching currently playing track: ", error);
    }
  };

  // Contrôle du player (lecture/pause)
  const controlPlayer = async (
    action: "play" | "pause",
    token: string,
    body?: any
  ) => {
    const endpoint = action === "play" ? "play" : "pause";
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/${endpoint}?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: action === "play" ? JSON.stringify(body) : undefined,
        }
      );
      return response;
    } catch (error) {
      console.error(`Error controlling the player: ${action}`, error);
    }
  };

  // Lecture/pause d'une playlist
  const handlePlayPause = async (playlist: any) => {
    const data = await getCurrentlyPlaying();

    if (playlist === "liked_tracks") {
      // Gestion des Titres Likés
      const tracks = likedTracks.length ? likedTracks : await getLikedTracks();
      if (!tracks || tracks.length === 0) {
        console.error("No liked tracks found");
        return;
      }

      setLikedTracks(tracks); // Mettre à jour les titres likés dans l'état

      if (data && data.is_playing && currentPlaylistId === "liked_tracks") {
        // Pause the current track
        await playPause();
      } else {
        // Start playing the liked tracks
        const trackUris = tracks.map((track: any) => track.uri);
        let body = {
          uris: trackUris,
        };

        try {
          const response = await controlPlayer(
            "play",
            session.accessToken,
            body
          );
          if (response?.status === 204 || response?.status === 202) {
            setCurrentSongId(tracks[0].id); // Mettre à jour l'ID de la chanson en cours
            setCurrentPlaylistId("liked_tracks"); // Utiliser 'liked_tracks' comme identifiant
            setIsTrackPlaying(true); // Mettre à jour l'état de lecture
          }
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      // Gestion des playlists classiques (ton code existant)
      const tracks = await getPlaylistTracks(playlist.id);

      if (!tracks || tracks.items.length === 0) {
        console.error("No tracks found for this playlist");
        return;
      }

      const currentTrackIndex = tracks.items.findIndex(
        (item: any) => item.track.id === currentSongId
      );
      const trackToPlayId = currentTrackIndex >= 0 ? currentTrackIndex : 0;

      if (data && data.is_playing && playlist.id === currentPlaylistId) {
        // Pause the current track
        await playPause();
      } else {
        // Start playing or resume the track at the correct position
        let body = {
          context_uri: playlist.uri,
          offset: {
            position: trackToPlayId,
          },
        };

        try {
          const response = await controlPlayer(
            "play",
            session.accessToken,
            body
          );
          if (response?.status === 204) {
            setCurrentSongId(tracks.items[trackToPlayId].track.id);
            setCurrentPlaylistId(playlist.id);
            setIsTrackPlaying(true);
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  const playPause = async () => {
    if (session && session.accessToken) {
      const data = await getCurrentlyPlaying();
      if (data && data.is_playing) {
        const response = await controlPlayer("pause", session.accessToken);
        if (response?.status === 200 || response?.status === 204) {
          setIsTrackPlaying(false);
        }
      } else {
        let body = {};
        if (currentPlaylistId === "liked_tracks") {
          // Reprendre la lecture des titres likés
          const trackUris = likedTracks.map((track) => track.uri);
          body = { uris: trackUris };
        }
        const response = await controlPlayer("play", session.accessToken, body);
        if (response?.status === 200 || response?.status === 204) {
          setIsTrackPlaying(true);
          setCurrentSongId(data?.item?.id);
        }
      }
    }
  };

  // Conditions pour vérifier s'il y a des titres likés
  const hasLikedTracks = likedTracks && likedTracks.length > 0;
  const hasPlaylists = playlists && playlists.length > 0;
  if (!hasLikedTracks && !hasPlaylists) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Collections et playlists</h2>
      <div className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-3 xl:grid-cols-4">
        <div className="bg-neutral-800/50 group hover:bg-neutral-800 transition-colors justify-between text-left group relative overflow-hidden gap-2 flex items-center cursor-pointer rounded-sm">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-slate-50">
              <FaHeart className="text-white text-base" />
            </div>
            <Link
              href="/dashboard/collection/liked-tracks"
              className="text-sm font-bold"
            >
              Titres likés
            </Link>
          </div>
          <Button
            size="icon"
            className="rounded-full mx-2 hover:scale-105 transition-transform opacity-0 group-hover:opacity-100"
            onClick={() => handlePlayPause("liked_tracks")}
            aria-label="Jouer la playlist"
          >
            {currentPlaylistId === "liked_tracks" && isTrackPlaying ? (
              <FaPause />
            ) : (
              <FaPlay />
            )}
          </Button>
        </div>

        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <div
              className="bg-neutral-800/50 group hover:bg-neutral-800 transition-colors justify-between text-left group relative overflow-hidden gap-2 flex items-center cursor-pointer rounded-sm"
              key={playlist.id}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-slate-50">
                  {playlist.images && playlist.images.length > 0 ? (
                    <img
                      src={playlist.images[0].url}
                      className="w-full h-full object-cover rounded-sm"
                      aria-label={`Image de la playlist ${playlist.name}`}
                    />
                  ) : (
                    <RiMusic2Line className="text-base" />
                  )}
                </div>
                <Link
                  href={`/dashboard/playlist/${playlist.id}`}
                  className="text-sm font-bold"
                >
                  {playlist.name}
                </Link>
              </div>
              <Button
                size="icon"
                className="rounded-full shadow-2xl mx-2 hover:scale-105 transition-transform opacity-0 group-hover:opacity-100"
                onClick={() => handlePlayPause(playlist)}
                aria-label="Jouer la playlist"
              >
                {playlist.id === currentPlaylistId && isTrackPlaying ? (
                  <FaPause />
                ) : (
                  <FaPlay />
                )}
              </Button>
            </div>
          ))
        ) : (
          <>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-[150px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-[150px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-[150px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
