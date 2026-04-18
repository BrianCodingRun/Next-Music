"use client";

import React, { useState, useCallback, useEffect } from "react";
import { FaPlus, FaHeart, FaPlay, FaPause } from "react-icons/fa6";
import { RiMusic2Line } from "react-icons/ri";
import { IoIosList } from "react-icons/io";
import { VscLibrary } from "react-icons/vsc";
import { Button } from "@/components/ui/button";
import { CiSearch } from "react-icons/ci";
import { HiSpeakerWave } from "react-icons/hi2";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { playlistsFetch } from "@/pages/api/spotify/playlists/playlistApi";
import { likedFetch } from "@/pages/api/spotify/liked/likedApi";
import { artistFetch } from "@/pages/api/spotify/artists/artistApi";
import useStore from "@/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "./ui/badge";
import Link from "next/link";

interface SavedTracks {
  id: string;
  total: number;
  items: [
    {
      track: {
        id: string;
        uri: string;
      };
    }
  ];
}

interface Playlist {
  id: string;
  name: string;
  images: { url: string }[];
  owner: {
    display_name: string;
  };
  type: string;
  uri: string;
}

interface Artist {
  id: string;
  name: string;
  images: { url: string }[];
}

const schema = z.object({
  name: z.string().min(5, {
    message: "Le nom de la playlist doit être au moins 5 caractère",
  }),
  description: z.string().optional(),
});

