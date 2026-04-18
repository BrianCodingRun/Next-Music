"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Sheet } from "./ui/sheet"
import { useRouter, usePathname } from "next/navigation";
import { FaSpotify } from "react-icons/fa";
import { GoHome, GoHomeFill } from "react-icons/go";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import SearchInput from "./SearchInput";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import useStore from "@/store/store";

export default function Navbar() {
    const { data: session }: any = useSession();
    const [inputValue, setInputValue] = useState<string>("");
    const [isHome, setIsHome] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>({});
    const router : any = useRouter();
    const pathname = usePathname();

    // GET INFO CURRENT USER
    const getUserInfo = useCallback(async () => {
        if (session?.accessToken) {
            const response = await fetch("https://api.spotify.com/v1/me", {
                headers: { Authorization: `Bearer ${session.accessToken}` },
            });
            if (!response.ok) {
                console.error("Erreur lors de la récupération des infos utilisateur");
                return;
            }
            const data = await response.json();
            setCurrentUser(data);
        }
    }, [session]);

    useEffect(() => {
        getUserInfo();
    }, [getUserInfo]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const goToSearch = () => {
        const encodedValue = encodeURIComponent(inputValue.trim());
        router.push(`/dashboard/search/${encodedValue}`);
    };

    useEffect(() => {
        if (inputValue !== "") {
            goToSearch();
        }
    }, [inputValue]);

    const logout = () => {
        useStore.setState({ likedTracks: [], currentSongId: "", currentPlaylistId: "", isTrackPlaying: false, deviceId: "" });
        signOut({ callbackUrl: "/" });
    };

    // Vérifier si on est sur la page d'accueil
    useEffect(() => {
        if (pathname === "/dashboard") {
            setIsHome(true);
        } else {
            setIsHome(false);
        }
    }, [pathname]);

    return (
        <div className="h-16 flex items-center transition-all">
            <Sheet>
                <nav className="grid grid-cols-[auto_3fr_auto] gap-6 w-full justify-between">
                        <FaSpotify className="text-4xl" />
                    <div className="flex flex-row gap-2 justify-center items-center">
                        <Link href="/dashboard" 
                            className="text-2xl font-medium bg-neutral-900 hover:scale-105 rounded-full p-[10px] transition-transform"
                            aria-label="Naviguer vers la page /dashboard"
                        >
                            {
                                isHome ? (
                                    <GoHomeFill />
                                ) : (
                                    <GoHome />
                                )
                            }
                        </Link>
                        <SearchInput handleInputChange={handleInputChange} />
                    </div>
                    <div className="flex flex-row gap-2 items-center justify-end">
                        {
                            session && session.accessToken ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost"
                                            size="icon"
                                            className="text-xl font-medium transition-transform 
                                        hover:bg-transparent"
                                            aria-label="Afficher le menu"
                                        >
                                            <div className="bg-neutral-900 rounded-full p-[10px]">
                                                <Avatar className="h-8 w-8">
                                                    {currentUser?.images?.[0]?.url ? (
                                                        <AvatarImage src={currentUser.images[0].url} alt={currentUser?.display_name} />
                                                    ) : (
                                                        <AvatarFallback>{currentUser?.display_name?.slice(0, 1) ?? 'U'}</AvatarFallback>
                                                    )}
                                                </Avatar>
                                            </div>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="m-2 w-auto">
                                        <DropdownMenuItem className="font-sans cursor-pointer"
                                            onClick={logout}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Déconnexion</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button className="font-sans border-none" onClick={() => signIn('spotify', { callbackUrl: '/dashboard' })}>Se connecter</Button>
                            )
                        }
                    </div>
                </nav>
            </Sheet>
        </div>
    );
}