export default function Sidebar() {
  const { data: session }: any = useSession();
  const {
    setCurrentSongId,
    isTrackPlaying,
    currentPlaylistId,
    deviceId,
    currentSongId,
    setIsTrackPlaying,
    setCurrentPlaylistId,
  } = useStore();
  const [savedTracks, setSavedTracks] = useState<SavedTracks>();
  const [cachedTracks, setCachedTracks] = useState<Record<string, any[]>>({});
  const [likedTracks, setLikedTracks] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [currentUser, setCurrentUser] = useState<any>({});
  const [openDialog, setOpenDialog] = useState<Boolean>(false);
  const [submitError, setSubmitError] = useState<String>("");
  const [submitSuccess, setSubmitSuccess] = useState<String>("");
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [toggleSearch, setToggleSearch] = useState<Boolean>(false);
  // Tags
  const [tags, setTags] = useState<string[]>([]);

  // GET INFO CURRENT USER
  const getUserInfo = useCallback(async () => {
    if (session && session.accessToken) {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      const data = await response.json();
      setCurrentUser(data);
    }
  }, [session]);

  // Get user's saved tracks
  const getSavedTracks = async () => {
    if (session && session.accessToken) {
      try {
        const response = await likedFetch(session.accessToken);
        setSavedTracks(response);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Get playlists
  const getPlaylists = async () => {
    if (session && session.accessToken) {
      try {
        const response = await playlistsFetch(session.accessToken);
        setPlaylists(response.items);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Get user's artists followed
  const getArtists = async () => {
    if (session && session.accessToken) {
      try {
        const response = await artistFetch(session.accessToken);
        setArtists(response.artists.items);
      } catch (error) {
        console.log(error);
      }
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

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
    },
  });

  const createPlaylist = async (data: z.infer<typeof schema>) => {
    if (session && session.accessToken) {
      setIsLoading(true);
      try {
        const user_id = currentUser.id;
        const response = await fetch(
          `https://api.spotify.com/v1/users/${user_id}/playlists`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: data.name,
              description: data.description,
            }),
          }
        );
        if (response.status === 201) {
          // Clear form
          form.reset();
          setSubmitSuccess("Playlist créée avec succès");
          setIsLoading(false);
          getPlaylists();
          setTimeout(() => {
            setSubmitSuccess("");
            setOpenDialog(false);
          }, 3000);
        }
      } catch (error) {
        console.log("Error:", error);
        setSubmitError("Erreur");
        setIsLoading(false);
      }
    }
  };

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

  // Lecture/pause d'une playlist
  const handlePlayPause = async (playlist: any) => {
    if (session && session.accessToken) {
      if (playlist === "liked_tracks") {
        // Gestion des Titres Likés
        const tracks = likedTracks.length
          ? likedTracks
          : await getLikedTracks();
        if (!tracks || tracks.length === 0) {
          console.error("No liked tracks found");
          return;
        }

        // Start playing the liked tracks
        const trackUris = tracks.map((track: any) => track.uri);
        let body = {
          uris: trackUris,
        };

        try {
          const response = await fetch(
            `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            }
          );
          if (response?.status === 204 || response?.status === 202) {
            setCurrentSongId(tracks[0].id); // Mettre à jour l'ID de la chanson en cours
            setCurrentPlaylistId("liked_tracks"); // Utiliser 'liked_tracks' comme identifiant
            setIsTrackPlaying(true); // Mettre à jour l'état de lecture
          }
        } catch (error) {
          console.log(error);
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

        // Start playing or resume the track at the correct position
        let body = {
          context_uri: playlist.uri,
          offset: {
            position: trackToPlayId,
          },
        };

        try {
          const response = await fetch(
            `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            }
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

  useEffect(() => {
    getSavedTracks();
    getPlaylists();
    getArtists();
  }, [session]);

  return (
    <div className="flex-col w-96 py-4 px-6 space-y-4 text-neutral-400 grow-0 shrink-0 rounded-xl h-[75%] max-h-[100svh] overflow-y-auto bg-card hidden md:inline-flex">
      <div className="flex flex-row items-center justify-between">
        {/* TITLE */}
        <div className="flex flex-row items-center gap-2">
          <VscLibrary className="text-2xl" />
          <h1 className="font-sans text-base font-bold">Bibliothèque</h1>
        </div>
        <Dialog open={!!openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button
              variant="link"
              size="icon"
              className="text-white rounded-full"
              onClick={() => setOpenDialog(true)}
            >
              <FaPlus className="text-xl" />
            </Button>
          </DialogTrigger>
          {session && session.accessToken ? (
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader className="py-1">
                <DialogTitle className="text-xl">
                  Créer une playlist
                </DialogTitle>
                <DialogDescription>
                  Renseignez un nom pour votre playlist, le champ description
                  n'est pas obligatoire.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(createPlaylist)}
                  className="flex flex-col gap-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="name" className="whitespace-nowrap">
                          Nom de la playlist{" "}
                          <span className="text-red-800">*</span>
                        </FormLabel>
                        <Input
                          id="name"
                          placeholder="Playlist-001"
                          className="col-span-3"
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor="description"
                          className="whitespace-nowrap"
                        >
                          Description:
                        </FormLabel>
                        <Textarea
                          id="description"
                          placeholder="Saisissez une description (optionnel)"
                          className="col-span-3"
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {isLoading && (
                    <div className="flex justify-start">
                      <Badge className="rounded-full">Création...</Badge>
                    </div>
                  )}
                  {submitError && (
                    <div className="flex justify-start">
                      <Badge variant="destructive" className="rounded-full">
                        {submitError}
                      </Badge>
                    </div>
                  )}
                  {submitSuccess && (
                    <div className="flex justify-start">
                      <Badge className="rounded-full">{submitSuccess}</Badge>
                    </div>
                  )}
                  <DialogFooter>
                    <Button type="submit">Créer</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          ) : (
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader className="py-1">
                <DialogTitle className="text-xl">
                  Veuillez vous connecter
                </DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Connectez-vous pour exploiter toutes les fonctionnalités de
                l'application !
              </DialogDescription>
              <DialogFooter className="sm:justify-start">
                <Button>Se connecter</Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
      {/* TAGS PLAYLISTS AND ARTISTES */}
      {session && session.accessToken ? (
        <>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="rounded-full">
              <span className="font-sans text-sm font-bold">Playlists</span>
            </Button>
            <Button variant="secondary" size="sm" className="rounded-full">
              <span className="font-sans text-sm font-bold">Artistes</span>
            </Button>
          </div>
        </>
      ) : (
        ""
      )}
      {/* LIST PLAYLISTS AND ARTISTES */}
      <div className="flex flex-col gap-2 scrollbar-none hover:scrollbar scrollbar-thumb-neutral-800 overflow-y-auto">
        {/* ITEMS LIKE SAVED TRACKS */}
        {session &&
        session.accessToken &&
        savedTracks &&
        savedTracks.total > 0 ? (
          <div className="w-full px-2 max-w-sm justify-start text-left group relative overflow-hidden gap-2 flex flex-row items-center cursor-pointer rounded-sm py-8 h-14">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-sm bg-gradient-to-br from-primary to-slate-50">
              <FaHeart className="text-white text-base transition-opacity duration-300 group-hover:opacity-0" />
              <div className="z-40 absolute bg-black/70 rounded-sm inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {isTrackPlaying && currentPlaylistId === "liked_tracks" ? (
                  <FaPause
                    className="text-white text-2xl"
                    onClick={() => handlePlayPause("liked_tracks")}
                  />
                ) : (
                  <FaPlay
                    className="text-white text-2xl"
                    onClick={() => handlePlayPause("liked_tracks")}
                  />
                )}
              </div>
            </div>
            <div className="relative z-50 flex flex-col">
              <Link href={`/dashboard/collection/liked-tracks`}>
                <h2
                  className={`font-sans text-base font-medium ${
                    isTrackPlaying && currentPlaylistId === "liked_tracks"
                      ? "text-primary"
                      : "text-white"
                  }`}
                >
                  Titres likés
                </h2>
                <div className="flex flex-row items-center gap-2">
                  <span className="font-sans text-sm capitalize">Playlist</span>
                  <hr className="border-none w-1 h-1 bg-current rounded-full" />
                  <span className="font-sans text-sm">
                    {savedTracks.total} titres
                  </span>
                </div>
              </Link>
            </div>
            {isTrackPlaying && currentPlaylistId === "liked_tracks" ? (
              <div className="absolute right-4 top-2/4 -translate-y-2/4">
                <HiSpeakerWave className="text-xl text-primary" />
              </div>
            ) : (
              ""
            )}
            <div className="absolute inset-0 bg-neutral-700/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        ) : null}
        {/* PLAYLISTS */}
        {playlists && playlists.length
          ? playlists &&
            playlists.map((playlist) => (
              <div
                className="w-full p-2 max-w-sm justify-start text-left group relative overflow-hidden gap-2 flex flex-row items-center cursor-pointer rounded-sm py-8 h-12"
                key={playlist.id}
              >
                <div className="relative flex items-center justify-center w-12 h-12 rounded-sm bg-neutral-700 group-hover:bg-neutral-900 transition-colors">
                  <div className="relative">
                    {playlist.images ? (
                      <img
                        src={playlist.images[0].url}
                        className="w-12 h-12 rounded-sm"
                        alt={`Image de la playlist ${playlist.name}`}
                      />
                    ) : (
                      <RiMusic2Line className="text-white text-2xl transition-opacity duration-300 group-hover:opacity-80" />
                    )}
                    <div className="z-40 absolute rounded-sm bg-black/70 inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {isTrackPlaying && currentPlaylistId === playlist.id ? (
                        <FaPause
                          className="text-white text-2xl"
                          onClick={() => handlePlayPause(playlist)}
                        />
                      ) : (
                        <FaPlay
                          className="text-white text-2xl"
                          onClick={() => handlePlayPause(playlist)}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="relative z-50 flex flex-col">
                  <Link href={`/dashboard/playlist/${playlist.id}`}>
                    <h2
                      className={`font-sans text-base font-medium ${
                        isTrackPlaying && currentPlaylistId === playlist.id
                          ? "text-primary"
                          : "text-white"
                      }`}
                    >
                      {playlist.name}
                    </h2>

                    <div className="flex flex-row items-center gap-2">
                      <span className="font-sans text-sm capitalize">
                        {playlist.type}
                      </span>
                      <hr className="border-none w-1 h-1 bg-current rounded-full" />
                      <span className="font-sans text-sm">
                        {playlist.owner.display_name}
                      </span>
                    </div>
                  </Link>
                </div>
                {isTrackPlaying && currentPlaylistId === playlist.id ? (
                  <div className="absolute right-4 top-2/4 -translate-y-2/4">
                    <HiSpeakerWave className="text-xl text-primary" />
                  </div>
                ) : (
                  ""
                )}
                <div className="absolute inset-0 bg-neutral-700/10 invisible opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:visible" />
              </div>
            ))
          : null}
        {/* ARTISTS */}
        {session && session.accessToken && artists && artists.length ? (
          artists &&
          artists.map((artist, index) => (
            <Button
              variant="ghost"
              size="custom"
              key={index}
              className="w-full max-w-sm justify-start text-left group relative overflow-hidden gap-2 flex flex-row items-center cursor-pointer rounded-sm py-8"
            >
              <div className="relative flex items-center justify-center w-12 h-12 rounded-sm">
                <div className="relative">
                  <img
                    src={artist.images[0].url}
                    className="w-12 h-12 rounded-full"
                    alt={artist.name}
                  />
                  <div className="absolute bg-black/60 inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <FaPlay className="text-white text-2xl" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col z-50">
                <Link href={`/dashboard/artist/${artist.id}`}>
                  <span className="font-sans text-base text-white">
                    {artist.name}
                  </span>
                  <div className="flex flex-row items-center gap-2">
                    <span className="font-sans text-sm capitalize">
                      Artiste
                    </span>
                  </div>
                </Link>
              </div>
              <div className="absolute inset-0 bg-neutral-800/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Button>
          ))
        ) : (
          <>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
